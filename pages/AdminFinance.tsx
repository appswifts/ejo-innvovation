import React from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { useAdminFinance } from '../src/hooks/useAdminFinance';
import { DollarSign, TrendingUp, CreditCard, Calendar, User, Search, Filter } from 'lucide-react';

const AdminFinance: React.FC = () => {
    const { transactions, stats, loading } = useAdminFinance();

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Financial Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <DollarSign className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <h3 className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <CreditCard className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                                <h3 className="text-2xl font-bold">{stats.count}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <TrendingUp className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg. Purchase Value</p>
                                <h3 className="text-2xl font-bold">
                                    ${stats.count > 0 ? (stats.totalRevenue / stats.count).toFixed(2) : '0.00'}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Transaction History</h3>
                        {/* Placeholder filters */}
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary">
                                <Filter className="size-4" /> Filter
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-secondary/50 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground bg-secondary/20 rounded-lg">
                            No transactions found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-muted-foreground font-medium border-b border-border">
                                    <tr>
                                        <th className="pb-3 pl-2">Date</th>
                                        <th className="pb-3">User</th>
                                        <th className="pb-3">Item</th>
                                        <th className="pb-3">Amount</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Provider</th>
                                        <th className="pb-3 text-right pr-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="group hover:bg-secondary/30 transition-colors">
                                            <td className="py-4 pl-2 font-mono text-xs">
                                                {new Date(tx.created_at).toLocaleDateString()} <br />
                                                <span className="text-muted-foreground">{new Date(tx.created_at).toLocaleTimeString()}</span>
                                            </td>
                                            <td className="py-4">
                                                <div className="font-medium text-foreground">{tx.user?.full_name || 'Unknown User'}</div>
                                                <div className="text-xs text-muted-foreground">{tx.user?.email}</div>
                                            </td>
                                            <td className="py-4">
                                                <div className="font-medium max-w-[200px] truncate" title={tx.submission?.title}>
                                                    {tx.submission?.title || 'Unknown Item'}
                                                </div>
                                            </td>
                                            <td className="py-4 font-bold">
                                                {tx.currency} {tx.amount}
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                        tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-muted-foreground text-xs uppercase">
                                                {tx.provider}
                                            </td>
                                            <td className="py-4 text-right pr-2">
                                                <button className="text-primary hover:underline text-xs">
                                                    View Receipt
                                                </button>
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

export default AdminFinance;
