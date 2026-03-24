ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_section_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_section_id_fkey
FOREIGN KEY (section_id)
REFERENCES public.sections(id)
ON DELETE SET NULL;