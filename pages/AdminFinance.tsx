import React from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';

const AdminFinance: React.FC = () => {
    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Financial Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-lg mb-2">Revenue Streams</h3>
                        <div className="h-40 bg-secondary/50 rounded-lg flex items-center justify-center text-muted-foreground">Chart Placeholder</div>
                    </div>
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-lg mb-2">Payouts Pending</h3>
                        <div className="h-40 bg-secondary/50 rounded-lg flex items-center justify-center text-muted-foreground">List Placeholder</div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Transaction History</h3>
                    <div className="text-center py-10 text-muted-foreground">
                        Transaction table will go here.
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminFinance;
