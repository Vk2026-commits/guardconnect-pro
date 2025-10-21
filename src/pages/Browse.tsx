import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, DollarSign, Briefcase, Search, Heart, HeartOff, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import HireButton from "@/components/dashboard/HireButton";
import { toast } from "sonner";

const Browse = () => {
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadOfficers();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser(session.user);
      const { data } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setCompanyProfile(data);
    }
  };

  const loadOfficers = async () => {
    const { data } = await supabase
      .from("officer_profiles")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    setOfficers(data || []);
    setLoading(false);
  };

  const filteredOfficers = officers.filter((officer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      officer.title?.toLowerCase().includes(searchLower) ||
      officer.location?.toLowerCase().includes(searchLower) ||
      officer.profiles?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewProfile = async (officer: any) => {
    setSelectedOfficer(officer);
    
    // Track profile view if user is a company
    if (companyProfile && currentUser) {
      try {
        await supabase.from("profile_views").insert({
          officer_id: officer.id,
          company_id: companyProfile.id,
          viewer_user_id: currentUser.id,
        });
      } catch (error) {
        console.error("Error tracking profile view:", error);
      }
    }
  };

  const handleInterest = async (officerId: string, status: 'interested' | 'not_interested') => {
    if (!companyProfile) {
      toast.error("Please create a company profile first");
      return;
    }

    try {
      const { error } = await supabase
        .from("officer_interests")
        .upsert(
          {
            company_id: companyProfile.id,
            officer_id: officerId,
            status,
          },
          { onConflict: 'company_id,officer_id' }
        );

      if (error) throw error;
      toast.success(`Officer marked as ${status === 'interested' ? 'interested' : 'not interested'}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const isFreeTier = !companyProfile || companyProfile.subscription_tier === 'free';
  const canViewFullDetails = companyProfile && ['professional', 'premium'].includes(companyProfile.subscription_tier);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Security Professionals</h1>
          <p className="text-muted-foreground text-lg">
            Find qualified security officers for your needs
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, title, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOfficers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                No officers found. Try adjusting your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOfficers.map((officer) => (
              <Card key={officer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {isFreeTier && officer.profiles?.full_name 
                          ? `${officer.profiles.full_name.split(' ')[0]} ${officer.profiles.full_name.split(' ').slice(1).map((n: string) => n[0]).join('')}.`
                          : officer.profiles?.full_name || "Anonymous"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {officer.title || "Security Officer"}
                      </CardDescription>
                    </div>
                    {officer.availability_status === "available" && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Available
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {officer.bio || "No bio provided yet."}
                  </p>

                  <div className="space-y-2 text-sm">
                    {officer.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{officer.location}</span>
                      </div>
                    )}
                    
                    {officer.years_experience && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{officer.years_experience} years experience</span>
                      </div>
                    )}

                    {officer.hourly_rate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>${officer.hourly_rate}/hour</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handleViewProfile(officer)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Profile Detail Dialog */}
      <Dialog open={!!selectedOfficer} onOpenChange={(open) => !open && setSelectedOfficer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isFreeTier && selectedOfficer?.profiles?.full_name 
                ? `${selectedOfficer.profiles.full_name.split(' ')[0]} ${selectedOfficer.profiles.full_name.split(' ').slice(1).map((n: string) => n[0]).join('')}.`
                : selectedOfficer?.profiles?.full_name || "Officer Profile"}
            </DialogTitle>
            <DialogDescription>
              {selectedOfficer?.title || "Security Officer"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOfficer && (
            <div className="space-y-4">
              {isFreeTier && (
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Limited Information Available</AlertTitle>
                  <AlertDescription>
                    Upgrade to Professional or Premium to view full officer details, including contact information, work history, and certifications.
                    <Link to="/auth?role=company" className="block mt-2">
                      <Button variant="link" className="p-0 h-auto">Upgrade Now</Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-4">
                {selectedOfficer.availability_status === "available" && (
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                )}
                {!isFreeTier && selectedOfficer.officer_number && (
                  <span className="text-sm text-muted-foreground">
                    ID: {selectedOfficer.officer_number}
                  </span>
                )}
              </div>

              {selectedOfficer.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{selectedOfficer.bio}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {selectedOfficer.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedOfficer.location}</span>
                  </div>
                )}
                
                {selectedOfficer.years_experience && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedOfficer.years_experience} years experience</span>
                  </div>
                )}

                {canViewFullDetails && selectedOfficer.hourly_rate && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">${selectedOfficer.hourly_rate}/hour</span>
                  </div>
                )}

                {canViewFullDetails && selectedOfficer.phone && (
                  <div className="text-sm">
                    <span className="font-medium">Phone: </span>
                    {selectedOfficer.phone}
                  </div>
                )}

                {canViewFullDetails && selectedOfficer.profiles?.email && (
                  <div className="text-sm">
                    <span className="font-medium">Email: </span>
                    {selectedOfficer.profiles.email}
                  </div>
                )}
              </div>

              {canViewFullDetails && selectedOfficer.main_region && (
                <div>
                  <h3 className="font-semibold mb-2">Main Region</h3>
                  <p className="text-sm">{selectedOfficer.main_region}</p>
                </div>
              )}

              {companyProfile && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleInterest(selectedOfficer.id, 'interested')}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Interested
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleInterest(selectedOfficer.id, 'not_interested')}
                    >
                      <HeartOff className="w-4 h-4 mr-2" />
                      Not Interested
                    </Button>
                  </div>
                  
                  {canViewFullDetails && (
                    <HireButton 
                      officerId={selectedOfficer.id}
                      officerName={selectedOfficer.profiles?.full_name || "Officer"}
                      companyId={companyProfile.id}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Browse;
