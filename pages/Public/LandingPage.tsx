import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';

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

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [promo, setPromo] = useState<Record<string, string>>({});

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    '/image (1).jpg',
    '/image (2).jpg',
    '/image (3).jpg',
    '/image (4).jpg'
  ];

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [journalsRes, booksRes, partnersRes, promoSettingsRes] = await Promise.all([
        supabase.from('journals').select('id, title, discipline, cover_image_url').limit(4),
        supabase.from('books').select('id, title, author_name, cover_url, price').eq('status', 'approved').order('created_at', { ascending: false }).limit(4),
        supabase.from('partners').select('id, name, logo_url, description, website_url').eq('is_active', true).order('name').limit(6),
        supabase.from('site_settings').select('key, value').eq('category', 'homepage_promo')
      ]);

      if (journalsRes.error) throw journalsRes.error;
      if (booksRes.error) throw booksRes.error;

      setJournals(journalsRes.data || []);
      setBooks(booksRes.data || []);
      setPartners(partnersRes.data || []);
      const promoMap: Record<string, string> = {};
      (promoSettingsRes.data || []).forEach((s: any) => { promoMap[s.key] = s.value; });
      setPromo(promoMap);
    } catch (error) {
      console.error('Error fetching landing page data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark antialiased transition-colors duration-200 font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="/Logo Nkiza Center.png"
                alt="Nkiza Center Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
            <div className="hidden md:flex space-x-8">
              <button onClick={() => navigate('/journals')} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Journals</button>
              <button onClick={() => navigate('/books')} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Books</button>
              <button onClick={() => navigate('/about')} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">About</button>
              <button onClick={() => navigate('/contact')} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Contact</button>
              <button onClick={() => navigate('/privacy')} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Privacy</button>
              <button onClick={() => navigate('/copyright')} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Copyright</button>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors">
                <span className="material-icons text-xl">search</span>
              </button>
              {user ? (
                <div
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-surface-dark rounded-full border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
                >
                  <span className="material-icons text-lg text-gray-500">account_circle</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">{profile?.full_name || user.email}</span>
                  <span className="material-icons text-base text-gray-400">expand_more</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 overflow-hidden min-h-[600px] flex items-center justify-center pb-20">
        {/* Background Images Slider */}
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] ease-out"
              style={{
                backgroundImage: `url('${image}')`,
                transform: index === currentImageIndex ? 'scale(1.1)' : 'scale(1)'
              }}
            ></div>
          </div>
        ))}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Where Knowledge Begins <br />
            <span className="text-blue-400 drop-shadow-lg">and the Future is Built</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
            We empower researchers, scholars, creative writers and innovators to discover, publish, and lead transformative ideas. Through world-class publishing, advanced research infrastructure, and global collaboration, we shape the future of science, economics, and society.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(user ? '/dashboard/submit' : '/login')}
              className="px-8 py-3.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
            >
              Submit Manuscript
            </button>
            <button
              onClick={() => navigate('/journals')}
              className="px-8 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all transform hover:-translate-y-0.5"
            >
              Explore Journals
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <div
              key={index}
              className={`transition-all duration-300 rounded-full ${index === currentImageIndex ? 'w-8 h-1 bg-primary' : 'w-1.5 h-1.5 bg-white/30'
                }`}
            ></div>
          ))}
        </div>
      </div>

      {/* New Releases / Featured Books */}
      <section className="py-20 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-xs font-bold text-primary tracking-wider uppercase mb-2">New Releases</h2>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Books</h3>
            </div>
            <button
              onClick={() => navigate('/books')}
              className="hidden sm:flex items-center text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors group"
            >
              Browse Collection
              <span className="material-icons text-base ml-1 transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm bg-gray-200 dark:bg-surface-dark animate-pulse"></div>
                </div>
              ))
            ) : books.length > 0 ? (
              books.map((book) => (
                <div key={book.id} className="group cursor-pointer" onClick={() => navigate(`/book/read/${book.id}`)}>
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img
                      alt={book.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      src={book.cover_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuArEDxU29cWPFV4shbv0ktfN0jxhmNuhkxP_3ObDIXjsVmPpCaEFrmC6JX3XeL-a5IfyADnBd9E1ugm0WU4NlrxN3krjobYM2Oq3OMi4SZAks-CB1rpO8NFWoyiSdIYX1KYZcBdW342V5lMzK53Zl4W9j2vTfZFYHQNehotPmvgkl4q9ryFekK555NFidGlLM5C77ddRztlVTjbsyi810n_LYFEwz0faINZRZe0CvWjl3CK5GNdgugj-HLWoM2Zg2qzfp2WZecVCd8B"}
                    />
                    <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-md">{book.price <= 0 ? 'Free' : `${parseFloat(book.price).toLocaleString()} RWF`}</div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary transition-colors line-clamp-1">{book.title}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{book.author_name}</p>
                  </div>
                </div>
              ))
            ) : null}
          </div>
          <button
            onClick={() => navigate('/books')}
            className="flex sm:hidden items-center text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 mt-6 justify-center w-full"
          >
            Browse Collection
            <span className="material-icons text-base ml-1">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Promo / Book Ad Section */}
      {promo.homepage_promo_title ? (
        <section className="py-24 bg-background-dark text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/10 blur-3xl rounded-full transform translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                {promo.homepage_promo_badge && (
                  <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                    {promo.homepage_promo_badge}
                  </span>
                )}
                {promo.homepage_promo_subtitle && (
                  <h2 className="text-xs font-bold text-primary tracking-wider uppercase mb-3">{promo.homepage_promo_subtitle}</h2>
                )}
                <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{promo.homepage_promo_title}</h3>
                {promo.homepage_promo_description && (
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">{promo.homepage_promo_description}</p>
                )}
                {promo.homepage_promo_price && (
                  <p className="text-3xl font-black text-white mb-8">{promo.homepage_promo_price}</p>
                )}
                {promo.homepage_promo_link_url && (
                  <button
                    onClick={() => {
                      const url = promo.homepage_promo_link_url;
                      if (url.startsWith('http://') || url.startsWith('https://')) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      } else {
                        navigate(url);
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-primary/30"
                  >
                    {promo.homepage_promo_link_text || 'Learn More'}
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                )}
              </div>
              {promo.homepage_promo_image_url && (
                <div className="relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                    <img
                      alt={promo.homepage_promo_title}
                      className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                      src={promo.homepage_promo_image_url}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
      /* Fallback: Original Foundation Section */
      <section className="py-24 bg-background-dark text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/10 blur-3xl rounded-full transform translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-xs font-bold text-primary tracking-wider uppercase mb-3">Our Foundation</h2>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Upholding Academic <br />Rigor and Excellence</h3>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                At Nkiza Center for Research (NCR), we implement a rigorous review structure to ensure that every publication meets international quality standards.
              </p>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-primary border border-blue-800">
                    <span className="material-icons text-xl">verified</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-semibold text-white">Peer-Reviewed Quality</h4>
                    <p className="mt-1 text-gray-400 text-sm">Strict double-blind peer review for all submissions.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-primary border border-blue-800">
                    <span className="material-icons text-xl">public</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-semibold text-white">Global Accessibility</h4>
                    <p className="mt-1 text-gray-400 text-sm">Open access options for worldwide research impact.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-primary border border-blue-800">
                    <span className="material-icons text-xl">bolt</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-semibold text-white">Rapid Dissemination</h4>
                    <p className="mt-1 text-gray-400 text-sm">Streamlined workflows for faster publication times.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                <img
                  alt="Desk with magazine and headphones representing research environment"
                  className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhH52BpIdbY1KJ4aIyxs7oe-4pg-l5rGSVM_09Yw4C6SU5dyjY4qHnZPTrgeMPnyfzXih2E65HXQl4sI3TWFrM5cJCz4g9zDWMTz8sVrGY1Khiit1Qrj4uFzfixE1RXSg2CcnF6FAdCq-k1b2Sy5PpphLRkD7iZokES8uprQakll0AP4faeRi4HTmn1m3uJ2An6BKkyC1ppXtumog_hOhSnynZh_k8hySROJ6IMfDVuAEzZWcIxcaO6uuVtcqpPU7noetfOWCp7k-l"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Academic Journals Section */}
      <section className="py-24 bg-gray-50 dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-xs font-bold text-primary tracking-wider uppercase mb-2">Departments</h2>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Journals</h3>
            </div>
            <button
              onClick={() => navigate('/journals')}
              className="flex items-center text-xs font-bold text-gray-400 hover:text-primary transition-colors tracking-widest uppercase"
            >
              Launch Explorer
              <span className="material-icons text-sm ml-2">open_in_new</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white dark:bg-surface-dark rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse h-[300px]"></div>
              ))
            ) : journals.length > 0 ? (
              journals.map((journal) => (
                <div key={journal.id} onClick={() => navigate(`/journals/${journal.id}`)} className="bg-white dark:bg-surface-dark rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100 dark:border-gray-800 cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                    <img
                      alt={journal.title}
                      className="w-full h-full object-contain object-center bg-gray-50 dark:bg-gray-800 p-2 transform group-hover:scale-105 transition-transform duration-500"
                      src={journal.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAyoZCZoi7kBIfs8VITvDq0lHoiOH7m5uC2UEcPPlSIqDRNKq2rF7DH3jc2ol-plu-oyo6siyjL6V-rY3PIc_9vSWiAHHhIInhIxSwyS11NmcjMKGbVrVUN139kZsU2Y-AmnEIvLZ686aAl3Oy4vomPxl9RhzQEuASVUbHoDNZ45nCrY8ZDRUJHoqG-9sV8R20fjs8nyVHvFPtBrJBm_KYhipLAdj_-0ulWUgtoLVwEIo3VblOVEtpeBYa-02ZMQ3_UseLvTZkDSZw3"}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">{journal.discipline || 'General'}</span>
                    </div>
                  </div>
                  <div className="px-2 pb-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-6 min-h-[3.5rem] line-clamp-2">{journal.title}</h4>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Issue</span>
                      <span className="material-icons text-gray-300 group-hover:text-primary transition-colors text-lg">chevron_right</span>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      {
        partners.length > 0 && (
          <section className="py-20 bg-white dark:bg-background-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-xs font-bold text-primary tracking-wider uppercase mb-2">Collaboration</h2>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Partners</h3>
              <p className="text-gray-500 text-sm max-w-xl mx-auto mb-12">
                We collaborate with leading institutions and organizations to advance research and knowledge globally.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
                {partners.map(partner => {
                    const PartnerCard = (
                      <div className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors">
                        {partner.logo_url ? (
                          <img
                            src={partner.logo_url}
                            alt={partner.name}
                            className="h-14 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center">
                            <span className="material-icons text-primary text-2xl">handshake</span>
                          </div>
                        )}
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{partner.name}</span>
                      </div>
                    );
                    return partner.website_url ? (
                      <a
                        key={partner.id}
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {PartnerCard}
                      </a>
                    ) : (
                      <div key={partner.id}>{PartnerCard}</div>
                    );
                  })}
              </div>
              <button
                onClick={() => navigate('/partners')}
                className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-blue-700 transition-colors"
              >
                View All Partners
                <span className="material-icons text-base">arrow_forward</span>
              </button>
            </div>
          </section>
        )
      }

      <Footer />
    </div>
  );
};

export default LandingPage;