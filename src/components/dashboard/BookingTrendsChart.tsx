import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Booking } from '@/types';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

interface BookingTrendsChartProps {
  bookings: Booking[];
}

export function BookingTrendsChart({ bookings }: BookingTrendsChartProps) {
  const today = startOfDay(new Date());
  const thirtyDaysAgo = subDays(today, 29);
  
  const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
  
  const trendData = dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBookings = bookings.filter(b => b.date === dateStr);
    
    return {
      date: format(date, 'MMM d'),
      total: dayBookings.length,
      approved: dayBookings.filter(b => b.status === 'approved').length,
    };
  });

  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-2">Booking Trends</h3>
      <p className="text-sm text-muted-foreground mb-4">Last 30 days activity</p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={trendData} margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            name="Total Bookings"
          />
          <Line 
            type="monotone" 
            dataKey="approved" 
            stroke="hsl(var(--success))" 
            strokeWidth={2}
            dot={false}
            name="Approved"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
