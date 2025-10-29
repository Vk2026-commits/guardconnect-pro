import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, Video, Lock, Users, CheckCircle2, Building2, User } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import JobListings from "@/components/JobListings";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const { t } = useTranslation();
  
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
              <span className="text-sm font-medium">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              {t('hero.title')}
              <span className="block mt-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
            
            <Dialog>
              <DialogTrigger asChild>
                <p className="text-lg font-medium text-primary max-w-2xl mx-auto cursor-pointer hover:underline">
                  {t('hero.freeProfessionals')}
                </p>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('roleSelection.title')}</DialogTitle>
                  <DialogDescription>
                    {t('roleSelection.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                  <Link to="/auth?role=officer" className="w-full">
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                      <User className="w-8 h-8" />
                      <span className="font-semibold">{t('roleSelection.officer')}</span>
                      <span className="text-xs text-muted-foreground">{t('roleSelection.officerSubtitle')}</span>
                    </Button>
                  </Link>
                  <Link to="/auth?role=company" className="w-full">
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                      <Building2 className="w-8 h-8" />
                      <span className="font-semibold">{t('roleSelection.company')}</span>
                      <span className="text-xs text-muted-foreground">{t('roleSelection.companySubtitle')}</span>
                    </Button>
                  </Link>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-lg h-12 px-8">
                <Link to="/auth?role=officer">Security Professionals Create Your Profile</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8">
                <Link to="/auth?role=company">Create Your Company Profile For Companies</Link>
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
              {t('features.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('features.profiles.title')}</h3>
                <p className="text-muted-foreground">
                  {t('features.profiles.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('features.video.title')}</h3>
                <p className="text-muted-foreground">
                  {t('features.video.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('features.certifications.title')}</h3>
                <p className="text-muted-foreground">
                  {t('features.certifications.description')}
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
              {t('pricing.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{t('pricing.free.name')}</h3>
                  <div className="text-4xl font-bold mb-2">{t('pricing.free.price')}</div>
                  <p className="text-muted-foreground">{t('pricing.free.description')}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{t('pricing.free.features.viewProfiles')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{t('pricing.free.features.basicInfo')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{t('pricing.free.features.search')}</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/browse">{t('pricing.free.button')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Professional Tier */}
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full mb-2">
                    {t('pricing.professional.popular')}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t('pricing.professional.name')}</h3>
                  <div className="text-4xl font-bold mb-2">{t('pricing.professional.price')}</div>
                  <p className="text-muted-foreground">{t('pricing.professional.period')}</p>
                  <p className="text-sm text-primary font-medium">{t('pricing.professional.trial')}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{t('pricing.professional.features.everything')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{t('pricing.professional.features.messaging')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{t('pricing.professional.features.email')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{t('pricing.professional.features.filters')}</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link to="/auth">{t('pricing.professional.button')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="border-2 border-accent">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full mb-2">
                    <Lock className="h-3 w-3" />
                    <span>{t('pricing.premium.name')}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t('pricing.premium.name')}</h3>
                  <div className="text-4xl font-bold mb-2">{t('pricing.premium.price')}</div>
                  <p className="text-muted-foreground">{t('pricing.premium.period')}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>{t('pricing.premium.features.everything')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>{t('pricing.premium.features.certifications')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>{t('pricing.premium.features.video')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>{t('pricing.premium.features.support')}</span>
                  </li>
                </ul>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <Link to="/auth">{t('pricing.premium.button')}</Link>
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
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of security professionals and companies already using
            <br />
            We Find Guards
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg h-12 px-8">
              <Link to="/auth?mode=signup">{t('cta.createAccount')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/browse">{t('cta.exploreProfiles')}</Link>
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
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
