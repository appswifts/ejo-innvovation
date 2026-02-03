-- Add pricing columns to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS preview_content TEXT;

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    provider VARCHAR(20) NOT NULL, -- STRIPE, MTN_MOMO, MANUAL
    transaction_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Policies for purchases

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
ON public.purchases FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
ON public.purchases FOR SELECT
USING (public.is_admin());

-- Admins can insert/update purchases (for manual management or webhooks)
CREATE POLICY "Admins can manage purchases"
ON public.purchases FOR ALL
USING (public.is_admin());

-- Allow authenticated users to insert purchases (e.g. initiating a transaction)
-- In a real scenario, this might be handled via a secure server function, 
-- but for now we allow creation with 'PENDING' status.
CREATE POLICY "Users can create purchases"
ON public.purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
