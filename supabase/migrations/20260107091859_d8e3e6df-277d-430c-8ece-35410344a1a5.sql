
-- Drop the existing restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Anyone can view sections" ON public.sections;

CREATE POLICY "Anyone can view sections" 
ON public.sections 
FOR SELECT 
TO public
USING (true);
