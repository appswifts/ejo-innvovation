import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Career job type with venue relationship
export interface CareerJob {
    id: string;
    venue_id: string | null;
    title: string;
    slug: string;
    department: string | null;
    location: string | null;
    job_type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
    description: string;
    requirements: string[];
    benefits: string[];
    salary_range: string | null;
    application_email: string | null;
    application_url: string | null;
    posted_by: string | null;
    is_active: boolean | null;
    expires_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    // Joined data
    venue?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    poster?: {
        id: string;
        full_name: string | null;
    } | null;
}

export interface UseCareerJobs {
    jobs: CareerJob[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useCareerJobs(): UseCareerJobs {
    const [jobs, setJobs] = useState<CareerJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('career_jobs')
                .select(`
                    *,
                    venue:venues(id, name, slug),
                    poster:profiles!career_jobs_posted_by_fkey(id, full_name)
                `)
                .eq('is_active', true)
                .or('expires_at.is.null,expires_at.gt.now()')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedJobs = (data || []).map(job => ({
                ...job,
                requirements: Array.isArray(job.requirements) ? job.requirements : [],
                benefits: Array.isArray(job.benefits) ? job.benefits : [],
                venue: job.venue,
                poster: job.poster
            })) as CareerJob[];

            setJobs(formattedJobs);
        } catch (err: any) {
            console.error('Error fetching career jobs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    return {
        jobs,
        loading,
        error,
        refetch: fetchJobs
    };
}

// Hook for single job detail
export function useCareerJob(slug: string) {
    const [job, setJob] = useState<CareerJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJob = useCallback(async () => {
        if (!slug) return;

        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('career_jobs')
                .select(`
                    *,
                    venue:venues(id, name, slug, description),
                    poster:profiles!career_jobs_posted_by_fkey(id, full_name, email)
                `)
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error) throw error;

            setJob({
                ...data,
                requirements: Array.isArray(data.requirements) ? data.requirements : [],
                benefits: Array.isArray(data.benefits) ? data.benefits : [],
                venue: data.venue,
                poster: data.poster
            } as CareerJob);
        } catch (err: any) {
            console.error('Error fetching career job:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    return {
        job,
        loading,
        error,
        refetch: fetchJob
    };
}
