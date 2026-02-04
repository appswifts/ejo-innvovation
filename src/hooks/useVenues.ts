import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Venue, Journal, Imprint, VenueType } from '../types/database';

interface VenueWithDetails extends Venue {
    journal?: Journal | null;
    imprint?: Imprint | null;
}

interface UseVenuesOptions {
    type?: VenueType;
    activeOnly?: boolean;
}

export function useVenues(options: UseVenuesOptions = {}) {
    const [venues, setVenues] = useState<VenueWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVenues = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase.from('venues').select('*');

            /* 
            // Debug: Temporarily disable DB filtering to check raw data
            if (options.type) {
                query = query.eq('type', options.type);
            }

            if (options.activeOnly !== false) {
                query = query.eq('is_active', true);
            }
            */

            const { data: rawData, error: fetchError } = await query.order('name');

            if (fetchError) throw fetchError;

            // Filter in memory to bypass potential RLS/Query issues
            let data = rawData || [];
            if (options.type) {
                data = data.filter(v => v.type === options.type);
            }
            if (options.activeOnly !== false) {
                data = data.filter(v => v.is_active === true);
            }

            // Fetch related journal/imprint data for each venue
            const venuesWithDetails: VenueWithDetails[] = await Promise.all(
                (data || []).map(async (venue) => {
                    if (venue.type === 'JOURNAL') {
                        const { data: journal } = await supabase
                            .from('journals')
                            .select('*')
                            .eq('venue_id', venue.id)
                            .maybeSingle();
                        return { ...venue, journal };
                    } else if (venue.type === 'BOOK_IMPRINT') {
                        const { data: imprint } = await supabase
                            .from('imprints')
                            .select('*')
                            .eq('venue_id', venue.id)
                            .maybeSingle();
                        return { ...venue, imprint };
                    }
                    return venue;
                })
            );

            setVenues(venuesWithDetails);
        } catch (err: any) {
            if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                // Ignore abort errors
                return;
            }
            console.error('Error fetching venues:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [options.type, options.activeOnly]);

    useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);

    return { venues, loading, error, refetch: fetchVenues };
}

export function useVenue(slug: string) {
    const [venue, setVenue] = useState<VenueWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchVenue() {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('venues')
                .select('*')
                .eq('slug', slug)
                .single();

            if (fetchError) {
                setError(fetchError.message);
                setLoading(false);
                return;
            }

            let venueWithDetails: VenueWithDetails = data;

            if (data?.type === 'JOURNAL') {
                const { data: journal } = await supabase
                    .from('journals')
                    .select('*')
                    .eq('venue_id', data.id)
                    .maybeSingle();
                venueWithDetails = { ...data, journal };
            } else if (data?.type === 'BOOK_IMPRINT') {
                const { data: imprint } = await supabase
                    .from('imprints')
                    .select('*')
                    .eq('venue_id', data.id)
                    .maybeSingle();
                venueWithDetails = { ...data, imprint };
            }

            setVenue(venueWithDetails);
            setLoading(false);
        }

        if (slug) {
            fetchVenue();
        }
    }, [slug]);

    return { venue, loading, error };
}

export function useJournals() {
    return useVenues({ type: 'JOURNAL' });
}

export function useImprints() {
    return useVenues({ type: 'BOOK_IMPRINT' });
}
