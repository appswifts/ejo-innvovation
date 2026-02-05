import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Globe, ArrowRight } from 'lucide-react';
import { useJournals } from '../hooks/useVenues';
import DashboardLayout from '../layouts/DashboardLayout';

const Journals: React.FC = () => {
    const { venues: journals, loading, error } = useJournals();

    return (
        <DashboardLayout>
            <div className="bg-background min-h-screen font-display flex flex-col">
                <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-foreground">Academic Journals</h1>
                            <p className="text-muted-foreground text-lg mt-2">Explore our collection of peer-reviewed journals.</p>
                        </div>
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
            </div>
        </DashboardLayout>
    );
};

export default Journals;
