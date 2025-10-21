import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, Crown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EmploymentTracking from "./EmploymentTracking";
import InterestedOfficers from "./InterestedOfficers";

interface CompanyDashboardProps {
  userId: string;
}

const CompanyDashboard = ({ userId }: CompanyDashboardProps) => {
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    company_size: "",
    website_url: "",
    contact_person_name: "",
    contact_person_title: "",
    contact_person_position: "",
    company_phone: "",
    company_phone_ext: "",
    contact_cell_phone: "",
    contact_email: "",
  });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setCompanyProfile(data);
      setFormData({
        company_name: data.company_name || "",
        industry: data.industry || "",
        company_size: data.company_size || "",
        website_url: data.website_url || "",
        contact_person_name: data.contact_person_name || "",
        contact_person_title: data.contact_person_title || "",
        contact_person_position: data.contact_person_position || "",
        company_phone: data.company_phone || "",
        company_phone_ext: data.company_phone_ext || "",
        contact_cell_phone: data.contact_cell_phone || "",
        contact_email: data.contact_email || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        user_id: userId,
        ...formData,
      };

      if (companyProfile) {
        const { error } = await supabase
          .from("company_profiles")
          .update(profileData)
          .eq("id", companyProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("company_profiles")
          .insert(profileData);

        if (error) throw error;
      }

      toast.success("Company profile updated successfully!");
      loadProfile();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      free: { variant: "secondary", icon: null },
      professional: { variant: "default", icon: Users },
      premium: { variant: "default", icon: Crown },
    };

    const config = variants[tier] || variants.free;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={tier === "premium" ? "bg-accent text-accent-foreground" : ""}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {companyProfile && getTierBadge(companyProfile.subscription_tier)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {companyProfile?.subscription_tier === "free" && "Upgrade for more features"}
              {companyProfile?.subscription_tier === "professional" && "Access to direct messaging"}
              {companyProfile?.subscription_tier === "premium" && "Full access to all features"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Profile</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companyProfile ? "Complete" : "Incomplete"}
            </div>
            <p className="text-xs text-muted-foreground">
              {companyProfile ? "Profile is set up" : "Complete your company profile"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  placeholder="Acme Security Services"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="Commercial Security"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_size">Company Size</Label>
                <Input
                  id="company_size"
                  placeholder="1-50 employees"
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Hiring Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_person_name">Contact Person Name</Label>
                  <Input
                    id="contact_person_name"
                    placeholder="John Doe"
                    value={formData.contact_person_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person_title">Title</Label>
                  <Input
                    id="contact_person_title"
                    placeholder="HR Manager"
                    value={formData.contact_person_title}
                    onChange={(e) => setFormData({ ...formData, contact_person_title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person_position">Position at Company</Label>
                  <Input
                    id="contact_person_position"
                    placeholder="Director of Operations"
                    value={formData.contact_person_position}
                    onChange={(e) => setFormData({ ...formData, contact_person_position: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email Address</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_phone">Company Phone Number</Label>
                  <Input
                    id="company_phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.company_phone}
                    onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_phone_ext">Phone Extension</Label>
                  <Input
                    id="company_phone_ext"
                    placeholder="1234"
                    value={formData.company_phone_ext}
                    onChange={(e) => setFormData({ ...formData, company_phone_ext: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_cell_phone">Cell Phone Number</Label>
                  <Input
                    id="contact_cell_phone"
                    type="tel"
                    placeholder="(555) 987-6543"
                    value={formData.contact_cell_phone}
                    onChange={(e) => setFormData({ ...formData, contact_cell_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Officers</TabsTrigger>
          <TabsTrigger value="interested">Interested</TabsTrigger>
          <TabsTrigger value="employment">Hired</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle>Browse Security Officers</CardTitle>
              <CardDescription>
                Find qualified security professionals for your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/browse">Browse Professionals</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interested">
          {companyProfile && <InterestedOfficers companyId={companyProfile.id} />}
        </TabsContent>

        <TabsContent value="employment">
          {companyProfile && <EmploymentTracking companyId={companyProfile.id} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDashboard;
