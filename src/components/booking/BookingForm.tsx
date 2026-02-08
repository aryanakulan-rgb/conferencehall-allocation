import { useState, useEffect } from 'react';
import { Hall } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Send, AlertTriangle, CheckCircle2, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { checkBookingConflict } from '@/hooks/useBookings';
import { timeSlots, formatTime12Hour, formatTimeRange12Hour, formatDateLocal } from '@/lib/timeUtils';

interface BookingFormProps {
  halls: Hall[];
  selectedHall?: Hall;
  preselectedDate?: Date;
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface BookingFormData {
  hallId: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  meetingLink?: string;
}


export function BookingForm({ halls, selectedHall, preselectedDate, onSubmit, onCancel, isSubmitting: externalIsSubmitting }: BookingFormProps) {
  const [hallId, setHallId] = useState(selectedHall?.id || '');
  const [date, setDate] = useState<Date | undefined>(preselectedDate);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictStatus, setConflictStatus] = useState<'idle' | 'checking' | 'conflict' | 'available'>('idle');
  const [conflictMessage, setConflictMessage] = useState('');

  const activeHalls = halls.filter(h => h.is_active);
  const isPending = externalIsSubmitting ?? isSubmitting;

  // Check for conflicts when hall, date, or time changes
  useEffect(() => {
    const checkConflict = async () => {
      if (!hallId || !date || !startTime || !endTime) {
        setConflictStatus('idle');
        return;
      }

      if (startTime >= endTime) {
        setConflictStatus('idle');
        return;
      }

      setConflictStatus('checking');
      
      try {
        const dateStr = formatDateLocal(date);
        const { hasConflict, conflictingBooking } = await checkBookingConflict(
          hallId,
          dateStr,
          startTime,
          endTime
        );

        if (hasConflict) {
          setConflictStatus('conflict');
          setConflictMessage(
            `Conflicts with ${conflictingBooking?.status} booking (${formatTimeRange12Hour(conflictingBooking?.start_time || '', conflictingBooking?.end_time || '')})`
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
  }, [hallId, date, startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hallId || !date || !startTime || !endTime || !purpose.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    if (conflictStatus === 'conflict') {
      toast.error('Cannot submit: Time slot has a conflict');
      return;
    }

    setIsSubmitting(true);
    onSubmit({ hallId, date, startTime, endTime, purpose: purpose.trim(), meetingLink: meetingLink.trim() || undefined });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="hall">Conference Hall *</Label>
        <Select value={hallId} onValueChange={setHallId}>
          <SelectTrigger id="hall">
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

      <div className="space-y-2">
        <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="meetingLink"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="pl-10"
            maxLength={500}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger id="startTime">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Start" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {formatTime12Hour(time)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Select value={endTime} onValueChange={setEndTime}>
            <SelectTrigger id="endTime">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="End" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time} disabled={startTime >= time}>
                  {formatTime12Hour(time)}
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
        <Label htmlFor="purpose">Purpose of Booking *</Label>
        <Textarea
          id="purpose"
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

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="accent" 
          className="flex-1" 
          disabled={isPending || conflictStatus === 'conflict' || conflictStatus === 'checking'}
        >
          <Send className="mr-2 h-4 w-4" />
          {isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
}
