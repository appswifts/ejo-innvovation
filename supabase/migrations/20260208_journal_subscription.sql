-- Add subscription_package_id to journals table
-- This allows journals to be linked to a specific pricing package for subscriptions
ALTER TABLE journals
ADD COLUMN subscription_package_id UUID REFERENCES publication_packages(id) ON DELETE SET NULL;

-- Create an index for better performance on joins
CREATE INDEX idx_journals_subscription_package_id ON journals(subscription_package_id);
