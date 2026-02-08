-- Enable RLS on manuscripts table if not already enabled
ALTER TABLE public.manuscripts ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read published manuscripts
CREATE POLICY "Public can view published manuscripts"
ON public.manuscripts
FOR SELECT
TO public
USING (status = 'published');

-- Policy to allow authors to view their own manuscripts (regardless of status)
CREATE POLICY "Authors can view own manuscripts"
ON public.manuscripts
FOR SELECT
TO authenticated
USING (auth.uid() = submitter_id);

-- Policy to allow admins and editors to view all manuscripts
CREATE POLICY "Admins and Editors can view all manuscripts"
ON public.manuscripts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id IN (
      SELECT id FROM public.roles WHERE slug IN ('super_admin', 'editor', 'finance_admin')
    )
  )
);
