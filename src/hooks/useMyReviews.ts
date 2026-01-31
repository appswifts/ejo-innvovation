import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Review {
    id: string;
    submission_id: string;
    reviewer_id: string;
    round_number: number;
    recommendation: 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT' | 'REJECT_RESUBMIT' | null;
    submitted_at: string | null;
    due_date: string | null;
    created_at: string;
    submission?: {
        title: string;
        venue?: {
            name: string;
        };
    };
}

export function useMyReviews() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        if (!user) {
            setReviews([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('reviews')
                .select(`
                    *,
                    submission:submissions (
                        title,
                        venue:venues (
                            name
                        )
                    )
                `)
                .eq('reviewer_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Type assertion since deep joining can be tricky to type automatically
            setReviews((data as unknown as Review[]) || []);
        } catch (err: any) {
            console.error('Error fetching reviews:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return { reviews, loading, error, refetch: fetchReviews };
}
