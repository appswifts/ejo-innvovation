import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { usePayment } from '../hooks';

interface PaymentModalProps {
    submission: {
        id: string;
        title: string;
        price: number;
        currency: string;
    };
    onClose: () => void;
    onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ submission, onClose, onSuccess }) => {
    const { initiatePurchase } = usePayment();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);
        setError(null);

        // In a real app, this is where we'd integrated Stripe Elements or similar
        // For now, we simulate the backend call
        const result = await initiatePurchase(submission.id, submission.price, submission.currency);

        setLoading(false);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } else {
            setError(result.error || 'Payment failed');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Lock className="size-4 text-primary" />
                        <h2 className="font-semibold">Secure Checkout</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-secondary rounded-full transition-colors"
                    >
                        <X className="size-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                            <div className="size-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="size-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-green-700">Payment Successful!</h3>
                            <p className="text-muted-foreground">You now have full access to this content.</p>
                        </div>
                    ) : (
                        <>
                            {/* Item Summary */}
                            <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchasing Access To</p>
                                <h3 className="font-bold text-lg leading-tight">{submission.title}</h3>
                                <div className="mt-2 text-2xl font-bold text-primary">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: submission.currency }).format(submission.price)}
                                </div>
                            </div>

                            {/* Payment Method Stub */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-primary bg-primary/5 p-3 rounded-lg flex items-center gap-2 cursor-pointer ring-1 ring-primary/20">
                                        <CreditCard className="size-4 text-primary" />
                                        <span className="text-sm font-medium">Card</span>
                                    </div>
                                    <div className="border border-border p-3 rounded-lg flex items-center gap-2 cursor-not-allowed opacity-50">
                                        <span className="size-4 rounded-full bg-yellow-400"></span>
                                        <span className="text-sm font-medium">MTN MoMo</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Secure payment processing via Stripe. No card details are stored on our servers.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="size-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handlePurchase}
                                disabled={loading}
                                className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Lock className="size-4" />
                                        Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency: submission.currency }).format(submission.price)}
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                {!success && (
                    <div className="p-4 bg-muted/30 border-t border-border text-center">
                        <p className="text-xs text-muted-foreground">By confirming, you agree to our Terms of Service.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
