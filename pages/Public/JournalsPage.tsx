import React, { useEffect, useState } from 'react';
import { ViewState, Journal } from '../../types';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabaseClient';

import { useNavigate } from 'react-router-dom';

const JournalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journals')
        .select('*');

      if (error) throw error;
      if (data && data.length > 0) {
        setJournals(data);
      } else {
        // Fallback for demo if DB is empty
        setJournals([
          {
            id: '1',
            title: "Nkiza International Journal of Economics",
            slug: 'nije',
            discipline: "Social Sciences",
            cover_image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2670&auto=format&fit=crop",
            issn: "2041-1723",
            editor_in_chief_name: "Prof. Alistair Nkiza",
            aims_scope: "Dedicated to the dissemination of significant economic research that impacts policy globally. NIJE publishes peer-reviewed original research.",
            impact_factor: 2.4,
            is_open_access: true,
            description: "",
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: "Journal of Advanced Biomedical Engineering",
            slug: 'jabe',
            discipline: "Engineering",
            cover_image_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
            issn: "1932-6203",
            editor_in_chief_name: "Prof. Michael Chen",
            aims_scope: "A transdisciplinary journal focusing on the development and application of engineering principles to the nervous system.",
            impact_factor: 3.1,
            is_open_access: true,
            description: "",
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJournals = filter === 'All'
    ? journals
    : journals.filter(j => j.discipline?.includes(filter));

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <TopNav active={ViewState.JOURNAL_LIST} />

      <main className="max-w-[1280px] mx-auto w-full px-6 md:px-20 py-8 flex-1">
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-primary font-medium">Home</button>
          <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
          <span className="text-slate-900 font-semibold">Journals</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-slate-900 text-4xl font-extrabold tracking-tight mb-2 font-display">Our Journals</h1>
          <p className="text-slate-600 text-lg max-w-2xl">Explore our collection of high-impact, peer-reviewed academic journals across diverse scientific and humanities disciplines.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4 text-slate-900">
                  <span className="material-symbols-outlined text-primary">school</span>
                  <h3 className="font-bold text-base uppercase tracking-wider">Discipline</h3>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-white cursor-pointer group transition-all">
                    <input type="radio" name="discipline" checked={filter === 'All'} onChange={() => setFilter('All')} className="h-4 w-4 text-primary focus:ring-primary border-slate-300" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary">All Disciplines</span>
                  </label>
                  {['Medical', 'Social Sciences', 'Engineering', 'Arts'].map((d) => (
                    <label key={d} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-white cursor-pointer group transition-all">
                      <input type="radio" name="discipline" checked={filter === d} onChange={() => setFilter(d)} className="h-4 w-4 text-primary focus:ring-primary border-slate-300" />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-primary">{d}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 flex gap-6 animate-pulse">
                    <div className="w-48 h-64 bg-slate-200 rounded-lg"></div>
                    <div className="flex-1 space-y-4 py-2">
                      <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-20 bg-slate-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJournals.length > 0 ? (
              filteredJournals.map((journal) => (
                <div key={journal.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row p-6 gap-6">
                  <div className="w-full md:w-48 h-64 md:h-auto flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                    <img src={journal.cover_image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2000&auto=format&fit=crop"} className="w-full h-full object-contain object-center p-2" alt="Journal Cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h2 onClick={() => navigate(`/journals/${journal.id}`)} className="text-2xl font-bold font-serif text-slate-900 cursor-pointer hover:text-primary transition-colors">{journal.title}</h2>
                        {journal.is_open_access && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Open Access</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4 text-sm text-slate-500">
                        <p><span className="font-semibold text-slate-700">ISSN:</span> {journal.issn}</p>
                        <p><span className="font-semibold text-slate-700">Editor:</span> {journal.editor_in_chief_name}</p>
                        <p><span className="font-semibold text-slate-700">Impact Factor:</span> {journal.impact_factor}</p>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Aims & Scope</h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                          {journal.aims_scope}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                      <button onClick={() => navigate(`/journals/${journal.id}`)} className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-colors">View Journal</button>
                      <button onClick={() => navigate('/dashboard/submit')} className="flex-1 md:flex-none px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-lg text-sm hover:bg-primary/20 transition-colors">Submit Manuscript</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-500">No journals found in this discipline.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JournalsPage;