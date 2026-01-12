import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Building, 
  ClipboardList, 
  Settings,
  ChevronRight,
  CalendarPlus,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'user')[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { title: 'Booking Calendar', href: '/admin-calendar', icon: Calendar, roles: ['admin'] },
  { title: 'Book Room', href: '/book-room', icon: CalendarPlus, roles: ['user'] },
  { title: 'My Bookings', href: '/my-bookings', icon: ClipboardList, roles: ['user'] },
  { title: 'All Bookings', href: '/bookings', icon: ClipboardList, roles: ['admin'] },
  { title: 'Hall Management', href: '/hall-management', icon: Settings, roles: ['admin'] },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <>
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.title}</span>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="rounded-lg bg-sidebar-accent/30 p-4">
          <p className="text-xs text-sidebar-foreground/70 mb-1">Logged in as</p>
          <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
          <p className="text-xs text-sidebar-primary capitalize">{user.role}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );
}

export function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
        <div className="flex flex-col h-full">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
