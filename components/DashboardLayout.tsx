
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [quickNavOpen, setQuickNavOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    if (!user || !profile) return null;

    const quickLinks = [
        { label: 'Home', icon: 'home', path: '/' },
        { label: 'Journals', icon: 'menu_book', path: '/journals' },
        { label: 'Books', icon: 'library_books', path: '/books' },
        { label: 'Partners', icon: 'handshake', path: '/partners' },
        { label: 'About Us', icon: 'info', path: '/about' },
    ];

    // Define menu items based on roles
    const getMenuItems = () => {
        const roleSlug = profile.role?.slug || 'reader';

        const items = [
            // General Access (Everyone)
            { label: 'Overview', icon: 'dashboard', path: '/dashboard/overview', roles: ['author', 'editor', 'reviewer', 'finance_admin', 'super_admin', 'reader', 'book_seller', 'author_bookseller'] },

            // Reader / Applicant
            { label: 'Applications', icon: 'assignment', path: '/dashboard/applications', roles: ['reader'] },
            { label: 'Become an Author', icon: 'edit_note', path: '/dashboard/applications/new', roles: ['reader'] },

            // Author
            { label: 'My Manuscripts', icon: 'description', path: '/dashboard/my-manuscripts', roles: ['author', 'author_bookseller'] },
            { label: 'New Submission', icon: 'add_circle', path: '/dashboard/submit', roles: ['author', 'author_bookseller'] },

            // Book Seller
            { label: 'My Books', icon: 'library_books', path: '/dashboard/books', roles: ['book_seller', 'author_bookseller'] },
            { label: 'Post a Book', icon: 'publish', path: '/dashboard/post-book', roles: ['book_seller', 'author_bookseller'] },

            // Editor / Super Admin
            { label: 'All Submissions', icon: 'inventory_2', path: '/dashboard/submissions', roles: ['editor', 'super_admin'] },
            { label: 'Manage Books', icon: 'menu_book', path: '/dashboard/admin/books', roles: ['editor', 'super_admin'] },
            { label: 'Applications', icon: 'approval', path: '/dashboard/admin/applications', roles: ['editor', 'super_admin'] },

            // Finance
            { label: 'Financials', icon: 'payments', path: '/dashboard/finance', roles: ['finance_admin', 'super_admin'] },

            // Admin
            { label: 'Users', icon: 'group', path: '/dashboard/admin/users', roles: ['super_admin'] },
            { label: 'Roles & Perms', icon: 'admin_panel_settings', path: '/dashboard/admin/roles', roles: ['super_admin'] },
            { label: 'Journals', icon: 'menu_book', path: '/dashboard/admin/journals', roles: ['editor', 'super_admin'] },
            { label: 'Partners', icon: 'handshake', path: '/dashboard/admin/partners', roles: ['super_admin'] },
            { label: 'Settings', icon: 'settings', path: '/dashboard/admin/settings', roles: ['super_admin'] },
        ];

        return items.filter(item => {
            if (roleSlug === 'super_admin') return true;
            return item.roles.includes(roleSlug);
        });
    };

    const menuItems = getMenuItems();
    const currentPath = location.pathname;

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar Overlay for mobile */}
            {!sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 transform ${sidebarOpen ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col shadow-xl lg:static lg:inset-auto lg:transform-none`}>
                <div className="h-24 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
                    {(!sidebarOpen || (sidebarOpen && !window.matchMedia('(min-width: 1024px)').matches)) && (
                        <img
                            src="/Logo Nkiza Center.png"
                            alt="Nkiza Center Logo"
                            className="h-16 w-auto object-contain brightness-0 invert"
                        />
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">{sidebarOpen ? 'menu' : 'menu_open'}</span>
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                navigate(item.path);
                                if (window.innerWidth < 1024) setSidebarOpen(true);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${currentPath === item.path || currentPath.startsWith(item.path) && item.path !== '/dashboard/overview'
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${sidebarOpen && 'lg:mx-auto'}`}>{item.icon}</span>
                            {(!sidebarOpen || (sidebarOpen && !window.matchMedia('(min-width: 1024px)').matches)) && (
                                <span className="font-medium text-sm">{item.label}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 shrink-0">
                    <div className={`flex items-center gap-3 ${sidebarOpen && 'lg:justify-center'}`}>
                        <div className="size-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {(!sidebarOpen || (sidebarOpen && !window.matchMedia('(min-width: 1024px)').matches)) && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{profile.full_name || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate capitalize">{profile.role?.name || 'No Role'}</p>
                            </div>
                        )}
                        {!sidebarOpen && (
                            <button onClick={handleSignOut} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-xl">logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 font-sans relative">
                {/* Mobile Header */}
                <header className="h-24 flex items-center px-4 bg-white border-b border-slate-200 lg:hidden shrink-0">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <img
                        src="/Logo Nkiza Center.png"
                        alt="Nkiza Center Logo"
                        className="h-16 w-auto object-contain ml-4"
                    />
                </header>

                <main className="flex-1 overflow-auto p-0 bg-slate-50">
                    <Outlet />
                </main>

                {/* Quick Navigation FAB */}
                <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-3">
                    {quickNavOpen && (
                        <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {quickLinks.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        navigate(link.path);
                                        setQuickNavOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group scale-95 hover:scale-100 origin-right"
                                    style={{ transitionDelay: `${(quickLinks.length - 1 - idx) * 50}ms` }}
                                >
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{link.label}</span>
                                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-xl">{link.icon}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setQuickNavOpen(!quickNavOpen)}
                        className={`size-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 transform ${quickNavOpen
                            ? 'bg-slate-900 text-white rotate-45 scale-90'
                            : 'bg-primary text-white hover:scale-110 hover:shadow-primary/30'
                            }`}
                        title="Quick Navigation"
                    >
                        <span className="material-symbols-outlined text-3xl">
                            {quickNavOpen ? 'close' : 'explore'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
