import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Subscription {
    id: string;
    user_id: string;
    plan_type: string; // matches 'key' in subscription_plans
    status: 'pending' | 'active' | 'cancelled' | 'expired';
    price_usd: number | null;
    submissions_limit: number | null;
    started_at: string | null;
    expires_at: string | null;
    payment_reference: string | null;
    payment_method: string;
    created_at: string;
}

export interface SubscriptionPlan {
    id: string;
    key: string;
    name: string;
    price_usd: number;
    submissions_limit: number | null; // null = unlimited
    features: string[];
    is_active: boolean;
}

// Use any to bypass type checking until types are regenerated
const db = supabase as any;

export function useSubscription() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch active subscription plans
    const fetchPlans = useCallback(async () => {
        try {
            const { data, error } = await db
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .order('price_usd', { ascending: true });

            if (error) throw error;
            setPlans(data as SubscriptionPlan[]);
        } catch (err: any) {
            console.error('Error fetching plans:', err);
            // Fallback to empty or handled in UI
        }
    }, []);

    // Fetch current subscription
    const fetchSubscription = useCallback(async () => {
        if (!user) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await db
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .in('status', ['active', 'pending'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            setSubscription(data as Subscription | null);
        } catch (err: any) {
            console.error('Error fetching subscription:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial load
    useEffect(() => {
        fetchPlans();
        if (user) {
            fetchSubscription();
        } else {
            setLoading(false);
        }
    }, [user, fetchPlans, fetchSubscription]);

    // Get current plan details
    const currentPlan = subscription && plans.length > 0
        ? plans.find(p => p.key === subscription.plan_type)
        : plans.find(p => p.key === 'free'); // Default to free if found

    // Check if user can submit (based on monthly limit)
    const canSubmit = useCallback(async (): Promise<{ allowed: boolean; reason?: string }> => {
        if (!user) return { allowed: false, reason: 'Please sign in to submit' };

        // If plans haven't loaded yet, wait or default to restrictive
        if (plans.length === 0) return { allowed: false, reason: 'Loading plans...' };

        const plan = currentPlan || plans.find(p => p.key === 'free');
        if (!plan) return { allowed: false, reason: 'No valid plan found' };

        // Unlimited submissions
        if (plan.submissions_limit === null) {
            return { allowed: true };
        }

        // Check this month's submissions
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from('submissions')
            .select('id', { count: 'exact', head: true })
            .eq('submitter_id', user.id)
            .gte('created_at', startOfMonth.toISOString());

        if (error) {
            console.error('Error checking submission count:', error);
            return { allowed: true }; // Allow on error, don't block
        }

        const submissionsThisMonth = count || 0;
        const remaining = plan.submissions_limit - submissionsThisMonth;

        if (remaining <= 0) {
            return {
                allowed: false,
                reason: `You've reached your monthly limit of ${plan.submissions_limit} submissions. Upgrade to submit more.`
            };
        }

        return { allowed: true };
    }, [user, currentPlan, plans]);

    // Subscribe to a plan (creates pending subscription for manual payment)
    const subscribe = async (planKey: string) => {
        if (!user) return { error: 'Must be logged in' };

        const plan = plans.find(p => p.key === planKey);
        if (!plan) return { error: 'Invalid plan' };

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await db
                .from('subscriptions')
                .insert({
                    user_id: user.id,
                    plan_type: planKey,
                    status: 'pending',
                    price_usd: plan.price_usd,
                    submissions_limit: plan.submissions_limit,
                    payment_method: 'manual'
                })
                .select()
                .single();

            if (error) throw error;

            await fetchSubscription();
            return { success: true, subscription: data };
        } catch (err: any) {
            console.error('Subscription error:', err);
            setError(err.message);
            return { error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Cancel subscription
    const cancelSubscription = async () => {
        if (!subscription) return { error: 'No active subscription' };

        setLoading(true);
        try {
            const { error } = await db
                .from('subscriptions')
                .update({ status: 'cancelled' })
                .eq('id', subscription.id);

            if (error) throw error;

            await fetchSubscription();
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        subscription,
        currentPlan,
        plans,
        loading,
        error,
        canSubmit,
        subscribe,
        cancelSubscription,
        refresh: fetchSubscription,
        isSubscribed: subscription?.status === 'active',
        isPending: subscription?.status === 'pending'
    };
}
