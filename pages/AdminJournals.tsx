import React, { useState } from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Plus, BookOpen, Globe, Edit, ExternalLink, Archive, RotateCcw, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { useJournals, useAdminJournals } from '../src/hooks';
import { Link } from 'react-router-dom';
import type { Venue } from '../src/types/database';

const AdminJournals: React.FC = () => {
    // Shared state
    const { venues: journals, loading, refetch } = useJournals();
    const { createJournal, updateJournal, archiveJournal, restoreJournal } = useAdminJournals();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState<Venue | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        abbreviation: '',
        description: '',
        contact_email: '',
        scope: '',
        cover_image_url: ''
    });

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            abbreviation: '',
            description: '',
            contact_email: '',
            scope: '',
            cover_image_url: ''
        });
        setSelectedJournal(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (journal: Venue) => {
        setSelectedJournal(journal);
        setFormData({
            name: journal.name,
            slug: journal.slug,
            abbreviation: journal.abbreviation || '',
            description: journal.description || '',
            contact_email: journal.contact_email || '',
            scope: journal.scope || '',
            cover_image_url: journal.cover_image_url || ''
        });
        setIsEditModalOpen(true);
    };

    const handleSubmitCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        const result = await createJournal(formData);
        if (result.success) {
            await refetch();
            setIsCreateModalOpen(false);
            resetForm();
        }
        setIsActionLoading(false);
    };

    const handleSubmitUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJournal) return;
        setIsActionLoading(true);
        const result = await updateJournal(selectedJournal.id, formData);
        if (result.success) {
            await refetch();
            setIsEditModalOpen(false);
            resetForm();
        }
        setIsActionLoading(false);
    };

    const handleArchive = async (id: string, currentStatus: boolean | null) => {
        if (!confirm(currentStatus ? 'Are you sure you want to archive this journal?' : 'Are you sure you want to restore this journal?')) return;

        setIsActionLoading(true);
        const action = currentStatus ? archiveJournal : restoreJournal;
        const result = await action(id);
        if (result.success) {
            await refetch();
        }
        setIsActionLoading(false);
    };

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Journals Management</h1>
                        <p className="text-muted-foreground mt-1">Manage journals, create new venues, and update details.</p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition"
                    >
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
                            <div key={journal.id} className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 ${!journal.is_active ? 'opacity-75 grayscale' : ''}`}>

                                {/* Cover Image or Color Bar */}
                                {journal.cover_image_url ? (
                                    <div className="h-32 w-full relative overflow-hidden bg-muted">
                                        <img
                                            src={journal.cover_image_url}
                                            alt={journal.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                // Fallback if image fails
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        {/* Fallback color bar if image hidden/error */}
                                        <div className={`hidden absolute inset-0 w-full h-full ${journal.is_active ? 'bg-primary/10' : 'bg-muted'}`}></div>
                                    </div>
                                ) : (
                                    <div className={`h-2 w-full ${journal.is_active ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="size-12 rounded-lg bg-secondary flex items-center justify-center font-bold text-xl text-primary flex-shrink-0">
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
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(journal)}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                            title="Edit Journal"
                                        >
                                            <Edit className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleArchive(journal.id, journal.is_active)}
                                            className={`p-1.5 rounded-md transition-colors ${journal.is_active ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-green-600 hover:bg-green-100'}`}
                                            title={journal.is_active ? "Archive Journal" : "Restore Journal"}
                                        >
                                            {journal.is_active ? <Trash2 className="size-4" /> : <RotateCcw className="size-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
                            <h2 className="text-xl font-bold">{isCreateModalOpen ? 'Create New Journal' : 'Edit Journal'}</h2>
                            <button
                                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={isCreateModalOpen ? handleSubmitCreate : handleSubmitUpdate} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Journal Name <span className="text-destructive">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. International Journal of Something"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Slug <span className="text-destructive">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. ijs"
                                    />
                                    <p className="text-xs text-muted-foreground">URL friendly identifier</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Abbreviation</label>
                                    <input
                                        type="text"
                                        value={formData.abbreviation}
                                        onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. IJS"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        <ImageIcon className="size-4 text-muted-foreground" />
                                        Cover Image URL
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={formData.cover_image_url}
                                            onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">URL to a cover image (landscape preferred).</p>
                                    {formData.cover_image_url && (
                                        <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border border-border bg-muted">
                                            <img
                                                src={formData.cover_image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        placeholder="Brief description of the journal..."
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Scope</label>
                                    <textarea
                                        rows={3}
                                        value={formData.scope}
                                        onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        placeholder="Topics covered by this journal..."
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Contact Email</label>
                                    <input
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="editor@example.com"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                                    className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isActionLoading && <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
                                    {isCreateModalOpen ? 'Create Journal' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminJournals;
