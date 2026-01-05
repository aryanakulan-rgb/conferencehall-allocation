import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { mockBookings, mockHalls } from '@/data/mockData';

export default function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Booking Calendar</h1>
          <p className="text-muted-foreground">
            View all bookings across conference halls
          </p>
        </div>

        <BookingCalendar bookings={mockBookings} halls={mockHalls} />
      </div>
    </DashboardLayout>
  );
}
