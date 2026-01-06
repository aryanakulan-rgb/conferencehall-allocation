import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge';
import { useUserBookings, Booking, BookingStatus } from '@/hooks/useBookings';
import { useHalls } from '@/hooks/useHalls';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Calendar, Clock, Plus, AlertCircle } from 'lucide-react';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: bookings = [], isLoading: bookingsLoading } = useUserBookings();
  const { data: halls = [], isLoading: hallsLoading } = useHalls();

  const isLoading = bookingsLoading || hallsLoading;

  const getHallName = (hallId: string) => {
    return halls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  };

  const filterBookings = (status: BookingStatus | 'all') => {
    if (status === 'all') return bookings;
    return bookings.filter(b => b.status === status);
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="p-5 rounded-xl border bg-card shadow-soft hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{booking.purpose}</p>
          <p className="text-sm text-muted-foreground">{getHallName(booking.hall_id)}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(booking.date), 'MMM d, yyyy')}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {booking.start_time} - {booking.end_time}
        </div>
      </div>

      {booking.remarks && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{booking.remarks}</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
        Requested on {format(new Date(booking.created_at), 'MMM d, yyyy')}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground">
              Track and manage your booking requests
            </p>
          </div>
          <Button variant="accent" onClick={() => navigate('/halls')}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filterBookings('pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({filterBookings('approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({filterBookings('rejected').length})
            </TabsTrigger>
          </TabsList>

          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <TabsContent key={status} value={status}>
              {filterBookings(status).length === 0 ? (
                <div className="text-center py-12 rounded-xl border bg-card">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground">No bookings found</h3>
                  <p className="text-muted-foreground mb-4">
                    {status === 'all' 
                      ? "You haven't made any booking requests yet"
                      : `No ${status} bookings`
                    }
                  </p>
                  {status === 'all' && (
                    <Button variant="accent" onClick={() => navigate('/halls')}>
                      Book a Hall
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBookings(status).map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
