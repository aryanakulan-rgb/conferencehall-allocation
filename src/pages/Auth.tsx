import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (activeTab === 'signup') {
      try {
        nameSchema.parse(name);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.name = e.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const { error } = await login(email, password);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Login successful!');
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const { error } = await signup(email, password, name);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created successfully! You can now login.');
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-foreground">DIC Hall Booking</h2>
            <p className="text-sm text-muted-foreground">Conference Hall Allocation System</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button 
                  type="submit" 
                  variant="accent" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button 
                  type="submit" 
                  variant="accent" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Demo Credentials</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-background rounded">
                <span className="font-medium text-foreground">Admin:</span>
                <span className="text-muted-foreground">admin@dic.gov.in / admin123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-background rounded">
                <span className="font-medium text-foreground">User:</span>
                <span className="text-muted-foreground">user@dic.gov.in / user123</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            New users are assigned the 'User' role by default.
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <Button variant="link" onClick={() => navigate('/')}>
            ← Back to Home
          </Button>
        </p>
      </div>
    </div>
  );
}
