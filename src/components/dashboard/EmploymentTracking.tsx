import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Star } from "lucide-react";

interface EmploymentTrackingProps {
  companyId: string;
}

const EmploymentTracking = ({ companyId }: EmploymentTrackingProps) => {
  const [hires, setHires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHire, setSelectedHire] = useState<string>("");
  const [updateType, setUpdateType] = useState("performance_review");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(5);

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
          employment_updates(*)
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

  const handleSubmitUpdate = async () => {
    if (!selectedHire) {
      toast.error("Please select an employee");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in");
        return;
      }

      const { error } = await supabase.from("employment_updates").insert({
        hire_id: selectedHire,
        update_type: updateType,
        notes,
        rating: updateType === "performance_review" ? rating : null,
        created_by_user_id: session.user.id,
      });

      if (error) throw error;

      toast.success("Employment update recorded");
      setNotes("");
      setRating(5);
      loadHires();
    } catch (error) {
      console.error("Error submitting update:", error);
      toast.error("Failed to submit update");
    }
  };

  if (loading) {
    return <div>Loading employment tracking...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Employment Update</CardTitle>
          <CardDescription>Track performance and updates for your hired officers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Employee</Label>
            <Select value={selectedHire} onValueChange={setSelectedHire}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {hires.map((hire) => (
                  <SelectItem key={hire.id} value={hire.id}>
                    {hire.officer_profiles?.profiles?.full_name || "Unknown"} - {hire.position_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Update Type</Label>
            <Select value={updateType} onValueChange={setUpdateType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance_review">Performance Review</SelectItem>
                <SelectItem value="status_update">Status Update</SelectItem>
                <SelectItem value="incident_report">Incident Report</SelectItem>
                <SelectItem value="commendation">Commendation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {updateType === "performance_review" && (
            <div className="space-y-2">
              <Label>Performance Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details about this update..."
              rows={4}
            />
          </div>

          <Button onClick={handleSubmitUpdate}>Submit Update</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Employees</CardTitle>
          <CardDescription>Officers you've hired and their employment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hires.map((hire) => (
              <div key={hire.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {hire.officer_profiles?.profiles?.full_name || "Unknown"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{hire.position_title}</p>
                    <p className="text-sm text-muted-foreground">
                      Hired: {new Date(hire.hire_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      hire.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {hire.status}
                  </span>
                </div>

                {hire.employment_updates && hire.employment_updates.length > 0 && (
                  <div className="mt-3 space-y-2 border-t pt-2">
                    <h4 className="text-sm font-medium">Recent Updates:</h4>
                    {hire.employment_updates.slice(0, 3).map((update: any) => (
                      <div key={update.id} className="text-sm bg-muted p-2 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{update.update_type.replace(/_/g, " ")}</span>
                          {update.rating && (
                            <div className="flex gap-1">
                              {[...Array(update.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground">{update.notes}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(update.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {hires.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No employees hired yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmploymentTracking;
