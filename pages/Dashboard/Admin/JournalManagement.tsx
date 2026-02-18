
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Journal } from '../../../types';
import Modal from '../../../components/Modal';

const JournalManagement: React.FC = () => {
    const [journals, setJournals] = useState<Journal[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [useUrlInput, setUseUrlInput] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

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
    }, []);

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

    const handleEdit = (journal: Journal) => {
        setSelectedJournal(journal);
        setCoverFile(null);
        setCoverPreview(journal.cover_image_url || null);
        setUseUrlInput(false);
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
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedJournal(null);
        setCoverFile(null);
        setCoverPreview(null);
        setUseUrlInput(false);
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
            let finalCoverUrl = formData.cover_image_url;

            // Upload cover file if selected
            if (coverFile) {
                setUploadingCover(true);
                const fileExt = coverFile.name.split('.').pop();
                const fileName = `journal-cover-${Date.now()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('journal-covers')
                    .upload(fileName, coverFile, { upsert: true });
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage
                    .from('journal-covers')
                    .getPublicUrl(uploadData.path);
                finalCoverUrl = publicUrl;
                setUploadingCover(false);
            }

            const payload = {
                ...formData,
                cover_image_url: finalCoverUrl,
                impact_factor: formData.impact_factor ? parseFloat(formData.impact_factor) : null,
                subscription_package_id: formData.is_open_access ? null : (formData.subscription_package_id || null),
            };

            let error;
            if (selectedJournal) {
                const { error: updateError } = await supabase
                    .from('journals')
                    .update(payload)
                    .eq('id', selectedJournal.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('journals')
                    .insert(payload);
                error = insertError;
            }

            if (error) throw error;

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
                            <label className="block text-sm font-bold text-slate-700 mb-1">Editor Team</label>
                            <input
                                name="editor_in_chief_name"
                                type="text"
                                value={formData.editor_in_chief_name}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Name of the Editor Team"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Cover Image</label>

                            {/* Toggle between upload and URL */}
                            <div className="flex items-center gap-2 mb-2">
                                <button type="button" onClick={() => setUseUrlInput(false)} className={`text-xs font-bold px-3 py-1 rounded-full transition ${!useUrlInput ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Upload File</button>
                                <button type="button" onClick={() => setUseUrlInput(true)} className={`text-xs font-bold px-3 py-1 rounded-full transition ${useUrlInput ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Paste URL</button>
                            </div>

                            {useUrlInput ? (
                                <input
                                    name="cover_image_url"
                                    type="url"
                                    value={formData.cover_image_url}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="https://..."
                                />
                            ) : coverPreview || coverFile ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                    <img src={coverFile ? URL.createObjectURL(coverFile) : coverPreview!} alt="Cover preview" className="w-full h-40 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setCoverFile(null); setCoverPreview(null); setFormData(prev => ({ ...prev, cover_image_url: '' })); }}
                                        className="absolute top-2 right-2 size-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragActive(false);
                                        const file = e.dataTransfer.files[0];
                                        if (file && file.type.startsWith('image/')) {
                                            if (file.size > 5 * 1024 * 1024) { alert('File must be under 5MB'); return; }
                                            setCoverFile(file);
                                        }
                                    }}
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e: any) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 5 * 1024 * 1024) { alert('File must be under 5MB'); return; }
                                                setCoverFile(file);
                                            }
                                        };
                                        input.click();
                                    }}
                                >
                                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">cloud_upload</span>
                                    <p className="text-sm font-bold text-slate-600">Drag & drop or click to upload</p>
                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                                </div>
                            )}
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
