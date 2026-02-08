-- Create the 'submission_files' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('submission_files', 'submission_files', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files to 'submission_files'
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'submission_files');

-- Policy: Allow users to view their own files (and admins to view all)
-- Assuming file path contains user_id as prefix or we just allow reading for now if they have the link
-- For simplicity in this demo, letting authenticated users read files in this bucket (signed URLs will protect access typically, but public=false means they need a token)
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'submission_files');

-- Policy: Allow users to update/delete their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'submission_files' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'submission_files' AND auth.uid() = owner);
