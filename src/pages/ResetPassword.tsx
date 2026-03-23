import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import dicKeralaEmblem from '@/assets/dic-kerala-emblem.png';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');

      if (type === 'recovery') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setEmail(session.user.email || '');
          setIsValidSession(true);
        }
      }

      // Also listen for auth state changes (recovery event)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          setEmail(session.user.email || '');
          setIsValidSession(true);
        }
      });

      setIsChecking(false);
      return () => subscription.unsubscribe();
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully! Redirecting to login...');
      await supabase.auth.signOut();
      setTimeout(() => navigate('/auth', { replace: true }), 2000);
    }

    setIsSubmitting(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden">
              <img src={dicKeralaEmblem} alt="DI&C Kerala Emblem" className="h-12 w-12 object-contain" />
            </div>
          </div>
          <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Invalid or Expired Link</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button variant="accent" className="w-full" onClick={() => navigate('/auth')}>
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden">
            <img src={dicKeralaEmblem} alt="DI&C Kerala Emblem" className="h-12 w-12 object-contain" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-foreground">DI&C Hall Booking</h2>
            <p className="text-sm text-muted-foreground">Reset Your Password</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">Set New Password</h3>
            <p className="text-sm text-muted-foreground">Enter your email and new password below</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Button variant="link" onClick={() => navigate('/auth')}>
            ← Back to Login
          </Button>
        </p>
      </div>
    </div>
  );
}
