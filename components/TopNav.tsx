import React, { useState } from 'react';
import { ViewState } from '../types';
import { useAuth } from '../contexts/AuthContext';

import { useNavigate } from 'react-router-dom';

interface TopNavProps {
  active?: string; // Changed from ViewState to string or just remove ViewState dependency if possible, but for now let's keep it simple or map it. 
  // Actually, let's just use path checking or passed active string. 
  // The original code used ViewState enum. Let's change active to accept string path or just ignore it for now and use location.pathname if needed.
  // But to minimize changes, let's just make active optional string or keeping ViewState if imported.
  // usage in LandingPage was active={ViewState.LANDING}. 
  // I will change active to be just `transparent` boolean mostly.
  transparent?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ transparent = false }) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-gray-200 ${transparent ? 'bg-white/90 backdrop-blur-md' : 'bg-white'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
              <img
                src="/Logo Nkiza Center.png"
                alt="Nkiza Center Logo"
                className="h-20 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate('/journals')} className={`text-sm font-medium transition-colors text-slate-600 hover:text-primary`}>Journals</button>
              <button onClick={() => navigate('/books')} className={`text-sm font-medium transition-colors text-slate-600 hover:text-primary`}>Books</button>
              <button onClick={() => navigate('/editors')} className={`text-sm font-medium transition-colors text-slate-600 hover:text-primary`}>Editors</button>
              <button onClick={() => navigate('/about')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">About</button>
              <button onClick={() => navigate('/contact')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Contact</button>
              <button onClick={() => navigate('/privacy')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Privacy</button>
              <button onClick={() => navigate('/copyright')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Copyright</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-sm">person</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">{profile?.full_name || 'User'}</span>
                  <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100 mb-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">dashboard</span> Dashboard
                    </button>
                    <button onClick={() => navigate('/dashboard/submit')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">upload_file</span> New Submission
                    </button>
                    <div className="border-t border-slate-100 my-2"></div>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">logout</span> Sign Out
                    </button>
                  </div>
                )}

                {/* Overlay to close dropdown */}
                {dropdownOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-semibold px-4 py-2 hover:text-primary transition-colors">Login</button>
                <button onClick={() => navigate('/signup')} className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;