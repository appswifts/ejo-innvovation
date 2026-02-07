import React, { useEffect, useState } from 'react';
import { ViewState, Journal } from '../../types';
import TopNav from '../../components/TopNav';
import { supabase } from '../../lib/supabaseClient';

import { useNavigate, useParams } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  abstract: string;
  submission_date: string;
  status: string;
  payment_status: string;
  submitter: {
    full_name: string;
  } | { full_name: string }[] | null;
}

const JournalDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id: journalId } = useParams<{ id: string }>();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!journalId) return;

        // 1. Fetch Journal Details
        const { data: journalData, error: journalError } = await supabase
          .from('journals')
          .select('*')
          .eq('id', journalId)
          .single();

        if (journalError) throw journalError;
        setJournal(journalData);

        // 2. Fetch Published Articles (Manuscripts)
        // Note: In real production, status should be 'published'. 
        // For now, listing 'submitted' or 'accepted' too so user sees something while testing.
        // Or I can strictly filter by 'published' and user has to publish one.
        // Let's filter by status NOT 'rejected' basically, or maybe just list all for now until workflow is tighter.
        // Better approach: Show "published" and "accepted".
        // Note: Filter for (status = published) OR (status = accepted AND payment_status = paid)
        // Since Supabase OR query with AND is tricky in one go without raw SQL or complex filters,
        // we will fetch 'accepted' and 'published' first, then filter in memory for now OR use a more complex query if needed.
        // For simplicity and to show all potential valid ones:
        const { data: articlesData, error: articlesError } = await supabase
          .from('manuscripts')
          .select('id, title, abstract, submission_date, status, payment_status, submitter:submitter_id(full_name)')
          .eq('journal_id', journalId)
          .in('status', ['published', 'accepted'])
          .order('submission_date', { ascending: false });

        if (articlesError) throw articlesError;

        // Strict Filter:
        // Show if status is 'published' 
        // OR if status is 'accepted' AND payment_status is 'paid'
        const visibleArticles = (articlesData || []).filter((article: any) =>
          article.status === 'published' || (article.status === 'accepted' && article.payment_status === 'paid')
        );

        setArticles(visibleArticles);

      } catch (err) {
        console.error("Error fetching journal data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [journalId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!journal) return <div className="p-10 text-center">Journal not found</div>;

  return (
    <div className="min-h-screen bg-background-light">
      <TopNav active={ViewState.JOURNAL_LIST} transparent={false} />

      {/* Hero */}
      <section className="bg-primary py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-white font-serif leading-tight">{journal.title}</h2>
              <div className="flex items-center gap-4 text-blue-100 font-medium">
                <span>ISSN: {journal.issn || 'N/A'}</span>
                <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                <span>{journal.is_open_access ? "Open Access Journal" : "Subscription Journal"}</span>
              </div>
            </div>
            {journal.impact_factor && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center min-w-[160px]">
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Impact Factor</p>
                <p className="text-4xl font-black text-white">{journal.impact_factor}</p>
                <p className="text-blue-200 text-[10px] mt-1">2023 Journal Citation Reports</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            <section>
              <h3 className="text-2xl font-bold font-serif mb-4 border-l-4 border-primary pl-4 text-slate-900">About this Journal</h3>
              <div className="prose max-w-none text-slate-600 leading-relaxed space-y-4">
                <p className="whitespace-pre-line">{journal.description}</p>
                {journal.aims_scope && (
                  <>
                    <h4 className="font-bold text-lg text-slate-800">Aims & Scope</h4>
                    <p className="whitespace-pre-line">{journal.aims_scope}</p>
                  </>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold font-serif text-slate-900">Latest Articles</h3>
              </div>

              <div className="space-y-6">
                {articles.length > 0 ? (
                  articles.map(article => (
                    <div
                      key={article.id}
                      onClick={() => navigate(`/articles/${article.id}`)}
                      className="group p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex gap-2 text-xs font-bold text-primary uppercase mb-3">
                        <span>Research Article</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{new Date(article.submission_date).toLocaleDateString()}</span>
                        <span className="text-slate-300">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {article.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold font-serif group-hover:text-primary transition-colors mb-2 text-slate-900">
                        {article.title}
                      </h4>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {article.abstract}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium italic text-slate-500">
                          {Array.isArray(article.submitter)
                            ? article.submitter[0]?.full_name
                            : article.submitter?.full_name || 'Unknown Author'}
                        </span>
                        <div className="flex gap-3 items-center">
                          {!journal?.is_open_access && (
                            <span className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                              <span className="material-symbols-outlined text-sm">lock</span> Requires Access
                            </span>
                          )}
                          <button className="flex items-center gap-1 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">visibility</span> View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-2">No articles found in this journal yet.</p>
                    <p className="text-xs text-slate-400">Be the first to submit!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <button onClick={() => navigate('/dashboard/submit')} className="w-full bg-primary text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-transform active:scale-95 shadow-lg shadow-primary/25">
                  <span className="material-symbols-outlined">upload_file</span>
                  Submit Your Manuscript
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-4 uppercase tracking-widest font-bold">Avg. Review Time: 45 Days</p>
              </div>

              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
                <h3 className="text-xl font-bold font-serif mb-6 text-slate-900">Editor-in-Chief</h3>
                <div className="flex gap-4 items-center mb-4">
                  {/* <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                                        <img alt={journal.editor_in_chief_name || 'Editor'} className="w-full h-full object-cover" src="https://via.placeholder.com/150" />
                                    </div> */}
                  <div>
                    <h4 className="font-bold text-slate-900">{journal.editor_in_chief_name || 'Not Assigned'}</h4>
                    <p className="text-primary font-semibold text-xs">Editor-in-Chief</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Leading the editorial board to ensure the highest standards of peer review and publication ethics.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default JournalDetail;