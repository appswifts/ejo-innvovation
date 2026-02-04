import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Comment {
    id: string;
    submission_id: string;
    user_id: string;
    content: string;
    visibility: 'internal' | 'author' | 'public';
    created_at: string;
    user?: {
        full_name?: string;
        email?: string;
        avatar_url?: string;
    };
}

export function useComments(submissionId: string) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        if (!submissionId) return;

        setLoading(true);
        setError(null);

        // Fetch comments and join with profiles to get user details
        // Note: We need to join with profiles on user_id
        const { data, error } = await supabase
            .from('submission_comments')
            .select(`
                *,
                user:profiles(full_name, email, avatar_url)
            `)
            .eq('submission_id', submissionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            setError(error.message);
        } else {
            setComments(data as any || []);
        }
        setLoading(false);
    }, [submissionId]);

    const addComment = async (content: string, visibility: 'internal' | 'author' | 'public' = 'internal') => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('submission_comments')
            .insert({
                submission_id: submissionId,
                user_id: user.id,
                content,
                visibility
            })
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        await fetchComments();
        return { data };
    };

    useEffect(() => {
        if (submissionId) {
            fetchComments();
        }
    }, [submissionId, fetchComments]);

    return { comments, loading, error, addComment, refetch: fetchComments };
}
