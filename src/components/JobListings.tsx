import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Briefcase, MapPin, DollarSign, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const JobListings = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [officerProfile, setOfficerProfile] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJobs();
    checkUser();
  }, []);

  useEffect(() => {
    if (selectedJob && officerProfile) {
      checkApplication();
    }
  }, [selectedJob, officerProfile]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "officer") {
        const { data: officerData } = await supabase
          .from("officer_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        setOfficerProfile(officerData);
      }
    }
  };

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from("job_postings")
      .select("*, company_profiles(company_name)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Failed to load jobs:", error);
      return;
    }
    setJobs(data || []);
  };

  const checkApplication = async () => {
    if (!selectedJob || !officerProfile) return;

    const { data } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_posting_id", selectedJob.id)
      .eq("officer_id", officerProfile.id)
      .maybeSingle();

    setHasApplied(!!data);
  };

  const handleInterest = async () => {
    if (!currentUser) {
      toast.error("Please sign in to express interest");
      return;
    }

    if (!officerProfile) {
      toast.error("Only security officers can apply for jobs");
      return;
    }

    try {
      const { error } = await supabase.from("job_applications").insert({
        job_posting_id: selectedJob.id,
        officer_id: officerProfile.id,
        status: "interested",
      });

      if (error) throw error;

      toast.success("Interest sent! The company has been notified.");
      setHasApplied(true);
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("You've already expressed interest in this position");
      } else {
        toast.error(error.message);
      }
    }
  };

  if (jobs.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Openings
          </CardTitle>
          <CardDescription>Latest security positions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => setSelectedJob(job)}
            >
              <h4 className="font-semibold text-sm mb-1">{job.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {job.company_profiles?.company_name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {job.location}
              </div>
              {job.hourly_rate_min && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <DollarSign className="h-3 w-3" />
                  ${job.hourly_rate_min}{job.hourly_rate_max && ` - $${job.hourly_rate_max}`}/hr
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {selectedJob?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedJob?.company_profiles?.company_name}
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selectedJob.location}
                </span>
                {selectedJob.hourly_rate_min && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${selectedJob.hourly_rate_min}
                    {selectedJob.hourly_rate_max && ` - $${selectedJob.hourly_rate_max}`}/hr
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedJob.employment_type?.map((type: string) => (
                  <Badge key={type} variant="outline">
                    {type}
                  </Badge>
                ))}
                {selectedJob.shift_type?.map((shift: string) => (
                  <Badge key={shift} variant="secondary">
                    {shift}
                  </Badge>
                ))}
              </div>

              {selectedJob.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
                </div>
              )}

              {selectedJob.requirements && (
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <p className="text-sm text-muted-foreground">{selectedJob.requirements}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                {hasApplied ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    You've expressed interest in this position
                  </div>
                ) : (
                  <Button onClick={handleInterest} className="w-full">
                    Express Interest
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobListings;