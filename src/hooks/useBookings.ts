import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingStatus = Database['public']['Enums']['booking_status'];

export function useBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });
}

export function useUserBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings', 'user', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });
}

export async function checkBookingConflict(
  hallId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictingBooking?: Booking }> {
  // Query for approved or pending bookings on the same hall and date
  let query = supabase
    .from('bookings')
    .select('*')
    .eq('hall_id', hallId)
    .eq('date', date)
    .in('status', ['approved', 'pending']);

  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId);
  }

  const { data: existingBookings, error } = await query;

  if (error) throw error;

  // Check for time overlap
  const conflictingBooking = existingBookings?.find((booking) => {
    const existingStart = booking.start_time;
    const existingEnd = booking.end_time;
    
    // Check if times overlap
    // Overlap occurs when: newStart < existingEnd AND newEnd > existingStart
    return startTime < existingEnd && endTime > existingStart;
  });

  return {
    hasConflict: !!conflictingBooking,
    conflictingBooking,
  };
}

export function useCheckConflict() {
  return useMutation({
    mutationFn: async ({
      hallId,
      date,
      startTime,
      endTime,
    }: {
      hallId: string;
      date: string;
      startTime: string;
      endTime: string;
    }) => {
      return checkBookingConflict(hallId, date, startTime, endTime);
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (booking: Omit<BookingInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      // Check for conflicts before creating
      const { hasConflict, conflictingBooking } = await checkBookingConflict(
        booking.hall_id,
        booking.date,
        booking.start_time,
        booking.end_time
      );

      if (hasConflict) {
        throw new Error(
          `Time slot conflicts with an existing ${conflictingBooking?.status} booking (${conflictingBooking?.start_time} - ${conflictingBooking?.end_time})`
        );
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking request submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create booking: ' + error.message);
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error('Failed to cancel booking: ' + error.message);
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      status, 
      remarks 
    }: { 
      bookingId: string; 
      status: BookingStatus; 
      remarks?: string;
    }) => {
      const updateData: { status: BookingStatus; remarks?: string } = { status };
      if (remarks) updateData.remarks = remarks;

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(`Booking ${variables.status} successfully`);
    },
    onError: (error) => {
      toast.error('Failed to update booking: ' + error.message);
    },
  });
}
