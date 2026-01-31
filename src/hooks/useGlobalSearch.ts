import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SearchResult {
    type: 'article' | 'journal' | 'author';
    id: string;
    title: string;
    subtitle?: string; // Abstract, bio, or description
    url: string;
    image?: string;
    date?: string;
    status?: string;
}

export function useGlobalSearch(query: string) {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Search Submissions (Articles)
                const { data: articles, error: articlesError } = await supabase
                    .from('submissions')
                    .select('id, title, abstract, published_at, venue:venues(name)')
                    .eq('status', 'PUBLISHED') // Only published articles
                    .or(`title.ilike.%${query}%,abstract.ilike.%${query}%`)
                    .limit(5);

                if (articlesError) throw articlesError;

                // 2. Search Journals (Venues)
                const { data: journals, error: journalsError } = await supabase
                    .from('venues')
                    .select('id, name, description, cover_image_url, abbreviation')
                    .eq('is_active', true)
                    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                    .limit(5);

                if (journalsError) throw journalsError;

                // 3. Search Authors (Profiles) - Only those with public contributions theoretically, but for now strict list
                // For privacy, maybe only search authors who are Editors or have published papers?
                // Let's stick to simple profile search for now
                const { data: authors, error: authorsError } = await supabase
                    .from('profiles')
                    .select('id, full_name, bio, avatar_url')
                    .or(`full_name.ilike.%${query}%`)
                    .limit(5);

                if (authorsError) throw authorsError;

                const formattedResults: SearchResult[] = [
                    ...(journals || []).map((j: any) => ({
                        type: 'journal' as const,
                        id: j.id,
                        title: j.name,
                        subtitle: j.description?.substring(0, 100) + '...',
                        url: `/journals/${j.id}`, // Should use slug if available
                        image: j.cover_image_url,
                    })),
                    ...(articles || []).map((a: any) => ({
                        type: 'article' as const,
                        id: a.id,
                        title: a.title,
                        subtitle: a.abstract?.substring(0, 100) + '...',
                        url: `/articles/${a.id}`,
                        date: a.published_at,
                        status: a.venue?.name
                    })),
                    ...(authors || []).map((p: any) => ({
                        type: 'author' as const,
                        id: p.id,
                        title: p.full_name,
                        subtitle: p.bio?.substring(0, 60),
                        url: `/author/${p.id}`,
                        image: p.avatar_url
                    })),
                ];

                setResults(formattedResults);

            } catch (err: any) {
                console.error('Search error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);

    }, [query]);

    return { results, loading, error };
}
