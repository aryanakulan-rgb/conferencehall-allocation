import { useState } from 'react';
import { Booking, Hall } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PendingApprovalsProps {
  bookings: Booking[];
  halls: Hall[];
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string, remarks: string) => void;
}

export function PendingApprovals({ bookings, halls, onApprove, onReject }: PendingApprovalsProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [remarks, setRemarks] = useState('');

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const getHallName = (hallId: string) => {
    return halls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  };

  const handleApprove = (booking: Booking) => {
    onApprove(booking.id);
    toast.success('Booking approved successfully');
  };

  const handleRejectClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setRemarks('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedBooking && remarks.trim()) {
      onReject(selectedBooking.id, remarks.trim());
      setRejectDialogOpen(false);
      setSelectedBooking(null);
      toast.success('Booking rejected');
    }
  };

  if (pendingBookings.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pending Approvals</h3>
        <div className="text-center py-8">
          <div className="h-12 w-12 rounded-full bg-success/10 mx-auto mb-3 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <p className="text-sm text-muted-foreground">
            All bookings have been processed
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Pending Approvals</h3>
          <span className="px-2.5 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
            {pendingBookings.length} pending
          </span>
        </div>

        <div className="space-y-4">
          {pendingBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 rounded-lg border border-border bg-secondary/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">{booking.purpose}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    Section Officer
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{getHallName(booking.hall_id)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(booking.date), 'MMM d')}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {booking.start_time} - {booking.end_time}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleApprove(booking)}
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRejectClick(booking)}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks for rejection..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectConfirm}
              disabled={!remarks.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
