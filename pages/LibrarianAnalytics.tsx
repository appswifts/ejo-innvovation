import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { useAuth } from '../src/hooks';

const LibrarianAnalytics: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="px-6 py-8 max-w-[1400px] mx-auto w-full">
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
      </div>
    </DashboardLayout>
  );
};

export default LibrarianAnalytics;