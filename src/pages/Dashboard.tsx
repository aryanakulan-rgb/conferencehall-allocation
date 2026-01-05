import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { PendingApprovals } from '@/components/admin/PendingApprovals';
import { mockBookings, mockHalls } from '@/data/mockData';
import { Building, Calendar, CheckCircle, Clock, Users, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Booking } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  if (!user) {
    navigate('/');
    return null;
  }

  const isAdmin = user.role === 'admin';

  const userBookings = isAdmin ? bookings : bookings.filter(b => b.userId === user.id);
  const pendingCount = userBookings.filter(b => b.status === 'pending').length;
  const approvedCount = userBookings.filter(b => b.status === 'approved').length;
  const rejectedCount = userBookings.filter(b => b.status === 'rejected').length;
  const activeHalls = mockHalls.filter(h => h.isActive).length;

  const handleApprove = (bookingId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'approved' as const, updatedAt: new Date().toISOString() } : b
    ));
  };

  const handleReject = (bookingId: string, remarks: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'rejected' as const, remarks, updatedAt: new Date().toISOString() } : b
    ));
  };

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
              Welcome back, {user.name}. {isAdmin ? 'Manage bookings and halls.' : 'View and manage your bookings.'}
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
                subtitle={`of ${mockHalls.length} total`}
                icon={Building}
              />
              <StatCard
                title="Total Users"
                value={12}
                subtitle="Active users"
                icon={Users}
              />
            </>
          ) : (
            <>
              <StatCard
                title="My Bookings"
                value={userBookings.length}
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
            <BookingCalendar bookings={bookings} halls={mockHalls} />
          </div>
          
          <div className="space-y-6">
            {isAdmin ? (
              <PendingApprovals 
                bookings={bookings} 
                halls={mockHalls}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ) : (
              <RecentBookings bookings={userBookings} halls={mockHalls} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
