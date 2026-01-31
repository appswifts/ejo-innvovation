import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

interface AuthState {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        session: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                setState(prev => ({ ...prev, loading: false, error: error.message }));
                return;
            }

            if (session?.user) {
                fetchProfile(session.user.id).then(profile => {
                    setState({
                        user: session.user,
                        profile,
                        session,
                        loading: false,
                        error: null,
                    });
                });
            } else {
                setState(prev => ({ ...prev, loading: false }));
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setState({
                        user: session.user,
                        profile,
                        session,
                        loading: false,
                        error: null,
                    });
                } else {
                    setState({
                        user: null,
                        profile: null,
                        session: null,
                        loading: false,
                        error: null,
                    });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string): Promise<Profile | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    };

    const signUp = useCallback(async (
        email: string,
        password: string,
        metadata?: { full_name?: string; affiliation?: string; is_student?: boolean }
    ) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });

        if (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
            return { error };
        }

        return { data };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setState(prev => ({ ...prev, loading: false, error: error.message }));
            return { error };
        }

        return { data };
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            setState(prev => ({ ...prev, error: error.message }));
        }
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            return { error };
        }
        return { success: true };
    }, []);

    const updatePassword = useCallback(async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            return { error };
        }
        return { success: true };
    }, []);

    const updateProfile = useCallback(async (updates: Partial<Profile>) => {
        if (!state.user) return { error: new Error('Not authenticated') };

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', state.user.id)
            .select()
            .single();

        if (error) {
            return { error };
        }

        setState(prev => ({ ...prev, profile: data }));
        return { data };
    }, [state.user]);

    return {
        ...state,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        isAuthenticated: !!state.user,
    };
}
