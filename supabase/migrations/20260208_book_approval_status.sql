-- Create book_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE book_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to books table
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS status book_status DEFAULT 'pending';

-- Update RLS policies for books
-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Public can view published books" ON public.books;
DROP POLICY IF EXISTS "Sellers can manage own books" ON public.books;
DROP POLICY IF EXISTS "Admins can manage all books" ON public.books;

-- 1. Public can only view approved books
CREATE POLICY "Public can view approved books"
ON public.books FOR SELECT
TO public
USING (status = 'approved');

-- 2. Sellers can view and manage their own books (regardless of status)
CREATE POLICY "Sellers can manage own books"
ON public.books FOR ALL
TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- 3. Admins/Editors can manage everything
CREATE POLICY "Admins can manage all books"
ON public.books FOR ALL
TO authenticated
USING (
  get_user_role_slug(auth.uid()) IN ('super_admin', 'editor', 'finance_admin')
);
