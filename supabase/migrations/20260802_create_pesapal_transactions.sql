-- Create PesaPal transactions tracking table
CREATE TABLE IF NOT EXISTS public.pesapal_transactions (
  id uuid default gen_random_uuid() primary key,
  order_tracking_id text unique not null,
  merchant_reference text not null,
  user_id uuid references auth.users(id),
  ref_id text,
  ref_type text,
  metadata jsonb default '{}'::jsonb,
  amount decimal(10, 2) not null,
  currency text not null default 'RWF',
  phone_number text,
  payment_method text,
  status text default 'pending',
  status_code int,
  confirmation_code text,
  payment_account text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.pesapal_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own pesapal transactions"
ON public.pesapal_transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());
