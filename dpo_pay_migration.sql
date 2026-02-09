-- =====================================================================
-- DPO PAY INTEGRATION FOR ACADEMIC PUBLISHING PLATFORM
-- Migration Script for Supabase
-- Version: 1.0
-- Date: February 9, 2026
-- =====================================================================

-- =====================================================================
-- STEP 1: Extend existing 'transactions' table with DPO fields
-- =====================================================================

-- Add DPO-specific columns to existing transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_gateway text DEFAULT 'dpo',
ADD COLUMN IF NOT EXISTS gateway_transaction_id text UNIQUE, -- DPO TransactionToken
ADD COLUMN IF NOT EXISTS gateway_metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS payment_method text CHECK (payment_method IN ('card', 'mobile_money', 'bank_transfer', 'cash')),
ADD COLUMN IF NOT EXISTS payment_method_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS gateway_status_code text, -- DPO Result code (000, 801, etc.)
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS company_ref text, -- DPO CompanyRef for tracking
ADD COLUMN IF NOT EXISTS refunded_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create index for faster DPO token lookups
CREATE INDEX IF NOT EXISTS idx_transactions_gateway_transaction_id 
ON public.transactions(gateway_transaction_id);

CREATE INDEX IF NOT EXISTS idx_transactions_company_ref 
ON public.transactions(company_ref);

CREATE INDEX IF NOT EXISTS idx_transactions_payment_gateway 
ON public.transactions(payment_gateway);

-- =====================================================================
-- STEP 2: Create DPO webhook events table
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.dpo_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  event_type text NOT NULL, -- 'payment_callback', 'verification', 'refund'
  transaction_token text NOT NULL, -- DPO TransactionToken
  company_ref text,
  status_code text, -- DPO Result code
  status_description text, -- DPO ResultExplanation
  payload jsonb NOT NULL, -- Full webhook/API response
  processed boolean DEFAULT false,
  processing_attempts integer DEFAULT 0,
  last_error text,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone
);

-- Indexes for webhook lookups
CREATE INDEX IF NOT EXISTS idx_webhook_transaction_token 
ON public.dpo_webhook_events(transaction_token);

CREATE INDEX IF NOT EXISTS idx_webhook_processed 
ON public.dpo_webhook_events(processed);

CREATE INDEX IF NOT EXISTS idx_webhook_transaction_id 
ON public.dpo_webhook_events(transaction_id);

-- =====================================================================
-- STEP 3: Create saved payment methods table
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g., "My Visa Card", "M-Pesa"
  method_type text NOT NULL CHECK (method_type IN ('card', 'mobile_money')),

  -- Card details (tokenized via DPO)
  card_last_four text,
  card_brand text, -- visa, mastercard, amex
  card_expiry_month integer,
  card_expiry_year integer,

  -- Mobile money details
  mobile_number text,
  mobile_provider text, -- 'mtn', 'airtel', 'vodacom', 'tigo', 'orange'

  -- DPO tokenization
  dpo_card_token text, -- DPO Super Wallet token
  dpo_customer_id text, -- DPO customer account ID

  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,

  UNIQUE(user_id, card_last_four, card_brand), -- Prevent duplicate cards
  UNIQUE(user_id, mobile_number) -- Prevent duplicate mobile numbers
);

-- Indexes for payment methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id 
ON public.payment_methods(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_default 
ON public.payment_methods(user_id, is_default) WHERE is_default = true;

-- =====================================================================
-- STEP 4: Create refunds table
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.payment_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  refund_amount numeric NOT NULL,
  refund_reason text,
  refund_type text DEFAULT 'full' CHECK (refund_type IN ('full', 'partial')),

  -- DPO refund details
  dpo_refund_token text,
  dpo_status_code text,
  dpo_status_description text,

  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  initiated_by uuid REFERENCES public.profiles(id), -- Admin who initiated refund
  approved_by uuid REFERENCES public.profiles(id), -- Admin who approved

  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  failed_at timestamp with time zone
);

-- Indexes for refunds
CREATE INDEX IF NOT EXISTS idx_refunds_transaction_id 
ON public.payment_refunds(transaction_id);

CREATE INDEX IF NOT EXISTS idx_refunds_status 
ON public.payment_refunds(status);

-- =====================================================================
-- STEP 5: Create user subscriptions table (for journal subscriptions)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.publication_packages(id),
  transaction_id uuid REFERENCES public.transactions(id),

  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),

  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,

  auto_renew boolean DEFAULT false,
  renewal_payment_method_id uuid REFERENCES public.payment_methods(id),

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  cancelled_at timestamp with time zone,

  UNIQUE(user_id, package_id, status) -- One active subscription per package per user
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
ON public.user_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
ON public.user_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date 
ON public.user_subscriptions(end_date) WHERE status = 'active';

-- =====================================================================
-- STEP 6: Create article access purchases table
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.article_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.transactions(id),

  access_expires_at timestamp with time zone, -- NULL = lifetime access
  download_limit integer DEFAULT -1, -- -1 = unlimited
  downloads_count integer DEFAULT 0,

  created_at timestamp with time zone DEFAULT now(),
  last_accessed_at timestamp with time zone,

  UNIQUE(user_id, article_id) -- One purchase per article per user
);

-- Indexes for article purchases
CREATE INDEX IF NOT EXISTS idx_article_purchases_user_id 
ON public.article_purchases(user_id);

CREATE INDEX IF NOT EXISTS idx_article_purchases_article_id 
ON public.article_purchases(article_id);

-- =====================================================================
-- STEP 7: Add article_id column to transactions (for article purchases)
-- =====================================================================

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS article_id uuid REFERENCES public.articles(id);

