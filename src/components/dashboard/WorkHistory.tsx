import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkHistoryProps {
  officerId: string;
  userId: string;
  onEnsureProfile?: () => Promise<any>;
}

interface WorkHistoryEntry {
  id: string;
  officer_id?: string;
  company_name: string;
  position_title: string;
  start_date: string;
  end_date: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_zip: string;
  supervisor_name: string;
  supervisor_phone: string;
  company_phone: string;
  reason_for_leaving: string;
  job_description: string;
  may_contact: boolean;
  created_at?: string;
  updated_at?: string;
}

export const WorkHistory = ({ officerId, userId, onEnsureProfile }: WorkHistoryProps) => {
  const [workHistory, setWorkHistory] = useState<WorkHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("employer-1");
  const [currentOfficerId, setCurrentOfficerId] = useState(officerId);

  useEffect(() => {
    if (officerId) {
      setCurrentOfficerId(officerId);
      loadWorkHistory();
    } else {
      // Initialize with empty entries if no officer profile yet
      setWorkHistory([
        createEmptyEntry(),
        createEmptyEntry(),
        createEmptyEntry(),
      ]);
    }
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

  const loadWorkHistory = async () => {
    const id = await ensureOfficerId();
    if (!id) return;

    const { data, error } = await supabase
      .from("work_history")
      .select("*")
      .eq("officer_id", id)
      .order("start_date", { ascending: false });

    if (error) {
      toast.error("Failed to load work history");
      return;
    }

    // Initialize with 3 empty entries if none exist
    if (!data || data.length === 0) {
      setWorkHistory([
        createEmptyEntry(),
        createEmptyEntry(),
        createEmptyEntry(),
      ]);
    } else {
      // Ensure we always have at least 3 slots
      const entries = [...data] as WorkHistoryEntry[];
      while (entries.length < 3) {
        entries.push(createEmptyEntry());
      }
      setWorkHistory(entries);
    }
  };

  const createEmptyEntry = (): WorkHistoryEntry => ({
    id: "",
    company_name: "",
    position_title: "",
    start_date: "",
    end_date: "",
    company_address: "",
    company_city: "",
    company_state: "",
    company_zip: "",
    supervisor_name: "",
    supervisor_phone: "",
    company_phone: "",
    reason_for_leaving: "",
    job_description: "",
    may_contact: true,
  });

  const handleSave = async (index: number) => {
    const entry = workHistory[index];
    
    if (!entry.company_name) {
      toast.error("Company name is required");
      return;
    }

    // Ensure we have an officer profile
    const id = await ensureOfficerId();
    if (!id) {
      toast.error("Please save your profile first");
      return;
    }

    setLoading(true);
    try {
      const workData = {
        officer_id: id,
        company_name: entry.company_name,
        position_title: entry.position_title,
        start_date: entry.start_date || null,
        end_date: entry.end_date || null,
        company_address: entry.company_address,
        company_city: entry.company_city,
        company_state: entry.company_state,
        company_zip: entry.company_zip,
        supervisor_name: entry.supervisor_name,
        supervisor_phone: entry.supervisor_phone,
        company_phone: entry.company_phone,
        reason_for_leaving: entry.reason_for_leaving,
        job_description: entry.job_description,
        may_contact: entry.may_contact,
      };

      if (entry.id) {
        const { error } = await supabase
          .from("work_history")
          .update(workData)
          .eq("id", entry.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("work_history")
          .insert(workData)
          .select()
          .single();

        if (error) throw error;
        
        // Update the entry with the new ID
        const updated = [...workHistory];
        updated[index] = { ...entry, id: data.id };
        setWorkHistory(updated);
      }

      toast.success("Work history saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save work history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    const entry = workHistory[index];
    
    if (!entry.id) {
      // Just clear the form if not saved
      const updated = [...workHistory];
      updated[index] = createEmptyEntry();
      setWorkHistory(updated);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("work_history")
        .delete()
        .eq("id", entry.id);

      if (error) throw error;

      const updated = [...workHistory];
      updated[index] = createEmptyEntry();
      setWorkHistory(updated);
      
      toast.success("Work history deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete work history");
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = (index: number, field: keyof WorkHistoryEntry, value: any) => {
    const updated = [...workHistory];
    updated[index] = { ...updated[index], [field]: value };
    setWorkHistory(updated);
  };

  const renderEmployerForm = (index: number) => {
    const entry = workHistory[index];
    if (!entry) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employer #{index + 1}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Provide detailed information about your employment history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`company-name-${index}`}>Company Name *</Label>
              <Input
                id={`company-name-${index}`}
                value={entry.company_name}
                onChange={(e) => updateEntry(index, "company_name", e.target.value)}
                placeholder="ABC Security Services"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`position-${index}`}>Position/Job Title</Label>
              <Input
                id={`position-${index}`}
                value={entry.position_title}
                onChange={(e) => updateEntry(index, "position_title", e.target.value)}
                placeholder="Security Officer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`start-date-${index}`}>Start Date</Label>
              <Input
                id={`start-date-${index}`}
                type="date"
                value={entry.start_date}
                onChange={(e) => updateEntry(index, "start_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`end-date-${index}`}>End Date</Label>
              <Input
                id={`end-date-${index}`}
                type="date"
                value={entry.end_date}
                onChange={(e) => updateEntry(index, "end_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`address-${index}`}>Company Address</Label>
            <Input
              id={`address-${index}`}
              value={entry.company_address}
              onChange={(e) => updateEntry(index, "company_address", e.target.value)}
              placeholder="Street Address"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`city-${index}`}>City</Label>
              <Input
                id={`city-${index}`}
                value={entry.company_city}
                onChange={(e) => updateEntry(index, "company_city", e.target.value)}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`state-${index}`}>State</Label>
              <Input
                id={`state-${index}`}
                value={entry.company_state}
                onChange={(e) => updateEntry(index, "company_state", e.target.value)}
                placeholder="State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`zip-${index}`}>ZIP Code</Label>
              <Input
                id={`zip-${index}`}
                value={entry.company_zip}
                onChange={(e) => updateEntry(index, "company_zip", e.target.value)}
                placeholder="ZIP"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`supervisor-${index}`}>Supervisor Name</Label>
              <Input
                id={`supervisor-${index}`}
                value={entry.supervisor_name}
                onChange={(e) => updateEntry(index, "supervisor_name", e.target.value)}
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supervisor-phone-${index}`}>Supervisor Phone</Label>
              <Input
                id={`supervisor-phone-${index}`}
                type="tel"
                value={entry.supervisor_phone}
                onChange={(e) => updateEntry(index, "supervisor_phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`company-phone-${index}`}>Company Phone</Label>
              <Input
                id={`company-phone-${index}`}
                type="tel"
                value={entry.company_phone}
                onChange={(e) => updateEntry(index, "company_phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id={`may-contact-${index}`}
                checked={entry.may_contact}
                onCheckedChange={(checked) => updateEntry(index, "may_contact", checked)}
              />
              <Label htmlFor={`may-contact-${index}`} className="cursor-pointer">
                May we contact this employer?
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`reason-${index}`}>Reason for Leaving</Label>
            <Textarea
              id={`reason-${index}`}
              value={entry.reason_for_leaving}
              onChange={(e) => updateEntry(index, "reason_for_leaving", e.target.value)}
              placeholder="Describe why you left this position..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`description-${index}`}>Job Description</Label>
            <Textarea
              id={`description-${index}`}
              value={entry.job_description}
              onChange={(e) => updateEntry(index, "job_description", e.target.value)}
              placeholder="Describe your duties, responsibilities, and achievements in this role..."
              rows={4}
            />
          </div>

          <Button
            onClick={() => handleSave(index)}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Saving..." : "Save Work History"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="employer-1">Employer 1</TabsTrigger>
        <TabsTrigger value="employer-2">Employer 2</TabsTrigger>
        <TabsTrigger value="employer-3">Employer 3</TabsTrigger>
      </TabsList>

      <TabsContent value="employer-1">
        {renderEmployerForm(0)}
      </TabsContent>

      <TabsContent value="employer-2">
        {renderEmployerForm(1)}
      </TabsContent>

      <TabsContent value="employer-3">
        {renderEmployerForm(2)}
      </TabsContent>
    </Tabs>
  );
};
