import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, DollarSign, MessageCircle } from "lucide-react";
import { ChatDialog } from "./ChatDialog";
import { toast } from "sonner";

interface InterestedJobsPanelProps {
  officerId: string;
  officerName: string;
}

export function InterestedJobsPanel({ officerId, officerName }: InterestedJobsPanelProps) {
  const [interestedJobs, setInterestedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    loadInterestedJobs();
  }, [officerId]);

  const loadInterestedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          job_postings!inner(
            *,
            company_profiles!inner(
              id,
              company_name,
              logo_url
            )
          )
        `)
        .eq("officer_id", officerId)
        .eq("status", "interested")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInterestedJobs(data || []);
    } catch (error) {
      console.error("Error loading interested jobs:", error);
      toast.error("Failed to load interested jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleContactEmployer = (job: any) => {
    setSelectedJob(job);
    setChatOpen(true);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Interested Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Interested Jobs
          </CardTitle>
          <CardDescription>
            Positions you've expressed interest in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {interestedJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No interested jobs yet</p>
              <p className="text-xs">Browse jobs and click "Interested" to add them here</p>
            </div>
          ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {interestedJobs.map((application) => (
                <Card 
                  key={application.id} 
                  className="hover:bg-accent/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {application.job_postings.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {application.job_postings.company_profiles.company_name}
                          </p>
                        </div>
                      </div>
                      
                      {application.job_postings.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {application.job_postings.location}
                        </div>
                      )}
                      
                      {application.job_postings.hourly_rate_min && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          ${application.job_postings.hourly_rate_min}
                          {application.job_postings.hourly_rate_max && 
                            ` - $${application.job_postings.hourly_rate_max}`}/hr
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {application.job_postings.employment_type?.map((type: string) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleContactEmployer(application.job_postings)}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Contact Employer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedJob && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          companyId={selectedJob.company_profiles.id}
          companyName={selectedJob.company_profiles.company_name}
          officerId={officerId}
          officerName={officerName}
          currentUserType="officer"
        />
      )}
    </>
  );
}
