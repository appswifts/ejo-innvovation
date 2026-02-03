import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
    Submission,
    SubmissionType,
    SubmissionStatus,
    InsertTables,
    UpdateTables
} from '../types/database';
import { useAuth } from './useAuth';

interface SubmissionWithRelations extends Submission {
    submission_type?: SubmissionType | null;
    venue?: { name: string; slug: string; abbreviation: string | null } | null;
}

interface UseSubmissionsOptions {
    status?: SubmissionStatus | SubmissionStatus[];
    venueId?: string;
    limit?: number;
}

export function useSubmissions(options: UseSubmissionsOptions = {}) {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<SubmissionWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubmissions = useCallback(async () => {
        if (!user) {
            setSubmissions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        let query = supabase
            .from('submissions')
            .select(`
        *,
        submission_type:submission_types(*),
        venue:venues(name, slug, abbreviation)
      `)
            .eq('submitter_id', user.id)
            .order('created_at', { ascending: false });

        if (options.status) {
            if (Array.isArray(options.status)) {
                query = query.in('status', options.status);
            } else {
                query = query.eq('status', options.status);
            }
        }

        if (options.venueId) {
            query = query.eq('venue_id', options.venueId);
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
            setError(fetchError.message);
            setLoading(false);
            return;
        }

        setSubmissions((data as any) || []);
        setLoading(false);
    }, [user, options.status, options.venueId, options.limit]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    return { submissions, loading, error, refetch: fetchSubmissions };
}

export function useSubmission(id: string) {
    const [submission, setSubmission] = useState<SubmissionWithRelations | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSubmission() {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('submissions')
                .select(`
          *,
          submission_type:submission_types(*),
          venue:venues(name, slug, abbreviation)
        `)
                .eq('id', id)
                .single();

            if (fetchError) {
                setError(fetchError.message);
                setLoading(false);
                return;
            }

            setSubmission(data as any);
            setLoading(false);
        }

        fetchSubmission();
    }, [id]);

    return { submission, loading, error };
}

export function useSubmissionTypes(venueType?: string) {
    const [types, setTypes] = useState<SubmissionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTypes() {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('submission_types')
                .select('*')
                .eq('is_active', true)
                .order('label');

            if (venueType) {
                query = query.contains('allowed_venue_types', [venueType]);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                setError(fetchError.message);
                setLoading(false);
                return;
            }

            setTypes(data || []);
            setLoading(false);
        }

        fetchTypes();
    }, [venueType]);

    return { types, loading, error };
}

export function useCreateSubmission() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createSubmission = useCallback(async (
        data: Omit<InsertTables<'submissions'>, 'submitter_id'>
    ) => {
        if (!user) {
            return { error: new Error('Not authenticated') };
        }

        setLoading(true);
        setError(null);

        const { data: submission, error: createError } = await supabase
            .from('submissions')
            .insert({
                ...data,
                submitter_id: user.id,
            })
            .select()
            .single();

        if (createError) {
            setError(createError.message);
            setLoading(false);
            return { error: createError };
        }

        setLoading(false);
        return { data: submission };
    }, [user]);

    return { createSubmission, loading, error };
}

export function useUpdateSubmission() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateSubmission = useCallback(async (
        id: string,
        data: UpdateTables<'submissions'>
    ) => {
        setLoading(true);
        setError(null);

        const { data: submission, error: updateError } = await supabase
            .from('submissions')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return { error: updateError };
        }

        setLoading(false);
        return { data: submission };
    }, []);

    return { updateSubmission, loading, error };
}

export function useSubmitSubmission() {
    const { updateSubmission } = useUpdateSubmission();

    const submitSubmission = useCallback(async (id: string) => {
        return updateSubmission(id, {
            status: 'SUBMITTED',
            submitted_at: new Date().toISOString(),
        });
    }, [updateSubmission]);

    return { submitSubmission };
}
