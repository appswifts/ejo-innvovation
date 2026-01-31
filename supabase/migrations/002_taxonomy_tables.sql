-- Migration: 002_taxonomy_tables
-- Description: Creates taxonomy system for flexible categorization
-- Creates: taxonomies, terms, submission_terms, submission_type_taxonomies

-- ============================================
-- TAXONOMIES (category definitions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.taxonomies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  is_hierarchical BOOLEAN DEFAULT false,
  is_multiple BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.taxonomies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Taxonomies are viewable by everyone"
  ON public.taxonomies FOR SELECT
  USING (true);

-- ============================================
-- TERMS (individual taxonomy values)
-- ============================================
CREATE TABLE IF NOT EXISTS public.terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taxonomy_id UUID REFERENCES public.taxonomies(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(taxonomy_id, slug)
);

CREATE INDEX idx_terms_taxonomy ON public.terms(taxonomy_id);
CREATE INDEX idx_terms_parent ON public.terms(parent_id);

ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Terms are viewable by everyone"
  ON public.terms FOR SELECT
  USING (true);

-- ============================================
-- SUBMISSION TERMS (links submissions to terms)
-- ============================================
CREATE TABLE IF NOT EXISTS public.submission_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(submission_id, term_id)
);

CREATE INDEX idx_submission_terms_submission ON public.submission_terms(submission_id);
CREATE INDEX idx_submission_terms_term ON public.submission_terms(term_id);

ALTER TABLE public.submission_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submission terms follow submission visibility"
  ON public.submission_terms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id 
      AND (s.submitter_id = auth.uid() OR s.status = 'PUBLISHED')
    )
  );

CREATE POLICY "Authors can manage terms for their submissions"
  ON public.submission_terms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id AND s.submitter_id = auth.uid()
    )
  );

-- ============================================
-- SUBMISSION TYPE TAXONOMIES (controls what appears where)
-- ============================================
CREATE TABLE IF NOT EXISTS public.submission_type_taxonomies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type_id UUID REFERENCES public.submission_types(id) ON DELETE CASCADE NOT NULL,
  taxonomy_id UUID REFERENCES public.taxonomies(id) ON DELETE CASCADE NOT NULL,
  is_required BOOLEAN DEFAULT false,
  min_terms INTEGER DEFAULT 0,
  max_terms INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(submission_type_id, taxonomy_id)
);

CREATE INDEX idx_stt_type ON public.submission_type_taxonomies(submission_type_id);
CREATE INDEX idx_stt_taxonomy ON public.submission_type_taxonomies(taxonomy_id);

ALTER TABLE public.submission_type_taxonomies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submission type taxonomies are viewable by everyone"
  ON public.submission_type_taxonomies FOR SELECT
  USING (true);

-- ============================================
-- VENUE TAXONOMIES (which terms apply to which venues)
-- ============================================
CREATE TABLE IF NOT EXISTS public.venue_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(venue_id, term_id)
);

CREATE INDEX idx_venue_terms_venue ON public.venue_terms(venue_id);
CREATE INDEX idx_venue_terms_term ON public.venue_terms(term_id);

ALTER TABLE public.venue_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venue terms are viewable by everyone"
  ON public.venue_terms FOR SELECT
  USING (true);

-- ============================================
-- HELPER FUNCTION: Get terms for submission type
-- ============================================
CREATE OR REPLACE FUNCTION public.get_taxonomies_for_type(type_id UUID)
RETURNS TABLE (
  taxonomy_id UUID,
  taxonomy_key TEXT,
  taxonomy_label TEXT,
  is_required BOOLEAN,
  min_terms INTEGER,
  max_terms INTEGER,
  terms JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as taxonomy_id,
    t.key as taxonomy_key,
    t.label as taxonomy_label,
    stt.is_required,
    stt.min_terms,
    stt.max_terms,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', tm.id,
          'slug', tm.slug,
          'name', tm.name,
          'parent_id', tm.parent_id
        ) ORDER BY tm.display_order
      ) FILTER (WHERE tm.id IS NOT NULL),
      '[]'::jsonb
    ) as terms
  FROM public.submission_type_taxonomies stt
  JOIN public.taxonomies t ON t.id = stt.taxonomy_id AND t.is_active = true
  LEFT JOIN public.terms tm ON tm.taxonomy_id = t.id AND tm.is_active = true
  WHERE stt.submission_type_id = type_id
  GROUP BY t.id, t.key, t.label, stt.is_required, stt.min_terms, stt.max_terms, stt.display_order
  ORDER BY stt.display_order;
END;
$$ LANGUAGE plpgsql STABLE;
