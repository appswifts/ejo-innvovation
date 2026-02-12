
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { UserProfile } from '../../../types';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [roles, setRoles] = useState<{ id: string, slug: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [usersRes, rolesRes] = await Promise.all([
            supabase.from('profiles').select('*, role:role_id(*)'),
            supabase.from('roles').select('id, slug, name').order('name')
        ]);

        if (usersRes.data) setUsers(usersRes.data as UserProfile[]);
        if (rolesRes.data) setRoles(rolesRes.data);
        setLoading(false);
    };

    const updateUserRole = async (userId: string, newRoleSlug: string) => {
        const role = roles.find(r => r.slug === newRoleSlug);
        if (!role) {
            alert('Role not found.');
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role_id: role.id })
            .eq('id', userId)
            .select();

        if (error) {
            alert(`Failed to update role: ${error.message}`);
        } else {
            await fetchData();
        }
    };

    const deleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName || 'Unnamed'}"? This action cannot be undone.`)) return;

        try {
            // Delete the profile (cascading will handle related records based on FK constraints)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            alert('User deleted successfully.');
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert('Error deleting user: ' + error.message);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage platform users, assign roles, and remove accounts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm w-64"
                        />
                    </div>
                    <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all text-slate-700">
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Institution</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                                                {user.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-medium text-slate-900">{user.full_name || 'Unnamed User'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{user.institution || '-'}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role?.slug || ''}
                                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                                            className="bg-slate-100 border-none rounded-md text-xs font-bold uppercase tracking-wider text-slate-700 p-2 cursor-pointer focus:ring-2 focus:ring-primary"
                                        >
                                            {roles.map(role => (
                                                <option key={role.id} value={role.slug}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => deleteUser(user.id, user.full_name)}
                                            className="flex items-center gap-1 text-slate-400 hover:text-red-600 transition-colors text-sm font-medium"
                                            title="Delete User"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                        {searchTerm ? 'No users match your search.' : 'No users found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-4 text-right text-xs text-slate-400">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} total
            </div>
        </div>
    );
};

export default UserManagement;
