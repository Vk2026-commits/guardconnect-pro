import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, User } from "lucide-react";
import { Link } from "react-router-dom";

interface JobApplicantsProps {
  companyId: string;
  subscriptionTier: string;
}

const JobApplicants = ({ companyId, subscriptionTier }: JobApplicantsProps) => {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    loadApplications();
  }, [companyId]);

  const loadApplications = async () => {
    const { data, error } = await supabase
      .from("job_applications")
      .select(`
        *,
        job_posting:job_postings(title),
        officer:officer_profiles(id, user_id),
        profile:officer_profiles(user_id)
      `)
      .eq("job_posting.company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load applications:", error);
      return;
    }

    // Get profile data for all officers
    const officerUserIds = data?.map((app: any) => app.officer?.user_id).filter(Boolean) || [];
    
    if (officerUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", officerUserIds);

      const applicationsWithNames = data?.map((app: any) => ({
        ...app,
        officerName: profiles?.find((p) => p.id === app.officer?.user_id)?.full_name || "Unknown",
      }));

      setApplications(applicationsWithNames || []);
    } else {
      setApplications(data || []);
    }
  };

  const getMaskedName = (fullName: string) => {
    const parts = fullName.split(" ");
    if (parts.length === 0) return "Unknown";
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1]?.[0] || "";
    return `${firstName} ${lastInitial}.`;
  };

  const isPaidSubscriber = subscriptionTier === "professional" || subscriptionTier === "premium";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Applicants</CardTitle>
        <CardDescription>
          Officers who have expressed interest in your positions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isPaidSubscriber && (
          <div className="mb-4 p-4 bg-muted rounded-lg flex items-start gap-3">
            <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium mb-1">Upgrade to view full details</p>
              <p className="text-sm text-muted-foreground">
                Subscribe to Professional or Premium to view full officer profiles and contact them directly.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {applications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No applications yet. Post jobs to attract security officers.
            </p>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {isPaidSubscriber ? app.officerName : getMaskedName(app.officerName)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Applied to: {app.job_posting?.title}
                    </p>
                  </div>
                  <Badge variant="secondary">{app.status}</Badge>
                </div>

                {isPaidSubscriber ? (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" asChild>
                      <Link to={`/browse?officer=${app.officer?.id}`}>View Profile</Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      Contact Officer
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" disabled className="mt-3">
                    <Lock className="h-3 w-3 mr-2" />
                    Unlock with Subscription
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobApplicants;