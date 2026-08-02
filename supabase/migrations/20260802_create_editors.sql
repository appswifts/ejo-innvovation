-- Editors management
-- 1. editors table (one row per editor user)
CREATE TABLE IF NOT EXISTS public.editors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  title text,
  bio text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT editors_user_id_key UNIQUE (user_id)
);

-- 2. journal_editors junction (which editors are linked to which journals)
CREATE TABLE IF NOT EXISTS public.journal_editors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id uuid NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  editor_id uuid NOT NULL REFERENCES public.editors(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'handling_editor',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT journal_editors_journal_editor_key UNIQUE (journal_id, editor_id)
);

-- RLS
ALTER TABLE public.editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_editors ENABLE ROW LEVEL SECURITY;

-- Editors: readable by anyone (public journal pages show editorial teams)
CREATE POLICY "Public can view editors"
ON public.editors FOR SELECT
TO anon, authenticated
USING (true);

-- Editors: super admins manage (CRUD)
CREATE POLICY "Super admins can manage editors"
ON public.editors FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug IN ('super_admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug IN ('super_admin', 'editor')
  )
);

-- journal_editors: readable by anyone (public journal pages show editorial teams)
CREATE POLICY "Public can view journal editors"
ON public.journal_editors FOR SELECT
TO anon, authenticated
USING (true);

-- journal_editors: super admins manage
CREATE POLICY "Super admins can manage journal editors"
ON public.journal_editors FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug IN ('super_admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.slug IN ('super_admin', 'editor')
  )
);
