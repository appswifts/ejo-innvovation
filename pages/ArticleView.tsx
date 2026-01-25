import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const ArticleView: React.FC = () => {
  return (
    <div className="bg-background text-foreground font-display min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-6 md:px-10 py-3 flex items-center justify-between max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 text-foreground hover:opacity-80 transition-opacity group">
              <div className="relative">
                <div className="size-9 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                  <Sparkles className="size-5 text-primary-foreground" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">Ejo Innovation</h2>
            </Link>
            <div className="hidden lg:flex flex-col min-w-40 !h-10 w-96">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-border bg-secondary/50">
                <div className="text-muted-foreground flex items-center justify-center pl-4 rounded-l-lg">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground px-3 text-sm" placeholder="Search papers, authors, journals..." />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/search" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Journals</Link>
              <Link to="/search" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Institutions</Link>
              <Link to="/search" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Conferences</Link>
            </nav>
            <Link to="/submit" className="hidden sm:flex items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-sm transition-colors">
              Submit Paper
            </Link>
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all" data-alt="User profile avatar showing a smiling person" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbMaUl86VEvo6iL7VWZiUTXQ5t5zrUmYccrZOIArX2c8lxrAhnT1xvX2--Ew7HlRX5ElE0tBohe0dWqfiX-JSC4AY69YoTPTMyWBblEyZBzuy_amhk6GPvc8QGPeFA5Y-bInk_u7ztBNIMwFUNL7wjJ8WV87s5fDMrPre4XklYU8f-r0FiJDCX4LmgvF4COJbA4h4cm4gXtnt12Hv0cqABmfgiT97S7-cAlOwwATChBe78euoOb4ZDf0tn4Cnz6yReNoxmW2UDqJw')" }}></div>
          </div>
        </div>
      </header>
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-10 py-6">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 text-sm mb-6">
          <Link to="/" className="text-primary hover:underline font-medium">Home</Link>
          <span className="text-muted-foreground">/</span>
          <a className="text-primary hover:underline font-medium" href="#">Journal of Biological Physics</a>
          <span className="text-muted-foreground">/</span>
          <a className="text-primary hover:underline font-medium" href="#">Volume 12</a>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Article</span>
        </div>
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-between gap-6 items-start">
            <div className="flex-1 min-w-[300px]">
              <h1 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] tracking-tight mb-4">
                Quantum Entanglement in Macroscopic Biological Systems: Evidence from Photosynthetic Complexes
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                  <div className="relative group cursor-pointer">
                    <div className="bg-center bg-no-repeat bg-cover border-2 border-background rounded-full size-10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLRgzYo6oVhiNEn3R7k1XwhnHpRZ7CSlX1wN5Qs9d14K-Vf81dWN2vnEoldKSNjX7c3Ozhn4d7DdP3tRskAknYEeu35jMUXo7VOXrnLpvDydSUSIlAkeLK6vxG1iqO6eojJaIfkv08Z4Bgu1dqFLOvX1_r7lDLAQggDBLo1Ds7cr0CvMxujWeZ2Tznk03AxXUuG0oU34S7ehRWzj8eoCBa28P7dF2JYGmNThNou0h2ciSiCS0bOgOaip-5HMyUVWfmCj0QUTJ2vFg')" }}></div>
                  </div>
                  <div className="relative group cursor-pointer">
                    <div className="bg-center bg-no-repeat bg-cover border-2 border-background rounded-full size-10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCxnCIZHZTQi3uh0FTiWgrUgTlO5cb2ObZ6gsJ4OYTeZU0vQwnyUCHi4RioQKprgSy4Dcxq3Q6ea882YtHnwIU-CvyUEsjAV4SpkhNV3s_-qU_EBqYsitpeRvHpqqSMdj_nsGWPsK_y1PWApjS_6kO2ZOpHV_sJoA08abkf29JDdU46V6vH1Nqsn7I630UV9bWXtuxg3nZArbRbX05IJ4tHjpz5_vRKQFaZck5PyhWRKIfp8f9Lho0E0DTmEAWhFNUDNcVaqkPmWoQ')" }}></div>
                  </div>
                  <div className="relative group cursor-pointer">
                    <div className="bg-secondary border-2 border-background text-muted-foreground rounded-full flex items-center justify-center size-10 text-xs font-bold">
                      +3
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Elena Rodriguez, James Tanaka</span> et al.
                </div>
                <span className="text-border">|</span>
                <div className="text-primary font-medium text-sm flex items-center gap-1">
                  Published: Oct 24, 2023
                </div>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex h-8 items-center justify-center gap-x-1.5 rounded-full bg-primary/10 pl-2 pr-3 border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-[18px]">lock_open</span>
                  <p className="text-primary text-xs font-bold uppercase tracking-wide">Open Access</p>
                </div>
                <div className="flex h-8 items-center justify-center gap-x-1.5 rounded-full bg-blue-500/10 pl-2 pr-3 border border-blue-500/20">
                  <span className="material-symbols-outlined text-blue-500 text-[18px]">verified</span>
                  <p className="text-blue-500 text-xs font-bold uppercase tracking-wide">Peer Reviewed</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
              <button className="flex-1 sm:flex-none h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 min-w-[180px]">
                <span className="material-symbols-outlined">download</span>
                Download PDF
              </button>
              <button className="flex-1 sm:flex-none h-12 px-6 rounded-lg bg-card border border-border text-foreground font-bold text-base hover:bg-accent transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">menu_book</span>
                Read Online
              </button>
            </div>
          </div>
        </div>
        {/* Main Layout Split */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          {/* Left Column: Article Content (70%) */}
          <div className="w-full lg:w-[70%] space-y-10">
            {/* Abstract */}
            <section className="bg-primary/5 p-6 md:p-8 rounded-xl border border-primary/10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Abstract</h3>
              <p className="text-base md:text-lg leading-relaxed text-foreground">
                Recent theoretical and experimental advances suggest that quantum phenomena, such as coherence and entanglement, may play a functional role in biological processes. Here we present experimental evidence for long-lived quantum entanglement in the Fenna-Matthews-Olson (FMO) complex at physiological temperatures...
              </p>
            </section>
            {/* Article Body */}
            <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary max-w-none text-muted-foreground">
              <h2 className="text-foreground">1. Introduction</h2>
              <p className="mb-6 leading-relaxed">
                The efficiency of energy transfer in photosynthetic complexes has long puzzled biophysicists...
              </p>
              <h2 className="text-foreground">2. Methodology</h2>
              <p className="mb-6 leading-relaxed">
                We isolated FMO complexes from <em>Chlorobium tepidum</em> and performed two-dimensional electronic spectroscopy...
              </p>
              {/* Figure Insertion */}
              <figure className="my-8 rounded-xl overflow-hidden bg-card border border-border p-4">
                <div className="bg-secondary w-full aspect-video rounded-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBS-Rsfv3_z6usoIuSbXnRP-Taw-Vnb5VArz3l27GPPNHjkSm3oJch4fPtGQ23e1PhSBhAxX8NJqkDEp_JLfIhCWPtSdWJRtjPRfurOC-qxeYO9oL1Rdp2RlOQtt8OoyaStT7JMXn0hH_C_eJpVBbFW51GRwbZuMRyankG09MmmjaJAYtgIGbXd2NWCbjMo8Y1SHqGapPgficauTvcpt6VXHVTc9DIlQqEru29PPqmYZsFW4JRKSaRs6glnT-fvrTrehLh7MfSkSrw')" }}></div>
                </div>
                <figcaption className="mt-4 text-sm text-muted-foreground text-center">
                  <strong>Figure 1.</strong> 2D electronic spectra of the FMO complex at 77K (left) and 293K (right).
                </figcaption>
              </figure>
              <h2 className="text-foreground">3. Results & Discussion</h2>
              <p className="mb-4 leading-relaxed">
                The observed quantum beats in the 2DES signals indicate that excitonic coherence is maintained for timescales relevant to energy transfer...
              </p>
            </div>
          </div>
          {/* Right Column: Sidebar (30%) */}
          <aside className="w-full lg:w-[30%] space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-5 sticky top-24">
              <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4 tracking-wider">Quick Actions</h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group">
                  <div className="bg-primary/10 text-primary p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">format_quote</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Cite</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group">
                  <div className="bg-primary/10 text-primary p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">share</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Share</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group">
                  <div className="bg-primary/10 text-primary p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">bookmark_add</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Save</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <footer className="mt-20 border-t border-border bg-card py-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-foreground">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
              <Sparkles className="size-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg">Ejo Innovation</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2023 Ejo Innovation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ArticleView;