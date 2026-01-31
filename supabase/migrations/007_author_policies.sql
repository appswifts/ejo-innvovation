-- Migration: 007_author_policies
-- Description: Add RLS policies for submission_authors to allow submitters to manage authors

-- Allow submitters to insert authors for their own submissions
CREATE POLICY "Submitters can add authors"
  ON public.submission_authors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id 
      AND s.submitter_id = auth.uid()
    )
  );

-- Allow submitters to update authors for their own submissions
CREATE POLICY "Submitters can update authors"
  ON public.submission_authors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id 
      AND s.submitter_id = auth.uid()
    )
  );

-- Allow submitters to delete authors for their own submissions
CREATE POLICY "Submitters can delete authors"
  ON public.submission_authors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s 
      WHERE s.id = submission_id 
      AND s.submitter_id = auth.uid()
    )
  );
