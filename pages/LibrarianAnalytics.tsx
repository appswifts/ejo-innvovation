import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const LibrarianAnalytics: React.FC = () => {
  return (
    <div className="bg-background font-display antialiased text-foreground transition-colors duration-200 min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border bg-card px-6 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="size-9 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Sparkles className="size-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </Link>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-foreground">Ejo Innovation</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-[1px] bg-border"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground">Dr. Sarah Jenkins</p>
                <p className="text-xs text-muted-foreground">Head Librarian</p>
              </div>
              <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-background shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABR2VcNaw22K0rCDSj5WBtdoKvss-Huz739Gz-1_04LIxFdsupebSqRokv3GXkNku5Ck1_605QQsLxO6-SlU_hq1XTEWdCNmAXdxap53tt5D9OHH-hqjRmhDRP8u7D8PzjlJ-fzFKLrSfT63aow357-6hzhHQDwxeXMir6yIHPXbVn9w-LHwKJXi6slwIq4Iit6qx9NG2k3K_clvsaZDv1Qgt0VSPzVPsHNNgmxdhtTl8NseIQIzdLDa_1Xy7XgMSsnekYGYEL75Q')" }}></div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-8 max-w-[1400px] mx-auto w-full">
          {/* Page Heading & Context */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-foreground">Usage Analytics</h1>
              <p className="text-primary font-medium text-lg">University of Science & Technology</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center justify-center gap-2 rounded-lg bg-card border border-border px-4 py-2 text-sm font-bold text-foreground shadow-sm hover:bg-accent transition">
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span>Settings</span>
              </button>
            </div>
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* KPI 1 */}
            <div className="flex flex-col gap-1 rounded-xl bg-card p-6 border border-border shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">monetization_on</span>
              </div>
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Cost Per Use</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-black text-foreground">$4.12</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LibrarianAnalytics;