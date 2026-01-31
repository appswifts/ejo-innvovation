-- Migration: 001_core_tables
-- Description: Creates core tables for NCR platform
-- Creates: profiles, venues, journals, imprints, submission_types, submissions

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  affiliation TEXT,
  orcid_id TEXT,
  google_scholar_url TEXT,
  bio TEXT,
  avatar_url TEXT,
  country TEXT,
  is_student BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- VENUES (unified journals + imprints)
-- ============================================
CREATE TYPE public.venue_type AS ENUM ('JOURNAL', 'BOOK_IMPRINT', 'CONFERENCE', 'SERIES');

CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.venue_type NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  abbreviation TEXT,
  description TEXT,
  mission TEXT,
  scope TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  contact_email TEXT,
  location TEXT DEFAULT 'Kigali, Rwanda',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venues are viewable by everyone"
  ON public.venues FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify venues"
  ON public.venues FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================
-- JOURNALS (journal-specific data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE UNIQUE NOT NULL,
  issn TEXT,
  eissn TEXT,
  publisher TEXT DEFAULT 'Nkiza Center for Research',
  frequency TEXT DEFAULT 'Continuous',
  indexing_info TEXT[],
  doi_prefix TEXT,
  student_fee_amount DECIMAL(10,2),
  researcher_fee_amount DECIMAL(10,2),
  author_revenue_share DECIMAL(5,2) DEFAULT 50.00,
  citation_style TEXT DEFAULT 'APA',
  peer_review_type TEXT DEFAULT 'double-blind',
  editor_in_chief_id UUID REFERENCES public.profiles(id),
  managing_editor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Journals are viewable by everyone"
  ON public.journals FOR SELECT
  USING (true);

-- ============================================
-- IMPRINTS (book imprint-specific data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.imprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE UNIQUE NOT NULL,
  publisher TEXT DEFAULT 'Nkiza Center for Research',
  isbn_prefix TEXT,
  student_fee_amount DECIMAL(10,2),
  professional_fee_amount DECIMAL(10,2),
  author_royalty_share DECIMAL(5,2) DEFAULT 70.00,
  access_models TEXT[] DEFAULT ARRAY['open-access', 'paid-access'],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.imprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Imprints are viewable by everyone"
  ON public.imprints FOR SELECT
  USING (true);

-- ============================================
-- SUBMISSION TYPES (configurable)
-- ============================================
CREATE TABLE IF NOT EXISTS public.submission_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  allowed_venue_types public.venue_type[] NOT NULL,
  default_workflow_id UUID, -- Will reference workflows table
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.submission_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submission types are viewable by everyone"
  ON public.submission_types FOR SELECT
  USING (true);

-- ============================================
-- SUBMISSIONS (generic submission entity)
-- ============================================
CREATE TYPE public.submission_status AS ENUM (
  'DRAFT',
  'SUBMITTED', 
  'UNDER_REVIEW',
  'REVISION_REQUESTED',
  'REVISION_SUBMITTED',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
  'IN_PRODUCTION',
  'PUBLISHED'
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID REFERENCES public.profiles(id) NOT NULL,
  submission_type_id UUID REFERENCES public.submission_types(id) NOT NULL,
  venue_id UUID REFERENCES public.venues(id) NOT NULL,
  
  -- Core content
  title TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[],
  
  -- Status tracking
  status public.submission_status DEFAULT 'DRAFT',
  current_workflow_step_id UUID, -- Will reference workflow_steps
  revision_number INTEGER DEFAULT 0,
  
  -- Flexible metadata
  metadata JSONB DEFAULT '{}',
  
  -- Important dates
  submitted_at TIMESTAMPTZ,
  decision_date TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Publication info (populated when published)
  doi TEXT,
  volume TEXT,
  issue TEXT,
  pages TEXT,
  publication_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_submissions_submitter ON public.submissions(submitter_id);
CREATE INDEX idx_submissions_venue ON public.submissions(venue_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_type ON public.submissions(submission_type_id);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Authors can view their own submissions
CREATE POLICY "Authors can view their own submissions"
  ON public.submissions FOR SELECT
  USING (submitter_id = auth.uid());

-- Authors can insert their own submissions
CREATE POLICY "Authors can insert their own submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (submitter_id = auth.uid());

-- Authors can update their own draft submissions
CREATE POLICY "Authors can update their own drafts"
  ON public.submissions FOR UPDATE
  USING (submitter_id = auth.uid() AND status = 'DRAFT');

-- Published submissions are viewable by everyone
CREATE POLICY "Published submissions are public"
  ON public.submissions FOR SELECT
  USING (status = 'PUBLISHED');

-- ============================================
-- SUBMISSION AUTHORS (co-authors)
-- ============================================
CREATE TABLE IF NOT EXISTS public.submission_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id),
  author_order INTEGER NOT NULL,
  is_corresponding BOOLEAN DEFAULT false,
  -- For authors not in system
  external_name TEXT,
  external_email TEXT,
  external_affiliation TEXT,
  external_orcid TEXT,
  contribution TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_submission_authors_submission ON public.submission_authors(submission_id);

ALTER TABLE public.submission_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submission authors follow submission visibility"
  ON public.submission_authors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id 
      AND (s.submitter_id = auth.uid() OR s.status = 'PUBLISHED')
    )
  );

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
