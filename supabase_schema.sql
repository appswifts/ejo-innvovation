-- NKIZA CENTER FOR RESEARCH (NCR) - SUPABASE SCHEMA

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Legacy support, though we act primarily on tables now)
CREATE TYPE manuscript_status AS ENUM ('draft', 'submitted', 'under_review', 'revision_required', 'accepted', 'rejected', 'published');
CREATE TYPE review_status AS ENUM ('invited', 'accepted', 'completed', 'declined', 'overdue');
CREATE TYPE review_recommendation AS ENUM ('accept', 'minor_revision', 'major_revision', 'reject');
CREATE TYPE access_type AS ENUM ('open', 'paid', 'institutional');

-- 3. RBAC SYSTEM (Roles & Permissions)
CREATE TABLE public.permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL, -- e.g., 'manage_users', 'publish_articles'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., 'Super Admin', 'Editor'
  slug TEXT UNIQUE NOT NULL, -- e.g., 'super_admin', 'editor'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 4. PROFILES (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  institution TEXT,
  bio TEXT,
  role_id UUID REFERENCES public.roles(id), -- Link to dynamic role
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. JOURNALS
CREATE TABLE public.journals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  issn TEXT,
  description TEXT,
  aims_scope TEXT,
  cover_image_url TEXT,
  discipline TEXT, -- e.g., 'Economics', 'Medical'
  editor_in_chief_name TEXT,
  impact_factor NUMERIC(5, 3),
  is_open_access BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ARTICLES
CREATE TABLE public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  journal_id UUID REFERENCES public.journals(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  abstract TEXT,
  content_html TEXT, -- Store HTML content or path to storage bucket
  pdf_url TEXT,      -- Path to PDF in Storage
  publication_date DATE DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  doi TEXT,
  keywords TEXT[],
  access_level access_type DEFAULT 'open',
  price NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ARTICLE AUTHORS (Junction Table)
CREATE TABLE public.article_authors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id), -- Optional link to registered user
  name TEXT NOT NULL, -- Fallback for display
  affiliation TEXT,
  author_order INTEGER NOT NULL DEFAULT 1
);

-- 7. MANUSCRIPTS (Submission Workflow)
CREATE TABLE public.manuscripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submitter_id UUID REFERENCES public.profiles(id) NOT NULL,
  journal_id UUID REFERENCES public.journals(id),
  title TEXT NOT NULL,
  abstract TEXT,
  file_url TEXT NOT NULL, -- Link to 'manuscripts' bucket
  cover_letter TEXT,
  status manuscript_status DEFAULT 'draft',
  submission_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REVIEWS
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id),
  status review_status DEFAULT 'invited',
  score_originality INTEGER CHECK (score_originality BETWEEN 1 AND 5),
  score_rigor INTEGER CHECK (score_rigor BETWEEN 1 AND 5),
  comments_to_author TEXT,
  comments_to_editor TEXT,
  recommendation review_recommendation,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ
);

-- 9. BOOKS (eBook Catalog)
CREATE TABLE public.books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author_name TEXT,
  cover_url TEXT,
  description TEXT,
  type TEXT CHECK (type IN ('monograph', 'textbook', 'anthology')),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  royalty_percentage INTEGER DEFAULT 70,
  published_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TRANSACTIONS (Finance)
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT CHECK (type IN ('purchase', 'apc_payment', 'royalty_payout')),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Security)

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read, User can update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RBAC Tables: Public read (for UI), Admin write (managed via UI or Seed)
CREATE POLICY "Public read roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Public read permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Public read role_permissions" ON public.role_permissions FOR SELECT USING (true);

-- Manuscripts: Submitters can see their own
CREATE POLICY "Authors view own manuscripts" ON public.manuscripts FOR SELECT USING (auth.uid() = submitter_id);

-- TRIGGER: Auto-create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Get the 'author' role ID
  SELECT id INTO default_role_id FROM public.roles WHERE slug = 'author' LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role_id)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    default_role_id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SEED DATA (RBAC)
-- 1. Insert Roles
INSERT INTO public.roles (name, slug, description) VALUES
('Super Admin', 'super_admin', 'Full access to the system'),
('Editor', 'editor', 'Can manage journals and submissions'),
('Reviewer', 'reviewer', 'Can review assigned manuscripts'),
('Author', 'author', 'Can submit manuscripts');

-- 2. Insert Permissions
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
('view_finances', 'Can view financial reports');

-- 3. Assign Permissions to Roles (Seed Logic)
-- Super Admin (All permissions)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p WHERE r.slug = 'super_admin';

-- Editor
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.slug = 'editor' AND p.slug IN (
  'view_dashboard', 'manage_journals', 'review_manuscripts', 'assign_reviewers', 'publish_articles'
);

-- Author
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.slug = 'author' AND p.slug IN (
  'view_dashboard', 'submit_manuscript', 'view_own_manuscripts'
);

-- Reviewer
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.slug = 'reviewer' AND p.slug IN (
  'view_dashboard', 'review_manuscripts'
);

-- SAMPLE DATA INSERTION (Optional)
INSERT INTO public.journals (title, slug, discipline, issn, is_open_access, impact_factor)
VALUES 
('Nkiza International Journal of Economics', 'nije', 'Economics', '2041-1723', true, 2.4),
('Journal of Advanced Biomedical Engineering', 'jabe', 'Medical', '1932-6203', true, 3.1);
