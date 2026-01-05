import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Building, 
  ClipboardList, 
  FileText, 
  Users, 
  Settings,
  ChevronRight
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
  { title: 'Calendar', href: '/calendar', icon: Calendar, roles: ['admin', 'user'] },
  { title: 'Halls', href: '/halls', icon: Building, roles: ['admin', 'user'] },
  { title: 'My Bookings', href: '/my-bookings', icon: ClipboardList, roles: ['user'] },
  { title: 'All Bookings', href: '/bookings', icon: ClipboardList, roles: ['admin'] },
  { title: 'Reports', href: '/reports', icon: FileText, roles: ['admin'] },
  { title: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
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

      <div className="p-4 border-t border-sidebar-border">
        <div className="rounded-lg bg-sidebar-accent/30 p-4">
          <p className="text-xs text-sidebar-foreground/70 mb-1">Logged in as</p>
          <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
          <p className="text-xs text-sidebar-primary capitalize">{user.role}</p>
        </div>
      </div>
    </aside>
  );
}
