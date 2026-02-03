import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Plus, ArrowLeft, GripVertical, Edit, Trash2, X, ToggleLeft, Type, Hash, Calendar, FileText, Link as LinkIcon, Mail, List, CheckSquare } from 'lucide-react';
import { usePostTypeFields } from '../src/hooks/useAdminPostTypes';
import { supabase } from '../src/lib/supabase';

const FIELD_TYPES = [
    { value: 'TEXT', label: 'Text', icon: Type, description: 'Single line text input' },
    { value: 'TEXTAREA', label: 'Textarea', icon: FileText, description: 'Multi-line text input' },
    { value: 'NUMBER', label: 'Number', icon: Hash, description: 'Numeric input' },
    { value: 'DATE', label: 'Date', icon: Calendar, description: 'Date picker' },
    { value: 'BOOLEAN', label: 'Checkbox', icon: CheckSquare, description: 'True/False toggle' },
    { value: 'SELECT', label: 'Select', icon: List, description: 'Dropdown selection' },
    { value: 'MULTISELECT', label: 'Multi-select', icon: List, description: 'Multiple selection' },
    { value: 'FILE', label: 'File Upload', icon: FileText, description: 'File attachment' },
    { value: 'URL', label: 'URL', icon: LinkIcon, description: 'Web link' },
    { value: 'EMAIL', label: 'Email', icon: Mail, description: 'Email address' },
];

const AdminPostTypeFields: React.FC = () => {
    const { id: postTypeId } = useParams<{ id: string }>();
    const { fields, loading, fetchFields, createField, updateField, deleteField } = usePostTypeFields(postTypeId || null);

    const [postType, setPostType] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<any>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [formData, setFormData] = useState({
        key: '',
        label: '',
        description: '',
        field_type: 'TEXT',
        is_required: false,
        section: '',
        options: '' // For SELECT/MULTISELECT, comma-separated
    });

    // Fetch post type info
    useEffect(() => {
        if (postTypeId) {
            supabase
                .from('submission_types')
                .select('*')
                .eq('id', postTypeId)
                .single()
                .then(({ data }) => setPostType(data));
        }
    }, [postTypeId]);

    const resetForm = () => {
        setFormData({
            key: '',
            label: '',
            description: '',
            field_type: 'TEXT',
            is_required: false,
            section: '',
            options: ''
        });
        setEditingField(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (field: any) => {
        setEditingField(field);
        setFormData({
            key: field.key || '',
            label: field.label || '',
            description: field.description || '',
            field_type: field.field_type || 'TEXT',
            is_required: field.is_required || false,
            section: field.section || '',
            options: field.options ? field.options.map((o: any) => o.value || o).join(', ') : ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postTypeId) return;
        setIsActionLoading(true);

        // Parse options for SELECT/MULTISELECT
        let options = null;
        if (['SELECT', 'MULTISELECT'].includes(formData.field_type) && formData.options.trim()) {
            options = formData.options.split(',').map(o => o.trim()).filter(Boolean).map(o => ({ value: o, label: o }));
        }

        const fieldData = {
            submission_type_id: postTypeId,
            key: formData.key,
            label: formData.label,
            description: formData.description || null,
            field_type: formData.field_type as 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT' | 'FILE' | 'URL' | 'EMAIL' | 'ORCID',
            is_required: formData.is_required,
            section: formData.section || null,
            options: options,
            display_order: editingField ? editingField.display_order : fields.length
        };

        let result;
        if (editingField) {
            const { submission_type_id, display_order, ...updateData } = fieldData;
            result = await updateField(editingField.id, updateData as any);
        } else {
            result = await createField(fieldData as any);
        }

        if (result.success) {
            await fetchFields();
            setIsModalOpen(false);
            resetForm();
        } else {
            alert('Failed: ' + (result.error || 'Unknown error'));
        }
        setIsActionLoading(false);
    };

    const handleDelete = async (field: any) => {
        if (!confirm(`Delete field "${field.label}"? This cannot be undone.`)) return;

        setIsActionLoading(true);
        const result = await deleteField(field.id);
        if (result.success) {
            await fetchFields();
        } else {
            alert('Failed to delete: ' + (result.error || 'Unknown error'));
        }
        setIsActionLoading(false);
    };

    const getFieldIcon = (type: string) => {
        const fieldType = FIELD_TYPES.find(ft => ft.value === type);
        return fieldType ? fieldType.icon : Type;
    };

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="mb-6">
                    <Link to="/admin/post-types" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-4">
                        <ArrowLeft className="size-4" /> Back to Post Types
                    </Link>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                {postType?.label || 'Post Type'} Fields
                            </h1>
                            <p className="text-muted-foreground mt-1">Configure the fields users will fill out when submitting this type.</p>
                        </div>
                        <button
                            onClick={handleOpenCreate}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition"
                        >
                            <Plus className="size-5" />
                            <span>Add Field</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                ) : fields.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                        <div className="size-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">No Fields Configured</h3>
                        <p className="mb-4">Add fields to define what information users provide when submitting.</p>
                        <button
                            onClick={handleOpenCreate}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold"
                        >
                            <Plus className="size-4" /> Add First Field
                        </button>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 border-b border-border bg-secondary/50 text-xs font-bold uppercase text-muted-foreground">
                            <div className="w-6"></div>
                            <div>Field</div>
                            <div className="w-24 text-center">Type</div>
                            <div className="w-20 text-center">Required</div>
                            <div className="w-20 text-center">Actions</div>
                        </div>
                        {fields.map((field, index) => {
                            const FieldIcon = getFieldIcon(field.field_type);
                            return (
                                <div key={field.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 border-b border-border last:border-0 items-center hover:bg-secondary/30 transition-colors">
                                    <div className="w-6 flex items-center">
                                        <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-foreground flex items-center gap-2">
                                            <FieldIcon className="size-4 text-primary" />
                                            {field.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono">key: {field.key}</div>
                                    </div>
                                    <div className="w-24 text-center">
                                        <span className="text-xs bg-secondary px-2 py-1 rounded font-medium">
                                            {field.field_type}
                                        </span>
                                    </div>
                                    <div className="w-20 text-center">
                                        {field.is_required ? (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">Yes</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No</span>
                                        )}
                                    </div>
                                    <div className="w-20 flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => handleOpenEdit(field)}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                        >
                                            <Edit className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(field)}
                                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl shadow-xl w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
                            <h2 className="text-xl font-bold">{editingField ? 'Edit Field' : 'Add Field'}</h2>
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
                                    placeholder="e.g. Featured Image"
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
                                    placeholder="e.g. featured_image"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Field Type <span className="text-destructive">*</span></label>
                                <select
                                    value={formData.field_type}
                                    onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    {FIELD_TYPES.map(ft => (
                                        <option key={ft.value} value={ft.value}>{ft.label} - {ft.description}</option>
                                    ))}
                                </select>
                            </div>

                            {['SELECT', 'MULTISELECT'].includes(formData.field_type) && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Options (comma-separated) <span className="text-destructive">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.options}
                                        onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. Option1, Option2, Option3"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Help text for users"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Section (optional)</label>
                                <input
                                    type="text"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. Basic Info, Media, etc."
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_required}
                                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                                    className="rounded border-border"
                                />
                                <span className="text-sm font-medium">Required field</span>
                            </label>

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
                                    {editingField ? 'Save Changes' : 'Add Field'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminPostTypeFields;
