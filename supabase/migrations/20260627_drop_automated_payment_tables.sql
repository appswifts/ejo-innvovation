-- Drop automated payment gateway tables (DPO, Polar)
-- These gateways have been removed from the codebase

DROP TABLE IF EXISTS public.polar_transactions CASCADE;
DROP TABLE IF EXISTS public.dpo_transactions CASCADE;
