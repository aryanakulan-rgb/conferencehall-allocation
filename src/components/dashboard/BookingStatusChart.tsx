import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Booking } from '@/types';

interface BookingStatusChartProps {
  bookings: Booking[];
}

export function BookingStatusChart({ bookings }: BookingStatusChartProps) {
  const statusData = [
    { name: 'Approved', value: bookings.filter(b => b.status === 'approved').length, color: 'hsl(var(--success))' },
    { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'hsl(var(--warning))' },
    { name: 'Rejected', value: bookings.filter(b => b.status === 'rejected').length, color: 'hsl(var(--destructive))' },
  ].filter(d => d.value > 0);

  if (statusData.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-4">Booking Status Distribution</h3>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No booking data available
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-4">Booking Status Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
