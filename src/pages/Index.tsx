import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const features = [
    { icon: Calendar, title: 'Easy Booking', description: 'Book conference halls with just a few clicks' },
    { icon: Clock, title: 'Real-time Availability', description: 'Check hall availability in real-time' },
    { icon: CheckCircle, title: 'Quick Approvals', description: 'Fast approval workflow for bookings' },
    { icon: FileText, title: 'Complete Audit Trail', description: 'Full transparency with detailed logs' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="hero-gradient">
        <div className="container py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-primary-foreground space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <Building2 className="h-7 w-7 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">DIC Hall Booking</h2>
                  <p className="text-sm text-primary-foreground/70">Directorate of Industries & Commerce</p>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Conference Hall
                <span className="block text-accent">Allocation System</span>
              </h1>

              <p className="text-lg text-primary-foreground/80 max-w-md">
                A centralized platform for transparent, efficient, and auditable allocation of conference halls across all sections.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                      <feature.icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-primary-foreground/60">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - CTA Card */}
            <div className="lg:pl-12 animate-slide-up">
              <div className="bg-card rounded-2xl shadow-elevated p-8 max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-foreground">Get Started</h3>
                  <p className="text-muted-foreground mt-1">Login or create an account to book halls</p>
                </div>

                <div className="space-y-4">
                  <Button 
                    variant="accent" 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    Login / Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Secure access for government employees</p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-sm font-medium text-foreground mb-2">System Features:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ Book conference halls online</li>
                    <li>✓ Real-time availability check</li>
                    <li>✓ Admin approval workflow</li>
                    <li>✓ Complete audit trail</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Directorate of Industries & Commerce. All rights reserved.</p>
          <p>Developed with ♥ for Government of India</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
