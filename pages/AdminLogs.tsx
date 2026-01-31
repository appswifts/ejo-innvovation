import React from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';

const AdminLogs: React.FC = () => {
    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">System Logs</h1>

                <div className="bg-black text-green-400 font-mono text-sm p-6 rounded-xl shadow-inner h-[600px] overflow-y-auto border border-border">
                    <p>[2024-10-24 10:23:45] INFO: System startup complete.</p>
                    <p>[2024-10-24 10:24:12] INFO: User login (ID: 452)</p>
                    <p>[2024-10-24 10:25:01] WARN: High latency detected on /api/v1/search</p>
                    <p>[2024-10-24 10:28:30] INFO: New submission received (ID: SUB-2024-001)</p>
                    <p className="animate-pulse">_</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminLogs;
