
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface DashboardStats {
    totalManuscripts: number;
    pendingReviews: number;
    published: number;
    totalEarnings: number;
}

interface ActivityItem {
    id: string;
    type: string;
    description: string;
    created_at: string;
}

const Overview: React.FC = () => {
    const { profile, user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalManuscripts: 0,
        pendingReviews: 0,
        published: 0,
        totalEarnings: 0
    });
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile && user) {
            fetchDashboardData();
        }
    }, [profile, user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const isAuthor = profile?.role?.slug === 'author';
            const isAdmin = ['super_admin', 'editor', 'finance_admin'].includes(profile?.role?.slug || '');

            // 1. Fetch Manuscript Stats
            let manuscriptQuery = supabase.from('manuscripts').select('status', { count: 'exact' });
            if (isAuthor) {
                manuscriptQuery = manuscriptQuery.eq('submitter_id', user?.id);
            }

            const { data: manuscriptData, count: totalCount } = await manuscriptQuery;

            const pending = manuscriptData?.filter(m => m.status === 'under_review' || m.status === 'submitted').length || 0;
            const published = manuscriptData?.filter(m => m.status === 'published').length || 0;

            // 2. Fetch Earnings / Revenue
            let transactionQuery = supabase.from('transactions').select('amount').eq('status', 'completed');
            if (isAuthor) {
                transactionQuery = transactionQuery.eq('user_id', user?.id); // Authors see their total spending/payments
            }

            const { data: transData } = await transactionQuery;
            const earnings = transData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

            setStats({
                totalManuscripts: totalCount || 0,
                pendingReviews: pending,
                published: published,
                totalEarnings: earnings
            });

            // 3. Fetch Recent Activity (Latest 5 Manuscripts as proxy for activity)
            let activityQuery = supabase.from('manuscripts').select('id, title, status, updated_at').order('updated_at', { ascending: false }).limit(5);
            if (isAuthor) {
                activityQuery = activityQuery.eq('submitter_id', user?.id);
            }

            const { data: recentData } = await activityQuery;
            if (recentData) {
                setRecentActivity(recentData.map(m => ({
                    id: m.id,
                    type: 'Submission Update',
                    description: `"${m.title}" is currently ${m.status.replace('_', ' ')}`,
                    created_at: m.updated_at
                })));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Manuscripts', value: stats.totalManuscripts.toString(), icon: 'article', color: 'bg-blue-50 text-blue-600' },
        { label: profile?.role?.slug === 'author' ? 'Under Review' : 'Pending Action', value: stats.pendingReviews.toString(), icon: 'pending_actions', color: 'bg-amber-50 text-amber-600' },
        { label: 'Published Articles', value: stats.published.toString(), icon: 'check_circle', color: 'bg-green-50 text-green-600' },
    ];

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0]}</h1>
                <p className="text-slate-500 text-sm">Here's a bird's eye view of your publishing activities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:border-primary/50 transition-colors group">
                        <div className={`size-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${stat.color}`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h2>
                        <span className="material-symbols-outlined text-slate-400 text-sm">more_horiz</span>
                    </div>
                    <div className="p-6">
                        {recentActivity.length > 0 ? (
                            <div className="space-y-6">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 items-start group">
                                        <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">history_edu</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                <span className="font-bold text-slate-900">{activity.type}</span>: {activity.description}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(activity.created_at).toLocaleString()}</p>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-sm text-slate-400 hover:text-primary">arrow_forward</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">inbox</span>
                                <p className="text-slate-400 text-xs font-bold">No recent activities found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative z-10">
                            <h2 className="text-lg font-black mb-1">Platform News</h2>
                            <p className="text-slate-400 text-xs mb-6 font-medium">What's new at Nkiza Center for Research.</p>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                <span className="bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded uppercase mb-2 inline-block tracking-widest">Update</span>
                                <h3 className="font-bold text-xs mb-1">Unified Checkout Live</h3>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">We've simplified the publication process with our new unified payment gateway.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-8 text-white">
                        <h2 className="text-lg font-black mb-1">Need help?</h2>
                        <p className="text-indigo-100 text-xs mb-6 font-medium">Our editorial team is here for you.</p>
                        <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-colors shadow-lg">Contact Support</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
