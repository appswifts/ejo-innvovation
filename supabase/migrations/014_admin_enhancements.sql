-- Migration: 014_admin_enhancements
-- Description: Adds system settings, admin logs, and seeds required post types.

-- ============================================
-- SYSTEM SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (public.is_admin());

-- Everyone can view settings (e.g. site name, maintenance mode)
CREATE POLICY "Everyone can view system settings"
  ON public.system_settings FOR SELECT
  USING (true);

-- ============================================
-- ADMIN LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view logs"
  ON public.admin_logs FOR SELECT
  USING (public.is_admin());

-- Only admins can insert logs (trigger or valid admin user)
CREATE POLICY "Admins can insert logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================
-- SEED POST TYPES (Journals, Books, Career Jobs)
-- ============================================
INSERT INTO public.submission_types (key, label, description, is_active, allowed_venue_types)
VALUES 
  ('journal', 'Journal', 'Academic journals and periodicals', true, '{JOURNAL}'),
  ('book', 'Book', 'Books and monographs', true, '{BOOK_IMPRINT}'),
  ('career_job', 'Career Job', 'Job postings and career opportunities', true, '{}')
ON CONFLICT (key) DO NOTHING;

-- Ensure other types are disabled if strictly enforced (Optional, based on user request)
-- UPDATE public.submission_types SET is_active = false WHERE key NOT IN ('journal', 'book', 'career_job');
