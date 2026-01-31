import React, { useState } from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Search, Filter, Eye, MoreHorizontal, Download } from 'lucide-react';
import { useAdminSubmissions } from '../src/hooks';
import { Link } from 'react-router-dom';

const AdminSubmissions: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const { submissions, total, loading, error } = useAdminSubmissions({
        page,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter
    });

    const totalPages = Math.ceil(total / 10);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        // Basic debounce
        setTimeout(() => setDebouncedSearch(e.target.value), 500);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            'DRAFT': 'bg-gray-100 text-gray-700',
            'SUBMITTED': 'bg-blue-100 text-blue-700',
            'UNDER_REVIEW': 'bg-yellow-100 text-yellow-700',
            'ACCEPTED': 'bg-green-100 text-green-700',
            'REJECTED': 'bg-red-100 text-red-700',
            'PUBLISHED': 'bg-purple-100 text-purple-700'
        };
        const defaultStyle = 'bg-gray-100 text-gray-700';
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status] || defaultStyle}`}>
                {status.replace('_', ' ')}
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
                                    <th className="px-6 py-4">Type</th>
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
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-20 animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24 animate-pulse"></div></td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    ))
                                )}

                                {!loading && submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
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
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {sub.submission_type?.label || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {formatDate(sub.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                // Assuming we will have a view page for admin like /admin/submissions/:id
                                                // For now linking to the generic preview or a new admin view
                                                to={`/submissions/${sub.id}`}
                                                className="inline-flex items-center justify-center size-8 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="size-4" />
                                            </Link>
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
        </DashboardLayout>
    );
};

export default AdminSubmissions;
