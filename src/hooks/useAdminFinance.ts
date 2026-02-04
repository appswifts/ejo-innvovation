import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminFinance() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalRevenue: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFinanceData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('purchases')
                .select(`
                    *,
                    user:user_id (
                        email,
                        full_name
                    ),
                    submission:submission_id (
                        title
                    )
                `)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const txs = data || [];
            setTransactions(txs);

            // Calculate stats
            const total = txs
                .filter(t => t.status === 'COMPLETED')
                .reduce((acc, curr) => acc + Number(curr.amount), 0);

            setStats({
                totalRevenue: total,
                count: txs.length
            });

        } catch (err: any) {
            console.error('Error fetching finance data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinanceData();
    }, [fetchFinanceData]);

    return {
        transactions,
        stats,
        loading,
        error,
        fetchFinanceData
    };
}
