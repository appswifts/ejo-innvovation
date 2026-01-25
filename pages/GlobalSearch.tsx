import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const GlobalSearch: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-display text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-6 py-3 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-8 flex-1">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="size-9 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                  <Sparkles className="size-5 text-primary-foreground" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-foreground text-xl font-bold tracking-tight">Ejo Innovation</h2>
            </Link>
            {/* Search Bar */}
            <div className="flex flex-1 max-w-2xl">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input className="block w-full p-2.5 pl-10 text-sm text-foreground bg-secondary border-0 rounded-lg focus:ring-2 focus:ring-primary focus:bg-background transition-all placeholder-muted-foreground" placeholder="Search articles, journals, authors..." type="text" defaultValue="climate change" />
              </div>
            </div>
          </div>
          {/* Right Nav */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/submit" className="text-sm font-medium hover:text-primary transition-colors">Publish</Link>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Community</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">About</a>
            </nav>
            <div className="h-6 w-px bg-border hidden md:block"></div>
            <button className="relative">
              <span className="material-symbols-outlined text-muted-foreground hover:text-primary">notifications</span>
              <span className="absolute top-0 right-0 size-2 bg-destructive rounded-full border-2 border-background"></span>
            </button>
            <div className="size-9 rounded-full bg-cover bg-center ring-2 ring-border cursor-pointer" data-alt="User profile avatar of a smiling researcher" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdne5eOS8MFi-U82ukpZY6iK_wJ51hznHoUW_mdXhR2Qv7jGZLd2v_COM0epFK9LBrkPYRYpgUsc1CKp9XViaGVB_-BSPVSz_jKuKd2VgnpErZ4_W6MGtWsKbwVIXRXLmSwn3aBbZEwPWRQnu6vftjYCBN2HPLtdsMbqPK-k3i68MihWzWLiGpu4e6YZaXpkUuI2N1QUMSfCfCVVfyfswAqJH-9mCjJ4jSVVNesyhgEo-2TGeWsmbLgxnJD59bx4LiYF5oZHInUjU')" }}>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-6 h-[calc(100vh-120px)] sticky top-24 overflow-y-auto custom-scrollbar pr-2 pb-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Filters</h3>
            <button className="text-xs font-medium text-primary hover:text-primary/80">Clear all</button>
          </div>
          {/* Open Access Toggle */}
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Open Access</span>
              <span className="text-xs text-muted-foreground">Show only free content</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input defaultChecked className="sr-only peer" type="checkbox" value="" />
              <div className="w-11 h-6 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          {/* Accordion Group */}
          <div className="flex flex-col gap-4">
            {/* Content Type */}
            <details className="group" open>
              <summary className="flex cursor-pointer items-center justify-between py-2 list-none text-sm font-semibold select-none">
                <span>Content Type</span>
                <span className="material-symbols-outlined text-muted-foreground group-open:rotate-180 transition-transform text-lg">expand_more</span>
              </summary>
              <div className="pt-2 flex flex-col gap-2">
                <label className="flex items-center gap-3 py-1 cursor-pointer group/item">
                  <input defaultChecked className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
                  <span className="text-sm text-muted-foreground group-hover/item:text-primary transition-colors">Journal Article (840)</span>
                </label>
                <label className="flex items-center gap-3 py-1 cursor-pointer group/item">
                  <input className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
                  <span className="text-sm text-muted-foreground group-hover/item:text-primary transition-colors">Preprint (215)</span>
                </label>
                <label className="flex items-center gap-3 py-1 cursor-pointer group/item">
                  <input className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20 bg-transparent" type="checkbox" />
                  <span className="text-sm text-muted-foreground group-hover/item:text-primary transition-colors">Dataset (104)</span>
                </label>
              </div>
            </details>
            <hr className="border-border" />
            {/* Publication Date */}
            <details className="group" open>
              <summary className="flex cursor-pointer items-center justify-between py-2 list-none text-sm font-semibold select-none">
                <span>Publication Date</span>
                <span className="material-symbols-outlined text-muted-foreground group-open:rotate-180 transition-transform text-lg">expand_more</span>
              </summary>
              <div className="pt-2 flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input className="h-4 w-4 border-input text-primary focus:ring-primary/20 bg-transparent" name="date" type="radio" />
                  <span className="text-sm text-muted-foreground">Any time</span>
                </label>
                <label className="flex items-center gap-2">
                  <input defaultChecked className="h-4 w-4 border-input text-primary focus:ring-primary/20 bg-transparent" name="date" type="radio" />
                  <span className="text-sm text-muted-foreground">Since 2020 (Last 5 years)</span>
                </label>
              </div>
            </details>
          </div>
        </aside>
        {/* Results Column */}
        <section className="flex-1 flex flex-col gap-6">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div>
              <h1 className="text-xl font-bold">1,240 results found</h1>
              <p className="text-sm text-muted-foreground mt-1">Showing results for <span className="font-semibold text-primary">"climate change"</span></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
              <div className="relative">
                <select className="pl-3 pr-8 py-1.5 text-sm font-medium border-none bg-secondary rounded-lg cursor-pointer focus:ring-2 focus:ring-primary/50 text-foreground">
                  <option>Relevance</option>
                  <option>Newest First</option>
                  <option>Most Cited</option>
                </select>
              </div>
            </div>
          </div>
          {/* Result Cards */}
          <div className="flex flex-col gap-4">
            {/* Card 1 */}
            <article className="group bg-card p-6 rounded-xl border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-primary/20">
                      <span className="material-symbols-outlined text-[14px] icon-filled">lock_open</span> Open Access
                    </span>
                    <span className="text-xs text-muted-foreground">Journal Article</span>
                  </div>
                  <h2 className="text-lg font-bold leading-tight mb-2">
                    <Link to="/article" className="hover:text-primary hover:underline decoration-2 decoration-primary/30 underline-offset-2">Impacts of Climate Change on Global Biodiversity Patterns</Link>
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">J. Smith, A. Johnson, et al.</span> • Nature Climate Change • October 2023
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4 line-clamp-3">
                    ...current models predict significant shifts in <span className="bg-yellow-100 dark:bg-yellow-900/30 font-semibold px-0.5 rounded text-foreground">climate change</span> scenarios, affecting species distribution across both terrestrial and marine ecosystems...
                  </p>
                  <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      <span>4.5k</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">format_quote</span>
                      <span>120</span>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-secondary hover:bg-primary/20 p-1.5 rounded text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            {/* Card 2 */}
            <article className="group bg-card p-6 rounded-xl border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">Policy Paper</span>
                  </div>
                  <h2 className="text-lg font-bold leading-tight mb-2">
                    <Link to="/article" className="hover:text-primary hover:underline decoration-2 decoration-primary/30 underline-offset-2">Renewable Energy Transition: A Policy Framework</Link>
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">L. Chen, M. Davis</span> • Energy Policy Journal • August 2023
                  </p>
                  <div className="flex items-center gap-6 text-xs text-muted-foreground mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      <span>2.1k</span>
                    </div>
                    <div className="flex-1"></div>
                  </div>
                </div>
              </div>
            </article>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-8 mb-12">
            <button className="flex items-center justify-center size-9 rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-background">1</button>
            <button className="flex items-center justify-center size-9 rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent font-medium transition-colors">2</button>
            <button className="flex items-center justify-center size-9 rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </section>
      </main>
      <footer className="bg-card border-t border-border py-6">
        <div className="max-w-[1440px] mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2024 Ejo Innovation. Accelerating scientific discovery.
        </div>
      </footer>
    </div>
  );
};

export default GlobalSearch;