import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Certification {
  id: string;
  name: string;
  certification_type: string;
  license_level?: string;
  issuing_organization?: string;
  certification_number?: string;
  issue_date?: string;
  expiry_date?: string;
}

interface CertificationsManagerProps {
  officerId: string;
}

const LICENSE_LEVELS = [
  { value: "level-ii", label: "Level II - Non-Commissioned Security Officer" },
  { value: "level-iii", label: "Level III - Commissioned Security Officer" },
  { value: "level-iv", label: "Level IV - Personal Protection Officer (PPO)" },
  { value: "private-investigator", label: "Private Investigator" },
];

const TRAINING_CERTIFICATIONS = [
  "CPR/First Aid",
  "Handcuffing Techniques",
  "Use of Force",
  "Baton Training",
  "Electronic Control Device (ECD/Taser)",
  "OC Spray (Pepper Spray)",
  "Firearms Qualification",
  "Active Shooter Response",
  "De-escalation Techniques",
  "Emergency Response",
  "Report Writing",
  "Patrol Procedures",
  "Access Control",
  "CCTV Operations",
];

export function CertificationsManager({ officerId }: CertificationsManagerProps) {
  const [licenses, setLicenses] = useState<Certification[]>([]);
  const [trainings, setTrainings] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const [newLicense, setNewLicense] = useState({
    license_level: "",
    certification_number: "",
    issue_date: "",
    expiry_date: "",
  });

  const [newTraining, setNewTraining] = useState({
    name: "",
    issuing_organization: "",
    certification_number: "",
    issue_date: "",
    expiry_date: "",
  });

  useEffect(() => {
    loadCertifications();
  }, [officerId]);

  const loadCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("officer_id", officerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLicenses(data?.filter((c) => c.certification_type === "license") || []);
      setTrainings(data?.filter((c) => c.certification_type === "training") || []);
    } catch (error: any) {
      toast.error("Failed to load certifications");
    } finally {
      setLoading(false);
    }
  };

  const addLicense = async () => {
    if (!newLicense.license_level || !newLicense.certification_number) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const licenseLabel = LICENSE_LEVELS.find((l) => l.value === newLicense.license_level)?.label || "";

      const { error } = await supabase.from("certifications").insert({
        officer_id: officerId,
        certification_type: "license",
        name: licenseLabel,
        license_level: newLicense.license_level,
        certification_number: newLicense.certification_number,
        issue_date: newLicense.issue_date || null,
        expiry_date: newLicense.expiry_date || null,
        issuing_organization: "Texas Department of Public Safety",
      });

      if (error) throw error;

      toast.success("License added successfully");
      setNewLicense({ license_level: "", certification_number: "", issue_date: "", expiry_date: "" });
      loadCertifications();
    } catch (error: any) {
      toast.error("Failed to add license");
    }
  };

  const addTraining = async () => {
    if (!newTraining.name) {
      toast.error("Please select a training certification");
      return;
    }

    try {
      const { error } = await supabase.from("certifications").insert({
        officer_id: officerId,
        certification_type: "training",
        name: newTraining.name,
        issuing_organization: newTraining.issuing_organization || null,
        certification_number: newTraining.certification_number || null,
        issue_date: newTraining.issue_date || null,
        expiry_date: newTraining.expiry_date || null,
      });

      if (error) throw error;

      toast.success("Training certification added successfully");
      setNewTraining({ name: "", issuing_organization: "", certification_number: "", issue_date: "", expiry_date: "" });
      loadCertifications();
    } catch (error: any) {
      toast.error("Failed to add training certification");
    }
  };

  const deleteCertification = async (id: string, type: string) => {
    try {
      const { error } = await supabase.from("certifications").delete().eq("id", id);

      if (error) throw error;

      toast.success(`${type === "license" ? "License" : "Training"} removed successfully`);
      loadCertifications();
    } catch (error: any) {
      toast.error("Failed to remove certification");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading certifications...</div>;
  }

  return (
    <Tabs defaultValue="licenses" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="licenses">Security Licenses</TabsTrigger>
        <TabsTrigger value="training">Training & Certifications</TabsTrigger>
      </TabsList>

      <TabsContent value="licenses" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Security License</CardTitle>
            <CardDescription>Texas security officer licenses (Level II, III, IV, PI)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license-level">License Level *</Label>
              <Select value={newLicense.license_level} onValueChange={(value) => setNewLicense({ ...newLicense, license_level: value })}>
                <SelectTrigger id="license-level">
                  <SelectValue placeholder="Select license level" />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-number">License Number *</Label>
              <Input
                id="cert-number"
                value={newLicense.certification_number}
                onChange={(e) => setNewLicense({ ...newLicense, certification_number: e.target.value })}
                placeholder="Enter license number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue-date">Issue Date</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={newLicense.issue_date}
                  onChange={(e) => setNewLicense({ ...newLicense, issue_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={newLicense.expiry_date}
                  onChange={(e) => setNewLicense({ ...newLicense, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={addLicense} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add License
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {licenses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No licenses added yet
              </CardContent>
            </Card>
          ) : (
            licenses.map((license) => (
              <Card key={license.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{license.name}</h4>
                        <Badge variant="secondary">License</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">
                          <span className="font-medium">License #:</span> {license.certification_number}
                        </p>
                        {license.issue_date && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Issue Date:</span> {new Date(license.issue_date).toLocaleDateString()}
                          </p>
                        )}
                        {license.expiry_date && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Expires:</span> {new Date(license.expiry_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCertification(license.id, "license")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="training" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Training Certification</CardTitle>
            <CardDescription>CPR, use of force, handcuffing, and other training certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="training-name">Training/Certification Type *</Label>
              <Select value={newTraining.name} onValueChange={(value) => setNewTraining({ ...newTraining, name: value })}>
                <SelectTrigger id="training-name">
                  <SelectValue placeholder="Select training type" />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_CERTIFICATIONS.map((training) => (
                    <SelectItem key={training} value={training}>
                      {training}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other (Custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newTraining.name === "other" && (
              <div className="space-y-2">
                <Label htmlFor="custom-training">Custom Training Name</Label>
                <Input
                  id="custom-training"
                  value={newTraining.name === "other" ? "" : newTraining.name}
                  onChange={(e) => setNewTraining({ ...newTraining, name: e.target.value })}
                  placeholder="Enter training name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="issuing-org">Issuing Organization</Label>
              <Input
                id="issuing-org"
                value={newTraining.issuing_organization}
                onChange={(e) => setNewTraining({ ...newTraining, issuing_organization: e.target.value })}
                placeholder="e.g., American Red Cross"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training-cert-number">Certification Number (Optional)</Label>
              <Input
                id="training-cert-number"
                value={newTraining.certification_number}
                onChange={(e) => setNewTraining({ ...newTraining, certification_number: e.target.value })}
                placeholder="Enter certification number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="training-issue-date">Issue Date</Label>
                <Input
                  id="training-issue-date"
                  type="date"
                  value={newTraining.issue_date}
                  onChange={(e) => setNewTraining({ ...newTraining, issue_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="training-expiry-date">Expiry Date</Label>
                <Input
                  id="training-expiry-date"
                  type="date"
                  value={newTraining.expiry_date}
                  onChange={(e) => setNewTraining({ ...newTraining, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={addTraining} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Training Certification
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {trainings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No training certifications added yet
              </CardContent>
            </Card>
          ) : (
            trainings.map((training) => (
              <Card key={training.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{training.name}</h4>
                        <Badge>Training</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        {training.issuing_organization && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Issued by:</span> {training.issuing_organization}
                          </p>
                        )}
                        {training.certification_number && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Cert #:</span> {training.certification_number}
                          </p>
                        )}
                        {training.issue_date && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Issue Date:</span> {new Date(training.issue_date).toLocaleDateString()}
                          </p>
                        )}
                        {training.expiry_date && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Expires:</span> {new Date(training.expiry_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCertification(training.id, "training")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
