import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoogleCalendarView } from '@/components/booking/GoogleCalendarView';
import { useBookings, useUserBookings } from '@/hooks/useBookings';
import { useHalls } from '@/hooks/useHalls';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
  const { user } = useAuth();
  
  const { data: allBookings = [], isLoading: allBookingsLoading } = useBookings();
  const { data: userBookings = [], isLoading: userBookingsLoading } = useUserBookings();
  const { data: halls = [], isLoading: hallsLoading } = useHalls();

  const isAdmin = user?.role === 'admin';
  const bookings = isAdmin ? allBookings : userBookings;
  const isLoading = hallsLoading || (isAdmin ? allBookingsLoading : userBookingsLoading);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Booking Calendar</h1>
          <p className="text-muted-foreground">
            View all bookings across conference halls
          </p>
        </div>

        <GoogleCalendarView bookings={bookings} halls={halls} />
      </div>
    </DashboardLayout>
  );
}
