import React, { useState } from 'react';
import { useSubscription, SubscriptionPlan } from '../hooks/useSubscription';
import { useAuth } from '../hooks/useAuth';
import PricingCard from '../components/PricingCard';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const SubscriptionPage = () => {
    const { plans, currentPlan, subscribe, loading: subLoading, error: subError } = useSubscription();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [actionLoading, setActionLoading] = useState<string | null>(null); // plan key being acted on
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        if (!user) {
            navigate('/signin?redirect=/subscription');
            return;
        }

        if (plan.key === currentPlan?.key) return;

        setActionLoading(plan.key);
        setError(null);
        setSuccessMessage(null);

        const result = await subscribe(plan.key);

        setActionLoading(null);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccessMessage(`Successfully subscribed to ${plan.name} plan! Please complete payment if required.`);
            // In a real app, show payment modal here if manual/stripe
        }
    };

    if (subLoading && plans.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="size-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-muted/30 border-b border-border">
                <div className="container py-8 md:py-12">
                    <div className="mb-6">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="size-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                            Choose Your Publishing Plan
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Select the plan that best fits your research needs. Upgrade or downgrade at any time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="container py-12">
                {subError && (
                    <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                        <AlertCircle className="size-5" />
                        <p>{subError}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                        <AlertCircle className="size-5" />
                        <p>{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-8 p-4 bg-green-500/10 text-green-600 rounded-lg flex items-center gap-2 border border-green-500/20">
                        <div className="size-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</div>
                        <p className="font-medium">{successMessage}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <PricingCard
                            key={plan.key}
                            plan={plan}
                            isCurrent={currentPlan?.key === plan.key}
                            onSelect={handleSubscribe}
                            loading={actionLoading === plan.key}
                        />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        Need a custom plan for your institution? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
