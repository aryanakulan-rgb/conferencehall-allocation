import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Building, 
  ClipboardList, 
  CalendarPlus,
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'user')[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { title: 'Book', href: '/book-room', icon: CalendarPlus, roles: ['user'] },
  { title: 'Calendar', href: '/calendar', icon: Calendar, roles: ['admin', 'user'] },
  { title: 'Halls', href: '/halls', icon: Building, roles: ['admin', 'user'] },
  { title: 'Bookings', href: '/my-bookings', icon: ClipboardList, roles: ['user'] },
  { title: 'Bookings', href: '/bookings', icon: ClipboardList, roles: ['admin'] },
  { title: 'Manage', href: '/hall-management', icon: Settings, roles: ['admin'] },
];

export function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredItems = navItems
    .filter(item => item.roles.includes(user.role))
    .slice(0, 5); // Limit to 5 items for bottom nav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-primary"
              )}>
                {item.title}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}