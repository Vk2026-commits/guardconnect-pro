import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, Video, Lock, Users, CheckCircle2, Building2, User } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import JobListings from "@/components/JobListings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div>
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-primary/20 mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Professional Security Marketplace</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Connect with Top
              <span className="block mt-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Security Professionals
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The premier platform where security officers showcase their expertise and companies find qualified professionals for their security needs.
            </p>
            
            <p className="text-lg font-medium text-primary max-w-2xl mx-auto">
              Free for security professionals to sign up and showcase their skills
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-lg h-12 px-8">
                    Create Your Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Choose Your Role</DialogTitle>
                    <DialogDescription>
                      Are you a security officer looking for work, or a company looking to hire?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-4 py-4">
                    <Link to="/auth?role=officer" className="w-full">
                      <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                        <User className="w-8 h-8" />
                        <span className="font-semibold">I am a Security Officer</span>
                        <span className="text-xs text-muted-foreground">Looking for opportunities</span>
                      </Button>
                    </Link>
                    <Link to="/auth?role=company" className="w-full">
                      <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                        <Building2 className="w-8 h-8" />
                        <span className="font-semibold">I am a Company</span>
                        <span className="text-xs text-muted-foreground">Looking to hire security officers</span>
                      </Button>
                    </Link>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8">
                <Link to="/browse">Browse Professionals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/30 rounded-lg">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features designed for security professionals and hiring companies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Professional Profiles</h3>
                <p className="text-muted-foreground">
                  Create comprehensive profiles showcasing your experience, certifications, and expertise.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Video Interviews</h3>
                <p className="text-muted-foreground">
                  Stand out with professional video interviews that showcase your personality and skills.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Certifications</h3>
                <p className="text-muted-foreground">
                  Display all your security certifications and credentials in one organized place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

            {/* Pricing Tiers */}
            <section className="py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Flexible Access Plans
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose the plan that fits your hiring needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <div className="text-4xl font-bold mb-2">$0</div>
                  <p className="text-muted-foreground">Basic browsing</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>View officer profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Basic information access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Search functionality</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/browse">Start Browsing</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Professional Tier */}
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full mb-2">
                    Popular
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Professional</h3>
                  <div className="text-4xl font-bold mb-2">$19.99</div>
                  <p className="text-muted-foreground">per month</p>
                  <p className="text-sm text-primary font-medium">30-day free trial</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Direct messaging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Email contact access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Advanced search filters</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="border-2 border-accent">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full mb-2">
                    <Lock className="h-3 w-3" />
                    <span>Premium</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <div className="text-4xl font-bold mb-2">$29.99</div>
                  <p className="text-muted-foreground">per month</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>Everything in Professional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>Full certification access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>Video interview viewing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <Link to="/auth">Go Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of security professionals and companies already using We Find Guards
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg h-12 px-8">
              <Link to="/auth?mode=signup">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/browse">Explore Profiles</Link>
            </Button>
          </div>
        </div>
      </section>

          </div>

          {/* Job Listings Sidebar */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <JobListings />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>© 2025 We Find Guards. Connecting security professionals with opportunity.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
