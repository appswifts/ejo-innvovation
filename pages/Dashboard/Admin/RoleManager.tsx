
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Role, Permission } from '../../../types';

const RoleManager: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({}); // roleId -> permissionIds[]
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch Roles
        const { data: rolesData } = await supabase.from('roles').select('*').order('name');

        // Fetch Permissions
        const { data: permissionsData } = await supabase.from('permissions').select('*').order('slug');

        // Fetch Junctions
        const { data: junctionData } = await supabase.from('role_permissions').select('*');

        if (rolesData) setRoles(rolesData as Role[]);
        if (permissionsData) setPermissions(permissionsData as Permission[]);

        // Process map
        const map: Record<string, string[]> = {};
        junctionData?.forEach((j: any) => {
            if (!map[j.role_id]) map[j.role_id] = [];
            map[j.role_id].push(j.permission_id);
        });
        setRolePermissions(map);

        setLoading(false);
    };

    const togglePermission = async (roleId: string, permissionId: string, hasPermission: boolean) => {
        // Optimistic UI update
        const currentList = rolePermissions[roleId] || [];
        let newList;

        if (hasPermission) {
            // Remove it
            newList = currentList.filter(id => id !== permissionId);
            await supabase.from('role_permissions').delete().match({ role_id: roleId, permission_id: permissionId });
        } else {
            // Add it
            newList = [...currentList, permissionId];
            await supabase.from('role_permissions').insert({ role_id: roleId, permission_id: permissionId });
        }

        setRolePermissions(prev => ({
            ...prev,
            [roleId]: newList
        }));
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading RBAC system...</div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Role & Permission Manager</h1>
                    <p className="text-slate-500">Configure what each role can do on the platform.</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">add_moderator</span> Create New Role
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 border-r border-slate-200 w-64 min-w-[250px]">
                                Permission / Capability
                            </th>
                            {roles.map(role => (
                                <th key={role.id} className="px-4 py-4 text-center min-w-[120px]">
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-slate-900">{role.name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono mt-1">{role.slug}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {permissions.map(perm => (
                            <tr key={perm.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 sticky left-0 bg-white z-10 border-r border-slate-100">
                                    <p className="text-sm font-bold text-slate-700 font-mono">{perm.slug}</p>
                                    <p className="text-xs text-slate-500">{perm.description}</p>
                                </td>
                                {roles.map(role => {
                                    const hasPerm = rolePermissions[role.id]?.includes(perm.id);
                                    const isSuperAdmin = role.slug === 'super_admin';

                                    return (
                                        <td key={`${role.id}-${perm.id}`} className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={hasPerm || isSuperAdmin}
                                                disabled={isSuperAdmin}
                                                onChange={() => togglePermission(role.id, perm.id, hasPerm)}
                                                className={`size-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer ${isSuperAdmin ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleManager;
