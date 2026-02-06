
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { UserProfile } from '../../../types';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [roles, setRoles] = useState<{ id: string, slug: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [usersRes, rolesRes] = await Promise.all([
            supabase.from('profiles').select('*, role:role_id(*)'),
            supabase.from('roles').select('id, slug')
        ]);

        if (usersRes.data) setUsers(usersRes.data as UserProfile[]);
        if (rolesRes.data) setRoles(rolesRes.data);
        setLoading(false);
    };

    const updateUserRole = async (userId: string, newRoleSlug: string) => {
        const role = roles.find(r => r.slug === newRoleSlug);
        if (!role) return;

        const { error } = await supabase
            .from('profiles')
            .update({ role_id: role.id })
            .eq('id', userId);

        if (!error) {
            fetchData(); // Refresh
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500">Manage platform users and assign roles.</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">person_add</span> Invite User
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading users...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Institution</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
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
                                            <option value="author">Author</option>
                                            <option value="reviewer">Reviewer</option>
                                            <option value="editor">Editor</option>
                                            <option value="finance_admin">Finance</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-slate-400 hover:text-red-600 transition-colors">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
