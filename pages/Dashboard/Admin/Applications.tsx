import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

interface Application {
    id: string;
    user_id: string;
    type: 'author' | 'book_seller' | 'both';
    status: 'pending' | 'approved' | 'rejected';
    data: any;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
}

const AdminApplications: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                profiles:user_id (full_name, email)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to load applications');
            console.error(error);
        } else {
            setApplications(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = async (id: string, action: 'approved' | 'rejected', type: string, userId: string) => {
        const { error } = await supabase
            .from('applications')
            .update({ status: action })
            .eq('id', id);

        if (error) {
            toast.error(`Failed to ${action} application`);
            return;
        }

        if (action === 'approved') {
            // Update User Role
            let newRoleSlug = 'reader';
            if (type === 'author') newRoleSlug = 'author';
            else if (type === 'book_seller') newRoleSlug = 'book_seller';
            else if (type === 'both') newRoleSlug = 'author_bookseller';

            // Get role id
            const { data: roleData } = await supabase
                .from('roles')
                .select('id')
                .eq('slug', newRoleSlug)
                .single();

            if (roleData) {
                const { error: roleError } = await supabase
                    .from('profiles')
                    .update({ role_id: roleData.id })
                    .eq('id', userId);

                if (roleError) toast.error('Application approved but role update failed.');
                else toast.success(`Application approved! User is now ${newRoleSlug}`);
            } else {
                toast.error('Role not found.');
            }
        } else {
            toast.success('Application rejected.');
        }

        fetchApplications();
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Pending Applications</h1>

            {loading ? (
                <div className="flex justify-center p-12"><span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span></div>
            ) : applications.length === 0 ? (
                <div className="text-center p-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                    <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                    <p>No pending applications</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${app.type === 'author' ? 'bg-blue-100 text-blue-700' :
                                        app.type === 'book_seller' ? 'bg-purple-100 text-purple-700' :
                                            'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {app.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-slate-400 text-sm">• {new Date(app.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{app.profiles?.full_name || 'Unknown User'}</h3>
                                <p className="text-slate-500 text-sm mb-4">{app.profiles?.email}</p>

                                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                                    {app.data?.degree_url && (
                                        <div className="col-span-2">
                                            <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Credentials</span>
                                            <a href={app.data.degree_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">attachment</span> View Degree
                                            </a>
                                        </div>
                                    )}
                                    {app.data?.categories?.length > 0 && (
                                        <div>
                                            <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Interests</span>
                                            <p>{app.data.categories.join(', ')}</p>
                                        </div>
                                    )}
                                    {app.data?.journals?.length > 0 && (
                                        <div>
                                            <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Journals</span>
                                            <p>{app.data.journals.join(', ')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <button
                                    onClick={() => handleAction(app.id, 'approved', app.type, app.user_id)}
                                    className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined">check</span> Approve
                                </button>
                                <button
                                    onClick={() => handleAction(app.id, 'rejected', app.type, app.user_id)}
                                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined">close</span> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminApplications;
