import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserRoleType } from '../types/database';

interface UseUserRolesResult {
    roles: UserRoleType[];
    isAdmin: boolean;
    isEditor: boolean;
    isReviewer: boolean;
    loading: boolean;
    error: string | null;
}

export function useUserRoles(userId: string | undefined): UseUserRolesResult {
    const [roles, setRoles] = useState<UserRoleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchRoles = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', userId)
                    .eq('is_active', true);

                if (fetchError) {
                    setError(fetchError.message);
                    return;
                }

                const userRoles = data?.map(r => r.role) || [];
                setRoles(userRoles);
            } catch (err) {
                setError('Failed to fetch user roles');
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, [userId]);

    return {
        roles,
        isAdmin: roles.includes('ADMIN'),
        isEditor: roles.includes('EDITOR') || roles.includes('EDITOR_IN_CHIEF') || roles.includes('MANAGING_EDITOR'),
        isReviewer: roles.includes('REVIEWER'),
        loading,
        error,
    };
}
