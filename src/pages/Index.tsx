import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Shield, User, Lock, ArrowRight, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/types';

const Index = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('user');

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password, activeRole);
    
    if (success) {
      toast.success('Login successful');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials. Try demo accounts.');
    }
    
    setIsLoading(false);
  };

  const features = [
    { icon: Calendar, title: 'Easy Booking', description: 'Book conference halls with just a few clicks' },
    { icon: Clock, title: 'Real-time Availability', description: 'Check hall availability in real-time' },
    { icon: CheckCircle, title: 'Quick Approvals', description: 'Fast approval workflow for bookings' },
    { icon: FileText, title: 'Complete Audit Trail', description: 'Full transparency with detailed logs' },
  ];

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

            {/* Login Card */}
            <div className="lg:pl-12 animate-slide-up">
              <div className="bg-card rounded-2xl shadow-elevated p-8 max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-foreground">Welcome Back</h3>
                  <p className="text-muted-foreground mt-1">Sign in to access the portal</p>
                </div>

                <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as UserRole)} className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user" className="gap-2">
                      <User className="h-4 w-4" />
                      User Login
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Login
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="accent" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs font-medium text-foreground mb-2">Demo Credentials:</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p><span className="font-medium">Admin:</span> admin@dic.gov.in / password</p>
                    <p><span className="font-medium">User:</span> user@dic.gov.in / password</p>
                  </div>
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
