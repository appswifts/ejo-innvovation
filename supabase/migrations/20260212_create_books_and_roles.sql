-- Create Enum for Book Types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'book_type_enum') THEN
        CREATE TYPE book_type_enum AS ENUM ('scholarly', 'creative', 'nonfiction');
    END IF;
END$$;

-- Create Enum for Book Status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'book_status_enum') THEN
        CREATE TYPE book_status_enum AS ENUM ('pending_payment', 'pending_review', 'published', 'rejected');
    END IF;
END$$;

-- Create Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    author_name TEXT NOT NULL,
    book_type book_type_enum NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0,
    cover_url TEXT,
    pdf_url TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status book_status_enum DEFAULT 'pending_payment',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Policies for Books
CREATE POLICY "Public can view published books" 
ON public.books FOR SELECT 
USING (status = 'published');

CREATE POLICY "Users can insert own books" 
ON public.books FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" 
ON public.books FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all books" 
ON public.books FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.permissions p ON rp.permission_id = p.id
    JOIN public.user_roles ur ON rp.role_id = ur.role_id
    WHERE ur.user_id = auth.uid() AND p.name = 'manage_content'
  )
  OR 
  EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
  )
);

-- Update Submissions Table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Storage Buckets for Books
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book_covers', 'book_covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Book Covers" ON storage.objects
FOR SELECT USING (bucket_id = 'book_covers');

CREATE POLICY "Auth Upload Book Covers" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'book_covers' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Update Book Covers" ON storage.objects
FOR UPDATE USING (bucket_id = 'book_covers' AND auth.uid() = owner);

CREATE POLICY "Owner Delete Book Covers" ON storage.objects
FOR DELETE USING (bucket_id = 'book_covers' AND auth.uid() = owner);
