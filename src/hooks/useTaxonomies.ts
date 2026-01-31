import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Taxonomy, Term } from '../types/database';

interface TaxonomyWithTerms extends Taxonomy {
    terms: Term[];
}

export function useTaxonomies() {
    const [taxonomies, setTaxonomies] = useState<TaxonomyWithTerms[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTaxonomies() {
            setLoading(true);
            setError(null);

            // Fetch taxonomies
            const { data: taxonomyData, error: taxError } = await supabase
                .from('taxonomies')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (taxError) {
                setError(taxError.message);
                setLoading(false);
                return;
            }

            // Fetch all terms
            const { data: termData, error: termError } = await supabase
                .from('terms')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (termError) {
                setError(termError.message);
                setLoading(false);
                return;
            }

            // Map terms to taxonomies
            const taxonomiesWithTerms: TaxonomyWithTerms[] = (taxonomyData || []).map(taxonomy => ({
                ...taxonomy,
                terms: (termData || []).filter(term => term.taxonomy_id === taxonomy.id),
            }));

            setTaxonomies(taxonomiesWithTerms);
            setLoading(false);
        }

        fetchTaxonomies();
    }, []);

    return { taxonomies, loading, error };
}

export function useTaxonomyByKey(key: string) {
    const [taxonomy, setTaxonomy] = useState<TaxonomyWithTerms | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTaxonomy() {
            setLoading(true);
            setError(null);

            const { data: taxonomyData, error: taxError } = await supabase
                .from('taxonomies')
                .select('*')
                .eq('key', key)
                .single();

            if (taxError) {
                setError(taxError.message);
                setLoading(false);
                return;
            }

            const { data: termData, error: termError } = await supabase
                .from('terms')
                .select('*')
                .eq('taxonomy_id', taxonomyData.id)
                .eq('is_active', true)
                .order('display_order');

            if (termError) {
                setError(termError.message);
                setLoading(false);
                return;
            }

            setTaxonomy({
                ...taxonomyData,
                terms: termData || [],
            });
            setLoading(false);
        }

        if (key) {
            fetchTaxonomy();
        }
    }, [key]);

    return { taxonomy, loading, error };
}

export function useTaxonomiesForSubmissionType(submissionTypeId: string) {
    const [taxonomies, setTaxonomies] = useState<Array<{
        taxonomy: Taxonomy;
        terms: Term[];
        isRequired: boolean;
        maxTerms: number | null;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTaxonomiesForType() {
            if (!submissionTypeId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            // Fetch submission_type_taxonomies
            const { data: sttData, error: sttError } = await supabase
                .from('submission_type_taxonomies')
                .select('*')
                .eq('submission_type_id', submissionTypeId)
                .order('display_order');

            if (sttError) {
                setError(sttError.message);
                setLoading(false);
                return;
            }

            if (!sttData || sttData.length === 0) {
                setTaxonomies([]);
                setLoading(false);
                return;
            }

            // Fetch taxonomy and term data for each
            const results = await Promise.all(
                sttData.map(async (stt) => {
                    const { data: taxonomy } = await supabase
                        .from('taxonomies')
                        .select('*')
                        .eq('id', stt.taxonomy_id)
                        .single();

                    const { data: terms } = await supabase
                        .from('terms')
                        .select('*')
                        .eq('taxonomy_id', stt.taxonomy_id)
                        .eq('is_active', true)
                        .order('display_order');

                    return {
                        taxonomy: taxonomy!,
                        terms: terms || [],
                        isRequired: stt.is_required || false,
                        maxTerms: stt.max_terms,
                    };
                })
            );

            setTaxonomies(results);
            setLoading(false);
        }

        fetchTaxonomiesForType();
    }, [submissionTypeId]);

    return { taxonomies, loading, error };
}
