import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Booking, Hall } from '@/types';

interface HallUtilizationChartProps {
  bookings: Booking[];
  halls: Hall[];
}

export function HallUtilizationChart({ bookings, halls }: HallUtilizationChartProps) {
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  
  const utilizationData = halls.map(hall => {
    const hallBookings = approvedBookings.filter(b => b.hall_id === hall.id);
    return {
      name: hall.name.length > 15 ? hall.name.substring(0, 12) + '...' : hall.name,
      fullName: hall.name,
      bookings: hallBookings.length,
      capacity: hall.capacity,
    };
  }).sort((a, b) => b.bookings - a.bookings);

  if (utilizationData.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-4">Hall Utilization</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No hall data available
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-2">Hall Utilization</h3>
      <p className="text-sm text-muted-foreground mb-4">Approved bookings by hall</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={utilizationData} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100} 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [
              `${value} bookings`,
              props.payload.fullName,
            ]}
          />
          <Bar 
            dataKey="bookings" 
            fill="hsl(var(--primary))" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
