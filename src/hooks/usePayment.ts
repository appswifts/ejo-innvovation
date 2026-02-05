import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Purchase {
    id: string;
    user_id: string;
    content_type: 'submission' | 'book';
    submission_id: string | null;
    book_id: string | null;
    amount: number;
    currency: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    provider: string;
    payment_reference: string | null;
    transaction_id: string | null;
    created_at: string;
}

// Use any to bypass type checking until types are regenerated
const db = supabase as any;

export function usePayment() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    // Fetch user's purchases
    const fetchPurchases = useCallback(async () => {
        if (!user) {
            setPurchases([]);
            return;
        }

        try {
            const { data, error } = await db
                .from('purchases')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPurchases((data || []) as Purchase[]);
        } catch (err: any) {
            console.error('Error fetching purchases:', err);
        }
    }, [user]);

    useEffect(() => {
        fetchPurchases();
    }, [fetchPurchases]);

    // Check if a specific submission is purchased
    const hasSubmissionAccess = useCallback((submissionId: string) => {
        return purchases.some(
            p => p.submission_id === submissionId && p.status === 'COMPLETED'
        );
    }, [purchases]);

    // Check if a specific book is purchased
    const hasBookAccess = useCallback((bookId: string) => {
        return purchases.some(
            p => p.book_id === bookId && p.status === 'COMPLETED'
        );
    }, [purchases]);

    // Purchase submission access with simulated payment
    const purchaseSubmission = async (
        submissionId: string,
        amount: number,
        currency = 'USD'
    ) => {
        if (!user) return { error: 'Must be logged in' };

        // Check if already purchased
        if (hasSubmissionAccess(submissionId)) {
            return { success: true, status: 'already_purchased' };
        }

        setLoading(true);
        setError(null);

        try {
            // Create purchase record with PENDING status (manual payment)
            const { data: purchase, error: createError } = await db
                .from('purchases')
                .insert({
                    user_id: user.id,
                    content_type: 'submission',
                    submission_id: submissionId,
                    amount,
                    currency,
                    status: 'PENDING',
                    provider: 'manual'
                })
                .select()
                .single();

            if (createError) throw createError;

            // Return pending status - admin will confirm payment manually
            return {
                success: true,
                status: 'pending',
                purchaseId: purchase.id,
                message: 'Your purchase is pending. Please complete payment to gain access.'
            };

        } catch (err: any) {
            console.error('Purchase failed:', err);
            setError(err.message || 'Purchase failed');
            return { error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Purchase a book
    const purchaseBook = async (
        bookId: string,
        amount: number,
        currency = 'USD'
    ) => {
        if (!user) return { error: 'Must be logged in' };

        // Check if already purchased
        if (hasBookAccess(bookId)) {
            return { success: true, status: 'already_purchased' };
        }

        setLoading(true);
        setError(null);

        try {
            const { data: purchase, error: createError } = await db
                .from('purchases')
                .insert({
                    user_id: user.id,
                    content_type: 'book',
                    book_id: bookId,
                    amount,
                    currency,
                    status: 'PENDING',
                    provider: 'manual'
                })
                .select()
                .single();

            if (createError) throw createError;

            // Return pending for manual payment confirmation
            return {
                success: true,
                status: 'pending',
                purchaseId: purchase.id,
                message: 'Your purchase is pending. Please complete payment to gain access.'
            };

        } catch (err: any) {
            console.error('Book purchase failed:', err);
            setError(err.message || 'Purchase failed');
            return { error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        purchases,
        hasSubmissionAccess,
        hasBookAccess,
        purchaseSubmission,
        purchaseBook,
        refresh: fetchPurchases
    };
}
