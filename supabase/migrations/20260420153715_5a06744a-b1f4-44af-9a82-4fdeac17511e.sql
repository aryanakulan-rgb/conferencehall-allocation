DROP POLICY IF EXISTS "Users can delete own pending bookings" ON public.bookings;

CREATE POLICY "Users can delete own bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  (user_id = auth.uid() AND status IN ('pending', 'approved'))
  OR has_role(auth.uid(), 'admin'::app_role)
);