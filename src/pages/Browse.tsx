import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, DollarSign, Briefcase, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Browse = () => {
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadOfficers();
  }, []);

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
                        {officer.profiles?.full_name || "Anonymous"}
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

                  <Button className="w-full" asChild>
                    <Link to={`/profile/${officer.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
