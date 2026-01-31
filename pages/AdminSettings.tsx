import React from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';

const AdminSettings: React.FC = () => {
    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">System Settings</h1>

                <div className="max-w-2xl bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <div>
                        <h3 className="font-bold text-lg">General Configuration</h3>
                        <p className="text-sm text-muted-foreground">Platform name, contact checks, maintenance mode.</p>
                    </div>
                    <div className="h-px bg-border"></div>
                    <div>
                        <h3 className="font-bold text-lg">Email Settings</h3>
                        <p className="text-sm text-muted-foreground">SMTP configuration and templates.</p>
                    </div>
                    <div className="h-px bg-border"></div>
                    <div>
                        <h3 className="font-bold text-lg">Security</h3>
                        <p className="text-sm text-muted-foreground">Password policies, session timeouts.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettings;
