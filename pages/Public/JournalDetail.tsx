import React, { useEffect, useState } from 'react';
import { ViewState, Journal } from '../../types';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabaseClient';

import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Article {
  id: string;
  title: string;
  abstract: string;
  submission_date: string;
  status: string;
  payment_status: string;
  price?: number;
  currency?: string;
  submitter: {
    id: string;
    full_name: string;
  } | { id: string; full_name: string }[] | null;
}

const JournalDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id: journalId } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [subscriptionPackage, setSubscriptionPackage] = useState<any | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [purchasedArticles, setPurchasedArticles] = useState<Set<string>>(new Set());
  const [hasJournalAccess, setHasJournalAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'guideline' | 'aims'>('about');

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

        // 1.1 Fetch Subscription Package if exists
        if (journalData.subscription_package_id) {
          const { data: pkg } = await supabase
            .from('publication_packages')
            .select('*')
            .eq('id', journalData.subscription_package_id)
            .single();
          setSubscriptionPackage(pkg);
        }

        // 2. Fetch Published/Accepted Articles
        const { data: articlesData, error: articlesError } = await supabase
          .from('manuscripts')
          .select('id, title, abstract, submission_date, status, payment_status, price, currency, submitter:submitter_id(id, full_name)')
          .eq('journal_id', journalId)
          .in('status', ['published', 'accepted'])
          .order('submission_date', { ascending: false });

        if (articlesError) throw articlesError;

        // Strict Filter: published OR (accepted AND paid)
        const visibleArticles = (articlesData || []).filter((article: any) =>
          article.status === 'published' || (article.status === 'accepted' && article.payment_status === 'paid')
        );

        setArticles(visibleArticles);

        // 3. Check Access (Transactions) if user is logged in
        if (user && !journalData.is_open_access) {
          // Check for article purchases
          const { data: articleTransactions } = await supabase
            .from('transactions')
            .select('manuscript_id')
            .eq('user_id', user.id)
            .eq('type', 'purchase')
            .eq('status', 'completed');

          const purchasedIds = new Set(articleTransactions?.map(t => t.manuscript_id) || []);
          setPurchasedArticles(purchasedIds);

          // Check for journal subscription
          if (journalData.subscription_package_id) {
            const { data: subTransactions } = await supabase
              .from('transactions')
              .select('id')
              .eq('user_id', user.id)
              .eq('package_id', journalData.subscription_package_id)
              .eq('status', 'completed')
              .limit(1);

            if (subTransactions && subTransactions.length > 0) {
              setHasJournalAccess(true);
            }
          }
        }

      } catch (err) {
        console.error("Error fetching journal data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [journalId, user]);

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
              <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'about'
                    ? 'text-primary'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  About Journal
                  {activeTab === 'about' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('aims')}
                  className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'aims'
                    ? 'text-primary'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Aims & Scope
                  {activeTab === 'aims' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('guideline')}
                  className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'guideline'
                    ? 'text-primary'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Submission Guidelines
                  {activeTab === 'guideline' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                  )}
                </button>
              </div>

              {activeTab === 'about' && (
                <div className="prose max-w-none text-slate-600 leading-relaxed space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-4 text-slate-900">About this Journal</h3>
                    <p className="whitespace-pre-line">{journal.description}</p>
                  </div>
                </div>
              )}

              {activeTab === 'aims' && (
                <div className="prose max-w-none text-slate-600 leading-relaxed animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold font-serif mb-4 text-slate-900">Aims & Scope</h3>
                  {journal.aims_scope ? (
                    <div className="whitespace-pre-line">
                      {journal.aims_scope}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-slate-500 italic">No aims and scope defined yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'guideline' && (
                <div className="prose max-w-none text-slate-600 leading-relaxed animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold font-serif mb-4 text-slate-900">Author Guidelines</h3>
                  {journal.guidelines ? (
                    <div className="whitespace-pre-line bg-slate-50 p-6 rounded-xl border border-slate-100">
                      {journal.guidelines}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-slate-500 italic">No specific guidelines have been published for this journal yet.</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold font-serif text-slate-900">Latest Articles</h3>
              </div>

              <div className="space-y-6">
                {articles.length > 0 ? (
                  articles.map(article => {
                    const isAuthor = user?.id === (Array.isArray(article.submitter) ? article.submitter[0]?.id : (article.submitter as any)?.id);
                    const isAdminOrEditor = ['super_admin', 'editor'].includes(profile?.role?.slug || '');
                    const hasAccess = journal?.is_open_access || hasJournalAccess || purchasedArticles.has(article.id) || isAuthor || isAdminOrEditor;

                    return (
                      <div
                        key={article.id}
                        onClick={() => navigate(`/articles/${article.id}`)}
                        className="group p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
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
                              : (article.submitter as any)?.full_name || 'Unknown Author'}
                          </span>
                          <div className="flex gap-3 items-center">
                            {hasAccess ? (
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                                  <span className="material-symbols-outlined text-xs">{(journal?.is_open_access) ? 'public' : 'verified'}</span>
                                  {journal?.is_open_access ? 'Open Access' : hasJournalAccess ? 'Included with Sub' : 'Purchased'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Standalone Price</span>
                                  <span className="text-sm font-black text-slate-900">
                                    {(article.price || 0) <= 0 ? 'Free' : `${(article.price || 0).toLocaleString()} RWF`}
                                  </span>
                                </div>
                                {((article.price || 0) <= 0 && journal?.is_open_access) ? (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (!user) {
                                        const checkoutUrl = encodeURIComponent(`/checkout?type=article&id=${article.id}`);
                                        navigate(`/login?redirect=${checkoutUrl}`);
                                        return;
                                      }
                                      try {
                                        const { error } = await supabase.from('transactions').insert({
                                          user_id: user.id,
                                          manuscript_id: article.id,
                                          amount: 0,
                                          currency: article.currency || 'RWF',
                                          type: 'purchase',
                                          status: 'completed',
                                          description: `Free access: ${article.title}`,
                                          payment_gateway: 'free',
                                        });
                                        if (error) throw error;
                                        setPurchasedArticles(prev => new Set([...prev, article.id]));
                                      } catch (err: any) {
                                        alert('Failed: ' + err.message);
                                      }
                                    }}
                                    className="flex items-center gap-1 text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all active:scale-95 shadow-md shadow-green-500/20"
                                  >
                                    <span className="material-symbols-outlined text-sm">lock_open</span> Get Free
                                  </button>
                                ) : (article.price || 0) > 0 ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!user) {
                                        const checkoutUrl = encodeURIComponent(`/checkout?type=article&id=${article.id}`);
                                        navigate(`/login?redirect=${checkoutUrl}`);
                                        return;
                                      }
                                      navigate(`/checkout?type=article&id=${article.id}`);
                                    }}
                                    className="flex items-center gap-1 text-xs font-bold bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-primary/20"
                                  >
                                    <span className="material-symbols-outlined text-sm">shopping_cart</span> Buy Paper
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!user) {
                                        const checkoutUrl = encodeURIComponent(`/checkout?type=subscription&id=${journal?.id}`);
                                        navigate(`/login?redirect=${checkoutUrl}`);
                                        return;
                                      }
                                      navigate(`/checkout?type=subscription&id=${journal?.id}`);
                                    }}
                                    className="flex items-center gap-1 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/20"
                                  >
                                    <span className="material-symbols-outlined text-sm">card_membership</span> Subscribe
                                  </button>
                                )}
                              </div>
                            )}
                            {!hasAccess && (
                              <button className="flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-sm">visibility</span> View Abstract
                              </button>
                            )}
                            {hasAccess && (
                              <button className="flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-sm">auto_stories</span> View Full Article
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
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

              {!journal.is_open_access && !hasJournalAccess && subscriptionPackage && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Subscribe to Journal</h3>
                  <p className="text-sm text-slate-500 mb-6">Gain full access to all articles in this journal with a subscription.</p>
                  <div className="bg-slate-50 p-4 rounded-lg mb-6 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Package</p>
                      <p className="font-bold text-slate-900 text-sm">{subscriptionPackage.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">{(subscriptionPackage.price || 0).toLocaleString()} RWF</p>
                      <p className="text-[10px] text-slate-400">/{subscriptionPackage.duration_months} Months</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        const checkoutUrl = encodeURIComponent(`/checkout?type=subscription&id=${journal.id}`);
                        navigate(`/login?redirect=${checkoutUrl}`);
                        return;
                      }
                      navigate(`/checkout?type=subscription&id=${journal.id}`);
                    }}
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                    Subscribe Now
                  </button>
                </div>
              )}

              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
                <h3 className="text-xl font-bold font-serif mb-6 text-slate-900">Editorial Team</h3>
                <div className="flex gap-4 items-center mb-4">
                  {/* <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                                        <img alt={journal.editor_in_chief_name || 'Editor'} className="w-full h-full object-cover" src="https://via.placeholder.com/150" />
                                    </div> */}
                  <div>
                    <h4 className="font-bold text-slate-900">{journal.editor_in_chief_name || 'Not Assigned'}</h4>
                    <p className="text-primary font-semibold text-xs">Editorial Team</p>
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
      <Footer />
    </div>
  );
};

export default JournalDetail;