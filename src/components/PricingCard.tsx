import React from 'react';
import { Check, X } from 'lucide-react';
import { SubscriptionPlan } from '../hooks/useSubscription';

interface PricingCardProps {
    plan: SubscriptionPlan;
    isCurrent: boolean;
    onSelect: (plan: SubscriptionPlan) => void;
    loading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, isCurrent, onSelect, loading }) => {
    const isFree = plan.price_usd === 0;

    return (
        <div className={`relative flex flex-col p-6 bg-card rounded-2xl border ${isCurrent ? 'border-primary ring-2 ring-primary/20 shadow-xl' : 'border-border shadow-sm hover:shadow-md'} transition-all duration-300`}>
            {isCurrent && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Current Plan
                    </span>
                </div>
            )}

            <div className="mb-5">
                <h3 className="text-lg font-bold text-foreground capitalize">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {plan.submissions_limit ? (
                        <span>{plan.submissions_limit} submissions / month</span>
                    ) : (
                        <span>Unlimited submissions</span>
                    )}
                </p>
            </div>

            <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                    {isFree ? 'Free' : `$${plan.price_usd}`}
                </span>
                {!isFree && <span className="text-sm text-muted-foreground">/ year</span>}
            </div>

            <ul className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                            <Check className="size-3 text-primary" />
                        </div>
                        <span className="text-foreground/80">{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSelect(plan)}
                disabled={isCurrent || loading}
                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
          ${isCurrent
                        ? 'bg-secondary text-secondary-foreground cursor-default'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                    }
          ${loading ? 'opacity-70 cursor-wait' : ''}
        `}
            >
                {loading ? 'Processing...' : isCurrent ? 'Active Plan' : isFree ? 'Get Started' : 'Subscribe Now'}
            </button>
        </div>
    );
};

export default PricingCard;
