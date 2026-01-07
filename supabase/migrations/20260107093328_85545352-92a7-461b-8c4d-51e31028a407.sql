-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

-- Create new policy allowing all authenticated users to view all bookings
CREATE POLICY "Authenticated users can view all bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);