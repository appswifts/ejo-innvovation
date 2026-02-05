import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Homepage from './pages/Homepage';
import About from './pages/About';
import GlobalSearch from './pages/GlobalSearch';
import ArticleView from './pages/ArticleView';
import ResearcherDashboard from './pages/ResearcherDashboard';
import LibrarianAnalytics from './pages/LibrarianAnalytics';
import SubmissionWizard from './pages/SubmissionWizard';
import Submissions from './pages/Submissions';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AdminJournals from './pages/AdminJournals';
import AdminBooks from './pages/AdminBooks';
import AdminUsers from './pages/AdminUsers';
import AdminSubmissions from './pages/AdminSubmissions';
import AdminSubmissionDetail from './pages/AdminSubmissionDetail';
import AdminFinance from './pages/AdminFinance';
import AdminSettings from './pages/AdminSettings';
import AdminLogs from './pages/AdminLogs';
import AdminPostTypes from './pages/AdminPostTypes';
import AdminPostTypeFields from './pages/AdminPostTypeFields';
import AdminTaxonomies from './pages/AdminTaxonomies';
import Books from './pages/Books';
import Career from './pages/Career';
import BookDetail from './pages/BookDetail';
import SignIn from './src/pages/SignIn';
import SignUp from './src/pages/SignUp';
import ForgotPassword from './src/pages/ForgotPassword';
import ResetPassword from './src/pages/ResetPassword';
import Journals from './src/pages/Journals';
import JournalDetail from './src/pages/JournalDetail';
import UserPurchases from './pages/UserPurchases';
import { ProtectedRoute, PublicRoute } from './src/components';

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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-background text-foreground font-display">
          <Routes>
            {/* Public Pages - Accessible to everyone */}
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<GlobalSearch />} />
            <Route path="/article" element={<ArticleView />} />
            <Route path="/journals" element={<Journals />} />
            <Route path="/journals/:slug" element={<JournalDetail />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/career" element={<Career />} />

            {/* Auth Pages - Only accessible when NOT logged in */}
            <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Pages - Require authentication */}
            <Route path="/dashboard" element={<ProtectedRoute><ResearcherDashboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><LibrarianAnalytics /></ProtectedRoute>} />
            <Route path="/submit" element={<ProtectedRoute><SubmissionWizard /></ProtectedRoute>} />
            <Route path="/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><UserPurchases /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Admin Pages - Require authentication (role check can be added later) */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/journals" element={<ProtectedRoute><AdminJournals /></ProtectedRoute>} />
            <Route path="/admin/books" element={<ProtectedRoute><AdminBooks /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/submissions" element={<ProtectedRoute><AdminSubmissions /></ProtectedRoute>} />
            <Route path="/admin/submissions/:id" element={<ProtectedRoute><AdminSubmissionDetail /></ProtectedRoute>} />
            <Route path="/admin/finance" element={<ProtectedRoute><AdminFinance /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute><AdminLogs /></ProtectedRoute>} />
            <Route path="/admin/post-types" element={<ProtectedRoute><AdminPostTypes /></ProtectedRoute>} />
            <Route path="/admin/post-types/:id/fields" element={<ProtectedRoute><AdminPostTypeFields /></ProtectedRoute>} />
            <Route path="/admin/taxonomies" element={<ProtectedRoute><AdminTaxonomies /></ProtectedRoute>} />
          </Routes>
          <DevNavigation />
        </div>
      </HashRouter>
    </QueryClientProvider>
  );
}