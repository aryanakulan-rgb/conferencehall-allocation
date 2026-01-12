import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { GoogleCalendarView } from '@/components/booking/GoogleCalendarView';
import { EditBookingDialog } from '@/components/booking/EditBookingDialog';
import { PendingApprovals } from '@/components/admin/PendingApprovals';
import { AdminAnalytics } from '@/components/dashboard/AdminAnalytics';
import { useHalls } from '@/hooks/useHalls';
import { useBookings, useUserBookings, useUpdateBookingStatus, useCancelBooking, useUpdateBooking, Booking } from '@/hooks/useBookings';
import { useProfiles } from '@/hooks/useProfiles';
import { useSections } from '@/hooks/useSections';
import { Calendar, CheckCircle, Clock, XCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton } from '@/components/navigation/BackButton';
import { AdminTopBar } from '@/components/navigation/AdminTopBar';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: halls = [], isLoading: hallsLoading } = useHalls();
  const { data: allBookings = [], isLoading: allBookingsLoading } = useBookings();
  const { data: userBookings = [], isLoading: userBookingsLoading } = useUserBookings();
  const { data: profiles = [] } = useProfiles();
  const { data: sections = [] } = useSections();
  
  const updateStatus = useUpdateBookingStatus();
  const cancelBooking = useCancelBooking();
  const updateBooking = useUpdateBooking();

  const isAdmin = user?.role === 'admin';
  // Show all bookings in calendar for everyone, but user stats show only their own
  const isLoading = hallsLoading || allBookingsLoading || userBookingsLoading;

  const filteredHalls = isAdmin 
    ? halls 
    : halls.filter(hall => 
        hall.name.toLowerCase().includes('mini conference') || 
        hall.name.toLowerCase().includes('main conference')
      );

  // User stats use their own bookings
  const userBookingsForStats = isAdmin ? allBookings : userBookings;
  const pendingCount = userBookingsForStats.filter(b => b.status === 'pending').length;
  const approvedCount = userBookingsForStats.filter(b => b.status === 'approved').length;
  const rejectedCount = userBookingsForStats.filter(b => b.status === 'rejected').length;

  const handleApprove = (bookingId: string) => {
    updateStatus.mutate({ bookingId, status: 'approved' });
  };

  const handleReject = (bookingId: string, remarks: string) => {
    updateStatus.mutate({ bookingId, status: 'rejected', remarks });
  };

  const handleDeleteBooking = (bookingId: string) => {
    cancelBooking.mutate(bookingId);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setEditDialogOpen(true);
  };

  const handleSaveBooking = (data: {
    bookingId: string;
    hallId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }) => {
    updateBooking.mutate(data, {
      onSuccess: () => {
        setEditDialogOpen(false);
        setEditingBooking(null);
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {isAdmin ? (
          <>
            <AdminTopBar />
            {/* Pending Approvals - Right below header */}
            <div className="flex justify-end -mt-2">
              <div className="w-full lg:w-[320px]">
                <PendingApprovals 
                  bookings={allBookings} 
                  halls={halls}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            </div>
          </>
        ) : (
          <BackButton className="mb-4" />
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}. {isAdmin ? 'Manage bookings and halls.' : 'View and manage your bookings.'}
            </p>
          </div>
          {!isAdmin && (
            <Button variant="accent" onClick={() => navigate('/halls')}>
              <Calendar className="mr-2 h-4 w-4" />
              Book a Hall
            </Button>
          )}
        </div>

        {isAdmin ? (
          <>
            
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Calendar Full Width */}
                <GoogleCalendarView 
                  bookings={allBookings} 
                  halls={filteredHalls} 
                  profiles={profiles}
                  sections={sections}
                  onDeleteBooking={handleDeleteBooking}
                  onEditBooking={handleEditBooking}
                />
              </TabsContent>
              
              <TabsContent value="analytics">
                <AdminAnalytics 
                  bookings={allBookings} 
                  halls={halls} 
                  profilesCount={profiles.length}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            {/* Stats Grid for Users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="My Bookings"
                value={userBookingsForStats.length}
                subtitle="Total requests"
                icon={Calendar}
                variant="primary"
              />
              <StatCard
                title="Approved"
                value={approvedCount}
                subtitle="Confirmed bookings"
                icon={CheckCircle}
                variant="success"
              />
              <StatCard
                title="Pending"
                value={pendingCount}
                subtitle="Awaiting approval"
                icon={Clock}
                variant="warning"
              />
              <StatCard
                title="Rejected"
                value={rejectedCount}
                subtitle="Declined requests"
                icon={XCircle}
              />
            </div>

            {/* Calendar Full Width */}
            <GoogleCalendarView 
              bookings={allBookings} 
              halls={filteredHalls} 
              profiles={profiles}
              sections={sections}
              onDeleteBooking={handleDeleteBooking}
              onEditBooking={handleEditBooking}
            />
          </>
        )}

        <EditBookingDialog
          booking={editingBooking}
          halls={halls}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveBooking}
          isSubmitting={updateBooking.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
