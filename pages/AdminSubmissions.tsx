import React, { useState } from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Search, Filter, Eye, MoreHorizontal, Download, Trash2, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { useAdminSubmissions, useSubmissionTypes } from '../src/hooks';
import { Link } from 'react-router-dom';
import type { SubmissionStatus } from '../src/types/database';

const STATUSES: SubmissionStatus[] = [
    'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED',
    'REVISION_SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN',
    'IN_PRODUCTION', 'PUBLISHED'
];

const AdminSubmissions: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    const { types, loading: typesLoading } = useSubmissionTypes();

    const { submissions, total, loading, error, updateSubmissionStatus, deleteSubmission } = useAdminSubmissions({
        page,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter,
        submissionTypeId: typeFilter
    });

    const totalPages = Math.ceil(total / 10);

    // Modal states
    const [editStatusModalOpen, setEditStatusModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [newStatus, setNewStatus] = useState<SubmissionStatus>('SUBMITTED');
    const [saving, setSaving] = useState(false);

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

    const openEditStatusModal = (submission: any) => {
        setSelectedSubmission(submission);
        setNewStatus(submission.status);
        setEditStatusModalOpen(true);
    };

    const openDeleteModal = (submission: any) => {
        setSelectedSubmission(submission);
        setDeleteModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedSubmission) return;
        setSaving(true);
        await updateSubmissionStatus(selectedSubmission.id, newStatus);
        setSaving(false);
        setEditStatusModalOpen(false);
        setSelectedSubmission(null);
    };

    const handleDeleteSubmission = async () => {
        if (!selectedSubmission) return;
        setSaving(true);
        await deleteSubmission(selectedSubmission.id);
        setSaving(false);
        setDeleteModalOpen(false);
        setSelectedSubmission(null);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            'DRAFT': 'bg-gray-100 text-gray-700',
            'SUBMITTED': 'bg-blue-100 text-blue-700',
            'UNDER_REVIEW': 'bg-yellow-100 text-yellow-700',
            'ACCEPTED': 'bg-green-100 text-green-700',
            'REJECTED': 'bg-red-100 text-red-700',
            'PUBLISHED': 'bg-purple-100 text-purple-700',
            'WITHDRAWN': 'bg-gray-200 text-gray-500 line-through'
        };
        const defaultStyle = 'bg-gray-100 text-gray-700';
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status] || defaultStyle}`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">All Submissions</h1>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition">
                            <Download className="size-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by title, abstract..."
                            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    setStatusFilter(s === 'ALL' ? null : s);
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${(s === 'ALL' && !statusFilter) || statusFilter === s
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                    }`}
                            >
                                {s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Type Filter */}
                    <div className="w-full md:w-48">
                        <select
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={typeFilter || ''}
                            onChange={(e) => {
                                setTypeFilter(e.target.value || null);
                                setPage(1);
                            }}
                        >
                            <option value="">All Types</option>
                            {types.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* List */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Author</th>
                                    <th className="px-6 py-4">Venue</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading && (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-20 animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24 animate-pulse"></div></td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    ))
                                )}

                                {!loading && submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            No submissions found matching your filters.
                                        </td>
                                    </tr>
                                )}

                                {!loading && submissions.map((sub) => (
                                    <tr key={sub.id} className="group hover:bg-accent/50 transition-colors">
                                        <td className="px-6 py-4 font-medium max-w-[300px]">
                                            <div className="truncate" title={sub.title}>{sub.title}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5 truncate">{sub.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="size-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                                                    {(sub.submitter?.full_name?.[0] || sub.submitter?.email?.[0] || '?').toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{sub.submitter?.full_name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">{sub.submitter?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {sub.venue?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {formatDate(sub.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Quick Actions */}
                                                {sub.status === 'SUBMITTED' || sub.status === 'UNDER_REVIEW' ? (
                                                    <>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm('Are you sure you want to approve this submission?')) {
                                                                    await updateSubmissionStatus(sub.id, 'ACCEPTED');
                                                                }
                                                            }}
                                                            className="inline-flex items-center justify-center size-8 rounded hover:bg-green-100 text-muted-foreground hover:text-green-700 transition-colors"
                                                            title="Approve / Accept"
                                                        >
                                                            <CheckCircle className="size-4" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const reason = prompt('Reason for rejection (optional):');
                                                                if (reason !== null) {
                                                                    await updateSubmissionStatus(sub.id, 'REJECTED');
                                                                    // Note: In a real app we'd save the reason
                                                                }
                                                            }}
                                                            className="inline-flex items-center justify-center size-8 rounded hover:bg-red-100 text-muted-foreground hover:text-red-700 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="size-4" />
                                                        </button>
                                                    </>
                                                ) : null}

                                                <Link
                                                    to={`/submissions/${sub.id}`}
                                                    className="inline-flex items-center justify-center size-8 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                                <button
                                                    onClick={() => openEditStatusModal(sub)}
                                                    className="inline-flex items-center justify-center size-8 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                                    title="Change Status (Advanced)"
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(sub)}
                                                    className="inline-flex items-center justify-center size-8 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Delete Submission"
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

            {/* Change Status Modal */}
            {editStatusModalOpen && selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-sm w-full border border-border">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="font-bold">Change Status</h2>
                            <button
                                onClick={() => setEditStatusModalOpen(false)}
                                className="p-1 hover:bg-secondary rounded-lg transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Update status for <span className="font-medium text-foreground">{selectedSubmission.title}</span>
                            </p>
                            <div>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as SubmissionStatus)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    {STATUSES.map((status) => (
                                        <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-border">
                            <button
                                onClick={() => setEditStatusModalOpen(false)}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={saving}
                                className="px-3 py-1.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-sm w-full border border-border">
                        <div className="p-6 text-center">
                            <div className="size-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="size-6 text-destructive" />
                            </div>
                            <h2 className="font-bold mb-2">Delete Submission?</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Are you sure you want to delete this submission? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteSubmission}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-bold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Deleting...' : 'Delete Permanently'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminSubmissions;
