import React from 'react';
import { Users, BookOpen, FileText, DollarSign, Activity, Settings as SettingsIcon, Book } from 'lucide-react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Link } from 'react-router-dom';
import { useAdminStats } from '../src/hooks';

const AdminDashboard: React.FC = () => {
    const { stats, loading } = useAdminStats();

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: 'Total Registered', icon: Users, color: 'text-blue-600 bg-blue-100' },
        { label: 'Active Journals', value: stats.activeJournals.toString(), change: 'Live Venues', icon: BookOpen, color: 'text-purple-600 bg-purple-100' },
        { label: 'Pending Submissions', value: stats.pendingSubmissions.toString(), change: 'Requires Action', icon: FileText, color: 'text-yellow-600 bg-yellow-100' },
        { label: 'Monthly Revenue', value: '$' + stats.monthlyRevenue.toLocaleString(), change: 'Estimated', icon: DollarSign, color: 'text-green-600 bg-green-100' },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8 flex flex-col gap-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Overview</h1>
                        <p className="text-muted-foreground mt-1">System status, user management, and platform analytics.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-colors">
                            Generate Report
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {loading ? <span className="animate-pulse bg-muted h-8 w-16 block rounded"></span> : stat.value}
                                    </h3>
                                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full mt-2 inline-block">
                                        {stat.change}
                                    </span>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <Icon className="size-5" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Activity / Submissions */}
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="font-bold text-lg">Recent Submissions</h3>
                            <Link to="/admin/submissions" className="text-sm text-primary font-medium hover:underline">View All</Link>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Author</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        // Loading Skeleton
                                        [1, 2, 3].map((i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div></td>
                                                <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div></td>
                                                <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-20 animate-pulse"></div></td>
                                                <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24 animate-pulse"></div></td>
                                            </tr>
                                        ))
                                    ) : stats.recentSubmissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                No submissions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        stats.recentSubmissions.map((sub: any) => (
                                            <tr key={sub.id} className="group hover:bg-accent/50 transition-colors">
                                                <td className="px-6 py-4 font-medium truncate max-w-[200px]" title={sub.title}>
                                                    {sub.title}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {sub.submitter?.full_name || sub.submitter?.email || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold 
                                                        ${sub.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                                                            sub.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                                                                sub.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                                    sub.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                        'bg-gray-100 text-gray-700'}`}>
                                                        {sub.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">{formatDate(sub.created_at)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions / System Status */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/admin/journals" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-all bg-background text-center">
                                    <BookOpen className="size-6 text-primary" />
                                    <span className="text-xs font-medium">Manage Journals</span>
                                </Link>
                                <Link to="/admin/users" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-all bg-background text-center">
                                    <Users className="size-6 text-blue-600" />
                                    <span className="text-xs font-medium">Manage Users</span>
                                </Link>
                                <Link to="/admin/books" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-all bg-background text-center">
                                    <Book className="size-6 text-indigo-600" />
                                    <span className="text-xs font-medium">Manage Books</span>
                                </Link>
                                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-all bg-background text-center">
                                    <Activity className="size-6 text-green-600" />
                                    <span className="text-xs font-medium">Logs</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex-1">
                            <h3 className="font-bold text-lg mb-4">System Health</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Database Status</span>
                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Healthy</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Storage Usage</span>
                                    <span className="text-sm font-medium">45%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full w-[45%]"></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">API Latency</span>
                                    <span className="text-sm font-medium">24ms</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
