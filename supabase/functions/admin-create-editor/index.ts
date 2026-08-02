const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateEditorPayload {
  full_name: string;
  email: string;
  title?: string;
  bio?: string;
  journal_ids?: string[];
  role?: string;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const randomPassword = () => {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !serviceKey) throw new Error('Admin editor service is not configured');

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return json(401, { success: false, message: 'Unauthorized' });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) return json(401, { success: false, message: 'Unauthorized' });

    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role:roles(slug)')
      .eq('id', user.id)
      .single();
    if (profileError || !callerProfile?.role || callerProfile.role.slug !== 'super_admin') {
      return json(403, { success: false, message: 'Forbidden: super admin only' });
    }

    const body: CreateEditorPayload = await req.json();
    const fullName = (body.full_name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    if (!fullName || !email) {
      return json(400, { success: false, message: 'full_name and email are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(400, { success: false, message: 'Invalid email address' });
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .ilike('email', email)
      .maybeSingle();
    if (existingProfile) {
      return json(409, { success: false, message: 'A user with this email already exists' });
    }

    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: randomPassword(),
      email_confirm: false,
      user_metadata: { full_name: fullName },
    });
    if (createError) throw createError;
    const userId = createdUser.user?.id;
    if (!userId) throw new Error('Failed to create user');

    const { data: editorRole } = await supabase
      .from('roles')
      .select('id')
      .eq('slug', 'editor')
      .single();
    if (editorRole?.id) {
      const { error: roleUpdateError } = await supabase
        .from('profiles')
        .update({ role_id: editorRole.id })
        .eq('id', userId);
      if (roleUpdateError) console.error('Role update failed:', roleUpdateError.message);
    }

    const { data: editorRow, error: editorError } = await supabase
      .from('editors')
      .insert({
        user_id: userId,
        full_name: fullName,
        email,
        title: body.title || null,
        bio: body.bio || null,
      })
      .select('*')
      .single();
    if (editorError) throw editorError;

    const journalIds = (body.journal_ids || []).filter((id) => typeof id === 'string');
    if (journalIds.length > 0) {
      const links = journalIds.map((journal_id) => ({
        journal_id,
        editor_id: editorRow.id,
        role: body.role || 'handling_editor',
      }));
      const { error: linksError } = await supabase.from('journal_editors').insert(links);
      if (linksError) throw linksError;
    }

    return json(200, { success: true, editor: editorRow, user_created: true });
  } catch (error: any) {
    console.error('admin-create-editor error:', error);
    return json(500, { success: false, message: error.message || 'Unable to create editor' });
  }
});
