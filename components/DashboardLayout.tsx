
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    if (!user || !profile) return null;

    // Define menu items based on roles
    const getMenuItems = () => {
        const items = [
            { label: 'Overview', icon: 'dashboard', path: '/dashboard/overview', roles: ['author', 'editor', 'reviewer', 'finance_admin', 'super_admin'] },

            // Author
            { label: 'My Manuscripts', icon: 'description', path: '/dashboard/my-manuscripts', roles: ['author'] },
            { label: 'New Submission', icon: 'add_circle', path: '/dashboard/submit', roles: ['author'] },

            // Editor
            { label: 'All Submissions', icon: 'inventory_2', path: '/dashboard/submissions', roles: ['editor', 'super_admin'] },
            { label: 'Books', icon: 'menu_book', path: '/dashboard/admin/books', roles: ['editor', 'super_admin'] },

            // Reviewer
            // { label: 'My Reviews', icon: 'rate_review', path: '/dashboard/reviews', roles: ['reviewer'] },

            // Finance
            { label: 'Financials', icon: 'payments', path: '/dashboard/finance', roles: ['finance_admin', 'super_admin'] },

            // Admin
            { label: 'Users', icon: 'group', path: '/dashboard/admin/users', roles: ['super_admin'] },
            { label: 'Roles & Perms', icon: 'admin_panel_settings', path: '/dashboard/admin/roles', roles: ['super_admin'] },
            { label: 'Journals', icon: 'menu_book', path: '/dashboard/admin/journals', roles: ['editor', 'super_admin'] },
        ];

        return items.filter(item => {
            if (profile.role?.slug === 'super_admin') return true;
            return profile.role?.slug && item.roles.includes(profile.role.slug);
        });
    };

    const menuItems = getMenuItems();
    const currentPath = location.pathname;

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col shadow-xl z-20`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    {sidebarOpen && <span className="text-white font-bold text-lg tracking-tight">Nkiza<span className="text-primary">Admin</span></span>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">{sidebarOpen ? 'menu_open' : 'menu'}</span>
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${currentPath === item.path || currentPath.startsWith(item.path) && item.path !== '/dashboard/overview'
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${!sidebarOpen && 'mx-auto'}`}>{item.icon}</span>
                            {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                            {!sidebarOpen && (
                                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="size-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{profile.full_name || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate capitalize">{profile.role?.name || 'No Role'}</p>
                            </div>
                        )}
                        {sidebarOpen && (
                            <button onClick={handleSignOut} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-xl">logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 overflow-auto p-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
