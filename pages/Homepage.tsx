import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { CTASection } from '../components/ui/hero-dithering-card';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { ChallengeCard } from '../components/ui/card-9';
import TrendingCard from '../components/ui/trending-card';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useJournals } from '../src/hooks';

// Color palette for journal cards
const CARD_COLORS = [
  'bg-blue-600',
  'bg-red-600',
  'bg-green-600',
  'bg-purple-600',
  'bg-orange-600',
  'bg-teal-600',
  'bg-pink-600',
  'bg-emerald-600',
  'bg-indigo-600',
  'bg-rose-600',
];

const Homepage: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { venues: journals, loading: journalsLoading } = useJournals();

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

  return (
    <div className="bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Sticky Header */}
      <Header showSearch={true}>
        <div className="flex items-center gap-3">
          <Link to="/signin" className="text-sm font-semibold text-foreground hover:text-primary transition-colors px-3 py-2">
            Log In
          </Link>
          <Link to="/signup" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold py-2 px-4 rounded-lg shadow-sm transition-transform active:scale-95">
            Get Started
          </Link>
        </div>
      </Header>

      {/* New Hero Section */}
      <CTASection />

      {/* Category Slider Section - Now Dynamic Journals */}
      <section className="py-16 bg-background border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Explore Journals</h2>
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
            {journalsLoading ? (
              // Loading skeleton
              [...Array(4)].map((_, idx) => (
                <div key={idx} className="snap-start shrink-0 w-[320px] h-[200px] bg-muted rounded-xl animate-pulse" />
              ))
            ) : journals.length > 0 ? (
              journals.map((journal, idx) => (
                <Link key={journal.id} to={`/journals/${journal.slug}`} className="snap-start shrink-0">
                  <ChallengeCard
                    title={journal.name}
                    description={journal.description || `Explore research published in ${journal.name}`}
                    buttonText="Browse"
                    backgroundColor={CARD_COLORS[idx % CARD_COLORS.length]}
                    className="h-full w-[320px]"
                  />
                </Link>
              ))
            ) : (
              // Empty state
              <div className="flex items-center justify-center w-full py-12 text-muted-foreground">
                <p>No journals available yet. Check back soon!</p>
              </div>
            )}
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
            <div className='flex justify-center'>
              <TrendingCard
                title="Advancements in Neural Network Pruning for Edge Devices"
                description="This study proposes a novel algorithm for pruning deep learning models to run efficiently on low-power hardware without significant accuracy loss."
                badges={["Technology", "Open Access"]}
                price="Free"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuArYZ6s3WQyoMgAetKL93k01S8GEMxaNrd1ULUXcryh7PhAZp4Yh_vCJC36LHWxjgvMW4RmeiPEYeGJE0boMBq8fUINL_-h1WuNVfbf4-d6TKaQNbQL9f_OAJ63juBQOdx7yad8bbpnyj7JYLNPxF_JjYgz1BUGTGVsnYV-DUFs1zNApJzUvrqC40bUFK7KIJOVZ7wXYoEn7fGdPTQJbgQtEYghCZ5oE6ymlKp3-MK4ravPJ4bgYCQXRsH55zf93YME1rB_VcHvgCs"
                author="J. Doe et al."
                date="Oct 24, 2023"
                className="h-full"
              />
            </div>
            {/* Article Card 2 */}
            <div className='flex justify-center'>
              <TrendingCard
                title="CRISPR-Cas9 Gene Editing in Agricultural Crops"
                description="A comprehensive review of the latest applications of gene editing technologies to improve crop yield and resistance to pests in varying climates."
                badges={["Biology", "Peer Reviewed"]}
                price="$35.00"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuClHv3SKcts7ZavACeMeMu0lUmaxkfCW3VEdc100LVURbgevHjjXUu-rg4PWJsfIIUHbxPbeCTJvIMFa36xHUOAfiHlgZiVcXosIttFmBKJrBYYx-G1GclW3pvd5kpTU3Uckp3NvAwQuGCAGxyplloO0YxWnuNwP7Or7PfN4aoFh_Bp4mnglYAptlitJuZ2Mg6QnaEztdKy2HHxy8FgWTW2_DocOwjytOkVn0hzpskfbWv_G7wioTKdwdqNyG2NG__YhzxtD_qXlxY"
                author="A. Smith"
                date="Oct 22, 2023"
                className="h-full"
              />
            </div>
            {/* Article Card 3 */}
            <div className='flex justify-center'>
              <TrendingCard
                title="Big Data Analytics for Sustainable Urban Planning"
                description="Leveraging municipal data streams to optimize public transportation routes and energy consumption in metropolitan areas."
                badges={["Data Science", "Open Access"]}
                price="Free"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBcqJWYgq9zAvAJS2S7nKM6YaIY1YWy618SGxlrHv2pfV-JMHLd7MSUS0cvJM6EimjecsT7fluYaTWh9l6KlFfeGi3hqdOoFn-1ohDj9gPbZC2gVhLd-l2AQDsFU7CGYlYVjdMoemZba45e_glRFDOMtqp_iIbU8zIT7QFuQxjhbLxb0cBguVHl306q9HZls_F888-WWBV0Hlw8Ba647KYX5gVMX_WsOm7FudPJGqppAKN0QrZndK90fP7GnSCd4RJ0v_RY3giofi0"
                author="K. Lee et al."
                date="Oct 20, 2023"
                className="h-full"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Homepage;