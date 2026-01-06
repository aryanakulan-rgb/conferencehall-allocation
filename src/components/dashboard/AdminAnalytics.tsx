import { Booking, Hall } from '@/types';
import { BookingStatusChart } from './BookingStatusChart';
import { HallUtilizationChart } from './HallUtilizationChart';
import { BookingTrendsChart } from './BookingTrendsChart';
import { StatCard } from './StatCard';
import { TrendingUp, Clock, Building, Users, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { format, isThisWeek, isThisMonth } from 'date-fns';

interface AdminAnalyticsProps {
  bookings: Booking[];
  halls: Hall[];
  profilesCount: number;
}

export function AdminAnalytics({ bookings, halls, profilesCount }: AdminAnalyticsProps) {
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length;
  const activeHalls = halls.filter(h => h.is_active).length;
  
  const thisWeekBookings = bookings.filter(b => isThisWeek(new Date(b.date)));
  const thisMonthBookings = bookings.filter(b => isThisMonth(new Date(b.date)));
  
  const approvalRate = bookings.length > 0 
    ? Math.round((approvedCount / (approvedCount + rejectedCount || 1)) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          title="Approval Rate"
          value={`${approvalRate}%`}
          subtitle="Of processed"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Active Halls"
          value={activeHalls}
          subtitle={`of ${halls.length} total`}
          icon={Building}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="This Week"
          value={thisWeekBookings.length}
          subtitle="Bookings scheduled"
          icon={Calendar}
        />
        <StatCard
          title="This Month"
          value={thisMonthBookings.length}
          subtitle="Bookings scheduled"
          icon={Calendar}
        />
        <StatCard
          title="Approved"
          value={approvedCount}
          subtitle="Confirmed bookings"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Registered Users"
          value={profilesCount}
          subtitle="Active accounts"
          icon={Users}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <BookingStatusChart bookings={bookings} />
        <HallUtilizationChart bookings={bookings} halls={halls} />
      </div>

      {/* Full Width Trend Chart */}
      <BookingTrendsChart bookings={bookings} />
    </div>
  );
}
