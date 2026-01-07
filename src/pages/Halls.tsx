import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HallCard } from '@/components/halls/HallCard';
import { BookingForm } from '@/components/booking/BookingForm';
import { useActiveHalls, Hall } from '@/hooks/useHalls';
import { useCreateBooking } from '@/hooks/useBookings';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/navigation/BackButton';

export default function Halls() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [hallType, setHallType] = useState<'all' | 'conference' | 'mini'>('all');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState<Hall | undefined>();

  const { data: halls = [], isLoading } = useActiveHalls();
  const createBooking = useCreateBooking();

  const filteredHalls = halls.filter(hall => {
    const matchesSearch = hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hall.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = hallType === 'all' || hall.type === hallType;
    return matchesSearch && matchesType;
  });

  const handleBookClick = (hall: Hall) => {
    setSelectedHall(hall);
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = async (data: {
    hallId: string;
    date: Date;
    startTime: string;
    endTime: string;
    purpose: string;
  }) => {
    await createBooking.mutateAsync({
      hall_id: data.hallId,
      date: data.date.toISOString().split('T')[0],
      start_time: data.startTime,
      end_time: data.endTime,
      purpose: data.purpose,
    });
    setBookingDialogOpen(false);
    setSelectedHall(undefined);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <BackButton className="mb-4" />
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conference Halls</h1>
          <p className="text-muted-foreground">
            Browse available halls and submit booking requests
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search halls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={hallType} onValueChange={(v) => setHallType(v as typeof hallType)}>
            <TabsList>
              <TabsTrigger value="all">All Halls</TabsTrigger>
              <TabsTrigger value="conference">Conference</TabsTrigger>
              <TabsTrigger value="mini">Mini</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Hall Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>{filteredHalls.length} available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span>{filteredHalls.filter(h => h.type === 'conference').length} conference halls</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-info" />
            <span>{filteredHalls.filter(h => h.type === 'mini').length} mini halls</span>
          </div>
        </div>

        {/* Halls Grid */}
        {filteredHalls.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No halls found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...filteredHalls].sort((a, b) => {
              if (a.type === 'mini' && b.type !== 'mini') return -1;
              if (a.type !== 'mini' && b.type === 'mini') return 1;
              return 0;
            }).map((hall) => (
              <HallCard
                key={hall.id}
                hall={hall}
                onBook={() => handleBookClick(hall)}
                showBookButton={user?.role === 'user'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Book Hall</DialogTitle>
            <DialogDescription>
              Fill in the details below to submit a booking request.
            </DialogDescription>
          </DialogHeader>
          
          <BookingForm
            halls={halls}
            selectedHall={selectedHall}
            onSubmit={handleBookingSubmit}
            onCancel={() => setBookingDialogOpen(false)}
            isSubmitting={createBooking.isPending}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
