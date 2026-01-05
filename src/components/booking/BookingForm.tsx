import { useState } from 'react';
import { Hall } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BookingFormProps {
  halls: Hall[];
  selectedHall?: Hall;
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
}

export interface BookingFormData {
  hallId: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export function BookingForm({ halls, selectedHall, onSubmit, onCancel }: BookingFormProps) {
  const [hallId, setHallId] = useState(selectedHall?.id || '');
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeHalls = halls.filter(h => h.isActive);

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

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit({ hallId, date, startTime, endTime, purpose: purpose.trim() });
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
                  {time}
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
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
        <Button type="submit" variant="accent" className="flex-1" disabled={isSubmitting}>
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
}
