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
import { Award, Video, User, Briefcase, Clock } from "lucide-react";
import { CertificationsManager } from "./CertificationsManager";
import { PhotoUpload } from "./PhotoUpload";
import { OfficerPhotos } from "./OfficerPhotos";
import { WorkHistory } from "./WorkHistory";

interface OfficerDashboardProps {
  userId: string;
}

const OfficerDashboard = ({ userId }: OfficerDashboardProps) => {
  const [officerProfile, setOfficerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    bio: "",
    years_experience: "",
    phone: "",
    location: "",
    linkedin_url: "",
    hourly_rate: "",
    employment_type: [] as string[],
    availability_schedule: {} as Record<string, { start: string; end: string }>,
    shift_preference: [] as string[],
  });
  const [quickSetStart, setQuickSetStart] = useState("");
  const [quickSetEnd, setQuickSetEnd] = useState("");

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
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
        location: data.location || "",
        linkedin_url: data.linkedin_url || "",
        hourly_rate: data.hourly_rate?.toString() || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        user_id: userId,
        title: formData.title,
        bio: formData.bio,
        years_experience: parseInt(formData.years_experience) || null,
        phone: formData.phone,
        location: formData.location,
        linkedin_url: formData.linkedin_url,
        hourly_rate: parseFloat(formData.hourly_rate) || null,
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
                Update your profile information to attract potential employers
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
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Licensed Security Officer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      placeholder="25.00"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    />
                  </div>
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
          {officerProfile && <CertificationsManager officerId={officerProfile.id} userId={userId} />}
          {!officerProfile && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Please complete your profile first to add certifications
              </CardContent>
            </Card>
          )}
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
