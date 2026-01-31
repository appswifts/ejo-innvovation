import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Submission } from '../types/database';

interface UseAdminSubmissionsOptions {
    page?: number;
    limit?: number;
    search?: string;
    status?: string | null;
}

export function useAdminSubmissions({ page = 1, limit = 10, search = '', status = null }: UseAdminSubmissionsOptions = {}) {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('submissions')
                .select(`
                    *,
                    submitter:profiles(full_name, email),
                    venue:venues(name),
                    submission_type:submission_types(label)
                `, { count: 'exact' });

            if (status) {
                query = query.eq('status', status as any); // Type assertion to bypass strict string literal check
            }

            if (search) {
                query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%`);
            }

            const from = (page - 1) * limit;
            const to = from + limit - 1;

            query = query
                .order('created_at', { ascending: false })
                .range(from, to);

            const { data, count, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setSubmissions(data || []);
            setTotal(count || 0);
        } catch (err: any) {
            console.error('Error fetching admin submissions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, status]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    return { submissions, total, loading, error, refetch: fetchSubmissions };
}
