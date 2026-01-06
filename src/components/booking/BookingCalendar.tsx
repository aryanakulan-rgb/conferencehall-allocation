import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Booking, Hall } from '@/types';
import { format, isSameDay } from 'date-fns';
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge';
import { Clock, MapPin } from 'lucide-react';

interface BookingCalendarProps {
  bookings: Booking[];
  halls: Hall[];
}

export function BookingCalendar({ bookings, halls }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getHallName = (hallId: string) => {
    return halls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  };

  const bookingsOnDate = bookings.filter(b => 
    isSameDay(new Date(b.date), selectedDate)
  );

  const hasBookingOnDate = (date: Date) => {
    return bookings.some(b => isSameDay(new Date(b.date), date));
  };

  return (
    <div className="rounded-xl border bg-card shadow-soft">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Booking Calendar</h3>
        <p className="text-sm text-muted-foreground">View hall availability and bookings</p>
      </div>

      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={{
              booked: (date) => hasBookingOnDate(date),
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: 'hsl(var(--accent) / 0.2)',
                fontWeight: 600,
              },
            }}
            className="rounded-md"
          />
        </div>

        <div className="p-6">
          <h4 className="font-medium text-foreground mb-4">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h4>

          {bookingsOnDate.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No bookings on this date
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingsOnDate.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-foreground text-sm">
                      {booking.purpose}
                    </p>
                    <BookingStatusBadge status={booking.status} size="sm" />
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {getHallName(booking.hall_id)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
