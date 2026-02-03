-- Migration: 009_fix_permissions
-- Description: Fixes RLS policies for global admins to ensure they can view and manage all users and roles.

-- 1. Create secure function to check admin status (avoids recursion)
-- This function runs with SECURITY DEFINER to bypass RLS on user_roles when checking permissions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'ADMIN'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow Admins to view ALL user_roles
-- Previous policies only allowed viewing own roles or venue-specific roles.
DROP POLICY IF EXISTS "Admins can view all user_roles" ON public.user_roles;
CREATE POLICY "Admins can view all user_roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

-- 3. Allow Admins to manage ALL user_roles
DROP POLICY IF EXISTS "Admins can manage all user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user_roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin());

-- 4. Re-assert Profiles are viewable (just in case they were somehow restricted)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- 5. Helper trigger to ensure profile exists for new users (redundancy for reliability)
-- Using ON CONFLICT logic in case it runs on existing users
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
