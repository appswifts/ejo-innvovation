
import React, { useEffect, useState } from 'react';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabaseClient';

interface EditorCard {
  id: string;
  full_name: string;
  email: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  journals: { journal_id: string; journal_title: string; role: string }[];
}

const ROLE_LABELS: Record<string, string> = {
  editor_in_chief: 'Editor-in-Chief',
  handling_editor: 'Handling Editor',
  board_member: 'Editorial Board Member',
};

const EditorsPage: React.FC = () => {
  const [editors, setEditors] = useState<EditorCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEditors = async () => {
      const [editorsRes, linksRes, journalsRes] = await Promise.all([
        supabase.from('editors').select('*').eq('is_active', true).order('full_name'),
        supabase.from('journal_editors').select('editor_id, journal_id, role').eq('is_active', true),
        supabase.from('journals').select('id, title').order('title'),
      ]);

      const editorsData = (editorsRes.data || []) as any[];
      const links = (linksRes.data || []) as any[];
      const journalsMap = new Map<string, string>(
        (journalsRes.data || []).map((j: any) => [j.id, j.title])
      );

      const mapped: EditorCard[] = editorsData.map((ed: any) => ({
        id: ed.id,
        full_name: ed.full_name,
        email: ed.email,
        title: ed.title || undefined,
        bio: ed.bio || undefined,
        avatar_url: ed.avatar_url || undefined,
        journals: links
          .filter((l: any) => l.editor_id === ed.id)
          .map((l: any) => ({
            journal_id: l.journal_id,
            journal_title: journalsMap.get(l.journal_id) || 'Unknown Journal',
            role: l.role,
          })),
      }));

      setEditors(mapped);
      setLoading(false);
    };
    fetchEditors();
  }, []);

  return (
    <div className="min-h-screen bg-background-light">
      <TopNav />

      <section className="bg-primary py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white font-serif mb-4">Editorial Board</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Meet the scholars, researchers, and professionals who guide the peer-review process and uphold the standards of our journals.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : editors.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">group_off</span>
            <h3 className="text-xl font-bold text-slate-500 mb-2">No editors listed yet</h3>
            <p className="text-slate-400">The editorial board will be announced soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {editors.map(editor => (
              <div key={editor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                      {editor.avatar_url ? (
                        <img alt={editor.full_name} src={editor.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        editor.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{editor.full_name}</h3>
                      {editor.title && (
                        <p className="text-primary font-semibold text-sm">{editor.title}</p>
                      )}
                    </div>
                  </div>

                  {editor.bio && (
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">{editor.bio}</p>
                  )}

                  {editor.journals.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Serves on</p>
                      <div className="space-y-1.5">
                        {editor.journals.map(j => (
                          <div key={j.journal_id} className="flex items-center gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                            <span className="text-slate-700 font-medium">{j.journal_title}</span>
                            <span className="text-xs font-bold text-primary ml-auto">
                              {ROLE_LABELS[j.role] || j.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editor.journals.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Not yet assigned to a journal</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EditorsPage;
