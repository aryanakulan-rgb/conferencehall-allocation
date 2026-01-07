import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileSidebar } from './Sidebar';
import { useSections } from '@/hooks/useSections';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: sections } = useSections();

  const userSection = sections?.find(s => s.id === user?.sectionId);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          {user && <MobileSidebar />}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">DIC Hall Booking</h1>
            <p className="text-xs text-muted-foreground">Directorate of Industries & Commerce</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {userSection ? `${userSection.name} • ` : ''}<span className="capitalize">{user.role}</span>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
