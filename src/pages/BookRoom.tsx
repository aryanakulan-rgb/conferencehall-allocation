import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingForm, BookingFormData } from '@/components/booking/BookingForm';
import { useActiveHalls, Hall } from '@/hooks/useHalls';
import { useCreateBooking } from '@/hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Monitor, Wifi, Projector, CheckCircle2, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/navigation/BackButton';

const facilityIcons: Record<string, React.ReactNode> = {
  'Projector': <Projector className="h-4 w-4" />,
  'WiFi': <Wifi className="h-4 w-4" />,
  'Video Conferencing': <Monitor className="h-4 w-4" />,
};

export default function BookRoom() {
  const { user } = useAuth();
  const [selectedHall, setSelectedHall] = useState<Hall | undefined>();
  const [showForm, setShowForm] = useState(false);

  const { data: halls = [], isLoading } = useActiveHalls();
  const createBooking = useCreateBooking();

  const handleSelectHall = (hall: Hall) => {
    setSelectedHall(hall);
    setShowForm(true);
  };

  const handleBookingSubmit = async (data: BookingFormData) => {
    try {
      await createBooking.mutateAsync({
        hall_id: data.hallId,
        date: data.date.toISOString().split('T')[0],
        start_time: data.startTime,
        end_time: data.endTime,
        purpose: data.purpose,
      });
      toast.success('Booking request submitted successfully!');
      setShowForm(false);
      setSelectedHall(undefined);
    } catch (error) {
      toast.error('Failed to submit booking request');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
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
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <BackButton className="mb-4" />
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Book a Room</h1>
          <p className="text-muted-foreground">
            Select a conference hall to submit a booking request
          </p>
        </div>

        {!showForm ? (
          <>
            {/* All Conference Halls */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h2 className="text-lg font-semibold text-foreground">Available Conference Halls</h2>
                <Badge variant="secondary" className="ml-2">
                  {halls.length} available
                </Badge>
              </div>
              
              {halls.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No conference halls available
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {halls.map((hall) => (
                    <HallSelectionCard
                      key={hall.id}
                      hall={hall}
                      isSelected={selectedHall?.id === hall.id}
                      onSelect={() => handleSelectHall(hall)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Booking Form */
          <div className="max-w-lg">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Book {selectedHall?.name}
                </CardTitle>
                <CardDescription>
                  Fill in the details below to submit your booking request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingForm
                  halls={halls}
                  selectedHall={selectedHall}
                  onSubmit={handleBookingSubmit}
                  onCancel={handleCancel}
                  isSubmitting={createBooking.isPending}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

interface HallSelectionCardProps {
  hall: Hall;
  isSelected: boolean;
  onSelect: () => void;
}

function HallSelectionCard({ hall, isSelected, onSelect }: HallSelectionCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{hall.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {hall.description || 'Conference room for meetings and events'}
            </CardDescription>
          </div>
          <Badge variant={hall.type === 'conference' ? 'default' : 'secondary'}>
            {hall.type === 'conference' ? 'Main' : 'Mini'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Capacity */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Capacity: {hall.capacity} people</span>
          </div>

          {/* Facilities */}
          {hall.facilities && hall.facilities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hall.facilities.slice(0, 3).map((facility) => (
                <Badge key={facility} variant="outline" className="text-xs">
                  {facilityIcons[facility] || <CheckCircle2 className="h-3 w-3" />}
                  <span className="ml-1">{facility}</span>
                </Badge>
              ))}
              {hall.facilities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{hall.facilities.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Book Button */}
          <Button 
            variant="accent" 
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            Book This Hall
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}