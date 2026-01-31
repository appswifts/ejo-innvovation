import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../hooks';

interface DashboardLayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
    variant?: 'researcher' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, showSidebar = true, variant = 'researcher' }) => {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const NavLink = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
        <Link
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive(to)
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent text-foreground'
                }`}
            onClick={() => setMobileMenuOpen(false)}
        >
            <span className="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">{icon}</span>
            <p className="text-sm font-medium leading-normal">{label}</p>
        </Link>
    );

    const getNavItems = () => {
        if (variant === 'admin') {
            return (
                <nav className="flex flex-col gap-2 mt-4">
                    <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">Administration</div>
                    <NavLink to="/admin" icon="dashboard" label="Overview" />
                    <NavLink to="/admin/journals" icon="menu_book" label="Journals" />
                    <NavLink to="/admin/users" icon="group" label="Users" />
                    <NavLink to="/admin/submissions" icon="description" label="All Submissions" />
                    <NavLink to="/admin/finance" icon="payments" label="Finance" />

                    <div className="h-px bg-border my-2 mx-3"></div>
                    <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">System</div>
                    <NavLink to="/admin/settings" icon="settings" label="Settings" />
                    <NavLink to="/admin/logs" icon="terminal" label="Logs" />
                </nav>
            );
        }

        // Default Researcher Navigation
        return (
            <nav className="flex flex-col gap-2 mt-4">
                <NavLink to="/dashboard" icon="dashboard" label="Dashboard" />
                <NavLink to="/submit" icon="add_circle" label="Submit" />
                <NavLink to="/submissions" icon="description" label="Submissions" />
                <NavLink to="/books" icon="library_books" label="Books" />
                <NavLink to="/analytics" icon="bar_chart" label="Publications" />

                <div className="h-px bg-border my-2 mx-3"></div>

                <NavLink to="/settings" icon="settings" label="Settings" />
            </nav>
        );
    };

    return (
        <div className="bg-background text-foreground font-display overflow-hidden h-screen flex w-full">
            {/* MOBILE OVERLAY */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            {showSidebar && (
                <aside className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
                    <div className="flex h-full flex-col justify-between p-4">
                        <div className="flex flex-col gap-4">
                            {/* Logo / Brand */}
                            <div className="flex justify-between items-center">
                                <Link to="/" className="flex gap-3 items-center px-2 py-2 group">
                                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                                        <Sparkles className="size-5 text-primary-foreground" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-foreground text-base font-bold leading-normal">Ejo Innovation</h1>
                                        <p className="text-primary text-xs font-normal leading-normal">
                                            {variant === 'admin' ? 'Admin Console' : 'Researcher Console'}
                                        </p>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            {/* Navigation */}
                            {getNavItems()}
                        </div>

                        {/* Bottom Action */}
                        <div className="flex flex-col gap-4">
                            {variant === 'researcher' && (
                                <Link to="/submit" className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm">
                                    <span className="truncate">New Submission</span>
                                </Link>
                            )}

                            <div className="flex items-center justify-between px-2 pt-2 border-t border-border mt-2">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 bg-secondary flex items-center justify-center text-secondary-foreground font-bold shrink-0">
                                        {user?.email?.[0].toUpperCase() || <User className="size-4" />}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <p className="text-sm font-medium truncate text-foreground">
                                            {user?.user_metadata?.full_name || (variant === 'admin' ? 'Administrator' : 'Researcher')}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                    title="Sign Out"
                                >
                                    <LogOut className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
                {/* Mobile Header Trigger */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-foreground">
                            <Menu className="size-6" />
                        </button>
                        <span className="font-bold">Ejo Innovation</span>
                    </div>
                    <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
