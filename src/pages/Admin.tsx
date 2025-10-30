import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, Briefcase, Eye, TrendingUp, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Analytics {
  totalOfficers: number;
  totalCompanies: number;
  totalHires: number;
  totalProfileViews: number;
  recentOfficers: any[];
  recentCompanies: any[];
  topViewedOfficers: any[];
  recentHires: any[];
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [allOfficers, setAllOfficers] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to access admin panel");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (rolesError || !roles) {
        toast.error("You don't have admin access");
        navigate("/dashboard");
        return;
      }

      await loadAnalytics();
      await loadAllProfiles();
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Error checking permissions");
      navigate("/dashboard");
    }
  };

  const loadAllProfiles = async () => {
    try {
      // Load all officers
      const { data: officers, error: officersError } = await supabase
        .from("officer_profiles")
        .select("*, profiles(full_name, email, created_at)")
        .order("created_at", { ascending: false });

      if (officersError) throw officersError;
      setAllOfficers(officers || []);

      // Load all companies
      const { data: companies, error: companiesError } = await supabase
        .from("company_profiles")
        .select("*, profiles(email, created_at)")
        .order("created_at", { ascending: false });

      if (companiesError) throw companiesError;
      setAllCompanies(companies || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast.error("Error loading profile data");
    }
  };

  const handlePasswordReset = async (email: string, name: string) => {
    setResettingPassword(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('reset-user-password', {
        body: { email },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) throw response.error;

      toast.success(`Password reset email sent to ${name}`);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setResettingPassword(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Get total counts
      const [officersCount, companiesCount, hiresCount, viewsCount] = await Promise.all([
        supabase.from("officer_profiles").select("*", { count: "exact", head: true }),
        supabase.from("company_profiles").select("*", { count: "exact", head: true }),
        supabase.from("hires").select("*", { count: "exact", head: true }),
        supabase.from("profile_views").select("*", { count: "exact", head: true }),
      ]);

      console.log("Counts:", { 
        officers: officersCount.count, 
        companies: companiesCount.count,
        hires: hiresCount.count,
        views: viewsCount.count 
      });

      // Get recent officers with registration date - use left join to avoid RLS issues
      const { data: recentOfficers, error: officersError } = await supabase
        .from("officer_profiles")
        .select("*, profiles(full_name, email, created_at)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (officersError) console.error("Officers error:", officersError);

      // Get recent companies - use left join to avoid RLS issues
      const { data: recentCompanies, error: companiesError } = await supabase
        .from("company_profiles")
        .select("*, profiles(email, created_at)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (companiesError) console.error("Companies error:", companiesError);

      // Get top viewed officers
      const { data: topViewed } = await supabase
        .from("profile_views")
        .select("officer_id, officer_profiles(*, profiles(full_name))")
        .order("viewed_at", { ascending: false });

      // Count views per officer
      const viewCounts: Record<string, { count: number; profile: any }> = {};
      topViewed?.forEach((view: any) => {
        const officerId = view.officer_id;
        if (!viewCounts[officerId]) {
          viewCounts[officerId] = { count: 0, profile: view.officer_profiles };
        }
        viewCounts[officerId].count++;
      });

      const topViewedOfficers = Object.entries(viewCounts)
        .map(([id, data]) => ({ ...data.profile, view_count: data.count }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10);

      // Get recent hires with details
      const { data: recentHires } = await supabase
        .from("hires")
        .select(`
          *,
          officer_profiles(*, profiles(full_name)),
          company_profiles(company_name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      setAnalytics({
        totalOfficers: officersCount.count || 0,
        totalCompanies: companiesCount.count || 0,
        totalHires: hiresCount.count || 0,
        totalProfileViews: viewsCount.count || 0,
        recentOfficers: recentOfficers || [],
        recentCompanies: recentCompanies || [],
        topViewedOfficers,
        recentHires: recentHires || [],
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Error loading analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscriptions for automatic updates
  useEffect(() => {
    if (!analytics) return;

    const channel = supabase
      .channel('admin-analytics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_profiles'
        },
        () => {
          console.log('Company profiles updated, reloading analytics');
          loadAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'officer_profiles'
        },
        () => {
          console.log('Officer profiles updated, reloading analytics');
          loadAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hires'
        },
        () => {
          console.log('Hires updated, reloading analytics');
          loadAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_views'
        },
        () => {
          console.log('Profile views updated, reloading analytics');
          loadAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [analytics]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDaysOnSite = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="officers">All Officers</TabsTrigger>
            <TabsTrigger value="companies">All Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Officers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalOfficers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalCompanies}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hires</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalHires}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalProfileViews}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Recent Officers */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Officers</CardTitle>
              <CardDescription>Latest security officer registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentOfficers.map((officer) => (
                  <div key={officer.id} className="flex justify-between items-start border-b pb-2">
                    <div>
                      <p className="font-medium">{officer.profiles?.full_name || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{officer.profiles?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {calculateDaysOnSite(officer.profiles?.created_at)} days on site
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(officer.profiles?.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Companies</CardTitle>
              <CardDescription>Latest company registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentCompanies.map((company) => (
                  <div key={company.id} className="flex justify-between items-start border-b pb-2">
                    <div>
                      <p className="font-medium">{company.company_name}</p>
                      <p className="text-sm text-muted-foreground">{company.profiles?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {calculateDaysOnSite(company.profiles?.created_at)} days on site
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(company.profiles?.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Viewed Officers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Viewed Officers
              </CardTitle>
              <CardDescription>Officers with most profile views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topViewedOfficers.map((officer, index) => (
                  <div 
                    key={officer.id} 
                    className="flex justify-between items-center border-b pb-2 hover:bg-accent/50 -mx-2 px-2 py-1 rounded cursor-pointer transition-colors"
                    onClick={() => navigate(`/browse?officer=${officer.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{officer.profiles?.full_name || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">{officer.title || "Security Officer"}</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary cursor-pointer hover:underline">{officer.view_count} views</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Hires */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Hires</CardTitle>
              <CardDescription>Latest successful placements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentHires.map((hire: any) => (
                  <div key={hire.id} className="border-b pb-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">{hire.officer_profiles?.profiles?.full_name || "N/A"}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(hire.hire_date)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hired by: {hire.company_profiles?.company_name || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Position: {hire.position_title || "Security Officer"}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                      hire.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hire.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
          </TabsContent>

          <TabsContent value="officers">
            <Card>
              <CardHeader>
                <CardTitle>All Security Officers</CardTitle>
                <CardDescription>Complete list of registered security officers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Officer #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allOfficers.map((officer) => (
                      <TableRow key={officer.id}>
                        <TableCell className="font-medium">{officer.profiles?.full_name || "N/A"}</TableCell>
                        <TableCell>{officer.profiles?.email}</TableCell>
                        <TableCell>{officer.officer_number || "N/A"}</TableCell>
                        <TableCell>{officer.title || "N/A"}</TableCell>
                        <TableCell>{officer.location || "N/A"}</TableCell>
                        <TableCell>{formatDate(officer.profiles?.created_at)}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={resettingPassword}>
                                <KeyRound className="h-4 w-4 mr-2" />
                                Reset Password
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Password</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Send a password reset email to {officer.profiles?.full_name || "this officer"} at {officer.profiles?.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handlePasswordReset(officer.profiles?.email, officer.profiles?.full_name || "Officer")}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Reset Email
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>All Companies</CardTitle>
                <CardDescription>Complete list of registered companies</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company #</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.company_name}</TableCell>
                        <TableCell>{company.profiles?.email}</TableCell>
                        <TableCell>{company.company_number || "N/A"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            company.subscription_tier === 'premium' 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {company.subscription_tier || "free"}
                          </span>
                        </TableCell>
                        <TableCell>{company.contact_person_name || "N/A"}</TableCell>
                        <TableCell>{formatDate(company.profiles?.created_at)}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={resettingPassword}>
                                <KeyRound className="h-4 w-4 mr-2" />
                                Reset Password
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Password</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Send a password reset email to {company.company_name} at {company.profiles?.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handlePasswordReset(company.profiles?.email, company.company_name)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Reset Email
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
