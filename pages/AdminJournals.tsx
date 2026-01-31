import React from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Plus, BookOpen, Globe, Edit, ExternalLink } from 'lucide-react';
import { useJournals } from '../src/hooks';
import { Link } from 'react-router-dom';

const AdminJournals: React.FC = () => {
    const { venues: journals, loading } = useJournals(); // useJournals uses useVenues({ type: 'JOURNAL' })

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Journals Management</h1>
                        <p className="text-muted-foreground mt-1">Manage journals, editorial teams, and settings.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition">
                        <Plus className="size-5" />
                        <span>Add Journal</span>
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-card border border-border rounded-xl shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : journals.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                        <div className="size-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">No Journals Found</h3>
                        <p>Get started by creating your first journal.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {journals.map((journal) => (
                            <div key={journal.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300">
                                <div className="h-2 bg-primary w-full"></div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="size-12 rounded-lg bg-secondary flex items-center justify-center font-bold text-xl text-primary">
                                            {journal.abbreviation || journal.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${journal.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {journal.is_active ? 'Active' : 'Archived'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                        {journal.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                                        {journal.description || 'No description provided.'}
                                    </p>

                                    <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Globe className="size-3 mr-2" />
                                            <span className="font-mono">/{journal.slug}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-secondary/50 p-3 flex items-center justify-between border-t border-border">
                                    <Link to={`/journals/${journal.slug}`} target="_blank" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1">
                                        View Live <ExternalLink className="size-3" />
                                    </Link>
                                    <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                        <Edit className="size-3" /> Manage
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminJournals;
