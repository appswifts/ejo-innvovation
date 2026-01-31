-- Migration: 004_files_and_dynamic_fields
-- Description: Creates file management and dynamic field system
-- Creates: submission_files, submission_fields, submission_field_values

-- ============================================
-- SUBMISSION FILES (attachments with versioning)
-- ============================================
CREATE TYPE public.file_type AS ENUM (
  'MANUSCRIPT',
  'SUPPLEMENTARY',
  'COVER_LETTER',
  'RESPONSE_TO_REVIEWERS',
  'REVISED_MANUSCRIPT',
  'FIGURE',
  'TABLE',
  'DATA',
  'PROOF',
  'FINAL_PDF',
  'OTHER'
);

CREATE TABLE IF NOT EXISTS public.submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  file_type public.file_type NOT NULL,
  version INTEGER DEFAULT 1,
  
  -- File info
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Metadata
  label TEXT,
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_files_submission ON public.submission_files(submission_id);
CREATE INDEX idx_files_type ON public.submission_files(file_type);

ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can view files on their submissions"
  ON public.submission_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id 
      AND (s.submitter_id = auth.uid() OR s.status = 'PUBLISHED')
    )
  );

CREATE POLICY "Authors can upload files to their submissions"
  ON public.submission_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id AND s.submitter_id = auth.uid()
    )
  );

CREATE POLICY "Authors can delete files from their draft submissions"
  ON public.submission_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id 
      AND s.submitter_id = auth.uid() 
      AND s.status = 'DRAFT'
    )
  );

-- ============================================
-- SUBMISSION FIELDS (dynamic form builder)
-- ============================================
CREATE TYPE public.field_type AS ENUM (
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'DATE',
  'BOOLEAN',
  'SELECT',
  'MULTISELECT',
  'FILE',
  'URL',
  'EMAIL',
  'ORCID'
);

CREATE TABLE IF NOT EXISTS public.submission_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type_id UUID REFERENCES public.submission_types(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  field_type public.field_type NOT NULL,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Validation
  min_length INTEGER,
  max_length INTEGER,
  min_value NUMERIC,
  max_value NUMERIC,
  pattern TEXT,
  
  -- For SELECT/MULTISELECT
  options JSONB,
  
  -- Display conditions
  show_condition JSONB,
  
  -- Grouping
  section TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(submission_type_id, key)
);

CREATE INDEX idx_fields_type ON public.submission_fields(submission_type_id);

ALTER TABLE public.submission_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submission fields are viewable by everyone"
  ON public.submission_fields FOR SELECT
  USING (true);

-- ============================================
-- SUBMISSION FIELD VALUES (EAV storage)
-- ============================================
CREATE TABLE IF NOT EXISTS public.submission_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES public.submission_fields(id) ON DELETE CASCADE NOT NULL,
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  value_date DATE,
  value_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(submission_id, field_id)
);

CREATE INDEX idx_field_values_submission ON public.submission_field_values(submission_id);
CREATE INDEX idx_field_values_field ON public.submission_field_values(field_id);

ALTER TABLE public.submission_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can view field values for their submissions"
  ON public.submission_field_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id 
      AND (s.submitter_id = auth.uid() OR s.status = 'PUBLISHED')
    )
  );

CREATE POLICY "Authors can manage field values for their submissions"
  ON public.submission_field_values FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id AND s.submitter_id = auth.uid()
    )
  );

-- ============================================
-- HELPER: Get dynamic fields for submission type
-- ============================================
CREATE OR REPLACE FUNCTION public.get_fields_for_type(type_id UUID)
RETURNS TABLE (
  field_id UUID,
  key TEXT,
  label TEXT,
  description TEXT,
  field_type public.field_type,
  is_required BOOLEAN,
  options JSONB,
  section TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sf.id as field_id,
    sf.key,
    sf.label,
    sf.description,
    sf.field_type,
    sf.is_required,
    sf.options,
    sf.section
  FROM public.submission_fields sf
  WHERE sf.submission_type_id = type_id
  ORDER BY sf.display_order;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- STORAGE BUCKET for files
-- ============================================
-- Note: This needs to be run separately or via Supabase dashboard
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('submissions', 'submissions', false);
