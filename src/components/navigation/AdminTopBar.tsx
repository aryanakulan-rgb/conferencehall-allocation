import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminTopBarProps {
  className?: string;
}

export function AdminTopBar({ className }: AdminTopBarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth', { replace: true });
  };

  return (
    <div className={`flex items-center justify-between gap-2 py-2 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHome}
          className="gap-1.5"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
}
