
-- Migration Script for RBAC
-- Run this in your Supabase SQL Editor to upgrade the database.

-- 1. Create New Tables
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 2. Seed Initial Roles & Permissions
INSERT INTO public.roles (name, slug, description) VALUES
('Super Admin', 'super_admin', 'Full access to the system'),
('Editor', 'editor', 'Can manage journals and submissions'),
('Reviewer', 'reviewer', 'Can review assigned manuscripts'),
('Author', 'author', 'Can submit manuscripts')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.permissions (slug, description) VALUES
('view_dashboard', 'Can view the main dashboard'),
('manage_users', 'Can create and edit users'),
('manage_roles', 'Can manage roles and permissions'),
('manage_journals', 'Can create and edit journals'),
('submit_manuscript', 'Can submit new manuscripts'),
('view_own_manuscripts', 'Can view own submissions'),
('review_manuscripts', 'Can review assigned manuscripts'),
('assign_reviewers', 'Can assign reviewers to manuscripts'),
('publish_articles', 'Can publish accepted manuscripts'),
('view_finances', 'Can view financial reports')
ON CONFLICT (slug) DO NOTHING;

-- Seed Junctions (Simplified for migration safety)
-- Super Admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p WHERE r.slug = 'super_admin'
ON CONFLICT DO NOTHING;

-- Editor
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.slug = 'editor' AND p.slug IN ('view_dashboard', 'manage_journals', 'review_manuscripts', 'assign_reviewers', 'publish_articles')
ON CONFLICT DO NOTHING;

-- Author
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.slug = 'author' AND p.slug IN ('view_dashboard', 'submit_manuscript', 'view_own_manuscripts')
ON CONFLICT DO NOTHING;

-- 3. Modify Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Migrate existing ENUM roles to new role_id (if data exists)
DO $$
BEGIN
    UPDATE public.profiles p
    SET role_id = r.id
    FROM public.roles r
    WHERE p.role::text = r.slug;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if column role doesn't exist or cast fails
    NULL;
END $$;

-- Drop old role column if you are ready (Commented out for safety)
-- ALTER TABLE public.profiles DROP COLUMN role;

-- 4. Enable RLS on New Tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Public read permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Public read role_permissions" ON public.role_permissions FOR SELECT USING (true);
