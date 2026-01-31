-- Migration: 003_workflow_tables
-- Description: Creates workflow system for editorial processes
-- Creates: workflows, workflow_steps, submission_workflow_steps, reviews, editor_decisions

-- ============================================
-- USER ROLES (role assignments per venue)
-- ============================================
CREATE TYPE public.user_role AS ENUM (
  'AUTHOR',
  'REVIEWER',
  'ASSOCIATE_EDITOR',
  'EDITOR',
  'MANAGING_EDITOR',
  'EDITOR_IN_CHIEF',
  'ADMIN'
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, venue_id, role)
);

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_venue ON public.user_roles(venue_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Editors can view roles for their venues"
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.venue_id = venue_id 
      AND ur.role IN ('EDITOR', 'MANAGING_EDITOR', 'EDITOR_IN_CHIEF', 'ADMIN')
    )
  );

-- ============================================
-- WORKFLOWS (named editorial processes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workflows are viewable by everyone"
  ON public.workflows FOR SELECT
  USING (true);

-- Add foreign key to submission_types now that workflows exists
ALTER TABLE public.submission_types 
  ADD CONSTRAINT fk_submission_types_workflow 
  FOREIGN KEY (default_workflow_id) 
  REFERENCES public.workflows(id);

-- ============================================
-- WORKFLOW STEPS (individual steps in workflow)
-- ============================================
CREATE TYPE public.workflow_step_type AS ENUM (
  'INITIAL_SCREENING',
  'PLAGIARISM_CHECK',
  'EDITOR_ASSIGNMENT',
  'REVIEWER_ASSIGNMENT',
  'PEER_REVIEW',
  'EDITORIAL_REVIEW',
  'REVISION',
  'FINAL_DECISION',
  'PRODUCTION',
  'PUBLICATION'
);

CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  step_order INTEGER NOT NULL,
  step_type public.workflow_step_type NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  required_role public.user_role,
  is_required BOOLEAN DEFAULT true,
  auto_advance BOOLEAN DEFAULT false,
  timeout_days INTEGER,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workflow_id, step_order)
);

CREATE INDEX idx_workflow_steps_workflow ON public.workflow_steps(workflow_id);

ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workflow steps are viewable by everyone"
  ON public.workflow_steps FOR SELECT
  USING (true);

-- Add foreign key to submissions now that workflow_steps exists
ALTER TABLE public.submissions 
  ADD CONSTRAINT fk_submissions_workflow_step 
  FOREIGN KEY (current_workflow_step_id) 
  REFERENCES public.workflow_steps(id);

-- ============================================
-- SUBMISSION WORKFLOW PROGRESS
-- ============================================
CREATE TYPE public.step_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'SKIPPED',
  'FAILED'
);

CREATE TABLE IF NOT EXISTS public.submission_workflow_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  workflow_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE NOT NULL,
  status public.step_status DEFAULT 'PENDING',
  assigned_to UUID REFERENCES public.profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(submission_id, workflow_step_id)
);

CREATE INDEX idx_swp_submission ON public.submission_workflow_progress(submission_id);
CREATE INDEX idx_swp_step ON public.submission_workflow_progress(workflow_step_id);
CREATE INDEX idx_swp_assigned ON public.submission_workflow_progress(assigned_to);

ALTER TABLE public.submission_workflow_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can view their submission progress"
  ON public.submission_workflow_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id AND s.submitter_id = auth.uid()
    )
  );

CREATE POLICY "Assigned users can view their progress"
  ON public.submission_workflow_progress FOR SELECT
  USING (assigned_to = auth.uid());

-- ============================================
-- REVIEWS (peer review records)
-- ============================================
CREATE TYPE public.review_recommendation AS ENUM (
  'ACCEPT',
  'MINOR_REVISION',
  'MAJOR_REVISION',
  'REJECT',
  'REJECT_RESUBMIT'
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  round_number INTEGER DEFAULT 1,
  
  -- Review content
  recommendation public.review_recommendation,
  comments_to_author TEXT,
  comments_to_editor TEXT,
  
  -- Ratings (optional structured feedback)
  ratings JSONB DEFAULT '{}',
  
  -- Status tracking
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  due_date DATE,
  
  -- Flags
  is_anonymous BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_submission ON public.reviews(submission_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewers can view their own reviews"
  ON public.reviews FOR SELECT
  USING (reviewer_id = auth.uid());

CREATE POLICY "Reviewers can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (reviewer_id = auth.uid() AND submitted_at IS NULL);

-- ============================================
-- EDITOR DECISIONS
-- ============================================
CREATE TYPE public.decision_type AS ENUM (
  'DESK_REJECT',
  'SEND_FOR_REVIEW',
  'ACCEPT',
  'MINOR_REVISION',
  'MAJOR_REVISION',
  'REJECT',
  'WITHDRAW'
);

CREATE TABLE IF NOT EXISTS public.editor_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  editor_id UUID REFERENCES public.profiles(id) NOT NULL,
  round_number INTEGER DEFAULT 1,
  decision public.decision_type NOT NULL,
  comments_to_author TEXT,
  internal_notes TEXT,
  decided_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_decisions_submission ON public.editor_decisions(submission_id);
CREATE INDEX idx_decisions_editor ON public.editor_decisions(editor_id);

ALTER TABLE public.editor_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can view decisions on their submissions"
  ON public.editor_decisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id AND s.submitter_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGER: Update submission status on decision
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_editor_decision()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.submissions
  SET 
    status = CASE NEW.decision
      WHEN 'DESK_REJECT' THEN 'REJECTED'::public.submission_status
      WHEN 'ACCEPT' THEN 'ACCEPTED'::public.submission_status
      WHEN 'REJECT' THEN 'REJECTED'::public.submission_status
      WHEN 'MINOR_REVISION' THEN 'REVISION_REQUESTED'::public.submission_status
      WHEN 'MAJOR_REVISION' THEN 'REVISION_REQUESTED'::public.submission_status
      WHEN 'SEND_FOR_REVIEW' THEN 'UNDER_REVIEW'::public.submission_status
      WHEN 'WITHDRAW' THEN 'WITHDRAWN'::public.submission_status
      ELSE status
    END,
    decision_date = CASE 
      WHEN NEW.decision IN ('ACCEPT', 'REJECT', 'DESK_REJECT') THEN now()
      ELSE decision_date
    END,
    accepted_at = CASE 
      WHEN NEW.decision = 'ACCEPT' THEN now()
      ELSE accepted_at
    END,
    updated_at = now()
  WHERE id = NEW.submission_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_editor_decision
  AFTER INSERT ON public.editor_decisions
  FOR EACH ROW EXECUTE FUNCTION public.handle_editor_decision();
