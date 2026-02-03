import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Purchase {
    id: string;
    user_id: string;
    submission_id: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    provider: string;
    created_at: string;
}

export function usePayment() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    // Fetch user's purchases
    const fetchPurchases = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('purchases')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'COMPLETED')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPurchases(data || []);
        } catch (err: any) {
            console.error('Error fetching purchases:', err);
        }
    }, [user]);

    useEffect(() => {
        fetchPurchases();
    }, [fetchPurchases]);

    // Check if a specific content is purchased
    const hasAccess = useCallback((submissionId: string) => {
        return purchases.some(p => p.submission_id === submissionId && p.status === 'COMPLETED');
    }, [purchases]);

    // Initiate a purchase (Simulated for now)
    const initiatePurchase = async (submissionId: string, amount: number, currency = 'USD', provider = 'STRIPE') => {
        if (!user) return { error: 'Must be logged in' };
        setLoading(true);
        setError(null);

        try {
            // 1. Create PENDING purchase record
            const { data: purchase, error: createError } = await supabase
                .from('purchases')
                .insert({
                    user_id: user.id,
                    submission_id: submissionId,
                    amount,
                    currency,
                    status: 'PENDING',
                    provider
                })
                .select()
                .single();

            if (createError) throw createError;

            // 2. SIMULATE PAYMENT PROCESSING (Wait 1s then success)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 3. Mark as COMPLETED
            // In production, this would be done via Webhook from Stripe/Momo
            const { error: updateError } = await supabase
                .from('purchases')
                .update({ status: 'COMPLETED', transaction_id: `sim_${Date.now()}` })
                .eq('id', purchase.id);

            if (updateError) throw updateError;

            await fetchPurchases(); // Refresh local state
            return { success: true };

        } catch (err: any) {
            console.error('Payment failed:', err);
            setError(err.message || 'Payment processing failed');
            return { error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        purchases,
        loading,
        error,
        fetchPurchases,
        hasAccess,
        initiatePurchase
    };
}
