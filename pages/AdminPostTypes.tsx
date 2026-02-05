import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Plus, FileText, Edit, Archive, RotateCcw, X, Settings, Layers } from 'lucide-react';
import { useAdminPostTypes } from '../src/hooks/useAdminPostTypes';

const VENUE_TYPES = ['JOURNAL', 'BOOK_IMPRINT'];

const AdminPostTypes: React.FC = () => {
    const { postTypes, loading, fetchPostTypes, updatePostType, archivePostType, restorePostType } = useAdminPostTypes();

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        key: '',
        label: '',
        description: '',
        icon: '',
        allowed_venue_types: [] as string[]
    });

    const resetForm = () => {
        setFormData({
            key: '',
            label: '',
            description: '',
            icon: '',
            allowed_venue_types: []
        });
        setEditingType(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (type: any) => {
        setEditingType(type);
        setFormData({
            key: type.key || '',
            label: type.label || '',
            description: type.description || '',
            icon: type.icon || '',
            allowed_venue_types: type.allowed_venue_types || []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);

        // Only allow updates, no creation
        let result;
        if (editingType) {
            result = await updatePostType(editingType.id, formData as any);
        } else {
            // Fallback/Error state if somehow triggered
            result = { success: false, error: 'Creation disabled' };
        }

        if (result.success) {
            await fetchPostTypes();
            setIsModalOpen(false);
            resetForm();
        } else {
            alert('Failed: ' + (result.error || 'Unknown error'));
        }
        setIsActionLoading(false);
    };

    const handleArchive = async (type: any) => {
        if (!confirm(`Are you sure you want to ${type.is_active ? 'archive' : 'restore'} "${type.label}"?`)) return;

        setIsActionLoading(true);
        const action = type.is_active ? archivePostType : restorePostType;
        const result = await action(type.id);
        if (result.success) {
            await fetchPostTypes();
        }
        setIsActionLoading(false);
    };

    const handleVenueTypeToggle = (venueType: string) => {
        setFormData(prev => ({
            ...prev,
            allowed_venue_types: prev.allowed_venue_types.includes(venueType)
                ? prev.allowed_venue_types.filter(v => v !== venueType)
                : [...prev.allowed_venue_types, venueType]
        }));
    };

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Post Types</h1>
                        <p className="text-muted-foreground mt-1">Manage the structure of system-defined content types.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-card border border-border rounded-xl shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : postTypes.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                        <div className="size-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">No Post Types Found</h3>
                        <p>Create your first post type to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {postTypes.map((type) => (
                            <div key={type.id} className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 ${!type.is_active ? 'opacity-75 grayscale' : ''}`}>
                                <div className={`h-2 w-full ${type.is_active ? 'bg-primary' : 'bg-muted-foreground'}`}></div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="size-12 rounded-lg bg-secondary flex items-center justify-center text-primary flex-shrink-0">
                                            <FileText className="size-6" />
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${type.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {type.is_active ? 'Active' : 'Archived'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                                        {type.label}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-2 font-mono">key: {type.key}</p>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                        {type.description || 'No description provided.'}
                                    </p>

                                    {type.allowed_venue_types && type.allowed_venue_types.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {type.allowed_venue_types.map((vt: string) => (
                                                <span key={vt} className="text-[10px] bg-secondary px-2 py-0.5 rounded font-medium">
                                                    {vt}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-secondary/50 p-3 flex items-center justify-between border-t border-border">
                                    <Link
                                        to={`/admin/post-types/${type.id}/fields`}
                                        className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1"
                                    >
                                        <Settings className="size-3" /> Manage Fields
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(type)}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                            title="Edit Post Type"
                                        >
                                            <Edit className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleArchive(type)}
                                            className={`p-1.5 rounded-md transition-colors ${type.is_active ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-green-600 hover:bg-green-100'}`}
                                            title={type.is_active ? "Archive" : "Restore"}
                                        >
                                            {type.is_active ? <Archive className="size-4" /> : <RotateCcw className="size-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl shadow-xl w-full max-w-lg border border-border">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold">{editingType ? 'Edit Post Type' : 'Create Post Type'}</h2>
                            <button
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Label <span className="text-destructive">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. PDF Document"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Key <span className="text-destructive">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.key}
                                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                    placeholder="e.g. pdf_document"
                                />
                                <p className="text-xs text-muted-foreground">Unique identifier (lowercase, no spaces)</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    placeholder="Brief description of this post type..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Allowed Venue Types</label>
                                <div className="flex flex-wrap gap-2">
                                    {VENUE_TYPES.map(vt => (
                                        <label key={vt} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.allowed_venue_types.includes(vt)}
                                                onChange={() => handleVenueTypeToggle(vt)}
                                                className="rounded border-border"
                                            />
                                            <span className="text-sm">{vt}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">Which venues can accept this type of submission</p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
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
                                    {editingType ? 'Save Changes' : 'Create Post Type'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminPostTypes;
