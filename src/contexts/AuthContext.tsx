import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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

interface AuthContextType extends AuthState {
    signUp: (email: string, password: string, metadata?: { full_name?: string; affiliation?: string; is_student?: boolean }) => Promise<{ data?: any; error?: any }>;
    signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ success?: boolean; error?: any }>;
    updatePassword: (newPassword: string) => Promise<{ success?: boolean; error?: any }>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ data?: Profile; error?: any }>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        session: null,
        loading: true,
        error: null,
    });

    const lastUserId = useRef<string | null>(null);

    const fetchProfile = async (userId: string): Promise<Profile | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('AuthProvider: Error fetching profile:', error);
            return null;
        }
        return data;
    };

    useEffect(() => {
        let mounted = true;
        console.log('AuthProvider: mounting');

        const initAuth = async () => {
            console.log('AuthProvider: getSession start');

            // Create a timeout promise to prevent hanging indefinitely
            const timeoutPromise = new Promise<{ data: { session: null }; error: { message: string } }>((resolve) => {
                setTimeout(() => resolve({ data: { session: null }, error: { message: "Auth timeout" } }), 5000);
            });

            // Race getSession against timeout
            const sessionPromise = supabase.auth.getSession();

            // Use type assertion to handle the race result
            const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
            const { data: { session }, error } = result;

            console.log('AuthProvider: getSession result', { hasSession: !!session, error });

            if (!mounted) {
                console.log('AuthProvider: unmounted during getSession');
                return;
            }

            if (error) {
                console.error('AuthProvider: error getting session or timeout', error);

                // CRITICAL FIX: If onAuthStateChange has already authenticated the user, 
                // do NOT wipe the state just because getSession timed out.
                if (lastUserId.current) {
                    console.log('AuthProvider: ignoring timeout/error because user is already authenticated via listener');
                    return;
                }

                // Only if we truly have no user...
                lastUserId.current = null;
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message === "Auth timeout" ? null : error.message
                }));
                return;
            }

            if (session?.user) {
                lastUserId.current = session.user.id;
                console.log('AuthProvider: fetching profile for', session.user.id);
                try {
                    const profile = await fetchProfile(session.user.id);
                    console.log('AuthProvider: profile fetched', { hasProfile: !!profile });

                    if (mounted) {
                        setState({
                            user: session.user,
                            profile,
                            session,
                            loading: false,
                            error: null,
                        });
                    }
                } catch (err) {
                    console.error('AuthProvider: profile fetch exception', err);
                    if (mounted) {
                        setState(prev => ({ ...prev, loading: false }));
                    }
                }
            } else {
                console.log('AuthProvider: no session user');
                lastUserId.current = null;
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('AuthProvider: auth change', event, { hasSession: !!session, userId: session?.user?.id });

                if (!mounted) {
                    console.log('AuthProvider: auth change ignored (unmounted)');
                    return;
                }

                if (session?.user) {
                    console.log('AuthProvider: processing user session');
                    if (session.user.id === lastUserId.current && (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN')) {
                        console.log('AuthProvider: skipping redundant fetch', { event, lastId: lastUserId.current });
                        setState(prev => ({
                            ...prev,
                            session,
                            user: session.user,
                            loading: false
                        }));
                        return;
                    }

                    console.log('AuthProvider: setting new user/fetching profile');
                    lastUserId.current = session.user.id;

                    try {
                        const profile = await fetchProfile(session.user.id);
                        console.log('AuthProvider: profile fetch complete', { hasProfile: !!profile });

                        if (mounted) {
                            setState({
                                user: session.user,
                                profile,
                                session,
                                loading: false,
                                error: null,
                            });
                        }
                    } catch (err) {
                        console.error('AuthProvider: error in auth change handler', err);
                        if (mounted) {
                            setState({
                                user: session.user,
                                profile: null,
                                session,
                                loading: false,
                                error: "Profile fetch failed"
                            });
                        }
                    }
                } else {
                    console.log('AuthProvider: no session in auth change');
                    lastUserId.current = null;
                    if (mounted) {
                        setState({
                            user: null,
                            profile: null,
                            session: null,
                            loading: false,
                            error: null,
                        });
                    }
                }
            }
        );

        return () => {
            console.log('AuthProvider: unmounting');
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signUp = useCallback(async (
        email: string,
        password: string,
        metadata?: { full_name?: string; affiliation?: string; is_student?: boolean }
    ) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });

        if (error) {
            return { error };
        }

        return { data };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error };
        }

        return { data };
    }, []);

    const signOut = useCallback(async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            // Optimistic update
            lastUserId.current = null;
            setState({
                user: null,
                profile: null,
                session: null,
                loading: false,
                error: null,
            });
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

    const value = {
        ...state,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        isAuthenticated: !!state.user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
