import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Modal from '../../../components/Modal';

interface Partner {
    id: string;
    name: string;
    logo_url: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

const PartnerManagement: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [uploading, setUploading] = useState(false);
    const [useUrlInput, setUseUrlInput] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        description: '',
        is_active: true,
    });

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPartners(data || []);
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (partner: Partner) => {
        setSelectedPartner(partner);
        setFormData({
            name: partner.name,
            logo_url: partner.logo_url || '',
            description: partner.description || '',
            is_active: partner.is_active,
        });
        setUseUrlInput(false);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedPartner(null);
        setFormData({ name: '', logo_url: '', description: '', is_active: true });
        setUseUrlInput(false);
        setDragOver(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const uploadLogo = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG, SVG, etc.)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be under 5MB.');
            return;
        }

        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('partner-logos')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('partner-logos')
                .getPublicUrl(fileName);

            setFormData(prev => ({ ...prev, logo_url: urlData.publicUrl }));
        } catch (error: any) {
            console.error('Error uploading logo:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadLogo(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadLogo(file);
    };

    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, logo_url: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                logo_url: formData.logo_url || null,
                description: formData.description || null,
                is_active: formData.is_active,
                updated_at: new Date().toISOString(),
            };

            if (selectedPartner) {
                const { error } = await supabase
                    .from('partners')
                    .update(payload)
                    .eq('id', selectedPartner.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('partners').insert(payload);
                if (error) throw error;
            }

            await fetchPartners();
            handleClose();
        } catch (error: any) {
            console.error('Error saving partner:', error);
            alert('Error: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this partner? This action cannot be undone.')) return;

        try {
            const { error } = await supabase.from('partners').delete().eq('id', id);
            if (error) throw error;
            setPartners(partners.filter(p => p.id !== id));
        } catch (error: any) {
            console.error('Error deleting partner:', error);
            alert('Failed to delete partner: ' + error.message);
        }
    };

    return (
        <div className="h-full bg-background-light overflow-y-auto">
            <main className="mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-slate-900 text-3xl font-black font-serif tracking-tight mb-2">Partners</h1>
                        <p className="text-slate-500 text-base">Manage partner logos and descriptions displayed on the website.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm">add</span> Add Partner
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Partner</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td></tr>
                                ) : partners.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">No partners added yet.</td></tr>
                                ) : (
                                    partners.map(partner => (
                                        <tr key={partner.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {partner.logo_url ? (
                                                        <img
                                                            src={partner.logo_url}
                                                            alt={partner.name}
                                                            className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-slate-400 text-lg">handshake</span>
                                                        </div>
                                                    )}
                                                    <p className="font-bold text-slate-900 text-sm">{partner.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-500 truncate max-w-[300px]">{partner.description || '—'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1.5 text-xs font-bold ${partner.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${partner.is_active ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                    {partner.is_active ? 'Active' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(partner)}
                                                        className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(partner.id)}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <Modal isOpen={isModalOpen} onClose={handleClose} title={selectedPartner ? 'Edit Partner' : 'Add Partner'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Partner Name <span className="text-red-500">*</span></label>
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring"
                            placeholder="e.g. University of Rwanda"
                        />
                    </div>

                    {/* Logo Upload / URL Section */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-bold text-slate-700">Partner Logo</label>
                            <button
                                type="button"
                                onClick={() => setUseUrlInput(!useUrlInput)}
                                className="text-xs text-primary font-semibold hover:underline"
                            >
                                {useUrlInput ? 'Upload file instead' : 'Use URL instead'}
                            </button>
                        </div>

                        {formData.logo_url ? (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <img src={formData.logo_url} alt="Logo preview" className="h-14 w-auto object-contain rounded-lg bg-white border border-slate-200 p-1" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">Logo uploaded</p>
                                    <p className="text-xs text-slate-400 truncate">{formData.logo_url}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors shrink-0"
                                    title="Remove logo"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                        ) : useUrlInput ? (
                            <input
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring"
                                placeholder="https://example.com/logo.png"
                            />
                        ) : (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragOver
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
                                    } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                {uploading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
                                        <span className="text-sm font-semibold text-slate-500">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
                                        <span className="text-sm font-semibold text-slate-600">Click or drag & drop to upload logo</span>
                                        <span className="text-xs text-slate-400">PNG, JPG, SVG up to 5MB</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-slate-300 focus:primary-ring resize-none"
                            placeholder="Brief description of the partner organization"
                        />
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                            <input
                                name="is_active"
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="size-5 text-primary rounded border-slate-300 focus:ring-primary"
                            />
                            <div>
                                <span className="block font-bold text-slate-900 text-sm">Show on Website</span>
                                <span className="block text-xs text-slate-500">Display this partner on the public partners page and homepage</span>
                            </div>
                        </label>
                    </div>

                    <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-dark transition disabled:opacity-50"
                        >
                            {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                            {submitting ? 'Saving...' : 'Save Partner'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PartnerManagement;
