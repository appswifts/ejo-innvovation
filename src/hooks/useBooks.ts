import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Book type with imprint relationship
export interface Book {
    id: string;
    imprint_id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    authors: { name: string; bio?: string; orcid?: string }[];
    isbn: string | null;
    publication_date: string | null;
    cover_image_url: string | null;
    description: string | null;
    table_of_contents: any;
    page_count: number | null;
    language: string | null;
    price_usd: number | null;
    access_type: 'open_access' | 'paid' | 'subscription' | null;
    file_url: string | null;
    is_active: boolean | null;
    metadata: any;
    created_at: string | null;
    updated_at: string | null;
    // Joined data
    imprint?: {
        id: string;
        publisher: string | null;
        venue_id: string;
        venue?: {
            id: string;
            name: string;
            slug: string;
        };
    };
}

export interface UseBooks {
    books: Book[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useBooks(): UseBooks {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('books')
                .select(`
                    *,
                    imprint:imprints(
                        id,
                        publisher,
                        venue_id,
                        venue:venues(id, name, slug)
                    )
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to flatten imprint relationship
            const formattedBooks = (data || []).map(book => ({
                ...book,
                authors: Array.isArray(book.authors) ? book.authors : [],
                imprint: book.imprint
            })) as Book[];

            setBooks(formattedBooks);
        } catch (err: any) {
            console.error('Error fetching books:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    return {
        books,
        loading,
        error,
        refetch: fetchBooks
    };
}

// Hook for single book detail
export function useBook(slug: string) {
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBook = useCallback(async () => {
        if (!slug) return;

        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('books')
                .select(`
                    *,
                    imprint:imprints(
                        id,
                        publisher,
                        venue_id,
                        venue:venues(id, name, slug, description)
                    )
                `)
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error) throw error;

            setBook({
                ...data,
                authors: Array.isArray(data.authors) ? data.authors : [],
                imprint: data.imprint
            } as Book);
        } catch (err: any) {
            console.error('Error fetching book:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchBook();
    }, [fetchBook]);

    return {
        book,
        loading,
        error,
        refetch: fetchBook
    };
}
