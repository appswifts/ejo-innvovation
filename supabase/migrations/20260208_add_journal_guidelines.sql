-- Add guidelines column to journals table
ALTER TABLE journals ADD COLUMN IF NOT EXISTS guidelines TEXT;
