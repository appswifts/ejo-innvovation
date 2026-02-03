-- Migration: 008_add_admin_user
-- Description: Adds admin role for appswifts@gmail.com

-- Add admin role for the user
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'ADMIN', true
FROM public.profiles
WHERE email = 'appswifts@gmail.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET is_active = true;
