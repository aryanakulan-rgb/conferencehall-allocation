import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge';
import { useBookings, useUpdateBookingStatus, Booking, BookingStatus } from '@/hooks/useBookings';
import { useHalls } from '@/hooks/useHalls';
import { useProfiles } from '@/hooks/useProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Search, CheckCircle, XCircle, Eye, Link } from 'lucide-react';
import { AdminTopBar } from '@/components/navigation/AdminTopBar';
import { formatTimeRange12Hour } from '@/lib/timeUtils';

export default function AdminBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [remarks, setRemarks] = useState('');

  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: halls = [], isLoading: hallsLoading } = useHalls();
  const { data: profiles = [] } = useProfiles();
  const updateStatus = useUpdateBookingStatus();

  const isLoading = bookingsLoading || hallsLoading;

  if (user?.role !== 'admin') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const getHallName = (hallId: string) => {
    return halls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  };

  const getUserName = (userId: string) => {
    return profiles.find(p => p.id === userId)?.name || 'Unknown User';
  };

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.purpose.toLowerCase().includes(searchLower) ||
      getHallName(booking.hall_id).toLowerCase().includes(searchLower) ||
      getUserName(booking.user_id).toLowerCase().includes(searchLower)
    );
  });

  const filterByStatus = (status: BookingStatus | 'all') => {
    if (status === 'all') return filteredBookings;
    return filteredBookings.filter(b => b.status === status);
  };

  const handleApprove = (booking: Booking) => {
    updateStatus.mutate({ bookingId: booking.id, status: 'approved' });
  };

  const handleRejectClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setRemarks('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedBooking && remarks.trim()) {
      updateStatus.mutate({ 
        bookingId: selectedBooking.id, 
        status: 'rejected', 
        remarks: remarks.trim() 
      });
      setRejectDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const BookingsTable = ({ bookings }: { bookings: Booking[] }) => (
    <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Purpose</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Hall</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Meeting Link</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No bookings found
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{booking.purpose}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{getUserName(booking.user_id)}</p>
                </TableCell>
                <TableCell>{getHallName(booking.hall_id)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{format(new Date(booking.date), 'MMM d, yyyy')}</p>
                    <p className="text-muted-foreground">{formatTimeRange12Hour(booking.start_time, booking.end_time)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {booking.meeting_link ? (
                    <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                      <Link className="h-3 w-3" />
                      Join
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  {booking.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleApprove(booking)}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleRejectClick(booking)}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <AdminTopBar />
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
          <p className="text-muted-foreground">
            Manage and process booking requests
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({filteredBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({filterByStatus('approved').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filterByStatus('rejected').length})</TabsTrigger>
          </TabsList>

          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <TabsContent key={status} value={status}>
              <BookingsTable bookings={filterByStatus(status)} />
            </TabsContent>
          ))}
        </Tabs>
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
              disabled={!remarks.trim() || updateStatus.isPending}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
