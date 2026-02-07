-- Create manuscript_comments table for review communication
CREATE TABLE IF NOT EXISTS manuscript_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manuscript_comments_manuscript_id ON manuscript_comments(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_manuscript_comments_author_id ON manuscript_comments(author_id);

-- Enable Row Level Security
ALTER TABLE manuscript_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Authors can view comments on their own manuscripts
CREATE POLICY "Authors can view comments on their manuscripts"
    ON manuscript_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM manuscripts 
            WHERE manuscripts.id = manuscript_comments.manuscript_id 
            AND manuscripts.submitter_id = auth.uid()
        )
    );

-- Policy: Editors and admins can view all comments
CREATE POLICY "Editors can view all comments"
    ON manuscript_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role_id IN (
                SELECT id FROM roles WHERE slug IN ('super_admin', 'editor')
            )
        )
    );

-- Policy: Editors and admins can insert comments
CREATE POLICY "Editors can insert comments"
    ON manuscript_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role_id IN (
                SELECT id FROM roles WHERE slug IN ('super_admin', 'editor')
            )
        )
    );

-- Policy: Authors can insert comments on their own manuscripts
CREATE POLICY "Authors can comment on their manuscripts"
    ON manuscript_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM manuscripts 
            WHERE manuscripts.id = manuscript_comments.manuscript_id 
            AND manuscripts.submitter_id = auth.uid()
        )
    );
