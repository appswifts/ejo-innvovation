import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Homepage from './pages/Homepage';
import GlobalSearch from './pages/GlobalSearch';
import ArticleView from './pages/ArticleView';
import ResearcherDashboard from './pages/ResearcherDashboard';
import LibrarianAnalytics from './pages/LibrarianAnalytics';
import SubmissionWizard from './pages/SubmissionWizard';

const DevNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
        {isOpen && (
            <div className="bg-card border border-border rounded-lg shadow-xl p-2 flex flex-col gap-1 w-64 mb-2">
                <div className="text-xs font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">Pages</div>
                <Link to="/" className={`px-3 py-2 text-sm rounded-md transition-colors ${location.pathname === '/' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent hover:text-accent-foreground text-foreground'}`}>Homepage</Link>
                <Link to="/search" className={`px-3 py-2 text-sm rounded-md transition-colors ${location.pathname === '/search' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent hover:text-accent-foreground text-foreground'}`}>Global Search</Link>
                <Link to="/article" className={`px-3 py-2 text-sm rounded-md transition-colors ${location.pathname === '/article' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent hover:text-accent-foreground text-foreground'}`}>Article View</Link>
                <Link to="/dashboard" className={`px-3 py-2 text-sm rounded-md transition-colors ${location.pathname === '/dashboard' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent hover:text-accent-foreground text-foreground'}`}>Researcher Dashboard</Link>
                <Link to="/analytics" className={`px-3 py-2 text-sm rounded-md transition-colors ${location.pathname === '/analytics' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent hover:text-accent-foreground text-foreground'}`}>Librarian Analytics</Link>
                <Link to="/submit" className={`px-3 py-2 text-sm rounded-md transition-colors ${location.pathname === '/submit' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent hover:text-accent-foreground text-foreground'}`}>Submission Wizard</Link>
            </div>
        )}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg flex items-center justify-center transition-all"
        >
            <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
        </button>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground font-display">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/search" element={<GlobalSearch />} />
          <Route path="/article" element={<ArticleView />} />
          <Route path="/dashboard" element={<ResearcherDashboard />} />
          <Route path="/analytics" element={<LibrarianAnalytics />} />
          <Route path="/submit" element={<SubmissionWizard />} />
        </Routes>
        <DevNavigation />
      </div>
    </HashRouter>
  );
}