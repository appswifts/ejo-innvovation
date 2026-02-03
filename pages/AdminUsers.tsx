import React, { useState } from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { UserPlus, Search, Mail, Calendar, Shield, X, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { useAdminUsers } from '../src/hooks';
import type { ProfileWithRole } from '../src/hooks/useAdminUsers';
import type { UserRoleType } from '../src/types/database';

const ROLES: { value: UserRoleType; label: string }[] = [
    { value: 'AUTHOR', label: 'Author' },
    { value: 'REVIEWER', label: 'Reviewer' },
    { value: 'ASSOCIATE_EDITOR', label: 'Associate Editor' },
    { value: 'EDITOR', label: 'Editor' },
    { value: 'MANAGING_EDITOR', label: 'Managing Editor' },
    { value: 'EDITOR_IN_CHIEF', label: 'Editor in Chief' },
    { value: 'ADMIN', label: 'Administrator' },
];

const AdminUsers: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { users, total, loading, error, updateUser, updateUserRole, deleteUser, refetch } = useAdminUsers({
        page,
        limit: 10,
        search: debouncedSearch
    });

    const totalPages = Math.ceil(total / 10);

    // Modal states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<ProfileWithRole | null>(null);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        full_name: '',
        affiliation: '',
        country: '',
        role: 'AUTHOR' as UserRoleType
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setTimeout(() => setDebouncedSearch(e.target.value), 500);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const openEditModal = (user: ProfileWithRole) => {
        setSelectedUser(user);
        setEditForm({
            full_name: user.full_name || '',
            affiliation: user.affiliation || '',
            country: user.country || '',
            role: (user.role as UserRoleType) || 'AUTHOR'
        });
        setEditModalOpen(true);
    };

    const openDeleteModal = (user: ProfileWithRole) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        setSaving(true);

        // Update profile
        const profileResult = await updateUser(selectedUser.id, {
            full_name: editForm.full_name,
            affiliation: editForm.affiliation,
            country: editForm.country
        });

        // Update role if changed
        if (editForm.role !== selectedUser.role) {
            await updateUserRole(selectedUser.id, editForm.role);
        }

        setSaving(false);
        setEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setSaving(true);
        await deleteUser(selectedUser.id);
        setSaving(false);
        setDeleteModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                        <p className="text-muted-foreground mt-1">View and manage registered users.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by name or email..."
                            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-6 flex items-center gap-2">
                        <AlertTriangle className="size-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* List */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Affiliation</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading && (
                                    [1, 2, 3].map((i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><div className="h-10 bg-muted rounded w-1/2 animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div></td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    ))
                                )}

                                {!loading && users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No users found.
                                        </td>
                                    </tr>
                                )}

                                {!loading && users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-accent/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {(user.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{user.full_name || 'No Name'}</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Mail className="size-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="size-4 text-muted-foreground" />
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'EDITOR_IN_CHIEF' ? 'bg-blue-100 text-blue-700' :
                                                        user.role === 'EDITOR' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {user.role?.replace('_', ' ') || 'User'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {user.affiliation || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="size-4" />
                                                {formatDate(user.created_at || '')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(user)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {total > 10 && (
                        <div className="p-4 border-t border-border flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to <span className="font-medium">{Math.min(page * 10, total)}</span> of <span className="font-medium">{total}</span> results
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 hover:bg-accent"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 hover:bg-accent"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {editModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-md w-full border border-border">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold">Edit User</h2>
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={selectedUser.email}
                                    disabled
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Affiliation</label>
                                <input
                                    type="text"
                                    value={editForm.affiliation}
                                    onChange={(e) => setEditForm({ ...editForm, affiliation: e.target.value })}
                                    placeholder="University or Organization"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Country</label>
                                <input
                                    type="text"
                                    value={editForm.country}
                                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                                    placeholder="Country"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRoleType })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    {ROLES.map((role) => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-border">
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveUser}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-md w-full border border-border">
                        <div className="p-6 text-center">
                            <div className="size-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="size-8 text-destructive" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Deactivate User?</h2>
                            <p className="text-muted-foreground mb-6">
                                Are you sure you want to deactivate <span className="font-medium text-foreground">{selectedUser.full_name || selectedUser.email}</span>?
                                This will remove their role and access to the platform.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-bold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Deactivating...' : 'Deactivate User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminUsers;
