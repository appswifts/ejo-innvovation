import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

interface Setting {
    key: string;
    value: string;
    label: string;
    category: string;
}

const CATEGORY_META: Record<string, { title: string; icon: string; description: string }> = {
    homepage_promo: {
        title: 'Homepage Promo / Book Ad',
        icon: 'campaign',
        description: 'Featured book or promotion displayed in the dark hero section on the homepage. Clear the title field to revert to the default Foundation section.'
    },
};

const SiteSettings: React.FC = () => {
    const { profile } = useAuth();
    const [settings, setSettings] = useState<Setting[]>([]);
    const [editedValues, setEditedValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const isSuperAdmin = profile?.role?.slug === 'super_admin';

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .order('category')
            .order('key');

        if (data) {
            setSettings(data);
            const vals: Record<string, string> = {};
            data.forEach((s: Setting) => { vals[s.key] = s.value; });
            setEditedValues(vals);
        }
        if (error) console.error('Error fetching settings:', error);
        setLoading(false);
    };

    const handleChange = (key: string, value: string) => {
        setEditedValues(prev => ({ ...prev, [key]: value }));
        setSaveSuccess(false);
    };

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5 MB.'); return; }
        setImageUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const filePath = `promo-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('journal_covers')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('journal_covers').getPublicUrl(filePath);
            handleChange('homepage_promo_image_url', urlData.publicUrl);
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally {
            setImageUploading(false);
        }
    };

    const hasChanges = settings.some(s => editedValues[s.key] !== s.value);

    const handleSaveAll = async () => {
        if (!hasChanges) return;
        setSaving(true);
        setSaveSuccess(false);

        try {
            const updates = settings
                .filter(s => editedValues[s.key] !== s.value)
                .map(s =>
                    supabase
                        .from('site_settings')
                        .update({ value: editedValues[s.key], updated_at: new Date().toISOString() })
                        .eq('key', s.key)
                );

            const results = await Promise.all(updates);
            const hasError = results.some(r => r.error);

            if (hasError) {
                alert('Some settings failed to save. Please try again.');
                console.error('Save errors:', results.filter(r => r.error));
            } else {
                setSaveSuccess(true);
                await fetchSettings();
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (error: any) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        const vals: Record<string, string> = {};
        settings.forEach(s => { vals[s.key] = s.value; });
        setEditedValues(vals);
        setSaveSuccess(false);
    };

    // Group settings by category
    const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {});

    if (!isSuperAdmin) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <span className="material-symbols-outlined text-red-400 text-4xl mb-3 block">lock</span>
                    <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
                    <p className="text-red-500">Only Super Admins can access site settings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">settings</span>
                        Site Settings
                    </h1>
                    <p className="text-slate-500 mt-1">Manage platform configuration. Changes are applied immediately after saving.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-16">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([category, items]) => {
                        const meta = CATEGORY_META[category] || { title: category, icon: 'tune', description: '' };
                        return (
                            <div key={category} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                {/* Category Header */}
                                <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                            <span className="material-symbols-outlined">{meta.icon}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">{meta.title}</h2>
                                            {meta.description && (
                                                <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Settings Fields */}
                                <div className="divide-y divide-slate-50">
                                    {items.map(setting => {
                                        const isChanged = editedValues[setting.key] !== setting.value;
                                        const isMultiline = setting.key === 'homepage_promo_description';
                                        const isImageUrl = setting.key.endsWith('_image_url');
                                        return (
                                            <div key={setting.key} className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-start justify-between gap-8">
                                                    <div className="flex-shrink-0 w-48">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                            {setting.label}
                                                            {isChanged && (
                                                                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved change"></span>
                                                            )}
                                                        </label>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{setting.key}</p>
                                                    </div>
                                                    <div className="flex-1 max-w-lg">
                                                        {isMultiline ? (
                                                            <textarea
                                                                value={editedValues[setting.key] || ''}
                                                                onChange={(e) => handleChange(setting.key, e.target.value)}
                                                                rows={3}
                                                                className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors ${isChanged ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'
                                                                    }`}
                                                            />
                                                        ) : isImageUrl ? (
                                                            <div className="space-y-2">
                                                                <div className="flex gap-2">
                                                                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${imageUploading ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-primary text-white border-primary hover:bg-primary-dark'}`}>
                                                                        {imageUploading ? (
                                                                            <>
                                                                                <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                                                                Uploading...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className="material-symbols-outlined text-lg">cloud_upload</span>
                                                                                Upload
                                                                            </>
                                                                        )}
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            disabled={imageUploading}
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) handleImageUpload(file);
                                                                            }}
                                                                        />
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={editedValues[setting.key] || ''}
                                                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                                                        className={`flex-1 h-10 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${isChanged ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'}`}
                                                                        placeholder="Paste image URL..."
                                                                    />
                                                                </div>
                                                                {editedValues[setting.key] && (
                                                                    <div className="rounded-lg overflow-hidden border border-slate-200 w-40 h-24">
                                                                        <img src={editedValues[setting.key]} alt="Preview" className="w-full h-full object-cover" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={editedValues[setting.key] || ''}
                                                                onChange={(e) => handleChange(setting.key, e.target.value)}
                                                                className={`w-full h-10 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${isChanged ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'
                                                                    }`}
                                                            />
                                                        )}
                                                        {isImageUrl && editedValues[setting.key] && (
                                                            false
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Action Bar */}
                    <div className={`sticky bottom-6 transition-all duration-300 ${hasChanges ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl shadow-slate-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-400">edit_note</span>
                                <span className="text-sm font-bold">
                                    {settings.filter(s => editedValues[s.key] !== s.value).length} unsaved change(s)
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleReset}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSaveAll}
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/30"
                                >
                                    {saving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Success Toast */}
                    {saveSuccess && (
                        <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl shadow-emerald-500/30 flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300 z-50">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="text-sm font-bold">Settings saved successfully!</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SiteSettings;
