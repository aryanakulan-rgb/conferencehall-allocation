import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoogleCalendarView } from '@/components/booking/GoogleCalendarView';
import { useBookings } from '@/hooks/useBookings';
import { useHalls } from '@/hooks/useHalls';
import { useProfiles } from '@/hooks/useProfiles';
import { useSections } from '@/hooks/useSections';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/navigation/BackButton';

export default function CalendarPage() {
  const { user } = useAuth();
  
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: halls = [], isLoading: hallsLoading } = useHalls();
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  const { data: sections = [], isLoading: sectionsLoading } = useSections();

  const isLoading = hallsLoading || bookingsLoading || profilesLoading || sectionsLoading;

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
        <BackButton className="mb-4" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Booking Calendar</h1>
          <p className="text-muted-foreground">
            View all bookings across conference halls
          </p>
        </div>

        <GoogleCalendarView 
          bookings={bookings} 
          halls={halls} 
          profiles={profiles}
          sections={sections}
        />
      </div>
    </DashboardLayout>
  );
}
