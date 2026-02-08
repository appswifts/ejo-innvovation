-- Add new roles
INSERT INTO public.roles (name, slug, description)
VALUES 
  ('Book Seller', 'book_seller', 'Can sell books'),
  ('Author & Book Seller', 'author_bookseller', 'Can submit manuscripts and sell books')
ON CONFLICT (slug) DO NOTHING;

-- Add new permission
INSERT INTO public.permissions (slug, description)
VALUES ('manage_books', 'Can create, edit, and delete own books')
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions to roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.slug IN ('book_seller', 'author_bookseller', 'super_admin', 'editor')
  AND p.slug = 'manage_books'
ON CONFLICT DO NOTHING;

-- Add seller_id to books
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES public.profiles(id);

-- Enable RLS on books if not already
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Books Policies
CREATE POLICY "Public can view published books"
ON public.books FOR SELECT
TO public
USING (true); -- Assuming all books are public for now, or filter by some status if exists

CREATE POLICY "Sellers can manage own books"
ON public.books FOR ALL
TO authenticated
USING (seller_id = auth.uid());

CREATE POLICY "Admins can manage all books"
ON public.books FOR ALL
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

-- Create Applications Table
CREATE TYPE application_type AS ENUM ('author', 'book_seller', 'both');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  type application_type NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  data jsonb DEFAULT '{}'::jsonb, -- Stores degree url, categories, etc
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT applications_pkey PRIMARY KEY (id)
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications Policies
CREATE POLICY "Users can create applications"
ON public.applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own applications"
ON public.applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id IN (
      SELECT id FROM public.roles WHERE slug IN ('super_admin', 'editor')
    )
  )
);

CREATE POLICY "Admins can update all applications"
ON public.applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id IN (
      SELECT id FROM public.roles WHERE slug IN ('super_admin', 'editor')
    )
  )
);
