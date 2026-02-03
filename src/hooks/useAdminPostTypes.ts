import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type SubmissionType = Database['public']['Tables']['submission_types']['Row'];
type SubmissionField = Database['public']['Tables']['submission_fields']['Row'];
type VenueType = Database['public']['Enums']['venue_type'];
type FieldType = Database['public']['Enums']['field_type'];

interface CreatePostTypeData {
    key: string;
    label: string;
    description?: string;
    icon?: string;
    allowed_venue_types?: VenueType[];
    default_workflow_id?: string;
}

interface UpdatePostTypeData extends Partial<CreatePostTypeData> { }

interface CreateFieldData {
    submission_type_id: string;
    key: string;
    label: string;
    description?: string;
    field_type: FieldType;
    is_required?: boolean;
    display_order?: number;
    min_length?: number;
    max_length?: number;
    options?: Record<string, unknown> | null;
    section?: string;
}

interface UpdateFieldData extends Partial<Omit<CreateFieldData, 'submission_type_id'>> { }

export function useAdminPostTypes() {
    const [postTypes, setPostTypes] = useState<SubmissionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all post types
    const fetchPostTypes = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('submission_types')
                .select('*')
                .order('label');

            if (fetchError) throw fetchError;
            setPostTypes(data || []);
        } catch (err: any) {
            console.error('Error fetching post types:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPostTypes();
    }, [fetchPostTypes]);

    // Create post type
    const createPostType = useCallback(async (data: CreatePostTypeData) => {
        setSaving(true);
        setError(null);
        try {
            const { data: newType, error: createError } = await supabase
                .from('submission_types')
                .insert({
                    key: data.key,
                    label: data.label,
                    description: data.description,
                    icon: data.icon,
                    allowed_venue_types: data.allowed_venue_types,
                    default_workflow_id: data.default_workflow_id,
                    is_active: true
                })
                .select()
                .single();

            if (createError) throw createError;
            return { success: true, data: newType };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, []);

    // Update post type
    const updatePostType = useCallback(async (id: string, data: UpdatePostTypeData) => {
        setSaving(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('submission_types')
                .update(data)
                .eq('id', id);

            if (updateError) throw updateError;
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, []);

    // Archive post type
    const archivePostType = useCallback(async (id: string) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('submission_types')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, []);

    // Restore post type
    const restorePostType = useCallback(async (id: string) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('submission_types')
                .update({ is_active: true })
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, []);

    return {
        postTypes,
        loading,
        saving,
        error,
        fetchPostTypes,
        createPostType,
        updatePostType,
        archivePostType,
        restorePostType
    };
}

// Hook for managing fields within a post type
export function usePostTypeFields(postTypeId: string | null) {
    const [fields, setFields] = useState<SubmissionField[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch fields for a post type
    const fetchFields = useCallback(async () => {
        if (!postTypeId) {
            setFields([]);
            return;
        }

        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('submission_fields')
                .select('*')
                .eq('submission_type_id', postTypeId)
                .order('display_order');

            if (fetchError) throw fetchError;
            setFields(data || []);
        } catch (err: any) {
            console.error('Error fetching fields:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [postTypeId]);

    useEffect(() => {
        fetchFields();
    }, [fetchFields]);

    // Create field
    const createField = useCallback(async (data: CreateFieldData) => {
        setSaving(true);
        setError(null);
        try {
            const { data: newField, error: createError } = await supabase
                .from('submission_fields')
                .insert(data as any)
                .select()
                .single();

            if (createError) throw createError;
            return { success: true, data: newField };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, []);

    // Update field
    const updateField = useCallback(async (id: string, data: UpdateFieldData) => {
        setSaving(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('submission_fields')
                .update(data as any)
                .eq('id', id);

            if (updateError) throw updateError;
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, []);

    // Delete field
    const deleteField = useCallback(async (id: string) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('submission_fields')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, []);

    // Reorder fields
    const reorderFields = useCallback(async (orderedIds: string[]) => {
        setSaving(true);
        try {
            const updates = orderedIds.map((id, index) =>
                supabase
                    .from('submission_fields')
                    .update({ display_order: index })
                    .eq('id', id)
            );

            await Promise.all(updates);
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    }, []);

    return {
        fields,
        loading,
        saving,
        error,
        fetchFields,
        createField,
        updateField,
        deleteField,
        reorderFields
    };
}
