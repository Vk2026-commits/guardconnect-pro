import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Star, Calendar, CheckCircle, Clock } from "lucide-react";
import EvaluationForm from "./EvaluationForm";

interface EmploymentTrackingProps {
  companyId: string;
}

const EmploymentTracking = ({ companyId }: EmploymentTrackingProps) => {
  const [hires, setHires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);

  useEffect(() => {
    loadHires();
  }, [companyId]);

  const loadHires = async () => {
    try {
      const { data, error } = await supabase
        .from("hires")
        .select(`
          *,
          officer_profiles(*, profiles(full_name)),
          evaluations(*)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHires(data || []);
    } catch (error) {
      console.error("Error loading hires:", error);
      toast.error("Failed to load employment data");
    } finally {
      setLoading(false);
    }
  };

  const periodNames: Record<string, string> = {
    '30_day': '30-Day',
    '90_day': '90-Day',
    '1_year': '1-Year'
  };

  const getEvaluationStatus = (evaluation: any) => {
    if (evaluation.completed_date) {
      return { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle };
    }
    if (evaluation.sent_date) {
      return { label: "Sent", color: "bg-blue-100 text-blue-800", icon: Clock };
    }
    if (new Date(evaluation.due_date) < new Date()) {
      return { label: "Overdue", color: "bg-red-100 text-red-800", icon: Calendar };
    }
    return { label: "Pending", color: "bg-gray-100 text-gray-800", icon: Calendar };
  };

  if (loading) {
    return <div>Loading employment tracking...</div>;
  }

  if (selectedEvaluation) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedEvaluation(null)}>
          ← Back to Hires
        </Button>
        <EvaluationForm 
          evaluation={selectedEvaluation} 
          onComplete={() => {
            setSelectedEvaluation(null);
            loadHires();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hired Officers</CardTitle>
          <CardDescription>Track performance evaluations and employment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hires.map((hire) => (
              <div key={hire.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {hire.officer_profiles?.profiles?.full_name || "Unknown"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{hire.position_title}</p>
                    <p className="text-sm text-muted-foreground">
                      Hired: {new Date(hire.hire_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={hire.status === "active" ? "default" : "secondary"}
                  >
                    {hire.status}
                  </Badge>
                </div>

                {hire.evaluations && hire.evaluations.length > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="text-sm font-semibold">Performance Evaluations:</h4>
                    <div className="grid gap-2">
                      {hire.evaluations
                        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                        .map((evaluation: any) => {
                          const status = getEvaluationStatus(evaluation);
                          const StatusIcon = status.icon;
                          
                          return (
                            <div
                              key={evaluation.id}
                              className="flex items-center justify-between bg-muted p-3 rounded"
                            >
                              <div className="flex items-center gap-3">
                                <StatusIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">
                                    {periodNames[evaluation.evaluation_period]} Evaluation
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Due: {new Date(evaluation.due_date).toLocaleDateString()}
                                  </p>
                                  {evaluation.completed_date && evaluation.overall_rating && (
                                    <div className="flex gap-1 mt-1">
                                      {[...Array(evaluation.overall_rating)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                                {!evaluation.completed_date && (
                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedEvaluation(evaluation)}
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {hires.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No officers hired yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmploymentTracking;
