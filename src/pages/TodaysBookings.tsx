import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useBookings, useUserBookings } from '@/hooks/useBookings';
import { useHalls } from '@/hooks/useHalls';
import { useProfiles } from '@/hooks/useProfiles';
import { useSections } from '@/hooks/useSections';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/navigation/BackButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatTime12Hour } from '@/lib/timeUtils';
import { formatDateLocal } from '@/lib/timeUtils';
import { CalendarCheck, Clock, Building, User, Link as LinkIcon, FileText } from 'lucide-react';

export default function TodaysBookings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: allBookings = [], isLoading: allLoading } = useBookings();
  const { data: userBookings = [], isLoading: userLoading } = useUserBookings();
  const { data: halls = [] } = useHalls();
  const { data: profiles = [] } = useProfiles();
  const { data: sections = [] } = useSections();

  const isLoading = isAdmin ? allLoading : userLoading;
  const bookings = isAdmin ? allBookings : userBookings;

  const today = formatDateLocal(new Date());
  const todaysBookings = bookings.filter(b => b.date === today);

  const getHallName = (hallId: string) => halls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  const getProfileName = (userId: string) => profiles.find(p => p.id === userId)?.name || 'Unknown';
  const getSectionName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    if (!profile?.section_id) return null;
    return sections.find(s => s.id === profile.section_id)?.name || null;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <BackButton className="mb-4" />
        <div className="flex items-center gap-3">
          <CalendarCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Today's Bookings</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {todaysBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No bookings for today</h3>
              <p className="text-muted-foreground text-sm mt-1">There are no bookings scheduled for today.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {todaysBookings
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map(booking => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Building className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">{getHallName(booking.hall_id)}</span>
                          <Badge className={statusColor(booking.status)} variant="outline">
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime12Hour(booking.start_time)} - {formatTime12Hour(booking.end_time)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{booking.purpose}</span>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>
                              {getProfileName(booking.user_id)}
                              {getSectionName(booking.user_id) && (
                                <span className="text-xs ml-1">({getSectionName(booking.user_id)})</span>
                              )}
                            </span>
                          </div>
                        )}

                        {booking.meeting_link && (
                          <div className="flex items-center gap-2 text-sm">
                            <LinkIcon className="h-4 w-4 text-primary" />
                            <a
                              href={booking.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate max-w-xs"
                            >
                              {booking.meeting_link}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
