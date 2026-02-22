import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useBookings } from '@/hooks/useBookings';
import { useHalls } from '@/hooks/useHalls';
import { useProfiles } from '@/hooks/useProfiles';
import { useSections } from '@/hooks/useSections';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/navigation/BackButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { formatTime12Hour, formatDateLocal } from '@/lib/timeUtils';
import { CalendarCheck } from 'lucide-react';

export default function TodaysBookings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: allBookings = [], isLoading } = useBookings();
  const { data: halls = [] } = useHalls();
  const { data: profiles = [] } = useProfiles();
  const { data: sections = [] } = useSections();

  const bookings = allBookings;

  const today = formatDateLocal(new Date());
  const todaysBookings = bookings
    .filter(b => b.date === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const getHallName = (hallId: string) => halls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  const getProfileName = (userId: string) => profiles.find(p => p.id === userId)?.name || 'Unknown';
  const getSectionName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    if (!profile?.section_id) return '-';
    return sections.find(s => s.id === profile.section_id)?.name || '-';
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
          <Skeleton className="h-64" />
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
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">S.No</TableHead>
                      <TableHead className="whitespace-nowrap">Conference Hall</TableHead>
                      {isAdmin && <TableHead className="whitespace-nowrap">Booked By</TableHead>}
                      <TableHead className="whitespace-nowrap">Section</TableHead>
                      <TableHead className="whitespace-nowrap">Time</TableHead>
                      <TableHead className="whitespace-nowrap">Meeting Description</TableHead>
                      
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaysBookings.map((booking, index) => (
                      <TableRow key={booking.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{getHallName(booking.hall_id)}</TableCell>
                        {isAdmin && <TableCell>{getProfileName(booking.user_id)}</TableCell>}
                        <TableCell>{getSectionName(booking.user_id)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatTime12Hour(booking.start_time)} - {formatTime12Hour(booking.end_time)}
                        </TableCell>
                        <TableCell>{booking.purpose}</TableCell>
                        <TableCell>
                          <Badge className={statusColor(booking.status)} variant="outline">
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
