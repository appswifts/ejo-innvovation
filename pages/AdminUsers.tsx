import React from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { UserPlus } from 'lucide-react';

const AdminUsers: React.FC = () => {
    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition">
                        <UserPlus className="size-5" />
                        <span>Add User</span>
                    </button>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 text-center text-muted-foreground py-20">
                        User list and role management will go here.
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUsers;
