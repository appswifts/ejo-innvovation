import React from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { useAdminLogs } from '../src/hooks/useAdminLogs';
import { Loader2, History, AlertCircle } from 'lucide-react';

const AdminLogs: React.FC = () => {
    const { logs, loading, error, page, setPage, total, pageSize } = useAdminLogs();
    const totalPages = Math.ceil(total / pageSize);

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Logs</h1>
                    <p className="text-muted-foreground mt-1">Track administrative actions and system events.</p>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-border bg-secondary/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium">
                            <History className="size-4" /> Recent Activity
                        </div>
                        <span className="text-xs text-muted-foreground">Total: {total.toLocaleString()}</span>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="size-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-destructive">
                            <AlertCircle className="size-10 mx-auto mb-2" />
                            <p>Error loading logs: {error}</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <p>No logs found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-secondary/30 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex gap-2">
                                            <span className="font-bold text-foreground">{log.action}</span>
                                            {log.target && <span className="text-muted-foreground">on {log.target}</span>}
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                                        <span>User: {log.user?.email || 'Unknown'}</span>
                                        {log.ip_address && <span className="text-xs bg-secondary px-1.5 rounded">IP: {log.ip_address}</span>}
                                    </div>
                                    {log.details && Object.keys(log.details).length > 0 && (
                                        <pre className="text-xs bg-secondary/50 p-2 rounded overflow-x-auto font-mono text-muted-foreground max-w-full">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-border flex justify-between items-center bg-secondary/20">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-background hover:bg-secondary disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                                className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-background hover:bg-secondary disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminLogs;
