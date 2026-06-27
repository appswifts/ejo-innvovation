-- Create KitovuPay transactions tracking table
CREATE TABLE IF NOT EXISTS public.kitovu_transactions (
  id uuid default gen_random_uuid() primary key,
  kitovu_reference text unique not null,
  merchant_reference text not null,
  user_id uuid references auth.users(id),
  ref_id text,
  ref_type text,
  metadata jsonb default '{}'::jsonb,
  amount decimal(10, 2) not null,
  currency text not null default 'RWF',
  phone_number text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.kitovu_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own kitovu transactions"
ON public.kitovu_transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Fix transactions table type constraint to accept additional types
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('purchase', 'apc_payment', 'royalty_payout', 'journal_subscription', 'book_purchase', 'manual_payment'));

-- Add payment_gateway column if not exists
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_gateway text;

-- Add book_id column if not exists
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS book_id uuid references public.books(id);

-- Add manuscript_id column if not exists
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS manuscript_id uuid references public.manuscripts(id);

-- Add package_id column if not exists
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS package_id uuid;
