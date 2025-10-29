import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Award, Video, User, Briefcase, Clock, Upload, FileText } from "lucide-react";
import { CertificationsManager } from "./CertificationsManager";
import { PhotoUpload } from "./PhotoUpload";
import { OfficerPhotos } from "./OfficerPhotos";
import { WorkHistory } from "./WorkHistory";

interface OfficerDashboardProps {
  userId: string;
}

const OfficerDashboard = ({ userId }: OfficerDashboardProps) => {
  const [officerProfile, setOfficerProfile] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    bio: "",
    years_experience: "",
    phone: "",
    address_street: "",
    address_unit: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    linkedin_url: "",
    desired_salary: "",
    employment_type: [] as string[],
    availability_schedule: {} as Record<string, { start: string; end: string }>,
    shift_preference: [] as string[],
  });
  const [quickSetStart, setQuickSetStart] = useState("");
  const [quickSetEnd, setQuickSetEnd] = useState("");

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const ensureOfficerProfile = async () => {
    if (!officerProfile) {
      try {
        const { data, error } = await supabase
          .from("officer_profiles")
          .insert({ user_id: userId })
          .select()
          .single();
        
        if (error) throw error;
        setOfficerProfile(data);
        return data;
      } catch (error: any) {
        toast.error("Failed to create profile");
        return null;
      }
    }
    return officerProfile;
  };

  const loadProfile = async () => {
    // Load profiles table for email
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    setProfile(profileData);

    // Load officer profile
    const { data } = await supabase
      .from("officer_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setOfficerProfile(data);
      setFormData({
        title: data.title || "",
        bio: data.bio || "",
        years_experience: data.years_experience?.toString() || "",
        phone: data.phone || "",
        address_street: data.address_street || "",
        address_unit: data.address_unit || "",
        address_city: data.address_city || "",
        address_state: data.address_state || "",
        address_zip: data.address_zip || "",
        linkedin_url: data.linkedin_url || "",
        desired_salary: data.desired_salary?.toString() || "",
        employment_type: data.employment_type || [],
        availability_schedule: (data.availability_schedule as Record<string, { start: string; end: string }>) || {},
        shift_preference: data.shift_preference || [],
      });
    }
  };

  const handlePhotoChange = async (url: string) => {
    try {
      const { error } = await supabase
        .from("officer_profiles")
        .update({ avatar_url: url })
        .eq("user_id", userId);

      if (error) throw error;
      loadProfile();
    } catch (error: any) {
      toast.error("Failed to update profile photo");
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingResume(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/resume.${fileExt}`;

      // Delete old resume if exists
      if (officerProfile?.resume_url) {
        const oldPath = officerProfile.resume_url.split("/resumes/")[1];
        if (oldPath) {
          await supabase.storage.from("resumes").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);

      const { error } = await supabase
        .from("officer_profiles")
        .update({ resume_url: data.publicUrl })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Resume uploaded successfully!");
      loadProfile();
    } catch (error: any) {
      toast.error("Error uploading resume: " + error.message);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title) {
      toast.error("Professional Title is required");
      return;
    }
    if (!formData.phone) {
      toast.error("Phone number is required");
      return;
    }
    
    setLoading(true);

    try {
      const profileData = {
        user_id: userId,
        title: formData.title,
        bio: formData.bio,
        years_experience: parseInt(formData.years_experience) || null,
        phone: formData.phone,
        address_street: formData.address_street || null,
        address_unit: formData.address_unit || null,
        address_city: formData.address_city || null,
        address_state: formData.address_state || null,
        address_zip: formData.address_zip || null,
        linkedin_url: formData.linkedin_url,
        desired_salary: parseFloat(formData.desired_salary) || null,
        employment_type: formData.employment_type,
        availability_schedule: formData.availability_schedule,
        shift_preference: formData.shift_preference,
      };

      if (officerProfile) {
        const { error } = await supabase
          .from("officer_profiles")
          .update(profileData)
          .eq("id", officerProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("officer_profiles")
          .insert(profileData);

        if (error) throw error;
      }

      toast.success("Profile updated successfully!");
      loadProfile();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {officerProfile ? "Complete" : "Incomplete"}
            </div>
            <p className="text-xs text-muted-foreground">
              {officerProfile ? "Your profile is live" : "Complete your profile to get started"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Add your certifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Interviews</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Upload your interview</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="work-history">Work History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
              <CardDescription>
                Update your profile information to attract potential employers. Fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center pb-4 border-b">
                  <PhotoUpload
                    userId={userId}
                    currentPhotoUrl={officerProfile?.avatar_url}
                    onPhotoChange={handlePhotoChange}
                    size="lg"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className={!formData.title ? "text-destructive" : ""}>
                      Professional Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Licensed Security Officer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={!formData.title ? "border-destructive" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className={!formData.phone ? "text-destructive" : ""}>
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={!formData.phone ? "border-destructive" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      placeholder="5"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address_street">Home Address</Label>
                    <Input
                      id="address_street"
                      placeholder="Street Address"
                      value={formData.address_street}
                      onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_unit">Apt/Unit</Label>
                    <Input
                      id="address_unit"
                      placeholder="Apt, Unit, etc."
                      value={formData.address_unit}
                      onChange={(e) => setFormData({ ...formData, address_unit: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_city">City</Label>
                    <Input
                      id="address_city"
                      placeholder="City"
                      value={formData.address_city}
                      onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_state">State</Label>
                    <Input
                      id="address_state"
                      placeholder="State"
                      value={formData.address_state}
                      onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_zip">ZIP Code</Label>
                    <Input
                      id="address_zip"
                      placeholder="ZIP Code"
                      value={formData.address_zip}
                      onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desired_salary">Desired Annual Salary ($)</Label>
                    <Input
                      id="desired_salary"
                      type="number"
                      placeholder="50000"
                      value={formData.desired_salary}
                      onChange={(e) => setFormData({ ...formData, desired_salary: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume</Label>
                  <div className="flex items-center gap-3">
                    {officerProfile?.resume_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(officerProfile.resume_url, '_blank')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Current Resume
                      </Button>
                    )}
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      className="hidden"
                    />
                    <label htmlFor="resume">
                      <Button 
                        type="button" 
                        variant={officerProfile?.resume_url ? "secondary" : "outline"}
                        size="sm"
                        disabled={uploadingResume}
                        asChild
                      >
                        <span className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          {uploadingResume ? "Uploading..." : officerProfile?.resume_url ? "Replace Resume" : "Upload Resume"}
                        </span>
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX format</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell companies about your experience, specializations, and what makes you an excellent security professional..."
                    rows={6}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Employment Type Preference</Label>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="full-time"
                        checked={formData.employment_type.includes("full_time")}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            employment_type: checked
                              ? [...formData.employment_type, "full_time"]
                              : formData.employment_type.filter((t) => t !== "full_time"),
                          });
                        }}
                      />
                      <Label htmlFor="full-time" className="cursor-pointer">Full-time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="part-time"
                        checked={formData.employment_type.includes("part_time")}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            employment_type: checked
                              ? [...formData.employment_type, "part_time"]
                              : formData.employment_type.filter((t) => t !== "part_time"),
                          });
                        }}
                      />
                      <Label htmlFor="part-time" className="cursor-pointer">Part-time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seasonal"
                        checked={formData.employment_type.includes("seasonal")}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            employment_type: checked
                              ? [...formData.employment_type, "seasonal"]
                              : formData.employment_type.filter((t) => t !== "seasonal"),
                          });
                        }}
                      />
                      <Label htmlFor="seasonal" className="cursor-pointer">Seasonal</Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Weekly Availability
              </CardTitle>
              <CardDescription>
                Set your available hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quick Set Actions */}
                <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
                  <h3 className="font-semibold text-sm">Quick Actions</h3>
                  
                  {/* Set All Days */}
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="quick-start" className="text-xs">Start Time</Label>
                      <Input
                        id="quick-start"
                        type="time"
                        value={quickSetStart}
                        onChange={(e) => setQuickSetStart(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quick-end" className="text-xs">End Time</Label>
                      <Input
                        id="quick-end"
                        type="time"
                        value={quickSetEnd}
                        onChange={(e) => setQuickSetEnd(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (quickSetStart && quickSetEnd) {
                          const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                          const newSchedule: Record<string, { start: string; end: string }> = {};
                          allDays.forEach(day => {
                            newSchedule[day] = { start: quickSetStart, end: quickSetEnd };
                          });
                          setFormData({ ...formData, availability_schedule: newSchedule });
                          toast.success("Applied schedule to all days");
                        } else {
                          toast.error("Please set both start and end times");
                        }
                      }}
                    >
                      Set All Days
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                        const newSchedule: Record<string, { start: string; end: string }> = {};
                        allDays.forEach(day => {
                          newSchedule[day] = { start: "00:00", end: "23:59" };
                        });
                        setFormData({ ...formData, availability_schedule: newSchedule });
                        toast.success("Set to available any time");
                      }}
                    >
                      Available Any Time
                    </Button>
                  </div>

                  {/* Shift Preference */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Preferred Shift</Label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { value: "first_shift", label: "First Shift (Day)" },
                        { value: "second_shift", label: "Second Shift (Evening)" },
                        { value: "third_shift", label: "Third Shift (Night)" },
                        { value: "weekend", label: "Weekends" }
                      ].map((shift) => (
                        <div key={shift.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={shift.value}
                            checked={formData.shift_preference.includes(shift.value)}
                            onCheckedChange={(checked) => {
                              setFormData({
                                ...formData,
                                shift_preference: checked
                                  ? [...formData.shift_preference, shift.value]
                                  : formData.shift_preference.filter((s) => s !== shift.value),
                              });
                            }}
                          />
                          <Label htmlFor={shift.value} className="cursor-pointer text-sm">{shift.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weekly Schedule */}
                <div className="space-y-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center pb-4 border-b last:border-0">
                    <Label className="font-semibold">{day}</Label>
                    <div className="space-y-2">
                      <Label htmlFor={`${day}-start`} className="text-sm text-muted-foreground">Start Time</Label>
                      <Input
                        id={`${day}-start`}
                        type="time"
                        value={formData.availability_schedule[day]?.start || ""}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            availability_schedule: {
                              ...formData.availability_schedule,
                              [day]: {
                                ...formData.availability_schedule[day],
                                start: e.target.value,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${day}-end`} className="text-sm text-muted-foreground">End Time</Label>
                      <Input
                        id={`${day}-end`}
                        type="time"
                        value={formData.availability_schedule[day]?.end || ""}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            availability_schedule: {
                              ...formData.availability_schedule,
                              [day]: {
                                ...formData.availability_schedule[day],
                                end: e.target.value,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSchedule = { ...formData.availability_schedule };
                        delete newSchedule[day];
                        setFormData({
                          ...formData,
                          availability_schedule: newSchedule,
                        });
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                ))}
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : "Save Availability"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <OfficerPhotos userId={userId} />
        </TabsContent>

        <TabsContent value="certifications">
          <CertificationsManager 
            officerId={officerProfile?.id || ""} 
            userId={userId}
            onEnsureProfile={ensureOfficerProfile}
          />
        </TabsContent>

        <TabsContent value="work-history">
          {officerProfile && <WorkHistory officerId={officerProfile.id} userId={userId} />}
          {!officerProfile && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Please complete your profile first to add work history
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfficerDashboard;
