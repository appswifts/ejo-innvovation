-- Fix: Allow super_admin to update any profile
-- This policy enables super admins (identified by their role) to update other users' profiles

-- First, create a helper function to check if current user is a super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the profiles UPDATE policy to allow super_admin updates
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow super_admins to update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles 
  FOR UPDATE 
  USING (public.is_super_admin());
