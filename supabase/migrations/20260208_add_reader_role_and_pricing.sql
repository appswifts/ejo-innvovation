-- Add 'reader' role if it doesn't exist
INSERT INTO roles (name, slug, description)
VALUES ('Reader', 'reader', 'Standard user with read-only access to purchased content.')
ON CONFLICT (slug) DO NOTHING;

-- Add 'price' column to manuscripts
ALTER TABLE manuscripts
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0.00;

-- Add 'currency' column to manuscripts
ALTER TABLE manuscripts
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
