import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, retries = 3) => {
    try {
      // Query profile with Role and Permissions relations
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          role:roles (
            id,
            name,
            slug,
            description,
            role_permissions (
              permission:permissions (
                slug
              )
            )
          )
        `)
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116' && retries > 0) {
        // Profile not found yet — the trigger may still be creating it
        console.log(`Profile not found for ${userId}, retrying in 1s... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchProfile(userId, retries - 1);
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        // Flatten permissions for easier access
        const rawRole = data.role as any;
        const permissions: string[] = rawRole?.role_permissions?.map((rp: any) => rp.permission?.slug) || [];

        // Construct the clean UserProfile
        const fullProfile: UserProfile = {
          ...data,
          role: rawRole ? {
            id: rawRole.id,
            name: rawRole.name,
            slug: rawRole.slug,
            description: rawRole.description
          } : undefined,
          permissions: permissions
        };

        setProfile(fullProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};