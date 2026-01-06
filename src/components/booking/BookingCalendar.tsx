import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Booking, Hall } from '@/types';
import { format, isSameDay } from 'date-fns';
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge';
import { Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  bookings: Booking[];
  halls: Hall[];
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export function BookingCalendar({ bookings, halls }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHallId, setSelectedHallId] = useState<string>('all');

  const getHallName = (hallId: string) => {
    return halls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  };

  const bookingsOnDate = bookings.filter(b => 
    isSameDay(new Date(b.date), selectedDate) &&
    (selectedHallId === 'all' || b.hall_id === selectedHallId)
  );

  const approvedBookingsOnDate = bookingsOnDate.filter(b => 
    b.status === 'approved' || b.status === 'pending'
  );

  const hasBookingOnDate = (date: Date) => {
    return bookings.some(b => 
      isSameDay(new Date(b.date), date) &&
      (selectedHallId === 'all' || b.hall_id === selectedHallId)
    );
  };

  // Check if a time slot is booked
  const isSlotBooked = (time: string, hallId?: string) => {
    return approvedBookingsOnDate.some(booking => {
      if (hallId && booking.hall_id !== hallId) return false;
      return time >= booking.start_time && time < booking.end_time;
    });
  };

  // Get booking for a specific slot
  const getBookingForSlot = (time: string, hallId?: string) => {
    return approvedBookingsOnDate.find(booking => {
      if (hallId && booking.hall_id !== hallId) return false;
      return time >= booking.start_time && time < booking.end_time;
    });
  };

  const activeHalls = halls.filter(h => h.is_active);
  const displayHalls = selectedHallId === 'all' ? activeHalls : activeHalls.filter(h => h.id === selectedHallId);

  return (
    <div className="rounded-xl border bg-card shadow-soft">
      <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Booking Calendar</h3>
          <p className="text-sm text-muted-foreground">View hall availability and bookings</p>
        </div>
        <Select value={selectedHallId} onValueChange={setSelectedHallId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by hall" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Halls</SelectItem>
            {activeHalls.map((hall) => (
              <SelectItem key={hall.id} value={hall.id}>
                {hall.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            className="rounded-md pointer-events-auto"
          />

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-destructive/80" />
              <span className="text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-warning/80" />
              <span className="text-muted-foreground">Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-success/20 border border-success/50" />
              <span className="text-muted-foreground">Available</span>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-auto max-h-[500px]">
          <h4 className="font-medium text-foreground mb-4">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h4>

          {/* Time Slot Grid */}
          <div className="space-y-4">
            {displayHalls.map((hall) => (
              <div key={hall.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={hall.type === 'conference' ? 'default' : 'secondary'} className="text-xs">
                    {hall.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">({hall.capacity} capacity)</span>
                </div>
                
                <div className="grid grid-cols-6 gap-1">
                  {timeSlots.map((time) => {
                    const booking = getBookingForSlot(time, hall.id);
                    const isBooked = !!booking;
                    const isPending = booking?.status === 'pending';
                    
                    return (
                      <div
                        key={`${hall.id}-${time}`}
                        className={cn(
                          "px-1.5 py-1 text-xs rounded text-center transition-colors",
                          isBooked && !isPending && "bg-destructive/80 text-destructive-foreground",
                          isBooked && isPending && "bg-warning/80 text-warning-foreground",
                          !isBooked && "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                        )}
                        title={isBooked ? `${booking.purpose} (${booking.status})` : 'Available'}
                      >
                        {time}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Booking Details */}
          {bookingsOnDate.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h5 className="font-medium text-sm text-foreground mb-3">Booking Details</h5>
              <div className="space-y-3">
                {bookingsOnDate.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 rounded-lg bg-secondary/50 border border-border/50"
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
            </div>
          )}

          {bookingsOnDate.length === 0 && (
            <div className="text-center py-8 mt-4">
              <div className="h-12 w-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No bookings on this date
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
