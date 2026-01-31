import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Filter, Search } from 'lucide-react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { useSubmissions } from '../src/hooks';

const Submissions: React.FC = () => {
    const { submissions, loading } = useSubmissions();
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const filteredSubmissions = submissions.filter(sub => {
        const matchesFilter = filter === 'ALL' || sub.status === filter;
        const matchesSearch = sub.title?.toLowerCase().includes(search.toLowerCase()) || false;
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'bg-green-100 text-green-700 border-green-200';
            case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'SUBMITTED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1200px] mx-auto p-6 md:p-8 lg:p-10 flex flex-col gap-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Submissions</h1>
                        <p className="text-muted-foreground mt-1">Manage and track your manuscript submissions.</p>
                    </div>
                    <Link to="/submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
                        <Plus className="size-5" />
                        <span>New Submission</span>
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        {['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === status
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search submissions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground">Loading submissions...</div>
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-4">
                            <div className="size-12 rounded-full bg-accent flex items-center justify-center">
                                <FileText className="size-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-foreground font-medium">No submissions found</p>
                                <p className="text-sm text-muted-foreground">Get started by creating your first submission.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Title</th>
                                        <th className="px-6 py-4 font-medium">Journal</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredSubmissions.map((sub) => (
                                        <tr key={sub.id} className="group hover:bg-accent/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link to={`/submit?id=${sub.id}`} className="font-medium text-foreground hover:text-primary transition-colors block max-w-md truncate">
                                                    {sub.title || 'Untitled Submission'}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {sub.venue?.name || 'Not selected'}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                {sub.updated_at ? new Date(sub.updated_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(sub.status || 'DRAFT')}`}>
                                                    {sub.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/submit?id=${sub.id}`} className="text-sm font-medium text-primary hover:underline">
                                                    {sub.status === 'DRAFT' ? 'Edit' : 'View'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Submissions;
