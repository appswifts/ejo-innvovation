import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, Users, Globe, ArrowLeft, Search, Calendar, FileText, Send } from 'lucide-react';
import { useVenue } from '../hooks/useVenues';

const JournalDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { venue, loading, error } = useVenue(slug || '');
    const [activeTab, setActiveTab] = useState('about');

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-muted-foreground animate-pulse">Loading journal...</p>
                </div>
            </div>
        );
    }

    if (error || !venue) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="max-w-md text-center px-6">
                    <BookOpen className="size-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Journal Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        The journal you are looking for does not exist or has been moved.
                    </p>
                    <Link to="/journals" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                        <ArrowLeft className="size-4" />
                        Back to Journals
                    </Link>
                </div>
            </div>
        );
    }

    const sections = [
        { id: 'about', label: 'About' },
        { id: 'editorial', label: 'Editorial Team' },
        { id: 'submissions', label: 'For Authors' },
        { id: 'archive', label: 'Journal Publications' },
    ];

    return (
        <div className="bg-background min-h-screen font-display flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/journals" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="size-4" />
                        <span className="text-sm font-medium">All Journals</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Minimal Journal Switcher or Search could go here */}
                        <Link to="/search" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                            <Search className="size-5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative bg-card border-b border-border">
                {venue.cover_image_url && (
                    <div className="absolute inset-0 z-0">
                        <img src={venue.cover_image_url} alt="" className="w-full h-full object-cover opacity-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
                    </div>
                )}

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="size-32 md:size-40 rounded-xl bg-white shadow-xl flex items-center justify-center shrink-0 overflow-hidden border-4 border-card">
                        {venue.logo_url ? (
                            <img src={venue.logo_url} alt={venue.name} className="w-full h-full object-contain p-2" />
                        ) : (
                            <BookOpen className="size-16 text-primary" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            {venue.abbreviation && (
                                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide">
                                    {venue.abbreviation}
                                </span>
                            )}
                            {venue.type === 'JOURNAL' && (
                                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                                    <Globe className="size-3.5" /> Open Access
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight">
                            {venue.name}
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed mb-6">
                            {venue.description}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to={`/submit?venue=${venue.id}`}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                <Send className="size-4" />
                                Submit Manuscript
                            </Link>
                            {/* Add more action buttons like "Browse Archive" */}
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="flex items-center gap-8 border-b border-border overflow-x-auto scrollbar-hide">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === section.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content Column */}
                    <div className="lg:col-span-2">
                        {activeTab === 'about' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section>
                                    <h3 className="text-2xl font-bold mb-4">Aims & Scope</h3>
                                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                                        {venue.mission ? (
                                            <p>{venue.mission}</p>
                                        ) : (
                                            <p className="text-muted-foreground italic">
                                                Mission statement not available yet.
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {(venue as any).journal?.indexing_info && (
                                    <section>
                                        <h3 className="text-2xl font-bold mb-4">Indexing & Abstracting</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {(venue as any).journal.indexing_info.map((idx: string) => (
                                                <span key={idx} className="px-3 py-1 bg-muted rounded-md text-sm font-medium">
                                                    {idx}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {activeTab === 'editorial' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-2xl font-bold mb-6">Editorial Board</h3>
                                <div className="bg-muted/30 rounded-xl p-8 text-center border border-border border-dashed">
                                    <Users className="size-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold mb-2">Editor-in-Chief</h4>
                                    <p className="text-muted-foreground">Dr. John Doe (Placeholder)</p>
                                    <p className="text-sm text-muted-foreground/70">University of Example</p>
                                    <div className="mt-8 pt-8 border-t border-border/50">
                                        <p className="text-sm text-muted-foreground">
                                            Full editorial board listing coming soon.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'submissions' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-2xl font-bold mb-6">Author Guidelines</h3>
                                <div className="prose prose-neutral dark:prose-invert max-w-none">
                                    <p>
                                        Detailed submission requirements, formatting guidelines, and ethical policies will be displayed here.
                                    </p>
                                    <ul>
                                        <li>Original research not published elsewhere</li>
                                        <li>Double-blind peer review process</li>
                                        <li>Standard citation format required</li>
                                    </ul>
                                </div>
                                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 mt-6">
                                    <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                        <FileText className="size-5" /> Submission Checklist
                                    </h4>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                        <li>Cover letter</li>
                                        <li>Anonymized manuscript file</li>
                                        <li>Separate title page with author details</li>
                                        <li>Figures and tables in appropriate format</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'archive' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-2xl font-bold mb-6">Recent Issues</h3>
                                <div className="text-center py-12 text-muted-foreground">
                                    <Calendar className="size-12 mx-auto mb-4 opacity-50" />
                                    <p>No issues published yet.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                            <h4 className="font-bold text-lg mb-4">Journal Information</h4>
                            <dl className="space-y-4 text-sm">
                                {(venue as any).journal?.issn && (
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <dt className="text-muted-foreground">ISSN</dt>
                                        <dd className="font-medium font-mono">{(venue as any).journal.issn}</dd>
                                    </div>
                                )}
                                {(venue as any).journal?.eissn && (
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <dt className="text-muted-foreground">e-ISSN</dt>
                                        <dd className="font-medium font-mono">{(venue as any).journal.eissn}</dd>
                                    </div>
                                )}
                                {(venue as any).journal?.frequency && (
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <dt className="text-muted-foreground">Frequency</dt>
                                        <dd className="font-medium">{(venue as any).journal.frequency}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <dt className="text-muted-foreground">Publisher</dt>
                                    <dd className="font-medium">Nkiza Center for Research</dd>
                                </div>
                            </dl>

                            <div className="mt-6 pt-6 border-t border-border">
                                <h5 className="font-semibold mb-3">Contact</h5>
                                <a href={`mailto:${venue.contact_email}`} className="text-primary hover:underline text-sm break-all">
                                    {venue.contact_email || 'editor@ejoinnovation.com'}
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
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

export default JournalDetail;
