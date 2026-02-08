-- 1. Drop the legacy 'role' column from profiles as we now use role_id
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 2. Add RLS Policies for Super Admin to manage Roles
-- Ensure RLS is enabled (it should be, but just in case)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Insert Policy
DROP POLICY IF EXISTS "Super Admins can insert roles" ON public.roles;
CREATE POLICY "Super Admins can insert roles" ON public.roles
  FOR INSERT WITH CHECK (public.is_super_admin());

-- Update Policy
DROP POLICY IF EXISTS "Super Admins can update roles" ON public.roles;
CREATE POLICY "Super Admins can update roles" ON public.roles
  FOR UPDATE USING (public.is_super_admin());

-- Delete Policy
DROP POLICY IF EXISTS "Super Admins can delete roles" ON public.roles;
CREATE POLICY "Super Admins can delete roles" ON public.roles
  FOR DELETE USING (public.is_super_admin());
