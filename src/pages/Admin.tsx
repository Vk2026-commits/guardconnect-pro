import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, Briefcase, Eye, TrendingUp } from "lucide-react";
import { toast } from "sonner";

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
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Error checking permissions");
      navigate("/dashboard");
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

      // Get recent officers with registration date
      const { data: recentOfficers } = await supabase
        .from("officer_profiles")
        .select("*, profiles!inner(full_name, email, created_at)")
        .order("created_at", { ascending: false })
        .limit(10);

      // Get recent companies
      const { data: recentCompanies } = await supabase
        .from("company_profiles")
        .select("*, profiles!inner(email, created_at)")
        .order("created_at", { ascending: false })
        .limit(10);

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
                  <div key={officer.id} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{officer.profiles?.full_name || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">{officer.title || "Security Officer"}</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary">{officer.view_count} views</span>
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
      </div>
    </div>
  );
};

export default Admin;
