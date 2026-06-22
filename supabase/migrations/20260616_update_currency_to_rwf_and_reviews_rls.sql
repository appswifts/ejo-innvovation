-- Update default currency to RWF across all tables

-- 1. Update manuscripts table default currency
ALTER TABLE manuscripts ALTER COLUMN currency SET DEFAULT 'RWF';
UPDATE manuscripts SET currency = 'RWF' WHERE currency = 'USD';

-- 2. Update transactions table default currency
ALTER TABLE transactions ALTER COLUMN currency SET DEFAULT 'RWF';
UPDATE transactions SET currency = 'RWF' WHERE currency = 'USD';

-- 3. Update books table default currency
ALTER TABLE books ALTER COLUMN currency SET DEFAULT 'RWF';
UPDATE books SET currency = 'RWF' WHERE currency = 'USD';

-- 4. Update publication_packages default currency
ALTER TABLE publication_packages ALTER COLUMN currency SET DEFAULT 'RWF';
UPDATE publication_packages SET currency = 'RWF' WHERE currency = 'USD';

-- 5. Update polar_transactions default currency
ALTER TABLE polar_transactions ALTER COLUMN currency SET DEFAULT 'RWF';
UPDATE polar_transactions SET currency = 'RWF' WHERE currency = 'USD';

-- 6. Update dpo_transactions default currency
ALTER TABLE dpo_transactions ALTER COLUMN currency SET DEFAULT 'RWF';
UPDATE dpo_transactions SET currency = 'RWF' WHERE currency = 'USD';

-- 7. Enable RLS on reviews table and add policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Editors can manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviewers can view own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authors can view reviews for their manuscripts" ON public.reviews;

-- Editors can create/update/delete reviews
CREATE POLICY "Editors can manage reviews" 
ON public.reviews FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug IN ('super_admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug IN ('super_admin', 'editor')
  )
);

-- Reviewers can view their own assigned reviews
CREATE POLICY "Reviewers can view own reviews" 
ON public.reviews FOR SELECT 
TO authenticated 
USING (
  reviewer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug IN ('super_admin', 'editor')
  )
);

-- Authors can view reviews for their manuscripts
CREATE POLICY "Authors can view reviews for their manuscripts" 
ON public.reviews FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.manuscripts m
    WHERE m.id = manuscript_id AND m.submitter_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug IN ('super_admin', 'editor')
  )
);

-- 8. Create storage buckets for manuscripts and library if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('manuscripts', 'manuscripts', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('library', 'library', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for manuscripts bucket (public read for open access, authenticated for upload)
DROP POLICY IF EXISTS "Public read manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Owner update manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete manuscripts" ON storage.objects;

CREATE POLICY "Public read manuscripts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'manuscripts');

CREATE POLICY "Authenticated upload manuscripts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'manuscripts');

CREATE POLICY "Owner update manuscripts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'manuscripts' AND auth.uid() = owner);

CREATE POLICY "Owner delete manuscripts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'manuscripts' AND auth.uid() = owner);

-- Policies for library bucket (public read for purchased books, authenticated for upload)
DROP POLICY IF EXISTS "Public read library" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload library" ON storage.objects;
DROP POLICY IF EXISTS "Owner update library" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete library" ON storage.objects;

CREATE POLICY "Public read library"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'library');

CREATE POLICY "Authenticated upload library"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'library');

CREATE POLICY "Owner update library"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'library' AND auth.uid() = owner);

CREATE POLICY "Owner delete library"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'library' AND auth.uid() = owner);

-- 9. Add helpful function for checking user role
CREATE OR REPLACE FUNCTION public.get_user_role_slug(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  role_slug TEXT;
BEGIN
  SELECT r.slug INTO role_slug
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = p_user_id;
  
  RETURN role_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
