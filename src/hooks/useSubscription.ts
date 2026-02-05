import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Subscription {
    id: string;
    user_id: string;
    plan_type: 'free' | 'student' | 'professional';
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
    type: 'free' | 'student' | 'professional';
    name: string;
    price: number;
    submissionsLimit: number | null; // null = unlimited
    features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        type: 'free',
        name: 'Free',
        price: 0,
        submissionsLimit: 2,
        features: [
            '2 submissions per month',
            'Basic author profile',
            'Email support'
        ]
    },
    {
        type: 'student',
        name: 'Student',
        price: 29,
        submissionsLimit: 10,
        features: [
            '10 submissions per month',
            'Priority review queue',
            'Discounted APC fees',
            'Enhanced author profile'
        ]
    },
    {
        type: 'professional',
        name: 'Professional',
        price: 99,
        submissionsLimit: null, // unlimited
        features: [
            'Unlimited submissions',
            'Priority review queue',
            'Free access to subscription books',
            'Dedicated support',
            'Analytics dashboard'
        ]
    }
];

// Use any to bypass type checking until types are regenerated
const db = supabase as any;

export function useSubscription() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    // Get current plan details
    const currentPlan = subscription
        ? SUBSCRIPTION_PLANS.find(p => p.type === subscription.plan_type)
        : SUBSCRIPTION_PLANS[0]; // Default to free

    // Check if user can submit (based on monthly limit)
    const canSubmit = useCallback(async (): Promise<{ allowed: boolean; reason?: string }> => {
        if (!user) return { allowed: false, reason: 'Please sign in to submit' };

        const plan = currentPlan || SUBSCRIPTION_PLANS[0];

        // Unlimited submissions
        if (plan.submissionsLimit === null) {
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
        const remaining = plan.submissionsLimit - submissionsThisMonth;

        if (remaining <= 0) {
            return {
                allowed: false,
                reason: `You've reached your monthly limit of ${plan.submissionsLimit} submissions. Upgrade to submit more.`
            };
        }

        return { allowed: true };
    }, [user, currentPlan]);

    // Subscribe to a plan (creates pending subscription for manual payment)
    const subscribe = async (planType: 'student' | 'professional') => {
        if (!user) return { error: 'Must be logged in' };

        const plan = SUBSCRIPTION_PLANS.find(p => p.type === planType);
        if (!plan) return { error: 'Invalid plan' };

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await db
                .from('subscriptions')
                .insert({
                    user_id: user.id,
                    plan_type: planType,
                    status: 'pending',
                    price_usd: plan.price,
                    submissions_limit: plan.submissionsLimit,
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
