-- Migration: 012_admin_post_type_policies
-- Description: Add RLS policies for admin management of post types, fields, and taxonomies

-- ============================================
-- SUBMISSION TYPES: Allow admin management
-- ============================================
DROP POLICY IF EXISTS "Admins can manage submission types" ON public.submission_types;

CREATE POLICY "Admins can manage submission types"
  ON public.submission_types FOR ALL
  USING (public.is_admin());

-- ============================================
-- SUBMISSION FIELDS: Allow admin management
-- ============================================
DROP POLICY IF EXISTS "Admins can manage submission fields" ON public.submission_fields;

CREATE POLICY "Admins can manage submission fields"
  ON public.submission_fields FOR ALL
  USING (public.is_admin());

-- ============================================
-- TAXONOMIES: Allow admin management
-- ============================================
DROP POLICY IF EXISTS "Admins can manage taxonomies" ON public.taxonomies;

CREATE POLICY "Admins can manage taxonomies"
  ON public.taxonomies FOR ALL
  USING (public.is_admin());

-- ============================================
-- TERMS: Allow admin management
-- ============================================
DROP POLICY IF EXISTS "Admins can manage terms" ON public.terms;

CREATE POLICY "Admins can manage terms"
  ON public.terms FOR ALL
  USING (public.is_admin());

-- ============================================
-- SUBMISSION TYPE TAXONOMIES: Allow admin management
-- ============================================
DROP POLICY IF EXISTS "Admins can manage submission type taxonomies" ON public.submission_type_taxonomies;

CREATE POLICY "Admins can manage submission type taxonomies"
  ON public.submission_type_taxonomies FOR ALL
  USING (public.is_admin());
