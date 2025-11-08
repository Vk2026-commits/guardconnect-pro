import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Upload, FileText, X } from "lucide-react";
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
  document_front_url?: string;
  document_back_url?: string;
  description?: string;
}

interface CertificationsManagerProps {
  officerId: string;
  userId: string;
  onEnsureProfile?: () => Promise<any>;
}

const LICENSE_LEVELS = [
  { value: "level-ii", label: "Non-Commission Certificate" },
  { value: "level-iii", label: "Commission Certificate" },
  { value: "level-iv", label: "Personal Protection Officer (Bodyguard)" },
];

const TRAINING_CERTIFICATIONS = [
  "Use of Force Training",
  "Baton Training",
  "Handcuff Training",
  "CPR Training",
  "First Aid",
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

export function CertificationsManager({ officerId, userId, onEnsureProfile }: CertificationsManagerProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [currentOfficerId, setCurrentOfficerId] = useState(officerId);

  useEffect(() => {
    if (officerId) {
      setCurrentOfficerId(officerId);
    }
    // Always attempt to load, will ensure/create profile if needed
    loadCertifications();
  }, [officerId]);

  const ensureOfficerId = async () => {
    if (currentOfficerId) return currentOfficerId;
    
    if (onEnsureProfile) {
      const profile = await onEnsureProfile();
      if (profile?.id) {
        setCurrentOfficerId(profile.id);
        return profile.id;
      }
    }
    return null;
  };

  const loadCertifications = async () => {
    try {
      const id = await ensureOfficerId();
      if (!id) {
        setLoading(false);
        setCertifications([]);
        return;
      }

      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("officer_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCertifications(data || []);
    } catch (error: any) {
      toast.error("Failed to load certifications");
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    certId: string,
    side: "front" | "back"
  ) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${certId}-${side}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("certification-documents")
      .upload(fileName, file, {
        upsert: true,
        cacheControl: "3600"
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("certification-documents")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleDocumentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    certId: string,
    side: "front" | "back"
  ) => {
    try {
      setUploading(`${certId}-${side}`);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validate file size (10MB for documents)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        setUploading(null);
        return;
      }

      const url = await uploadDocument(file, certId, side);

      const updateField = side === "front" ? "document_front_url" : "document_back_url";
      const { error } = await supabase
        .from("certifications")
        .update({ [updateField]: url })
        .eq("id", certId);

      if (error) throw error;

      toast.success(`Document uploaded successfully`);
      await loadCertifications();
      
      // Reset the input so the same file can be uploaded again if needed
      event.target.value = '';
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
      console.error("Upload error:", error);
    } finally {
      setUploading(null);
    }
  };

  const removeDocument = async (certId: string, side: "front" | "back", url: string) => {
    try {
      const filePath = url.split("/certification-documents/")[1];
      if (filePath) {
        await supabase.storage.from("certification-documents").remove([filePath]);
      }

      const updateField = side === "front" ? "document_front_url" : "document_back_url";
      const { error } = await supabase
        .from("certifications")
        .update({ [updateField]: null })
        .eq("id", certId);

      if (error) throw error;

      toast.success("Document removed");
      loadCertifications();
    } catch (error: any) {
      toast.error("Failed to remove document");
    }
  };

  const deleteCertification = async (id: string) => {
    try {
      const cert = certifications.find((c) => c.id === id);
      
      // Delete associated documents
      if (cert?.document_front_url) {
        const filePath = cert.document_front_url.split("/certification-documents/")[1];
        if (filePath) {
          await supabase.storage.from("certification-documents").remove([filePath]);
        }
      }
      if (cert?.document_back_url) {
        const filePath = cert.document_back_url.split("/certification-documents/")[1];
        if (filePath) {
          await supabase.storage.from("certification-documents").remove([filePath]);
        }
      }

      const { error } = await supabase.from("certifications").delete().eq("id", id);
      if (error) throw error;

      toast.success("Certification removed successfully");
      loadCertifications();
    } catch (error: any) {
      toast.error("Failed to remove certification");
    }
  };

  const LicenseForm = ({ licenseLevel, label }: { licenseLevel: string; label: string }) => {
    const [formData, setFormData] = useState({
      certification_number: "",
      issue_date: "",
      expiry_date: "",
    });

    const existingLicense = certifications.find(
      (c) => c.license_level === licenseLevel && c.certification_type === "license"
    );

    useEffect(() => {
      if (existingLicense) {
        setFormData({
          certification_number: existingLicense.certification_number || "",
          issue_date: existingLicense.issue_date || "",
          expiry_date: existingLicense.expiry_date || "",
        });
      }
    }, [existingLicense]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.certification_number) {
        toast.error("License number is required");
        return;
      }

      const id = await ensureOfficerId();
      if (!id) {
        toast.error("Please create your profile first");
        return;
      }

      try {
        const certData = {
          officer_id: id,
          certification_type: "license",
          name: label,
          license_level: licenseLevel,
          certification_number: formData.certification_number,
          issue_date: formData.issue_date || null,
          expiry_date: formData.expiry_date || null,
          issuing_organization: "Texas Department of Public Safety",
        };

        if (existingLicense) {
          const { error } = await supabase
            .from("certifications")
            .update(certData)
            .eq("id", existingLicense.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("certifications").insert(certData);
          if (error) throw error;
        }

        toast.success("License saved successfully");
        loadCertifications();
      } catch (error: any) {
        toast.error("Failed to save license");
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{label}</CardTitle>
          <CardDescription>Enter license details and upload documentation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${licenseLevel}-number`}>License Number *</Label>
              <Input
                id={`${licenseLevel}-number`}
                value={formData.certification_number}
                onChange={(e) =>
                  setFormData({ ...formData, certification_number: e.target.value })
                }
                placeholder="Enter license number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${licenseLevel}-issue`}>Certification Date</Label>
                <Input
                  id={`${licenseLevel}-issue`}
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${licenseLevel}-expiry`}>Expiration Date</Label>
                <Input
                  id={`${licenseLevel}-expiry`}
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              {existingLicense ? "Update License" : "Save License"}
            </Button>
          </form>

          {existingLicense && (
            <div className="space-y-4 pt-4 border-t">
              <Label>Upload License Documents</Label>
              <div className="grid grid-cols-2 gap-4">
                {["front", "back"].map((side) => {
                  const url =
                    side === "front"
                      ? existingLicense.document_front_url
                      : existingLicense.document_back_url;
                  const isUploading = uploading === `${existingLicense.id}-${side}`;

                  return (
                    <div key={side} className="space-y-2">
                      <Label className="capitalize">{side} of License</Label>
                      {url ? (
                        <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden border">
                          <img
                            src={url}
                            alt={`License ${side}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              removeDocument(
                                existingLicense.id,
                                side as "front" | "back",
                                url
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">No document</p>
                          </div>
                        </div>
                      )}
                      <input
                        id={`license-upload-${existingLicense.id}-${side}`}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleDocumentUpload(e, existingLicense.id, side as "front" | "back")
                        }
                        disabled={isUploading}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isUploading}
                        onClick={() => document.getElementById(`license-upload-${existingLicense.id}-${side}`)?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Uploading..." : url ? "Change" : "Upload"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const TrainingSection = () => {
    const [newTraining, setNewTraining] = useState({
      name: "",
      issuing_organization: "",
      certification_number: "",
      issue_date: "",
      expiry_date: "",
      description: "",
    });

    const trainings = certifications.filter((c) => c.certification_type === "training");

    const addTraining = async () => {
      if (!newTraining.name) {
        toast.error("Please select or enter a training type");
        return;
      }

      const id = await ensureOfficerId();
      if (!id) {
        toast.error("Please create your profile first");
        return;
      }

      try {
        const { error } = await supabase.from("certifications").insert({
          officer_id: id,
          certification_type: "training",
          name: newTraining.name,
          issuing_organization: newTraining.issuing_organization || null,
          certification_number: newTraining.certification_number || null,
          issue_date: newTraining.issue_date || null,
          expiry_date: newTraining.expiry_date || null,
          description: newTraining.description || null,
        });

        if (error) throw error;

        toast.success("Training added successfully");
        setNewTraining({
          name: "",
          issuing_organization: "",
          certification_number: "",
          issue_date: "",
          expiry_date: "",
          description: "",
        });
        loadCertifications();
      } catch (error: any) {
        toast.error("Failed to add training");
      }
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Training Certification</CardTitle>
            <CardDescription>
              Add training certificates such as CPR, use of force, handcuffing, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="training-name">Training Type *</Label>
              <Select
                value={newTraining.name}
                onValueChange={(value) => setNewTraining({ ...newTraining, name: value })}
              >
                <SelectTrigger id="training-name">
                  <SelectValue placeholder="Select training type" />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_CERTIFICATIONS.map((training) => (
                    <SelectItem key={training} value={training}>
                      {training}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Other (Custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newTraining.name === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-name">Custom Training Name</Label>
                <Input
                  id="custom-name"
                  placeholder="Enter training name"
                  onChange={(e) => setNewTraining({ ...newTraining, name: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="issuing-org">Issuing Organization</Label>
              <Input
                id="issuing-org"
                value={newTraining.issuing_organization}
                onChange={(e) =>
                  setNewTraining({ ...newTraining, issuing_organization: e.target.value })
                }
                placeholder="e.g., American Red Cross"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-number">Certification Number (Optional)</Label>
              <Input
                id="cert-number"
                value={newTraining.certification_number}
                onChange={(e) =>
                  setNewTraining({ ...newTraining, certification_number: e.target.value })
                }
                placeholder="Enter certification number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="training-issue">Issue Date</Label>
                <Input
                  id="training-issue"
                  type="date"
                  value={newTraining.issue_date}
                  onChange={(e) =>
                    setNewTraining({ ...newTraining, issue_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="training-expiry">Expiration Date</Label>
                <Input
                  id="training-expiry"
                  type="date"
                  value={newTraining.expiry_date}
                  onChange={(e) =>
                    setNewTraining({ ...newTraining, expiry_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTraining.description}
                onChange={(e) =>
                  setNewTraining({ ...newTraining, description: e.target.value })
                }
                placeholder="Brief description of the training..."
                rows={3}
              />
            </div>

            <Button onClick={addTraining} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Training
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
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{training.name}</h4>
                          <Badge>Training</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          {training.issuing_organization && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Issued by:</span>{" "}
                              {training.issuing_organization}
                            </p>
                          )}
                          {training.certification_number && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Cert #:</span>{" "}
                              {training.certification_number}
                            </p>
                          )}
                          {training.issue_date && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Issue Date:</span>{" "}
                              {new Date(training.issue_date).toLocaleDateString()}
                            </p>
                          )}
                          {training.expiry_date && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Expires:</span>{" "}
                              {new Date(training.expiry_date).toLocaleDateString()}
                            </p>
                          )}
                          {training.description && (
                            <p className="text-muted-foreground mt-2">
                              <span className="font-medium">Description:</span>{" "}
                              {training.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCertification(training.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <Label className="mb-2 block">Upload Certificate Documents</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {["front", "back"].map((side) => {
                          const url =
                            side === "front"
                              ? training.document_front_url
                              : training.document_back_url;
                          const isUploading = uploading === `${training.id}-${side}`;

                          return (
                            <div key={side} className="space-y-2">
                              <Label className="capitalize text-xs">
                                {side === "front" ? "Certificate" : "Additional Document"}
                              </Label>
                              {url ? (
                                <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden border">
                                  <img
                                    src={url}
                                    alt={`Certificate ${side}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() =>
                                      removeDocument(training.id, side as "front" | "back", url)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center">
                                  <div className="text-center text-muted-foreground">
                                    <FileText className="h-6 w-6 mx-auto mb-1" />
                                    <p className="text-xs">No document</p>
                                  </div>
                                </div>
                              )}
                              <input
                                id={`training-upload-${training.id}-${side}`}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                  handleDocumentUpload(e, training.id, side as "front" | "back")
                                }
                                disabled={isUploading}
                                className="hidden"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                disabled={isUploading}
                                onClick={() => document.getElementById(`training-upload-${training.id}-${side}`)?.click()}
                              >
                                <Upload className="mr-2 h-3 w-3" />
                                {isUploading ? "Uploading..." : url ? "Change" : "Upload"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading certifications...</div>;
  }

  return (
    <Tabs defaultValue="level-ii" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="level-ii">Non-Commission</TabsTrigger>
        <TabsTrigger value="level-iii">Commission</TabsTrigger>
        <TabsTrigger value="level-iv">Personal Protection Officer</TabsTrigger>
        <TabsTrigger value="training">Other Training</TabsTrigger>
      </TabsList>

      <TabsContent value="level-ii" className="space-y-4">
        <LicenseForm
          licenseLevel="level-ii"
          label="Non-Commission Certificate"
        />
      </TabsContent>

      <TabsContent value="level-iii" className="space-y-4">
        <LicenseForm
          licenseLevel="level-iii"
          label="Commission Certificate"
        />
      </TabsContent>

      <TabsContent value="level-iv" className="space-y-4">
        <LicenseForm licenseLevel="level-iv" label="Personal Protection Officer (Bodyguard)" />
      </TabsContent>

      <TabsContent value="training" className="space-y-4">
        <TrainingSection />
      </TabsContent>
    </Tabs>
  );
}
