
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface Role {
    id: string;
    name: string;
    slug: string;
    description: string;
}

const Roles: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<Partial<Role>>({ name: '', slug: '', description: '' });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .order('name');

        if (data) setRoles(data);
        if (error) console.error('Error fetching roles:', error);
        setLoading(false);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData(role);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) return;

        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting role:', error);
            alert(`Failed to delete role: ${error.message}`);
        } else {
            fetchRoles();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingRole) {
                // Update
                const { error } = await supabase
                    .from('roles')
                    .update({
                        name: formData.name,
                        slug: formData.slug,
                        description: formData.description
                    })
                    .eq('id', editingRole.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('roles')
                    .insert([{
                        name: formData.name,
                        slug: formData.slug, // Slug should ideally be auto-generated or validated
                        description: formData.description
                    }]);

                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditingRole(null);
            setFormData({ name: '', slug: '', description: '' });
            fetchRoles();
        } catch (error: any) {
            console.error('Error saving role:', error);
            alert(`Failed to save role: ${error.message}`);
        }
    };

    const openCreateModal = () => {
        setEditingRole(null);
        setFormData({ name: '', slug: '', description: '' });
        setIsModalOpen(true);
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Role Management</h1>
                    <p className="text-slate-500">Create and manage system user roles.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <span className="material-symbols-outlined">add_moderator</span> Create Role
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading roles...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {roles.map(role => (
                                <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{role.name}</td>
                                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{role.slug}</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm max-w-xs truncate" title={role.description}>{role.description}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(role)}
                                                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 transition"
                                                title="Edit Role"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role.id)}
                                                className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition"
                                                title="Delete Role"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {roles.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 italic">No roles defined yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-900">{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Role Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Content Editor"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Slug (Unique ID)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                    placeholder="e.g. content_editor"
                                />
                                <p className="text-xs text-slate-400 mt-1">Used in code to identify this role. Lowercase, no spaces.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all min-h-[80px]"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Briefly describe what this role can do..."
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-primary/25"
                                >
                                    {editingRole ? 'Save Changes' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;
