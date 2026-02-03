import React, { useState } from 'react';
import { usePayment } from '../hooks';
import { useAuth } from '../hooks/useAuth';
import PaymentModal from './PaymentModal';
import { Lock, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface ContentGuardProps {
    submission: {
        id: string;
        title: string;
        price: number | null;
        currency: string;
        preview_content?: string | null;
        submitter_id: string; // To allow author to view free
    };
    children: React.ReactNode;
}

const ContentGuard: React.FC<ContentGuardProps> = ({ submission, children }) => {
    const { user } = useAuth();
    const { hasAccess } = usePayment();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const location = useLocation();

    const isAuthor = user?.id === submission.submitter_id;
    const isAdmin = false; // TODO: Check admin status from hook if needed, but RLS usually handles this
    // Actually, for frontend UI logic:
    // If price is null or 0 -> Free
    // If user is author -> Free
    // If user purchased -> Free
    // Otherwise -> Blocked

    const isFree = !submission.price || submission.price <= 0;
    const isPurchased = hasAccess(submission.id);

    // Grant access if free, author, or purchased. 
    // Note: Admins should ideally be checked too, but let's assume they might need to test the flow
    // unless we explicitly want them to bypass.
    if (isFree || isAuthor || isPurchased) {
        return <>{children}</>;
    }

    return (
        <div className="space-y-8">
            {/* Preview Content */}
            <div className="prose max-w-none text-muted-foreground relative">
                <div dangerouslySetInnerHTML={{ __html: submission.preview_content || '<p>This content is locked.</p>' }} />

                {/* Gradient Fade */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Access Gate */}
            <div className="bg-card border border-border rounded-xl p-8 text-center shadow-lg relative z-10 -mt-12">
                <div className="flex justify-center mb-6">
                    <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Lock className="size-8 text-primary" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">Unlock Full Access</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Purchase this content to get unlimited lifetime access to the full article and downloadable resources.
                </p>

                {user ? (
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 transform hover:-translate-y-1"
                    >
                        Buy Now for {new Intl.NumberFormat('en-US', { style: 'currency', currency: submission.currency }).format(submission.price || 0)}
                    </button>
                ) : (
                    <div className="space-y-4">
                        <Link
                            to={`/signin?redirect=${location.pathname}`}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground font-bold rounded-full hover:bg-secondary/80 transition-all"
                        >
                            <LogIn className="size-4" />
                            Sign in to Purchase
                        </Link>
                        <p className="text-xs text-muted-foreground">
                            Don't have an account? <Link to="/signup" className="underline hover:text-primary">Sign up</Link>
                        </p>
                    </div>
                )}
            </div>

            {showPaymentModal && (
                <PaymentModal
                    submission={{
                        id: submission.id,
                        title: submission.title,
                        price: submission.price || 0,
                        currency: submission.currency
                    }}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={() => setShowPaymentModal(false)}
                />
            )}
        </div>
    );
};

export default ContentGuard;
