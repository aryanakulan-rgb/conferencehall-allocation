import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const homePath = isAuthenticated ? '/dashboard' : '/';

  const handleBack = () => {
    // If there is no meaningful browser history, fall back to app “home”.
    if (window.history.length <= 1) {
      navigate(homePath);
      return;
    }
    navigate(-1);
  };

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Button variant="ghost" size="sm" type="button" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Button variant="ghost" size="sm" type="button" onClick={() => navigate(homePath)}>
        <Home className="h-4 w-4 mr-2" />
        Home
      </Button>
    </div>
  );
}