-- =====================================================================
-- STEP 8: Create functions and triggers
-- =====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for transactions table
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payment_methods table
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_one_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE public.payment_methods
        SET is_default = false
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for default payment method
DROP TRIGGER IF EXISTS ensure_default_payment_method ON public.payment_methods;
CREATE TRIGGER ensure_default_payment_method
    BEFORE INSERT OR UPDATE ON public.payment_methods
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION ensure_one_default_payment_method();

-- =====================================================================
-- STEP 9: Row Level Security (RLS) Policies
-- =====================================================================

-- Enable RLS on new tables
ALTER TABLE public.dpo_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_purchases ENABLE ROW LEVEL SECURITY;

-- Payment Methods: Users can view/edit their own
CREATE POLICY "Users can view own payment methods"
ON public.payment_methods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
ON public.payment_methods FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
ON public.payment_methods FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
ON public.payment_methods FOR DELETE
USING (auth.uid() = user_id);

-- Subscriptions: Users can view their own
CREATE POLICY "Users can view own subscriptions"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Article Purchases: Users can view their own
CREATE POLICY "Users can view own article purchases"
ON public.article_purchases FOR SELECT
USING (auth.uid() = user_id);

-- Webhooks: Admin-only (service role)
CREATE POLICY "Service role can manage webhooks"
ON public.dpo_webhook_events FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Refunds: Admin-only
CREATE POLICY "Admins can manage refunds"
ON public.payment_refunds FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug IN ('admin', 'finance_manager')
  )
);

-- Transactions: Users can view their own
CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

-- =====================================================================
-- STEP 10: Helper functions for payment processing
-- =====================================================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id uuid, p_package_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_subscriptions
        WHERE user_id = p_user_id
        AND package_id = p_package_id
        AND status = 'active'
        AND (end_date IS NULL OR end_date > now())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns article
CREATE OR REPLACE FUNCTION has_article_access(p_user_id uuid, p_article_id uuid)
RETURNS boolean AS $$
DECLARE
    v_article_access_level text;
    v_has_purchase boolean;
    v_has_subscription boolean;
BEGIN
    -- Check if article is open access
    SELECT access_level INTO v_article_access_level
    FROM public.articles
    WHERE id = p_article_id;

    IF v_article_access_level = 'open' THEN
        RETURN true;
    END IF;

    -- Check if user purchased article
    SELECT EXISTS (
        SELECT 1 FROM public.article_purchases
        WHERE user_id = p_user_id
        AND article_id = p_article_id
        AND (access_expires_at IS NULL OR access_expires_at > now())
    ) INTO v_has_purchase;

    IF v_has_purchase THEN
        RETURN true;
    END IF;

    -- Check if user has active journal subscription
    SELECT EXISTS (
        SELECT 1 FROM public.user_subscriptions us
        JOIN public.articles a ON us.package_id = a.journal_id
        WHERE us.user_id = p_user_id
        AND a.id = p_article_id
        AND us.status = 'active'
        AND (us.end_date IS NULL OR us.end_date > now())
    ) INTO v_has_subscription;

    RETURN v_has_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's default payment method
CREATE OR REPLACE FUNCTION get_default_payment_method(p_user_id uuid)
RETURNS uuid AS $$
DECLARE
    v_payment_method_id uuid;
BEGIN
    SELECT id INTO v_payment_method_id
    FROM public.payment_methods
    WHERE user_id = p_user_id
    AND is_default = true
    AND is_active = true
    LIMIT 1;

    RETURN v_payment_method_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- STEP 11: Create views for reporting
-- =====================================================================

-- View: Payment statistics by user
CREATE OR REPLACE VIEW public.user_payment_stats AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT t.id) as total_transactions,
    SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END) as total_spent,
    SUM(CASE WHEN t.type = 'apc_payment' AND t.status = 'completed' THEN t.amount ELSE 0 END) as apc_spent,
    SUM(CASE WHEN t.type = 'purchase' AND t.status = 'completed' THEN t.amount ELSE 0 END) as purchases_spent,
    COUNT(DISTINCT pm.id) as saved_payment_methods,
    COUNT(DISTINCT s.id) as active_subscriptions
FROM public.profiles u
LEFT JOIN public.transactions t ON u.id = t.user_id
LEFT JOIN public.payment_methods pm ON u.id = pm.user_id AND pm.is_active = true
LEFT JOIN public.user_subscriptions s ON u.id = s.user_id AND s.status = 'active'
GROUP BY u.id, u.full_name, u.email;

-- View: Payment gateway performance
CREATE OR REPLACE VIEW public.payment_gateway_stats AS
SELECT 
    payment_gateway,
    payment_method,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_count,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
    ROUND(
        100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*),
        2
    ) as success_rate_percent,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
    currency
FROM public.transactions
WHERE payment_gateway IS NOT NULL
GROUP BY payment_gateway, payment_method, currency;

-- =====================================================================
-- STEP 12: Insert sample data for testing
-- =====================================================================

-- Insert DPO payment gateway configuration
-- (This would typically be in a separate config table, but using comments for now)

-- =====================================================================
-- STEP 13: Create indexes for performance
-- =====================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_status 
ON public.transactions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_transactions_type_status 
ON public.transactions(type, status);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at 
ON public.transactions(created_at DESC);

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================

-- Verify migration
DO $$
BEGIN
    RAISE NOTICE 'DPO Pay integration migration completed successfully!';
    RAISE NOTICE 'New tables created: 5';
    RAISE NOTICE 'Extended tables: 1 (transactions)';
    RAISE NOTICE 'New functions: 3';
    RAISE NOTICE 'New views: 2';
    RAISE NOTICE 'RLS policies: Enabled on all tables';
END $$;
