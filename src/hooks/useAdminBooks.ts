import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Venue, Imprint } from '../types/database';

export interface CreateBookData {
    name: string;
    description?: string;
    slug: string;
    publisher?: string;
    isbn_prefix?: string;
}

export interface UpdateBookData {
    name?: string;
    description?: string;
    slug?: string;
    publisher?: string;
    isbn_prefix?: string;
}

export function useAdminBooks() {
    const [books, setBooks] = useState<(Venue & { imprints: Imprint | null })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch venues of type BOOK_IMPRINT or SERIES
            const { data, error } = await supabase
                .from('venues')
                .select('*, imprints(*)')
                .in('type', ['BOOK_IMPRINT', 'SERIES'])
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to ensure imprints is accessible. 
            // Note: In a real relationship, if one-to-one, we expect single object.
            // Supabase client might treat it as array if not defined as single.
            const formattedData = (data || []).map(venue => ({
                ...venue,
                imprints: Array.isArray(venue.imprints) && venue.imprints.length > 0
                    ? venue.imprints[0]
                    : (venue.imprints as any) || null
            }));

            setBooks(formattedData);
        } catch (err: any) {
            console.error('Error fetching admin books:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const createBook = useCallback(async (data: CreateBookData) => {
        try {
            // 1. Create Venue
            const { data: venue, error: venueError } = await supabase
                .from('venues')
                .insert([{
                    name: data.name,
                    slug: data.slug,
                    type: 'BOOK_IMPRINT', // Defaulting to BOOK_IMPRINT for now
                    description: data.description || null,
                    is_active: true
                }])
                .select()
                .single();

            if (venueError) throw venueError;
            if (!venue) throw new Error('Failed to create venue');

            // 2. Create Imprint Entry
            const { error: imprintError } = await supabase
                .from('imprints')
                .insert([{
                    venue_id: venue.id,
                    publisher: data.publisher || null,
                    isbn_prefix: data.isbn_prefix || null
                }]);

            if (imprintError) {
                // Ideally rollback venue creation here
                console.error('Error creating imprint details:', imprintError);
                // We keep going but return error? Or just throw?
                // Let's throw to user
                throw imprintError;
            }

            await fetchBooks();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    }, [fetchBooks]);

    const updateBook = useCallback(async (id: string, data: UpdateBookData) => {
        try {
            // Update Venue
            const { error: venueError } = await supabase
                .from('venues')
                .update({
                    name: data.name,
                    slug: data.slug,
                    description: data.description
                })
                .eq('id', id);

            if (venueError) throw venueError;

            // Update Imprint - check if exists first? Or upsert?
            // Upsert is safer if we missed creating it before
            // But we need the ID of the imprint row usually, or match on venue_id unique constraint?
            // imprints table doesn't have unique constraint on venue_id in the definitions I saw, but logically it should.
            // Let's try update first.

            // Actually, let's just do update on imprints if we have fields to update
            if (data.publisher !== undefined || data.isbn_prefix !== undefined) {
                const { error: imprintError } = await supabase
                    .from('imprints')
                    .update({
                        publisher: data.publisher,
                        isbn_prefix: data.isbn_prefix
                    })
                    .eq('venue_id', id);

                if (imprintError) throw imprintError;
            }

            await fetchBooks();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    }, [fetchBooks]);

    const archiveBook = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('venues')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            await fetchBooks();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    }, [fetchBooks]);

    const restoreBook = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('venues')
                .update({ is_active: true })
                .eq('id', id);

            if (error) throw error;
            await fetchBooks();
            return { success: true };
        } catch (err: any) {
            return { error: err.message };
        }
    }, [fetchBooks]);

    return {
        books,
        loading,
        error,
        createBook,
        updateBook,
        archiveBook,
        restoreBook,
        refetch: fetchBooks
    };
}
