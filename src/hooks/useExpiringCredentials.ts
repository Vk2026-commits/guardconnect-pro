import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ExpiringItem {
  id: string;
  name: string;
  type: string;
  expiry_date: string;
  daysLeft: number;
  officerName?: string;
}

const daysUntil = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date + "T00:00:00");
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
};

export const useExpiringCredentials = (userId: string, mode: "officer" | "company") => {
  const [items, setItems] = useState<ExpiringItem[]>([]);

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
        if (!cancelled) setItems(rows);
      } catch {
        // silently ignore
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, mode]);

  return items;
};
