import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type FieldType = Database['public']['Enums']['field_type'];

export interface SubmissionField {
    field_id: string;
    key: string;
    label: string;
    description: string;
    field_type: FieldType;
    is_required: boolean;
    options: any; // JSON
    section: string;
}

export function useSubmissionFields(submissionTypeId: string) {
    const [fields, setFields] = useState<SubmissionField[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFields() {
            if (!submissionTypeId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .rpc('get_fields_for_type', { type_id: submissionTypeId });

            if (fetchError) {
                setError(fetchError.message);
                setLoading(false);
                return;
            }

            setFields(data || []);
            setLoading(false);
        }

        fetchFields();
    }, [submissionTypeId]);

    // Group fields by section
    const fieldsBySection = fields.reduce((acc, field) => {
        const section = field.section || 'General';
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(field);
        return acc;
    }, {} as Record<string, SubmissionField[]>);

    return { fields, fieldsBySection, loading, error };
}
