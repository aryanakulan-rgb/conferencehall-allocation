import { useState, useEffect } from 'react';
import { Hall, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Clock, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { checkBookingConflict } from '@/hooks/useBookings';

interface EditBookingDialogProps {
  booking: Booking | null;
  halls: Hall[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    bookingId: string;
    hallId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }) => void;
  isSubmitting?: boolean;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export function EditBookingDialog({ 
  booking, 
  halls, 
  open, 
  onOpenChange, 
  onSave, 
  isSubmitting 
}: EditBookingDialogProps) {
  const [hallId, setHallId] = useState('');
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [conflictStatus, setConflictStatus] = useState<'idle' | 'checking' | 'conflict' | 'available'>('idle');
  const [conflictMessage, setConflictMessage] = useState('');

  const activeHalls = halls.filter(h => h.is_active);

  // Initialize form when booking changes
  useEffect(() => {
    if (booking) {
      setHallId(booking.hall_id);
      setDate(parseISO(booking.date));
      setStartTime(booking.start_time);
      setEndTime(booking.end_time);
      setPurpose(booking.purpose);
      setConflictStatus('idle');
    }
  }, [booking]);

  // Check for conflicts when hall, date, or time changes
  useEffect(() => {
    const checkConflict = async () => {
      if (!hallId || !date || !startTime || !endTime || !booking) {
        setConflictStatus('idle');
        return;
      }

      if (startTime >= endTime) {
        setConflictStatus('idle');
        return;
      }

      setConflictStatus('checking');
      
      try {
        const dateStr = format(date, 'yyyy-MM-dd');
        const { hasConflict, conflictingBooking } = await checkBookingConflict(
          hallId,
          dateStr,
          startTime,
          endTime,
          booking.id
        );

        if (hasConflict) {
          setConflictStatus('conflict');
          setConflictMessage(
            `Conflicts with ${conflictingBooking?.status} booking (${conflictingBooking?.start_time} - ${conflictingBooking?.end_time})`
          );
        } else {
          setConflictStatus('available');
          setConflictMessage('');
        }
      } catch (error) {
        console.error('Error checking conflict:', error);
        setConflictStatus('idle');
      }
    };

    const debounceTimer = setTimeout(checkConflict, 300);
    return () => clearTimeout(debounceTimer);
  }, [hallId, date, startTime, endTime, booking]);

  const handleSave = () => {
    if (!booking || !hallId || !date || !startTime || !endTime || !purpose.trim()) {
      return;
    }

    if (conflictStatus === 'conflict') {
      return;
    }

    onSave({
      bookingId: booking.id,
      hallId,
      date: format(date, 'yyyy-MM-dd'),
      startTime,
      endTime,
      purpose: purpose.trim(),
    });
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-hall">Conference Hall *</Label>
            <Select value={hallId} onValueChange={setHallId}>
              <SelectTrigger id="edit-hall">
                <SelectValue placeholder="Select a hall" />
              </SelectTrigger>
              <SelectContent>
                {activeHalls.map((hall) => (
                  <SelectItem key={hall.id} value={hall.id}>
                    {hall.name} ({hall.capacity} capacity)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startTime">Start Time *</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="edit-startTime">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Start" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-endTime">End Time *</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger id="edit-endTime">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="End" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time} disabled={startTime >= time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conflict Status Alert */}
          {conflictStatus === 'checking' && (
            <Alert className="border-muted">
              <Clock className="h-4 w-4 animate-spin" />
              <AlertDescription>Checking availability...</AlertDescription>
            </Alert>
          )}
          
          {conflictStatus === 'conflict' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{conflictMessage}</AlertDescription>
            </Alert>
          )}
          
          {conflictStatus === 'available' && (
            <Alert className="border-success bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">Time slot is available!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-purpose">Purpose of Booking *</Label>
            <Textarea
              id="edit-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe the purpose of this booking..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {purpose.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="accent" 
              className="flex-1" 
              disabled={isSubmitting || conflictStatus === 'conflict' || conflictStatus === 'checking' || !purpose.trim()}
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
