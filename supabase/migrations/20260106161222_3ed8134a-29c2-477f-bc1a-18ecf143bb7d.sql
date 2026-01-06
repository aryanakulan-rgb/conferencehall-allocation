-- Create test users in auth.users (for demo purposes)
-- Note: These will work with the auto-confirm enabled

-- First, let's insert demo profiles and roles that will be linked when users sign up
-- We'll use a trigger approach - when users sign up with these emails, they get the correct role

-- Create a function to assign admin role to specific email
CREATE OR REPLACE FUNCTION public.assign_demo_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If admin email, assign admin role
  IF NEW.email = 'admin@dic.gov.in' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after profile is created
DROP TRIGGER IF EXISTS on_profile_created_assign_role ON public.profiles;
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_demo_roles();