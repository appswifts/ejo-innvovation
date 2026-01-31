import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SubmissionAuthor {
    id: string;
    submission_id: string;
    profile_id?: string | null;
    author_order: number;
    is_corresponding: boolean;
    external_name?: string | null;
    external_email?: string | null;
    external_affiliation?: string | null;
    external_orcid?: string | null;
    contribution?: string | null;
    created_at?: string;
}

export interface UseSubmissionAuthorsResult {
    authors: SubmissionAuthor[];
    loading: boolean;
    error: string | null;
    fetchAuthors: () => Promise<void>;
    addAuthor: (author: Omit<SubmissionAuthor, 'id' | 'created_at' | 'submission_id'>) => Promise<{ data: SubmissionAuthor | null; error: string | null }>;
    updateAuthor: (id: string, updates: Partial<SubmissionAuthor>) => Promise<{ data: SubmissionAuthor | null; error: string | null }>;
    removeAuthor: (id: string) => Promise<{ error: string | null }>;
    reorderAuthors: (authors: SubmissionAuthor[]) => Promise<void>;
}

export const useSubmissionAuthors = (submissionId: string | null): UseSubmissionAuthorsResult => {
    const [authors, setAuthors] = useState<SubmissionAuthor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAuthors = useCallback(async () => {
        if (!submissionId) return;

        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('submission_authors')
                .select('*')
                .eq('submission_id', submissionId)
                .order('author_order', { ascending: true });

            if (fetchError) throw fetchError;
            setAuthors(data || []);
        } catch (err: any) {
            console.error('Error fetching authors:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [submissionId]);

    useEffect(() => {
        fetchAuthors();
    }, [fetchAuthors]);

    const addAuthor = async (authorData: Omit<SubmissionAuthor, 'id' | 'created_at' | 'submission_id'>) => {
        if (!submissionId) return { data: null, error: 'No submission ID provided' };

        setLoading(true);
        try {
            // Calculate next order if not provided or valid
            const nextOrder = authors.length > 0
                ? Math.max(...authors.map(a => a.author_order)) + 1
                : 1;

            const { data, error: insertError } = await supabase
                .from('submission_authors')
                .insert({
                    ...authorData,
                    submission_id: submissionId,
                    author_order: authorData.author_order || nextOrder
                })
                .select()
                .single();

            if (insertError) throw insertError;

            setAuthors(prev => [...prev, data]);
            return { data, error: null };
        } catch (err: any) {
            setError(err.message);
            return { data: null, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateAuthor = async (id: string, updates: Partial<SubmissionAuthor>) => {
        setLoading(true);
        try {
            const { data, error: updateError } = await supabase
                .from('submission_authors')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            setAuthors(prev => prev.map(a => a.id === id ? data : a));
            return { data, error: null };
        } catch (err: any) {
            setError(err.message);
            return { data: null, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const removeAuthor = async (id: string) => {
        setLoading(true);
        try {
            const { error: deleteError } = await supabase
                .from('submission_authors')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setAuthors(prev => prev.filter(a => a.id !== id));
            return { error: null };
        } catch (err: any) {
            setError(err.message);
            return { error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Optimistic UI for reordering could be added, but simple update for now
    const reorderAuthors = async (reorderedAuthors: SubmissionAuthor[]) => {
        // Locally update first
        setAuthors(reorderedAuthors);

        // Then update in DB (potentially in batch if RPC exists, otherwise loop)
        // For now, loop is simplest but inefficient. Ideally use an RPC.
        // We will just assume the local state is enough for the UI and update orders one by one silently

        for (let i = 0; i < reorderedAuthors.length; i++) {
            const author = reorderedAuthors[i];
            if (author.author_order !== i + 1) {
                await supabase.from('submission_authors').update({ author_order: i + 1 }).eq('id', author.id);
            }
        }
    };

    return {
        authors,
        loading,
        error,
        fetchAuthors,
        addAuthor,
        updateAuthor,
        removeAuthor,
        reorderAuthors
    };
};
