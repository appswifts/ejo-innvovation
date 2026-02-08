-- Ensure 'reader' role exists and get its ID
-- We'll use a subquery in the function, but let's make sure it's seeded
INSERT INTO public.roles (name, slug, description)
VALUES ('Reader', 'reader', 'Standard user with read-only access to purchased content.')
ON CONFLICT (slug) DO NOTHING;

-- Update the handle_new_user function to use the reader role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  reader_role_id uuid;
BEGIN
  -- Get the reader role ID
  SELECT id INTO reader_role_id FROM public.roles WHERE slug = 'reader';

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role_id)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    reader_role_id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup: Drop the redundant 'role' column from profiles
-- First, ensure all profiles have a role_id if possible
UPDATE public.profiles p
SET role_id = r.id
FROM public.roles r
WHERE p.role::text = r.slug
AND p.role_id IS NULL;

-- If still null, set to reader
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE slug = 'reader')
WHERE role_id IS NULL;

-- Now drop the column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
