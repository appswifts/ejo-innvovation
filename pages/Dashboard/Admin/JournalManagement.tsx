
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Journal } from '../../../types';
import Modal from '../../../components/Modal';

interface EditorOption {
  id: string;
  full_name: string;
  email: string;
  title?: string;
}

const ROLE_LABELS: Record<string, string> = {
  editor_in_chief: 'Editor-in-Chief',
  handling_editor: 'Handling Editor',
  board_member: 'Editorial Board Member',
};

const JournalManagement: React.FC = () => {
    const [journals, setJournals] = useState<Journal[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [editors, setEditors] = useState<EditorOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
    const [selectedEditorIds, setSelectedEditorIds] = useState<Set<string>>(new Set());
    const [editorRoles, setEditorRoles] = useState<Record<string, string>>({});

    // Form Stats
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        issn: '',
        description: '',
        aims_scope: '',
        cover_image_url: '',
        discipline: '',
        editor_in_chief_name: '',
        impact_factor: '',
        is_open_access: true,
        subscription_package_id: '',
        guidelines: '', // Add guidelines to form state
    });

    useEffect(() => {
        fetchJournals();
        fetchPackages();
        fetchEditors();
    }, []);

    const fetchEditors = async () => {
        const { data } = await supabase.from('editors').select('id, full_name, email, title').eq('is_active', true).order('full_name');
        if (data) setEditors(data as EditorOption[]);
    };

    const fetchPackages = async () => {
        const { data } = await supabase
            .from('publication_packages')
            .select('*')
            .eq('type', 'journal_subscription')
            .eq('is_active', true);
        if (data) setPackages(data);
    };

    const fetchJournals = async () => {
        const { data } = await supabase.from('journals').select('*').order('created_at', { ascending: false });
        if (data) setJournals(data as Journal[]);
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData(prev => ({
            ...prev,
            title,
            slug: selectedJournal ? prev.slug : slug // Don't auto-update slug if editing
        }));
    };

    const handleCoverUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG, WebP, etc.)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5 MB.');
            return;
        }
        setCoverUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('journal_covers')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('journal_covers').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, cover_image_url: urlData.publicUrl }));
            setCoverPreview(urlData.publicUrl);
        } catch (err: any) {
            console.error('Upload failed:', err);
            alert('Failed to upload image: ' + err.message);
        } finally {
            setCoverUploading(false);
        }
    };

    const handleEdit = async (journal: Journal) => {
        setSelectedJournal(journal);
        setCoverPreview(journal.cover_image_url || null);
        setFormData({
            title: journal.title,
            slug: journal.slug,
            issn: journal.issn || '',
            description: journal.description || '',
            aims_scope: journal.aims_scope || '',
            cover_image_url: journal.cover_image_url || '',
            discipline: journal.discipline || '',
            editor_in_chief_name: journal.editor_in_chief_name || '',
            impact_factor: journal.impact_factor ? journal.impact_factor.toString() : '',
            is_open_access: journal.is_open_access,
            subscription_package_id: journal.subscription_package_id || '',
            guidelines: journal.guidelines || '',
        });

        // load currently assigned editors for this journal
        const { data: links } = await supabase
            .from('journal_editors')
            .select('editor_id, role')
            .eq('journal_id', journal.id);
        const ids = new Set<string>();
        const roles: Record<string, string> = {};
        (links || []).forEach((l: any) => {
            ids.add(l.editor_id);
            roles[l.editor_id] = l.role;
        });
        setSelectedEditorIds(ids);
        setEditorRoles(roles);

        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedJournal(null);
        setCoverPreview(null);
        setSelectedEditorIds(new Set());
        setEditorRoles({});
        setFormData({
            title: '',
            slug: '',
            issn: '',
            description: '',
            aims_scope: '',
            cover_image_url: '',
            discipline: '',
            editor_in_chief_name: '',
            impact_factor: '',
            is_open_access: true,
            subscription_package_id: '',
            guidelines: '',
        });
    };

    const handleDelete = async (journal: Journal) => {
        if (!window.confirm(`Are you sure you want to delete "${journal.title}"? Related articles and manuscripts will be unlinked (not deleted).`)) return;
        try {
            const { error } = await supabase.from('journals').delete().eq('id', journal.id);
            if (error) throw error;
            alert('Journal deleted successfully.');
            await fetchJournals();
        } catch (error: any) {
            console.error('Error deleting journal:', error);
            alert('Failed to delete journal: ' + error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                cover_image_url: formData.cover_image_url,
                impact_factor: formData.impact_factor ? parseFloat(formData.impact_factor) : null,
                subscription_package_id: formData.is_open_access ? null : (formData.subscription_package_id || null),
            };

            let journalId = selectedJournal?.id || '';
            if (selectedJournal) {
                const { error: updateError } = await supabase
                    .from('journals')
                    .update(payload)
                    .eq('id', selectedJournal.id);
                if (updateError) throw updateError;
            } else {
                const { data: newJournal, error: insertError } = await supabase
                    .from('journals')
                    .insert(payload)
                    .select('id')
                    .single();
                if (insertError) throw insertError;
                journalId = newJournal.id;
            }

            // sync editor assignments for this journal
            await supabase.from('journal_editors').delete().eq('journal_id', journalId);
            if (selectedEditorIds.size > 0) {
                const links = Array.from(selectedEditorIds).map(editor_id => ({
                    journal_id: journalId,
                    editor_id,
                    role: editorRoles[editor_id] || 'handling_editor',
                }));
                const { error: linksError } = await supabase.from('journal_editors').insert(links);
                if (linksError) throw linksError;
            }

            await fetchJournals();
            handleClose();
        } catch (error: any) {
            console.error('Error saving journal:', error);
            alert('Failed to save journal: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Journal Management</h1>
                    <p className="text-slate-500">Configure and manage academic journals.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedJournal(null);
                        setSelectedEditorIds(new Set());
                        setEditorRoles({});
                        setFormData({
                            title: '',
                            slug: '',
                            issn: '',
                            description: '',
                            aims_scope: '',
                            cover_image_url: '',
                            discipline: '',
                            editor_in_chief_name: '',
                            impact_factor: '',
                            is_open_access: true,
                            subscription_package_id: '',
                            guidelines: '',
                        });
                        setIsModalOpen(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md group"
                >
                    <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">library_add</span> Add New Journal
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {journals.map(journal => (
                        <div key={journal.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="h-32 bg-slate-100 bg-center bg-cover relative" style={{ backgroundImage: `url(${journal.cover_image_url || 'https://via.placeholder.com/400x200?text=No+Cover'})` }}>
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(journal)}
                                        className="size-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white hover:text-primary transition shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(journal)}
                                        className="size-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white hover:text-red-600 transition shadow-sm"
                                        title="Delete Journal"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                                {journal.is_open_access && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase border border-green-200">
                                        Open Access
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">{journal.discipline || 'General'}</span>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{journal.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-3 mb-4">{journal.description || 'No description available.'}</p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400 font-medium uppercase">Impact Factor</p>
                                        <p className="font-bold text-slate-900">{journal.impact_factor || 'N/A'}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400 font-medium uppercase">ISSN</p>
                                        <p className="font-bold text-slate-900">{journal.issn || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleClose} title={selectedJournal ? "Edit Journal" : "Create New Journal"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Journal Title <span className="text-red-500">*</span></label>
                            <input
                                required
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="e.g. Nkiza Journal of Medicine"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">URL Slug <span className="text-red-500">*</span></label>
                            <input
                                required
                                name="slug"
                                type="text"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm bg-slate-50"
                                placeholder="e.g. nkiza-journal-medicine"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Discipline</label>
                            <input
                                name="discipline"
                                type="text"
                                value={formData.discipline}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="e.g. Medical, Economics"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">ISSN</label>
                            <input
                                name="issn"
                                type="text"
                                value={formData.issn}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="XXXX-XXXX"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Impact Factor</label>
                            <input
                                name="impact_factor"
                                type="number"
                                step="0.001"
                                value={formData.impact_factor}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="e.g. 2.5"
                                max="99.999"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Editorial Team</label>
                            <p className="text-xs text-slate-400 mb-2">Select editors to assign to this journal.</p>
                            {editors.length === 0 ? (
                                <p className="text-xs text-amber-600 italic">No editors available. Add editors first in the Editors page.</p>
                            ) : (
                                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-52 overflow-y-auto custom-scrollbar">
                                    {editors.map(ed => {
                                        const isSelected = selectedEditorIds.has(ed.id);
                                        return (
                                            <label
                                                key={ed.id}
                                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        setSelectedEditorIds(prev => {
                                                            const next = new Set(prev);
                                                            if (next.has(ed.id)) {
                                                                next.delete(ed.id);
                                                            } else {
                                                                next.add(ed.id);
                                                                setEditorRoles(r => ({ ...r, [ed.id]: r[ed.id] || 'handling_editor' }));
                                                            }
                                                            return next;
                                                        });
                                                    }}
                                                    className="accent-primary"
                                                />
                                                <span className="text-sm font-medium text-slate-800 flex-1 truncate">
                                                    {ed.full_name}
                                                    <span className="text-xs text-slate-400 ml-1.5 truncate">{ed.email}</span>
                                                </span>
                                                {isSelected && (
                                                    <select
                                                        value={editorRoles[ed.id] || 'handling_editor'}
                                                        onChange={(e) => setEditorRoles(r => ({ ...r, [ed.id]: e.target.value }))}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-xs font-bold text-slate-600 bg-slate-100 border-0 rounded-md py-1 px-2 focus:ring-2 focus:ring-primary/20"
                                                    >
                                                        {Object.entries(ROLE_LABELS).map(([k, v]) => (
                                                            <option key={k} value={k}>{v}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            {selectedEditorIds.size > 0 && (
                                <p className="text-xs text-slate-400 mt-1.5">{selectedEditorIds.size} editor{selectedEditorIds.size !== 1 ? 's' : ''} selected</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Preview */}
                                <div className="w-full sm:w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {(coverPreview || formData.cover_image_url) ? (
                                        <img
                                            src={coverPreview || formData.cover_image_url}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="text-center p-2">
                                            <span className="material-symbols-outlined text-3xl text-slate-300">image</span>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1">No image</p>
                                        </div>
                                    )}
                                </div>
                                {/* Upload area */}
                                <div className="flex-1 space-y-3">
                                    <label
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${coverUploading
                                            ? 'border-primary/40 bg-primary/5'
                                            : 'border-slate-200 hover:border-primary/40 hover:bg-primary/5'
                                            }`}
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) handleCoverUpload(file);
                                        }}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleCoverUpload(file);
                                            }}
                                            disabled={coverUploading}
                                        />
                                        {coverUploading ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-primary text-xl">progress_activity</span>
                                                <span className="text-xs font-bold text-primary mt-1">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-slate-400 text-xl">cloud_upload</span>
                                                <span className="text-xs font-bold text-slate-500 mt-1">Click or drag to upload</span>
                                                <span className="text-[10px] text-slate-400">JPG, PNG, WebP — Max 5 MB</span>
                                            </>
                                        )}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-slate-200"></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">or paste URL</span>
                                        <div className="h-px flex-1 bg-slate-200"></div>
                                    </div>
                                    <input
                                        name="cover_image_url"
                                        type="url"
                                        value={formData.cover_image_url}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setCoverPreview(e.target.value || null);
                                        }}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                placeholder="Brief description of the journal..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Aims & Scope</label>
                            <textarea
                                name="aims_scope"
                                rows={3}
                                value={formData.aims_scope}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                placeholder="Detailed aims and scope..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Submission Guidelines</label>
                            <textarea
                                name="guidelines"
                                rows={5}
                                value={formData.guidelines}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                placeholder="Instructions for authors..."
                            />
                        </div>

                        <div className="md:col-span-2 pt-2">
                            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                                <input
                                    name="is_open_access"
                                    type="checkbox"
                                    checked={formData.is_open_access}
                                    onChange={handleChange}
                                    className="size-5 text-primary rounded border-slate-300 focus:ring-primary"
                                />
                                <div>
                                    <span className="block font-bold text-slate-900 text-sm">Open Access Journal</span>
                                    <span className="block text-xs text-slate-500">Content is freely available to the public.</span>
                                </div>
                            </label>
                        </div>

                        {!formData.is_open_access && (
                            <div className="md:col-span-2 slide-in">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Subscription Package <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    name="subscription_package_id"
                                    value={formData.subscription_package_id}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                >
                                    <option value="">Select a package</option>
                                    {packages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.name} ({pkg.currency} {pkg.price.toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-slate-500">Select the package readers must purchase to access this journal.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                            {submitting ? 'Saving...' : (selectedJournal ? 'Update Journal' : 'Create Journal')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default JournalManagement;
