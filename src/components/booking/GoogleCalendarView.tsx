import { useState, useMemo } from 'react';
import { Booking, Hall, Profile, Section } from '@/types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, MapPin, Trash2, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge';
import { useAuth } from '@/context/AuthContext';

interface GoogleCalendarViewProps {
  bookings: Booking[];
  halls: Hall[];
  profiles?: Profile[];
  sections?: Section[];
  onDeleteBooking?: (bookingId: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function GoogleCalendarView({ bookings, halls, profiles = [], sections = [], onDeleteBooking }: GoogleCalendarViewProps) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedHallId, setSelectedHallId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeHalls = halls.filter(h => h.is_active);
  const isAdmin = user?.role === 'admin';

  const getHallName = (hallId: string) => {
    return halls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  };

  const getProfileByUserId = (userId: string) => {
    return profiles.find(p => p.id === userId);
  };

  const getSectionName = (sectionId: string | null | undefined) => {
    if (!sectionId) return 'No Section';
    return sections.find(s => s.id === sectionId)?.name || 'Unknown Section';
  };

  const getHallColor = (hallId: string) => {
    const hall = halls.find(h => h.id === hallId);
    if (!hall) return 'bg-primary/80 text-primary-foreground';
    return hall.type === 'conference' 
      ? 'bg-primary/80 text-primary-foreground' 
      : 'bg-accent/80 text-accent-foreground';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const canDeleteBooking = (booking: Booking) => {
    // Admin can delete any booking, users can delete their own pending bookings
    if (isAdmin) return true;
    return booking.user_id === user?.id && booking.status === 'pending';
  };

  // Filter bookings by selected hall
  const filteredBookings = useMemo(() => {
    if (selectedHallId === 'all') return bookings;
    return bookings.filter(b => b.hall_id === selectedHallId);
  }, [bookings, selectedHallId]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter(b => isSameDay(new Date(b.date), date));
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDateClick = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length > 0) {
      setSelectedDate(date);
      setDialogOpen(true);
    }
  };

  const handleDelete = (bookingId: string) => {
    if (onDeleteBooking) {
      onDeleteBooking(bookingId);
    }
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <h2 className="text-xl font-semibold text-foreground ml-2">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
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

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground bg-muted/20"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayBookings = getBookingsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const hasBookings = dayBookings.length > 0;
          const maxVisibleBookings = 3;
          const hiddenCount = dayBookings.length - maxVisibleBookings;

          return (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={cn(
                "min-h-[100px] md:min-h-[120px] p-1 border-b border-r border-border transition-colors",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isCurrentMonth && "bg-card",
                hasBookings && "cursor-pointer hover:bg-muted/20",
                index % 7 === 0 && "border-l"
              )}
            >
              {/* Date Number */}
              <div className="flex justify-end mb-1">
                <span
                  className={cn(
                    "text-sm w-7 h-7 flex items-center justify-center rounded-full",
                    isToday && "bg-primary text-primary-foreground font-semibold",
                    !isToday && !isCurrentMonth && "text-muted-foreground",
                    !isToday && isCurrentMonth && "text-foreground"
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Event Bars */}
              <div className="space-y-0.5">
                {dayBookings.slice(0, maxVisibleBookings).map((booking) => (
                  <div
                    key={booking.id}
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded truncate font-medium",
                      getStatusColor(booking.status)
                    )}
                    title={`${booking.purpose} (${booking.start_time} - ${booking.end_time})`}
                  >
                    <span className="hidden sm:inline">{booking.start_time} </span>
                    <span className="truncate">{booking.purpose}</span>
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <div className="text-xs text-muted-foreground px-1.5 font-medium">
                    +{hiddenCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/20 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-success" />
          <span className="text-muted-foreground">Approved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-warning" />
          <span className="text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-destructive" />
          <span className="text-muted-foreground">Rejected</span>
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDateBookings.map((booking) => {
              const profile = getProfileByUserId(booking.user_id);
              const sectionName = getSectionName(profile?.section_id);
              
              return (
                <div
                  key={booking.id}
                  className="p-3 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-foreground text-sm">
                      {booking.purpose}
                    </p>
                    <div className="flex items-center gap-2">
                      <BookingStatusBadge status={booking.status} size="sm" />
                      {canDeleteBooking(booking) && onDeleteBooking && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this booking? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(booking.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
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
                    {profile && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        {profile.name}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" />
                      {sectionName}
                    </div>
                  </div>
                </div>
              );
            })}
            {selectedDateBookings.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No bookings on this date
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
