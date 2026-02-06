import React, { useEffect, useState, useRef } from 'react';
import TopNav from '../../components/TopNav';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface Journal {
  id: string;
  title: string;
  discipline: string;
  cover_image_url: string | null;
}

interface Book {
  id: string;
  title: string;
  author_name: string;
  cover_url: string | null;
  price: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroImages = [
    '/image (1).jpg',
    '/image (2).jpg',
    '/image (3).jpg',
    '/image (4).jpg'
  ];

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [journalsRes, booksRes] = await Promise.all([
        supabase.from('journals').select('id, title, discipline, cover_image_url').limit(5),
        supabase.from('books').select('id, title, author_name, cover_url, price').limit(10)
      ]);

      if (journalsRes.error) throw journalsRes.error;
      if (booksRes.error) throw booksRes.error;

      setJournals(journalsRes.data || []);
      setBooks(booksRes.data || []);
    } catch (error) {
      console.error('Error fetching landing page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisciplineColor = (index: number) => {
    const colors = ['bg-primary', 'bg-green-600', 'bg-purple-600', 'bg-amber-600', 'bg-cyan-600'];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav transparent />

      {/* Hero Section with Slider */}
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === heroIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            <img
              alt={`Slide ${idx}`}
              className="w-full h-full object-cover scale-105 animate-slow-zoom"
              src={img}
            />
          </div>
        ))}

        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full mb-6">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Excellence in Academic Research</span>
          </div>
          <h1 className="text-5xl md:text-7xl text-white font-black mb-6 leading-tight font-serif drop-shadow-2xl">
            Advancing Human <br /> <span className="text-primary italic">Knowledge</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg">
            A premium multidisciplinary platform for professional journal publication, monographs, and global research dissemination.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard/submit')}
              className="bg-primary hover:bg-blue-600 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-105"
            >
              Submit Manuscript
            </button>
            <button
              onClick={() => navigate('/journals')}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/20 font-black py-4 px-10 rounded-2xl transition-all"
            >
              Explore Journals
            </button>
          </div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === heroIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30'}`}
            ></button>
          ))}
        </div>
      </section>

      {/* Featured Books Slider Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-black text-xs uppercase tracking-widest mb-2 block">New Releases</span>
              <h2 className="text-3xl md:text-4xl font-black font-serif text-slate-900 italic">Featured Monographs</h2>
            </div>
            <button onClick={() => navigate('/books')} className="hidden md:flex items-center gap-2 text-slate-400 font-bold hover:text-primary transition-colors">
              Browse Collection <span className="material-symbols-outlined">east</span>
            </button>
          </div>

          <div className="relative group">
            <div className="flex overflow-x-auto gap-8 pb-12 no-scrollbar scroll-smooth">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[280px] h-[400px] bg-slate-100 rounded-3xl animate-pulse"></div>
                ))
              ) : books.length > 0 ? (
                books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/books`)}
                    className="min-w-[280px] max-w-[280px] group/book cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden shadow-2xl mb-6 bg-slate-100 border border-slate-100">
                      <img
                        src={book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop'}
                        className="w-full h-full object-cover group-hover/book:scale-110 transition-transform duration-700"
                        alt={book.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover/book:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                        <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-wider mb-2">
                          Quick View
                        </button>
                      </div>
                      <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                        ${book.price}
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 line-clamp-1 mb-1">{book.title}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{book.author_name}</p>
                  </div>
                ))
              ) : (
                <div className="w-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                  <span className="material-symbols-outlined text-4xl text-slate-200 mb-2 block">library_books</span>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Coming Soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Standards Section */}
      <section className="py-24 px-4 bg-slate-950 text-white relative">
        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-primary font-black text-xs uppercase tracking-widest mb-4 block">Our Foundation</span>
              <h2 className="text-4xl md:text-5xl font-black mb-8 font-serif leading-tight">Upholding Academic Rigor and Excellence</h2>
              <p className="text-slate-400 text-lg mb-12 leading-relaxed font-medium">
                At Nkiza Center, we implement a rigorous review structure to ensure that every publication meets international quality standards.
              </p>
              <div className="space-y-6">
                {[
                  { title: 'Peer-Reviewed Quality', desc: 'Strict double-blind peer review for all submissions.' },
                  { title: 'Global Accessibility', desc: 'Open access options for worldwide research impact.' },
                  { title: 'Rapid Dissemination', desc: 'Streamlined workflows for faster publication times.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="size-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white/5 rounded-[60px] border border-white/10 p-4">
                <img
                  src="/image (2).jpg"
                  className="w-full h-full object-cover rounded-[44px] shadow-2xl brightness-75"
                  alt="Process"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-primary p-8 rounded-[40px] shadow-2xl hidden lg:block">
                <div className="text-4xl font-black text-white mb-1 italic leading-none">12+</div>
                <div className="text-[10px] font-black text-white/70 uppercase tracking-widest">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journal Showcase */}
      <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <span className="text-primary font-black text-xs uppercase tracking-widest mb-2 block">Departments</span>
              <h2 className="text-3xl md:text-4xl font-black font-serif text-slate-900">Academic Journals</h2>
            </div>
            <button onClick={() => navigate('/journals')} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-primary flex items-center gap-2 transition-all">
              Launch Explorer <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-[450px] bg-slate-200 rounded-[32px] animate-pulse"></div>
              ))
            ) : journals.length > 0 ? (
              journals.map((journal, i) => (
                <div
                  key={journal.id}
                  onClick={() => navigate(`/journals/${journal.id}`)}
                  className="bg-white rounded-[40px] p-6 border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer"
                >
                  <div className="aspect-[4/5] relative rounded-[32px] overflow-hidden mb-6 bg-slate-100">
                    <img
                      alt={journal.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      src={journal.cover_image_url || `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop`}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  <div className="flex flex-col h-[140px]">
                    <span className={`text-[9px] font-black text-white ${getDisciplineColor(i)} px-3 py-1 rounded-full uppercase self-start mb-4 tracking-wider`}>
                      {journal.discipline || 'General'}
                    </span>
                    <h4 className="font-black text-slate-800 text-lg leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">{journal.title}</h4>
                    <div className="mt-auto flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-widest">Active Issue</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-slate-100">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Inventory Synchronizing...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl font-black italic">N</span>
                </div>
                <h5 className="font-serif font-black text-2xl italic tracking-tighter">Nkiza Center</h5>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                Nkiza Academic Publishing specializes in multidisciplinary research dissemination, providing a robust platform for authors to share findings with a global community of scholars.
              </p>
              <div className="flex gap-4">
                {['facebook', 'twitter', 'linkedin'].map(soc => (
                  <div key={soc} className="size-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">{soc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 md:col-start-6">
              <h6 className="font-black text-[11px] uppercase tracking-[0.2em] mb-8 text-primary">Library</h6>
              <ul className="space-y-4 text-xs font-bold text-slate-400">
                <li><a className="hover:text-white transition-colors" href="#">Journals</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Monographs</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Digital Archives</a></li>
                <li><a className="hover:text-white transition-colors" href="#">New Releases</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h6 className="font-black text-[11px] uppercase tracking-[0.2em] mb-8 text-primary">Authors</h6>
              <ul className="space-y-4 text-xs font-bold text-slate-400">
                <li><a className="hover:text-white transition-colors" href="#">Submission Portal</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Editorial Policies</a></li>
                <li><a className="hover:text-white transition-colors" href="#">APC Information</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Author Resources</a></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h6 className="font-black text-[11px] uppercase tracking-[0.2em] mb-8 text-primary">Newsletter</h6>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Receive latest research alerts.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs flex-1 focus:outline-none focus:border-primary transition-colors"
                />
                <button className="bg-primary hover:bg-blue-600 p-3 rounded-xl transition-all">
                  <span className="material-symbols-outlined text-white text-[20px]">send</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            <p>© 2026 NKIZA CENTER FOR RESEARCH. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              <a className="hover:text-primary transition-colors" href="#">Privacy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms</a>
              <a className="hover:text-primary transition-colors" href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS for custom scrollbar and animations */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate linear;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;