import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Application {
    id: string;
    type: 'author' | 'book_seller' | 'both';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    data: any;
}

const UserApplications: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, [user]);

    const fetchApplications = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to load applications');
        } else {
            setApplications(data || []);
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Applications</h1>
                    <p className="text-slate-500 mt-1">Track the status of your role upgrade requests</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/applications/new')}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                    <span className="material-symbols-outlined">add</span>
                    New Application
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
                </div>
            ) : applications.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Application Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Date Submitted</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applications.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 capitalize font-medium text-slate-900">
                                        {app.type.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {app.type === 'author' && (
                                            <div>
                                                <span className="block">Journals: {app.data?.journals?.length || 0}</span>
                                            </div>
                                        )}
                                        {app.type === 'book_seller' && (
                                            <div>
                                                <span className="block">Categories: {app.data?.categories?.length || 0}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-slate-400">assignment_late</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Applications Yet</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't submitted any applications to upgrade your role yet.</p>
                    <button
                        onClick={() => navigate('/dashboard/applications/new')}
                        className="text-primary font-bold hover:underline"
                    >
                        Start an Application
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserApplications;
