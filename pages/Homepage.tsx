import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { CTASection } from '../components/ui/hero-dithering-card';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { ChallengeCard } from '../components/ui/card-9';

const Homepage: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  const categories = [
    { name: 'Computer Science', description: 'Explore 120k+ articles including AI, ML, and Software Engineering.', color: 'bg-blue-600' },
    { name: 'Medicine', description: 'Access 85k+ clinical studies, trials, and medical research papers.', color: 'bg-red-600' },
    { name: 'Biology', description: 'Discover 64k+ papers on genetics, ecology, and molecular biology.', color: 'bg-green-600' },
    { name: 'Physics', description: 'Browse 42k+ findings in quantum mechanics, astrophysics, and more.', color: 'bg-purple-600' },
    { name: 'Engineering', description: 'View 90k+ innovations in civil, mechanical, and electrical fields.', color: 'bg-orange-600' },
    { name: 'Chemistry', description: 'Search 35k+ compounds, reactions, and material science studies.', color: 'bg-teal-600' },
    { name: 'Social Sciences', description: 'Read 28k+ articles on psychology, sociology, and anthropology.', color: 'bg-pink-600' },
    { name: 'Environmental', description: 'Find 31k+ research pieces on climate change and sustainability.', color: 'bg-emerald-600' },
  ];

  return (
    <div className="bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="size-9 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                  <Sparkles className="size-5 text-primary-foreground" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Ejo Innovation</span>
            </Link>
            {/* Desktop Nav & Search */}
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center px-8">
              <div className="w-full max-w-md">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">search</span>
                  </div>
                  <input className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg leading-5 bg-secondary text-sm placeholder-muted-foreground focus:outline-none focus:placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all duration-200" placeholder="Search articles, authors, or DOIs..." type="text" />
                </div>
              </div>
            </div>
            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-sm font-semibold text-foreground hover:text-primary transition-colors px-3 py-2">
                Log In
              </Link>
              <Link to="/dashboard" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold py-2 px-4 rounded-lg shadow-sm transition-transform active:scale-95">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* New Hero Section */}
      <CTASection />

      {/* Category Slider Section */}
      <section className="py-16 bg-background border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Explore by Category</h2>
            <div className="flex gap-2">
              <button
                onClick={scrollLeft}
                className="p-2 rounded-full border border-border hover:bg-accent text-muted-foreground transition-colors"
                aria-label="Scroll left"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button
                onClick={scrollRight}
                className="p-2 rounded-full border border-border hover:bg-accent text-muted-foreground transition-colors"
                aria-label="Scroll right"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat, idx) => (
              <Link key={idx} to="/search" className="snap-start shrink-0">
                <ChallengeCard
                  title={cat.name}
                  description={cat.description}
                  buttonText="Browse"
                  backgroundColor={cat.color}
                  className="h-full w-[320px]"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex flex-col items-center p-4">
              <span className="text-4xl font-black text-foreground tracking-tight mb-2">2.5M+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Articles Published</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-4xl font-black text-foreground tracking-tight mb-2">150+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Countries Represented</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-4xl font-black text-foreground tracking-tight mb-2">500K+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Monthly Readers</span>
            </div>
          </div>
        </div>
      </section>
      {/* Persona Segmentation (Features) */}
      <section className="py-20 bg-background">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Tailored for the Scientific Community
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether you are publishing groundbreaking research or managing a university library, we have built tools specifically for your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <FeaturesGrid />
          </div>
        </div>
      </section>
      {/* Global Search CTA */}
      <section className="py-20 bg-secondary border-y border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Search the Global Database</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Find articles by DOI, title, author, or keyword. Access millions of records instantly.</p>
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-card ring-1 ring-border focus-within:ring-2 focus-within:ring-primary transition-shadow">
              <div className="pl-4 text-muted-foreground">
                <span className="material-symbols-outlined text-2xl">search</span>
              </div>
              <input className="w-full border-0 bg-transparent py-4 pl-3 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:ring-0" placeholder="Search 2.5M+ articles..." type="text" />
              <Link to="/search" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 m-1.5 rounded-lg transition-colors">
                Search
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              <span>Popular:</span>
              <Link to="/search" className="text-primary hover:underline">Artificial Intelligence</Link>
              <span className="text-border">•</span>
              <Link to="/search" className="text-primary hover:underline">Climate Change</Link>
              <span className="text-border">•</span>
              <Link to="/search" className="text-primary hover:underline">Bioinformatics</Link>
            </div>
          </div>
        </div>
      </section>
      {/* Trending Research Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">trending_up</span>
              Trending This Week
            </h2>
            <Link to="/search" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center">
              View all trending <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Article Card 1 */}
            <article className="flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-40 w-full bg-cover bg-center relative" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuArYZ6s3WQyoMgAetKL93k01S8GEMxaNrd1ULUXcryh7PhAZp4Yh_vCJC36LHWxjgvMW4RmeiPEYeGJE0boMBq8fUINL_-h1WuNVfbf4-d6TKaQNbQL9f_OAJ63juBQOdx7yad8bbpnyj7JYLNPxF_JjYgz1BUGTGVsnYV-DUFs1zNApJzUvrqC40bUFK7KIJOVZ7wXYoEn7fGdPTQJbgQtEYghCZ5oE6ymlKp3-MK4ravPJ4bgYCQXRsH55zf93YME1rB_VcHvgCs')" }}>
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-accent-foreground uppercase tracking-wide">Technology</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium dark:bg-green-900 dark:text-green-100">Open Access</span>
                  <span className="text-muted-foreground text-xs">Oct 24, 2023</span>
                </div>
                <Link to="/article" className="text-lg font-bold text-card-foreground leading-tight mb-2 hover:text-primary cursor-pointer transition-colors">
                  Advancements in Neural Network Pruning for Edge Devices
                </Link>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  This study proposes a novel algorithm for pruning deep learning models to run efficiently on low-power hardware without significant accuracy loss.
                </p>
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">JD</div>
                    <span className="text-xs font-medium text-foreground">J. Doe et al.</span>
                  </div>
                  <button className="text-muted-foreground hover:text-primary">
                    <span className="material-symbols-outlined text-lg">bookmark</span>
                  </button>
                </div>
              </div>
            </article>
            {/* Article Card 2 */}
            <article className="flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-40 w-full bg-cover bg-center relative" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClHv3SKcts7ZavACeMeMu0lUmaxkfCW3VEdc100LVURbgevHjjXUu-rg4PWJsfIIUHbxPbeCTJvIMFa36xHUOAfiHlgZiVcXosIttFmBKJrBYYx-G1GclW3pvd5kpTU3Uckp3NvAwQuGCAGxyplloO0YxWnuNwP7Or7PfN4aoFh_Bp4mnglYAptlitJuZ2Mg6QnaEztdKy2HHxy8FgWTW2_DocOwjytOkVn0hzpskfbWv_G7wioTKdwdqNyG2NG__YhzxtD_qXlxY')" }}>
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary uppercase tracking-wide">Biology</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded font-medium">Peer Reviewed</span>
                  <span className="text-muted-foreground text-xs">Oct 22, 2023</span>
                </div>
                <Link to="/article" className="text-lg font-bold text-card-foreground leading-tight mb-2 hover:text-primary cursor-pointer transition-colors">
                  CRISPR-Cas9 Gene Editing in Agricultural Crops
                </Link>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  A comprehensive review of the latest applications of gene editing technologies to improve crop yield and resistance to pests in varying climates.
                </p>
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">AS</div>
                    <span className="text-xs font-medium text-foreground">A. Smith</span>
                  </div>
                  <button className="text-muted-foreground hover:text-primary">
                    <span className="material-symbols-outlined text-lg">bookmark</span>
                  </button>
                </div>
              </div>
            </article>
            {/* Article Card 3 */}
            <article className="flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-40 w-full bg-cover bg-center relative" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBcqJWYgq9zAvAJS2S7nKM6YaIY1YWy618SGxlrHv2pfV-JMHLd7MSUS0cvJM6EimjecsT7fluYaTWh9l6KlFfeGi3hqdOoFn-1ohDj9gPbZC2gVhLd-l2AQDsFU7CGYlYVjdMoemZba45e_glRFDOMtqp_iIbU8zIT7QFuQxjhbLxb0cBguVHl306q9HZls_F888-WWBV0Hlw8Ba647KYX5gVMX_WsOm7FudPJGqppAKN0QrZndK90fP7GnSCd4RJ0v_RY3giofi0')" }}>
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Data Science</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium dark:bg-green-900 dark:text-green-100">Open Access</span>
                  <span className="text-muted-foreground text-xs">Oct 20, 2023</span>
                </div>
                <Link to="/article" className="text-lg font-bold text-card-foreground leading-tight mb-2 hover:text-primary cursor-pointer transition-colors">
                  Big Data Analytics for Sustainable Urban Planning
                </Link>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  Leveraging municipal data streams to optimize public transportation routes and energy consumption in metropolitan areas.
                </p>
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">KL</div>
                    <span className="text-xs font-medium text-foreground">K. Lee et al.</span>
                  </div>
                  <button className="text-muted-foreground hover:text-primary">
                    <span className="material-symbols-outlined text-lg">bookmark</span>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-secondary pt-16 pb-8 border-t border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2 pr-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
                  <Sparkles className="size-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold text-foreground">Ejo Innovation</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Accelerating scientific discovery by making research more accessible, transparent, and collaborative for everyone.
              </p>
              <div className="flex gap-4">
                <a className="text-muted-foreground hover:text-primary transition-colors" href="#"><span className="sr-only">Twitter</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
                <a className="text-muted-foreground hover:text-primary transition-colors" href="#"><span className="sr-only">LinkedIn</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg></a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Platform</h3>
              <ul className="space-y-3">
                <li><Link to="/search" className="text-sm text-muted-foreground hover:text-primary">Browse Journals</Link></li>
                <li><Link to="/submit" className="text-sm text-muted-foreground hover:text-primary">Submit Manuscript</Link></li>
                <li><Link to="/search" className="text-sm text-muted-foreground hover:text-primary">Institutions</Link></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Help Center</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">API Documentation</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Community Guidelines</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">About Us</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Careers</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Legal</a></li>
                <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © 2023 Ejo Innovation Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a className="text-xs text-muted-foreground hover:text-primary" href="#">Privacy Policy</a>
              <a className="text-xs text-muted-foreground hover:text-primary" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;