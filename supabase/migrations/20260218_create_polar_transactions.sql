-- Create polar_transactions table for Polar payment gateway
create table if not exists public.polar_transactions (
  id uuid default gen_random_uuid() primary key,
  checkout_id text unique not null,        -- Polar Checkout Session ID
  polar_order_id text,                     -- Polar Order ID (set after payment)
  
  -- Project Specific References
  user_id uuid references auth.users(id),  -- Link to auth.users (nullable for guest checkout)
  ref_id text,                             -- Your Order ID, Booking ID, etc.
  ref_type text,                           -- 'order', 'booking', 'subscription'
  metadata jsonb default '{}'::jsonb,      -- Any extra context (plan_name, items, etc.)
  
  -- Payment Details
  amount decimal(10, 2) not null,
  currency text not null default 'USD',
  status text default 'created',           -- created, paid, failed, cancelled, refunded
  
  -- Audit
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for fast lookups
create index if not exists idx_polar_checkout_id on public.polar_transactions(checkout_id);
create index if not exists idx_polar_ref_id on public.polar_transactions(ref_id);
create index if not exists idx_polar_user_id on public.polar_transactions(user_id);

-- Enable RLS
alter table public.polar_transactions enable row level security;

-- Policies
create policy "Users can view their own polar transactions"
  on public.polar_transactions
  for select
  using (auth.uid() = user_id);

create policy "Service role can manage all polar transactions"
  on public.polar_transactions
  using (true)
  with check (true);
