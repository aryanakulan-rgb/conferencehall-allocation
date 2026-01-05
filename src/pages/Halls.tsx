import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HallCard } from '@/components/halls/HallCard';
import { BookingForm, BookingFormData } from '@/components/booking/BookingForm';
import { mockHalls } from '@/data/mockData';
import { Hall } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Building, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Halls() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hallType, setHallType] = useState<'all' | 'conference' | 'mini'>('all');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState<Hall | undefined>();

  if (!user) {
    navigate('/');
    return null;
  }

  const filteredHalls = mockHalls.filter(hall => {
    const matchesSearch = hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hall.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = hallType === 'all' || hall.type === hallType;
    return matchesSearch && matchesType;
  });

  const handleBookClick = (hall: Hall) => {
    setSelectedHall(hall);
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = (data: BookingFormData) => {
    // In real app, this would make an API call
    toast.success('Booking request submitted successfully!', {
      description: `Your request for ${format(data.date, 'MMM d, yyyy')} has been sent for approval.`,
    });
    setBookingDialogOpen(false);
    setSelectedHall(undefined);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
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
            <span>{filteredHalls.filter(h => h.isActive).length} available</span>
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
            {filteredHalls.map((hall) => (
              <HallCard
                key={hall.id}
                hall={hall}
                onBook={() => handleBookClick(hall)}
                showBookButton={user.role === 'user'}
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
            halls={mockHalls}
            selectedHall={selectedHall}
            onSubmit={handleBookingSubmit}
            onCancel={() => setBookingDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
