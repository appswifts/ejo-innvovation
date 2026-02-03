-- Migration: 011_fix_venues_policy
-- Description: Update venues RLS policy to use the robust public.is_admin() function
-- Prevents issues where direct querying of user_roles might fail due to RLS policies

DROP POLICY IF EXISTS "Only admins can modify venues" ON public.venues;

CREATE POLICY "Admins can modify venues"
  ON public.venues FOR ALL
  USING (public.is_admin());
