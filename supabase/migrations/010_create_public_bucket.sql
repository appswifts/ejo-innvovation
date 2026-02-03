-- Migration: 010_create_public_bucket
-- Description: Creates a public storage bucket for assets like cover images and logos

-- Create 'public-assets' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'public-assets', 
    'public-assets', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies

-- Public Read
DROP POLICY IF EXISTS "Public Assets are viewable by everyone" ON storage.objects;
CREATE POLICY "Public Assets are viewable by everyone"
ON storage.objects FOR SELECT
USING ( bucket_id = 'public-assets' );

-- Authenticated Upload
DROP POLICY IF EXISTS "Authenticated users can upload public assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload public assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'public-assets' AND
    auth.role() = 'authenticated'
);

-- Users can update/delete their own uploads (relying on implicit owner column or metadata)
-- Note: storage.objects has 'owner' column but it might be null if not set explicitly or handled by Supabase Auth integration.
-- Usually Supabase sets owner to auth.uid() automatically on insert.
DROP POLICY IF EXISTS "Users can update their own public assets" ON storage.objects;
CREATE POLICY "Users can update their own public assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'public-assets' AND
    auth.uid() = owner
);

DROP POLICY IF EXISTS "Users can delete their own public assets" ON storage.objects;
CREATE POLICY "Users can delete their own public assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'public-assets' AND
    auth.uid() = owner
);
