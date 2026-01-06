import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { PendingApprovals } from '@/components/admin/PendingApprovals';
import { useHalls } from '@/hooks/useHalls';
import { useBookings, useUserBookings, useUpdateBookingStatus } from '@/hooks/useBookings';
import { useProfiles } from '@/hooks/useProfiles';
import { Building, Calendar, CheckCircle, Clock, Users, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: halls = [], isLoading: hallsLoading } = useHalls();
  const { data: allBookings = [], isLoading: allBookingsLoading } = useBookings();
  const { data: userBookings = [], isLoading: userBookingsLoading } = useUserBookings();
  const { data: profiles = [] } = useProfiles();
  
  const updateStatus = useUpdateBookingStatus();

  const isAdmin = user?.role === 'admin';
  const bookings = isAdmin ? allBookings : userBookings;
  const isLoading = hallsLoading || (isAdmin ? allBookingsLoading : userBookingsLoading);

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length;
  const activeHalls = halls.filter(h => h.is_active).length;

  const handleApprove = (bookingId: string) => {
    updateStatus.mutate({ bookingId, status: 'approved' });
  };

  const handleReject = (bookingId: string, remarks: string) => {
    updateStatus.mutate({ bookingId, status: 'rejected', remarks });
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
      <div className="space-y-8 animate-fade-in">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isAdmin ? (
            <>
              <StatCard
                title="Total Bookings"
                value={bookings.length}
                subtitle="All time"
                icon={Calendar}
                variant="primary"
              />
              <StatCard
                title="Pending Approvals"
                value={pendingCount}
                subtitle="Requires action"
                icon={Clock}
                variant="warning"
              />
              <StatCard
                title="Active Halls"
                value={activeHalls}
                subtitle={`of ${halls.length} total`}
                icon={Building}
              />
              <StatCard
                title="Total Users"
                value={profiles.length}
                subtitle="Registered users"
                icon={Users}
              />
            </>
          ) : (
            <>
              <StatCard
                title="My Bookings"
                value={bookings.length}
                subtitle="Total requests"
                icon={Calendar}
                variant="primary"
              />
              <StatCard
                title="Pending"
                value={pendingCount}
                subtitle="Awaiting approval"
                icon={Clock}
                variant="warning"
              />
              <StatCard
                title="Approved"
                value={approvedCount}
                subtitle="Confirmed bookings"
                icon={CheckCircle}
                variant="success"
              />
              <StatCard
                title="Rejected"
                value={rejectedCount}
                subtitle="Declined requests"
                icon={XCircle}
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BookingCalendar bookings={bookings} halls={halls} />
          </div>
          
          <div className="space-y-6">
            {isAdmin ? (
              <PendingApprovals 
                bookings={bookings} 
                halls={halls}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ) : (
              <RecentBookings bookings={bookings} halls={halls} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
