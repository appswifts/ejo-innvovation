import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Venue, VenueType, Journal } from '../types/database';

interface CreateJournalData {
    name: string;
    slug: string;
    abbreviation?: string;
    description?: string;
    scope?: string;
    contact_email?: string;
    cover_image_url?: string;
    // Journal-specific fields
    publisher?: string;
    citation_style?: string;
    peer_review_type?: string;
    issn?: string;
    eissn?: string;
}

interface UpdateJournalData extends Partial<CreateJournalData> { }

export function useAdminJournals() {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // CREATE journal
    const createJournal = useCallback(async (data: CreateJournalData) => {
        setSaving(true);
        setError(null);

        try {
            // First create the venue
            const { data: venue, error: venueError } = await supabase
                .from('venues')
                .insert({
                    type: 'JOURNAL' as VenueType,
                    name: data.name,
                    slug: data.slug,
                    abbreviation: data.abbreviation,
                    description: data.description,
                    scope: data.scope,
                    contact_email: data.contact_email,
                    cover_image_url: data.cover_image_url,
                    is_active: true
                })
                .select()
                .single();

            if (venueError) throw venueError;

            // Then create the journal record
            const { error: journalError } = await supabase
                .from('journals')
                .insert({
                    venue_id: venue.id,
                    publisher: data.publisher || 'Nkiza Center for Research',
                    citation_style: data.citation_style || 'APA',
                    peer_review_type: data.peer_review_type || 'double-blind',
                    issn: data.issn,
                    eissn: data.eissn
                });

            if (journalError) throw journalError;

            setSaving(false);
            return { success: true, data: venue };
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
            return { error: err.message };
        }
    }, []);

    // UPDATE journal
    const updateJournal = useCallback(async (venueId: string, data: UpdateJournalData) => {
        setSaving(true);
        setError(null);

        try {
            // Update venue
            const venueUpdates: any = {};
            if (data.name !== undefined) venueUpdates.name = data.name;
            if (data.slug !== undefined) venueUpdates.slug = data.slug;
            if (data.abbreviation !== undefined) venueUpdates.abbreviation = data.abbreviation;
            if (data.description !== undefined) venueUpdates.description = data.description;
            if (data.scope !== undefined) venueUpdates.scope = data.scope;
            if (data.contact_email !== undefined) venueUpdates.contact_email = data.contact_email;
            if (data.cover_image_url !== undefined) venueUpdates.cover_image_url = data.cover_image_url;

            if (Object.keys(venueUpdates).length > 0) {
                const { error: venueError } = await supabase
                    .from('venues')
                    .update(venueUpdates)
                    .eq('id', venueId);

                if (venueError) throw venueError;
            }

            // Update journal record
            const journalUpdates: any = {};
            if (data.publisher !== undefined) journalUpdates.publisher = data.publisher;
            if (data.citation_style !== undefined) journalUpdates.citation_style = data.citation_style;
            if (data.peer_review_type !== undefined) journalUpdates.peer_review_type = data.peer_review_type;
            if (data.issn !== undefined) journalUpdates.issn = data.issn;
            if (data.eissn !== undefined) journalUpdates.eissn = data.eissn;

            if (Object.keys(journalUpdates).length > 0) {
                const { error: journalError } = await supabase
                    .from('journals')
                    .update(journalUpdates)
                    .eq('venue_id', venueId);

                if (journalError) throw journalError;
            }

            setSaving(false);
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
            return { error: err.message };
        }
    }, []);

    // DELETE (archive) journal
    const archiveJournal = useCallback(async (venueId: string) => {
        setSaving(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('venues')
                .update({ is_active: false })
                .eq('id', venueId);

            if (error) throw error;

            setSaving(false);
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
            return { error: err.message };
        }
    }, []);

    // RESTORE journal
    const restoreJournal = useCallback(async (venueId: string) => {
        setSaving(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('venues')
                .update({ is_active: true })
                .eq('id', venueId);

            if (error) throw error;

            setSaving(false);
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
            return { error: err.message };
        }
    }, []);

    return {
        saving,
        error,
        createJournal,
        updateJournal,
        archiveJournal,
        restoreJournal
    };
}
