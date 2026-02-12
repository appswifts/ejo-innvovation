import React, { useEffect, useState } from 'react';
import { ViewState } from '../../types';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ArticleDetail {
  id: string;
  title: string;
  abstract: string;
  submission_date: string;
  status: string;
  payment_status: string;
  file_url: string | null;
  price: number;
  currency: string;
  submitter: {
    id: string;
    full_name: string;
  } | { id: string; full_name: string }[] | null;
  journal: {
    id: string;
    title: string;
    is_open_access: boolean;
    subscription_package_id: string | null;
  } | null;
}

const ArticleView: React.FC = () => {
  const navigate = useNavigate();
  const { id: articleId } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

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
                        price,
                        currency,
                        submitter:submitter_id(id, full_name),
                        journal:journal_id(id, title, is_open_access, subscription_package_id)
                    `)
          .eq('id', articleId)
          .single();

        if (error) throw error;
        // @ts-ignore - Supabase types join fix
        setArticle(data);
      } catch (err) {
        console.error("Error fetching article", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  useEffect(() => {
    checkAccess();
  }, [article, user]);

  const checkAccess = async () => {
    if (!article) return;
    setCheckingAccess(true);

    // 1. Open Access
    if (article.journal?.is_open_access) {
      setHasAccess(true);
      setCheckingAccess(false);
      return;
    }

    if (!user) {
      setHasAccess(false);
      setCheckingAccess(false);
      return;
    }

    // 2. Author
    const submitterId = Array.isArray(article.submitter) ? article.submitter[0]?.id : (article.submitter as any)?.id;
    if (user.id === submitterId) {
      setHasAccess(true);
      setCheckingAccess(false);
      return;
    }

    // 3. Admin/Editor Bypass
    const roleSlug = profile?.role?.slug;
    if (['super_admin', 'editor', 'finance_admin'].includes(roleSlug || '')) {
      setHasAccess(true);
      setCheckingAccess(false);
      return;
    }

    // 3.5 Journal Subscription
    if (user && article.journal?.subscription_package_id) {
      const { data: sub } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('package_id', article.journal.subscription_package_id)
        .eq('status', 'completed')
        .maybeSingle();

      if (sub) {
        setHasAccess(true);
        setCheckingAccess(false);
        return;
      }
    }

    // 4. Purchased
    const { data: purchase } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'purchase') // Assuming 'purchase' type for articles as well, or we can use 'article_purchase'
      .eq('manuscript_id', article.id) // Correct column for article purchase
      .eq('status', 'completed')
      .maybeSingle();

    if (purchase) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
    }
    setCheckingAccess(false);
  };

  const handleDownload = async () => {
    if (!hasAccess) {
      // Should not happen if UI is correct, but safe guard
      alert("Please purchase this article to download.");
      return;
    }

    if (!article?.file_url) {
      alert("File not available.");
      return;
    }

    try {
      let path = article.file_url;
      if (path.includes('supabase.co')) {
        const match = path.match(/\/manuscripts\/(.+)$/);
        if (match) path = match[1];
      }

      const { data, error } = await supabase.storage
        .from('manuscripts')
        .createSignedUrl(path, 60);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error("Download error", error);
      alert("Could not download file.");
    }
  };

  const handlePurchase = () => {
    if (!user) {
      const currentUrl = encodeURIComponent(`/checkout?type=article&id=${article?.id}`);
      navigate(`/login?redirect=${currentUrl}`);
      return;
    }
    navigate(`/checkout?type=article&id=${article?.id}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!article) return <div className="p-10 text-center">Article not found</div>;

  const isPaidJournal = !article.journal?.is_open_access;

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
                  : (article.submitter as any)?.full_name || 'Unknown Author'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              <span className="text-sm">Published {new Date(article.submission_date).toLocaleDateString()}</span>
            </div>
            {/* Badge for Access Type */}
            {isPaidJournal ? (
              <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm">lock</span>
                Premium Access
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm">lock_open</span>
                Open Access
              </span>
            )}
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

            {/* Access Control Section */}
            <div className="relative rounded-xl border border-slate-200 bg-white shadow-xl min-h-[300px] flex flex-col items-center justify-center p-8 overflow-hidden">

              {checkingAccess ? (
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
                  <div className="h-10 w-48 bg-slate-200 rounded"></div>
                </div>
              ) : hasAccess ? (
                <div className="text-center z-10">
                  <div className="size-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Full Text Available</h3>
                  <p className="text-slate-500 mb-6 max-w-md">
                    You have access to this article.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto shadow-lg hover:shadow-primary/30"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download PDF
                  </button>
                </div>
              ) : (
                <div className="text-center z-10 relative">
                  {/* Blurred background effect behind content if we had partial preview, but here we just show lock */}
                  <div className="size-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-100">
                    <span className="material-symbols-outlined text-4xl">lock</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Restricted Access</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    This article is published in a premium journal. Purchase access to view and download the full text.
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-3xl font-black text-slate-900">
                      {article.currency || 'USD'} {(article.price || 0).toFixed(2)}
                    </div>
                    <button
                      onClick={handlePurchase}
                      className="bg-primary text-white font-bold py-4 px-10 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 mx-auto shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5"
                    >
                      <span className="material-symbols-outlined">shopping_cart</span>
                      Purchase Access
                    </button>
                  </div>
                </div>
              )}
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
      <Footer />
    </div>
  );
};

export default ArticleView;