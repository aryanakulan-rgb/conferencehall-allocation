import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge';
import { mockBookings, mockHalls } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import { toast } from 'sonner';

export default function AdminBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [remarks, setRemarks] = useState('');

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const getHallName = (hallId: string) => {
    return mockHalls.find(h => h.id === hallId)?.name || 'Unknown Hall';
  };

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.purpose.toLowerCase().includes(searchLower) ||
      getHallName(booking.hallId).toLowerCase().includes(searchLower)
    );
  });

  const filterByStatus = (status: BookingStatus | 'all') => {
    if (status === 'all') return filteredBookings;
    return filteredBookings.filter(b => b.status === status);
  };

  const handleApprove = (booking: Booking) => {
    setBookings(prev => prev.map(b => 
      b.id === booking.id ? { ...b, status: 'approved' as const, updatedAt: new Date().toISOString() } : b
    ));
    toast.success('Booking approved successfully');
  };

  const handleRejectClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setRemarks('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedBooking && remarks.trim()) {
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id ? { ...b, status: 'rejected' as const, remarks: remarks.trim(), updatedAt: new Date().toISOString() } : b
      ));
      setRejectDialogOpen(false);
      setSelectedBooking(null);
      toast.success('Booking rejected');
    }
  };

  const BookingsTable = ({ bookings }: { bookings: Booking[] }) => (
    <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Purpose</TableHead>
            <TableHead>Hall</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No bookings found
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{booking.purpose}</p>
                    <p className="text-xs text-muted-foreground">Section Officer</p>
                  </div>
                </TableCell>
                <TableCell>{getHallName(booking.hallId)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{format(new Date(booking.date), 'MMM d, yyyy')}</p>
                    <p className="text-muted-foreground">{booking.startTime} - {booking.endTime}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  {booking.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="success" onClick={() => handleApprove(booking)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRejectClick(booking)}>
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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
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
              disabled={!remarks.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
