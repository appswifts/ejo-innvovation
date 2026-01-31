import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminStats {
    totalUsers: number;
    activeJournals: number;
    pendingSubmissions: number;
    monthlyRevenue: number;
    recentSubmissions: any[];
}

export function useAdminStats() {
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        activeJournals: 0,
        pendingSubmissions: 0,
        monthlyRevenue: 0,
        recentSubmissions: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true);

                // 1. Total Users (Count profiles)
                const { count: userCount, error: userError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                if (userError) throw userError;

                // 2. Active Journals
                const { count: journalCount, error: journalError } = await supabase
                    .from('venues')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true);

                if (journalError) throw journalError;

                // 3. Pending Submissions
                const { count: pendingCount, error: pendingError } = await supabase
                    .from('submissions')
                    .select('*', { count: 'exact', head: true })
                    .in('status', ['SUBMITTED', 'UNDER_REVIEW']);

                if (pendingError) throw pendingError;

                // 4. Recent Submissions
                // Note: We need to join with profiles to get author name. 
                // Assuming 'submitter_id' references 'profiles.id'
                const { data: recent, error: recentError } = await supabase
                    .from('submissions')
                    .select(`
                        id,
                        title,
                        status,
                        created_at,
                        submitter:profiles(full_name, email)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (recentError) throw recentError;

                setStats({
                    totalUsers: userCount || 0,
                    activeJournals: journalCount || 0,
                    pendingSubmissions: pendingCount || 0,
                    monthlyRevenue: 0, // Placeholder as we don't have payments yet
                    recentSubmissions: recent || []
                });

            } catch (err: any) {
                console.error('Error fetching admin stats:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    return { stats, loading, error };
}
