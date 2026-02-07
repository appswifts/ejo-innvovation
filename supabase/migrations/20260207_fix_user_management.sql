-- RBAC Full Setup Migration (Applied: 2026-02-07)
-- This migration sets up the complete Role-Based Access Control system

-- 1. Create RBAC Tables
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 2. Seed All Roles (including finance_admin)
INSERT INTO public.roles (name, slug, description) VALUES
('Super Admin', 'super_admin', 'Full access to the system'),
('Editor', 'editor', 'Can manage journals and submissions'),
('Reviewer', 'reviewer', 'Can review assigned manuscripts'),
('Author', 'author', 'Can submit manuscripts'),
('Finance Admin', 'finance_admin', 'Can view and manage financial reports')
ON CONFLICT (slug) DO NOTHING;

-- 3. Seed Permissions
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

-- 4. Seed Role-Permissions Junctions
-- Super Admin (all permissions)
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

-- Reviewer
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.slug = 'reviewer' AND p.slug IN ('view_dashboard', 'review_manuscripts')
ON CONFLICT DO NOTHING;

-- Finance Admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.slug = 'finance_admin' AND p.slug IN ('view_dashboard', 'view_finances')
ON CONFLICT DO NOTHING;

-- 5. Add role_id to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- 6. Enable RLS on RBAC Tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Public read policies for RBAC tables
DROP POLICY IF EXISTS "Public read roles" ON public.roles;
DROP POLICY IF EXISTS "Public read permissions" ON public.permissions;
DROP POLICY IF EXISTS "Public read role_permissions" ON public.role_permissions;

CREATE POLICY "Public read roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Public read permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Public read role_permissions" ON public.role_permissions FOR SELECT USING (true);

-- 7. Create helper function for admin check
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Set up profiles policies for user management
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- SELECT policies
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles 
  FOR SELECT USING (public.is_super_admin());

-- UPDATE policies  
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles 
  FOR UPDATE USING (public.is_super_admin());
