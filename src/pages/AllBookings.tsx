import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BackButton } from '@/components/navigation/BackButton';
import { useBookings } from '@/hooks/useBookings';
import { useHalls } from '@/hooks/useHalls';
import { useProfiles } from '@/hooks/useProfiles';
import { useSections } from '@/hooks/useSections';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge';
import { formatTime12Hour } from '@/lib/timeUtils';
import { format, parseISO } from 'date-fns';

export default function AllBookings() {
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: halls = [], isLoading: hallsLoading } = useHalls();
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  const { data: sections = [], isLoading: sectionsLoading } = useSections();

  const isLoading = bookingsLoading || hallsLoading || profilesLoading || sectionsLoading;

  const hallMap = new Map(halls.map((h) => [h.id, h]));
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const sectionMap = new Map(sections.map((s) => [s.id, s]));

  // Sort by date ascending, then start_time ascending
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <BackButton className="mb-2" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
          <p className="text-muted-foreground">
            All section meeting details across conference halls (date-wise ascending)
          </p>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Hall</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedBookings.map((booking) => {
                  const hall = hallMap.get(booking.hall_id);
                  const profile = profileMap.get(booking.user_id);
                  const section = profile?.section_id ? sectionMap.get(profile.section_id) : null;

                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(parseISO(booking.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatTime12Hour(booking.start_time)} - {formatTime12Hour(booking.end_time)}
                      </TableCell>
                      <TableCell>{hall?.name ?? '—'}</TableCell>
                      <TableCell>{section?.name ?? '—'}</TableCell>
                      <TableCell className="max-w-xs truncate">{booking.purpose}</TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
