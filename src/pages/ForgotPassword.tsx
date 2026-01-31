import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ForgotPassword: React.FC = () => {
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        const result = await resetPassword(email);
        setLoading(false);

        if (result.error) {
            setError(result.error.message);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-3">Check your email</h1>
                    <p className="text-muted-foreground mb-6">
                        We've sent password reset instructions to <strong>{email}</strong>.
                        Please check your inbox and follow the link to reset your password.
                    </p>
                    <Link
                        to="/signin"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
                            <Sparkles className="size-6 text-primary-foreground" strokeWidth={2} />
                        </div>
                        <span className="text-xl font-bold text-foreground">Ejo Innovation</span>
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Reset password</h1>
                    <p className="text-muted-foreground">
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                        <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="size-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                Sending...
                            </span>
                        ) : (
                            'Send reset instructions'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/signin"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
