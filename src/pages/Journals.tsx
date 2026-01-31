import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Globe, ExternalLink, ArrowRight } from 'lucide-react';
import { useJournals } from '../hooks/useVenues';

const Journals: React.FC = () => {
    const { venues: journals, loading, error } = useJournals();

    return (
        <div className="bg-background min-h-screen font-display flex flex-col">
            {/* Navigation Bar */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border bg-card/80 backdrop-blur-md px-6 py-3 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                            <BookOpen className="size-5 text-primary-foreground" strokeWidth={2} />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Ejo Innovation</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link to="/search" className="hover:text-foreground transition-colors">Search</Link>
                        <Link to="/journals" className="text-foreground font-semibold">Journals</Link>
                        <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/signin" className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors">
                        Sign In
                    </Link>
                    <Link to="/submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm">
                        Submit Paper
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                        Academic <span className="text-primary">Journals</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Explore our collection of peer-reviewed journals covering science, humanities, engineering, and more.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-card rounded-2xl border border-border p-6 h-64 animate-pulse">
                                <div className="w-16 h-16 bg-muted rounded-xl mb-6"></div>
                                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                                <div className="h-4 bg-muted rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-destructive/5 rounded-2xl border border-destructive/10">
                        <p className="text-destructive font-medium mb-2">Error loading journals</p>
                        <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {journals.map((journal) => (
                            <Link
                                key={journal.id}
                                to={`/journals/${journal.slug}`}
                                className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                            >
                                <div className="h-32 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    {journal.cover_image_url ? (
                                        <img
                                            src={journal.cover_image_url}
                                            alt={journal.name}
                                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute bottom-4 left-6 size-16 bg-white rounded-xl shadow-lg flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                                            {journal.logo_url ? (
                                                <img src={journal.logo_url} alt="" className="w-10 h-10 object-contain" />
                                            ) : (
                                                <BookOpen className="size-8 text-primary" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 p-6 pt-8 flex flex-col">
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                                            {journal.name}
                                        </h2>
                                        {journal.abbreviation && (
                                            <span className="inline-block px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-semibold">
                                                {journal.abbreviation}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                                        {journal.description || `The ${journal.name} publishes high-quality research...`}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
                                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="size-3.5" />
                                                <span>Open Access</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="size-3.5" />
                                                <span>Peer Reviewed</span>
                                            </div>
                                        </div>
                                        <span className="flex items-center text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                            View Journal <ArrowRight className="ml-1 size-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-card border-t border-border mt-auto py-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-muted-foreground text-sm">
                        © 2026 Nkiza Center for Research. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Journals;
