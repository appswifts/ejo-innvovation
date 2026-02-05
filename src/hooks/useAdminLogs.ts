import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminLog {
    id: string;
    user_id: string;
    action: string;
    target: string | null;
    details: any;
    ip_address: string | null;
    created_at: string;
    user?: {
        email: string;
        full_name: string;
    };
}

export const useAdminLogs = () => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(50);
    const [total, setTotal] = useState(0);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Get total count
            const { count, error: countError } = await supabase
                .from('admin_logs')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;
            setTotal(count || 0);

            // Get paginated data
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from('admin_logs')
                .select('*, user:user_id(email, full_name)')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            setLogs(data || []);
        } catch (err: any) {
            console.error('Error fetching admin logs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize]);

    /* 
     * Log an action to the admin_logs table.
     * Use this manually when performing sensitive actions.
     */
    const logAction = async (action: string, target: string | null = null, details: any = {}) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('admin_logs')
                .insert({
                    user_id: user.id,
                    action,
                    target,
                    details
                });

            if (error) throw error;
        } catch (err) {
            console.error('Failed to log admin action:', err);
            // Don't throw, we don't want to block the main action if logging fails
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return {
        logs,
        loading,
        error,
        total,
        page,
        setPage,
        pageSize,
        fetchLogs,
        logAction
    };
};
