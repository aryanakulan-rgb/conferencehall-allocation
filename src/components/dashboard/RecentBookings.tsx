import { Booking, Hall } from '@/types';
import { BookingStatusBadge } from './BookingStatusBadge';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatTimeRange12Hour } from '@/lib/timeUtils';

interface RecentBookingsProps {
  bookings: Booking[];
  halls: Hall[];
}

export function RecentBookings({ bookings, halls }: RecentBookingsProps) {
  const getHallName = (hallId: string) => {
    return halls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Bookings</h3>
      
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No bookings found
          </p>
        ) : (
          bookings.slice(0, 5).map((booking) => (
            <div
              key={booking.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground truncate">
                      {booking.purpose}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getHallName(booking.hall_id)}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} size="sm" />
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(booking.date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeRange12Hour(booking.start_time, booking.end_time)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
