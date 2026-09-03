import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export interface ExpiringItem {
  id: string;
  name: string;
  type: string;
  expiry_date: string;
  daysLeft: number;
  officerName?: string;
}

interface Props {
  userId: string;
  mode: "officer" | "company";
}

const daysUntil = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date + "T00:00:00");
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
};

const label = (t: string) => (t === "training" ? "Training" : t === "license" ? "License" : "Certificate");

export const ExpiringCredentialsAlert = ({ userId, mode }: Props) => {
  const [items, setItems] = useState<ExpiringItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        let rows: ExpiringItem[] = [];

        if (mode === "officer") {
          const { data: officer } = await supabase
            .from("officer_profiles")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
          if (!officer) return;

          const { data } = await supabase
            .from("certifications")
            .select("id, name, certification_type, expiry_date")
            .eq("officer_id", officer.id)
            .not("expiry_date", "is", null);

          rows = (data || [])
            .map((c: any) => ({
              id: c.id,
              name: c.name,
              type: c.certification_type,
              expiry_date: c.expiry_date,
              daysLeft: daysUntil(c.expiry_date),
            }))
            .filter((r) => r.daysLeft <= 90);
        } else {
          const { data: company } = await supabase
            .from("company_profiles")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
          if (!company) return;

          const { data: hires } = await supabase
            .from("hires")
            .select("officer_id")
            .eq("company_id", company.id);

          const officerIds = [...new Set((hires || []).map((h: any) => h.officer_id))];
          if (officerIds.length === 0) return;

          const [{ data: certs }, { data: officers }] = await Promise.all([
            supabase
              .from("officer_certifications_safe")
              .select("certification_id, officer_id, name, certification_type, expiry_date")
              .in("officer_id", officerIds)
              .not("expiry_date", "is", null),
            supabase.from("officer_profiles_safe").select("id, user_id").in("id", officerIds),
          ]);

          const userIds = (officers || []).map((o: any) => o.user_id);
          const { data: names } = userIds.length
            ? await supabase.from("public_profiles").select("id, full_name").in("id", userIds)
            : { data: [] as any[] };

          const nameByOfficer = new Map<string, string>();
          (officers || []).forEach((o: any) => {
            const p = (names || []).find((n: any) => n.id === o.user_id);
            nameByOfficer.set(o.id, p?.full_name || "Officer");
          });

          rows = (certs || [])
            .map((c: any) => ({
              id: c.certification_id,
              name: c.name,
              type: c.certification_type,
              expiry_date: c.expiry_date,
              daysLeft: daysUntil(c.expiry_date),
              officerName: nameByOfficer.get(c.officer_id) || "Officer",
            }))
            .filter((r) => r.daysLeft <= 90);
        }

        rows.sort((a, b) => a.daysLeft - b.daysLeft);
        if (cancelled || rows.length === 0) return;

        setItems(rows);

        // Show once per session per set of alerts
        const key = `expiring-alert:${mode}:${userId}:${rows.map((r) => `${r.id}:${r.daysLeft <= 30 ? 30 : 90}`).join(",")}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          setOpen(true);
        }
      } catch {
        // silently ignore
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, mode]);

  if (items.length === 0) return null;

  const urgent = items.some((i) => i.daysLeft <= 30);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${urgent ? "text-destructive" : ""}`}>
            <AlertTriangle className={`h-5 w-5 ${urgent ? "text-destructive" : "text-amber-500"}`} />
            Expiring credentials
          </DialogTitle>
          <DialogDescription>
            {mode === "officer"
              ? "The following licenses, certificates or trainings are expiring soon. Please renew them to stay active."
              : "The following officer credentials are expiring soon."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {items.map((item) => {
            const isUrgent = item.daysLeft <= 30;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between rounded-md border p-3 ${
                  isUrgent ? "border-destructive/50 bg-destructive/5" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className={`font-medium truncate ${isUrgent ? "text-destructive" : ""}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {label(item.type)}
                    {item.officerName ? ` · ${item.officerName}` : ""} · Expires{" "}
                    {new Date(item.expiry_date + "T00:00:00").toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={isUrgent ? "destructive" : "secondary"} className="shrink-0">
                  {item.daysLeft < 0
                    ? "Expired"
                    : item.daysLeft === 0
                    ? "Expires today"
                    : `${item.daysLeft} days`}
                </Badge>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpiringCredentialsAlert;
