import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

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
    venue?: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

export interface CreateJobData {
    title: string;
    slug: string;
    venue_id?: string | null;
    department?: string;
    location?: string;
    job_type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
    description: string;
    requirements?: string[];
    benefits?: string[];
    salary_range?: string;
    application_email?: string;
    application_url?: string;
    expires_at?: string;
}

export interface UpdateJobData extends Partial<CreateJobData> {
    is_active?: boolean;
}

export function useAdminCareer() {
    const { user } = useAuth();
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
                    venue:venues(id, name, slug)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedJobs = (data || []).map(job => ({
                ...job,
                requirements: Array.isArray(job.requirements) ? job.requirements : [],
                benefits: Array.isArray(job.benefits) ? job.benefits : [],
                venue: job.venue
            })) as CareerJob[];

            setJobs(formattedJobs);
        } catch (err: any) {
            console.error('Error fetching admin career jobs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const createJob = useCallback(async (data: CreateJobData) => {
        try {
            const { error } = await supabase
                .from('career_jobs')
                .insert([{
                    ...data,
                    posted_by: user?.id,
                    is_active: true,
                    requirements: data.requirements || [],
                    benefits: data.benefits || []
                }]);

            if (error) throw error;
            await fetchJobs();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    }, [user?.id, fetchJobs]);

    const updateJob = useCallback(async (id: string, data: UpdateJobData) => {
        try {
            const { error } = await supabase
                .from('career_jobs')
                .update(data)
                .eq('id', id);

            if (error) throw error;
            await fetchJobs();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    }, [fetchJobs]);

    const archiveJob = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('career_jobs')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            await fetchJobs();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    }, [fetchJobs]);

    const restoreJob = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('career_jobs')
                .update({ is_active: true })
                .eq('id', id);

            if (error) throw error;
            await fetchJobs();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    }, [fetchJobs]);

    const deleteJob = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('career_jobs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchJobs();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    }, [fetchJobs]);

    return {
        jobs,
        loading,
        error,
        createJob,
        updateJob,
        archiveJob,
        restoreJob,
        deleteJob,
        refetch: fetchJobs
    };
}
