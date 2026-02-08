import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

type Inputs = {
    type: 'author' | 'book_seller' | 'both';
    degree?: FileList;
    categories: string[];
    journals: string[];
};

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Arts'];

const Applications: React.FC = () => {
    const { user } = useAuth();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Inputs>();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [applicationType, setApplicationType] = useState<'author' | 'book_seller' | 'both'>('author');
    const [availableJournals, setAvailableJournals] = useState<{ id: string, title: string }[]>([]);

    useEffect(() => {
        const fetchJournals = async () => {
            const { data, error } = await supabase
                .from('journals')
                .select('id, title');

            if (error) {
                console.error('Error fetching journals:', error);
                toast.error('Failed to load journals');
            } else {
                setAvailableJournals(data || []);
            }
        };

        fetchJournals();
    }, []);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setLoading(true);
        try {
            // 1. Upload Degree if Author
            let degreeUrl = '';
            if ((data.type === 'author' || data.type === 'both') && data.degree && data.degree.length > 0) {
                const file = data.degree[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${user?.id}_${Math.random()}.${fileExt}`;
                const { error: uploadError, data: uploadData } = await supabase.storage
                    .from('submission_files') // Reusing existing bucket or create 'applications' bucket
                    .upload(`degrees/${fileName}`, file);

                if (uploadError) throw uploadError;
                degreeUrl = uploadData.path;
            }

            // 2. Submit Application
            const { error } = await supabase
                .from('applications')
                .insert({
                    user_id: user?.id,
                    type: data.type,
                    data: {
                        degree_url: degreeUrl,
                        categories: data.categories,
                        journals: data.journals
                    }
                });

            if (error) throw error;
            setSuccess(true);
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error('Failed to submit application.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="p-8 text-center max-w-lg mx-auto bg-white rounded-xl shadow mt-10">
                <span className="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
                <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                <p className="text-slate-600">Your application to become a {applicationType.replace('_', ' ')} is under review. We will notify you once approved.</p>
                <button onClick={() => window.location.href = '/dashboard'} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg">Go to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Apply for Upgrade</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">

                {/* Application Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">I want to apply as:</label>
                    <div className="grid grid-cols-3 gap-4">
                        {['author', 'book_seller', 'both'].map((type) => (
                            <label key={type} className={`
                                border-2 rounded-lg p-4 cursor-pointer text-center transition-all
                                ${watch('type') === type ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 hover:border-slate-300'}
                            `}>
                                <input
                                    type="radio"
                                    value={type}
                                    {...register('type')}
                                    className="sr-only"
                                    onClick={() => setApplicationType(type as any)}
                                />
                                <span className="capitalize">{type.replace('_', ' ')}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Author Fields */}
                {(watch('type') === 'author' || watch('type') === 'both') && (
                    <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined">edit_note</span> Author Details
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Degree / Certification</label>
                            <input
                                type="file"
                                {...register('degree', { required: watch('type') !== 'book_seller' })}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            {errors.degree && <span className="text-red-500 text-xs">Degree is required for authors.</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Select Journals of Interest</label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                                {availableJournals.length > 0 ? availableJournals.map(journal => (
                                    <label key={journal.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 text-sm">
                                        <input type="checkbox" value={journal.title} {...register('journals')} className="rounded text-primary focus:ring-primary" />
                                        {journal.title}
                                    </label>
                                )) : (
                                    <p className="text-sm text-slate-500 p-2 col-span-2">No journals available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Book Seller Fields */}
                {(watch('type') === 'book_seller' || watch('type') === 'both') && (
                    <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined">storefront</span> Seller Details
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Book Categories you intend to sell</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(category => (
                                    <label key={category} className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1 rounded-full border border-slate-200 hover:border-slate-300">
                                        <input type="checkbox" value={category} {...register('categories')} className="rounded text-primary focus:ring-primary" />
                                        <span className="text-sm">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">send</span>}
                        Submit Application
                    </button>
                </div>

            </form>
        </div>
    );
};

export default Applications;
