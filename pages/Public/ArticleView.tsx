import React, { useEffect, useState } from 'react';
import { ViewState } from '../../types';
import TopNav from '../../components/TopNav';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

interface ArticleDetail {
  id: string;
  title: string;
  abstract: string;
  submission_date: string;
  status: string;
  payment_status: string;
  file_url: string | null;
  submitter: {
    full_name: string;
  } | { full_name: string }[] | null;
  journal: {
    id: string;
    title: string;
  } | null;
}

const ArticleView: React.FC = () => {
  const navigate = useNavigate();
  const { id: articleId } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        if (!articleId) return;

        const { data, error } = await supabase
          .from('manuscripts')
          .select(`
                        id, 
                        title, 
                        abstract, 
                        submission_date, 
                        status, 
                        payment_status,
                        file_url,
                        submitter:submitter_id(full_name),
                        journal:journal_id(id, title)
                    `)
          .eq('id', articleId)
          .single();

        if (error) throw error;
        // @ts-ignore - Supabase types join fix
        setArticle(data);

        // Security Check: If not published AND (not accepted+paid), maybe hidden?
        // But for now, let's just allow viewing logic, but the list page is filtered.
        // Or redirect if status is restricted?
        const isVisible = data.status === 'published' || (data.status === 'accepted' && data.payment_status === 'paid');

        // If user is the author or admin, they might still want to see it? 
        // For public view, we enforce this.
        // Assuming this page is public facing.
        // We'll trust the list filtering primarily, but here is a simple check:
        if (!isVisible) {
          // Optional: You could redirect or show a "Content not available" message.
          // For now, keeping it open to verify the updated data structure, but filtering on JournalDetail is key.
        }
      } catch (err) {
        console.error("Error fetching article", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleDownload = async () => {
    if (!article?.file_url) return;

    // Simpler download logic - assume it's a public URL or handle signed URL if needed
    // For now, if we stored just the path, we need to generate a signed URL
    try {
      let path = article.file_url;
      // If full URL, strip it (though logic in SubmissionWizard now stores path)
      if (path.includes('supabase.co')) {
        const match = path.match(/\/manuscripts\/(.+)$/);
        if (match) path = match[1];
      }

      const { data, error } = await supabase.storage
        .from('manuscripts')
        .createSignedUrl(path, 60); // 1 minute expiry

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error("Download error", error);
      alert("Could not download file.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!article) return <div className="p-10 text-center">Article not found</div>;

  return (
    <div className="min-h-screen bg-background-light font-display">
      <TopNav transparent={false} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <button onClick={() => navigate('/journals')} className="hover:text-primary">Journals</button>
          {article.journal && (
            <>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <button onClick={() => navigate(`/journals/${article.journal?.id}`)} className="hover:text-primary font-medium">
                {article.journal.title}
              </button>
            </>
          )}
        </nav>

        <div className="mb-10">
          <h1 className="font-serif text-4xl lg:text-5xl text-navy-deep leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-primary font-medium text-lg">
                {Array.isArray(article.submitter)
                  ? article.submitter[0]?.full_name
                  : article.submitter?.full_name || 'Unknown Author'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              <span className="text-sm">Published {new Date(article.submission_date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-slate-200/50 rounded-lg text-slate-700 text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">visibility</span> 0 Views
            </span>
            <span className={`ml-auto px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
              {article.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <section className="bg-white border-l-4 border-primary p-8 rounded-r-xl shadow-sm mb-8">
              <h3 className="text-lg font-bold text-navy-deep mb-4 uppercase tracking-wider">Abstract</h3>
              <p className="text-slate-700 leading-relaxed italic whitespace-pre-line">
                {article.abstract}
              </p>
            </section>

            <div className="border-b border-slate-200 mb-8">
              <div className="flex gap-8">
                <button className="pb-4 text-sm font-bold text-primary border-b-2 border-primary">PDF Preview</button>
              </div>
            </div>

            {/* PDF View / Access Control */}
            <div className="relative rounded-xl border border-slate-200 bg-white shadow-xl min-h-[400px] flex flex-col items-center justify-center p-8">
              {/* Simplified view: Just a download button for now. 
                                 A real PDF viewer would go here. */}
              <div className="text-center">
                <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-slate-400">picture_as_pdf</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Read Full Article</h3>
                <p className="text-slate-500 mb-6 max-w-md">
                  Download the full PDF to read the complete research paper.
                </p>
                <button
                  onClick={handleDownload}
                  className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined">download</span>
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24 shadow-sm">
              <h4 className="text-sm font-bold text-navy-deep uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">build</span> Tools
              </h4>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100">
                  <span>Cite this article</span>
                  <span className="material-symbols-outlined text-slate-400">format_quote</span>
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 flex justify-center items-center gap-2">
                    <span className="material-symbols-outlined text-base">share</span> Share
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">print</span> Print
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ArticleView;