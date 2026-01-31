import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const { signUp, loading, error } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        affiliation: '',
        isStudent: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!formData.fullName || !formData.email || !formData.password) {
            setLocalError('Please fill in all required fields');
            return;
        }

        if (formData.password.length < 8) {
            setLocalError('Password must be at least 8 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        const result = await signUp(formData.email, formData.password, {
            full_name: formData.fullName,
            affiliation: formData.affiliation,
            is_student: formData.isStudent,
        });

        if (!result.error) {
            setSuccess(true);
        }
    };

    const displayError = localError || error;

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-3">Check your email</h1>
                    <p className="text-muted-foreground mb-6">
                        We've sent a verification link to <strong>{formData.email}</strong>.
                        Please click the link to verify your account.
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
        <div className="min-h-screen bg-background flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 relative overflow-hidden">
                <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
                    <Link to="/" className="flex items-center gap-3 mb-12">
                        <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                            <Sparkles className="size-8 text-white" strokeWidth={2} />
                        </div>
                        <span className="text-2xl font-bold">Ejo Innovation</span>
                    </Link>

                    <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
                        Join the Nkiza<br />
                        <span className="text-white/90">Research Community</span>
                    </h1>

                    <p className="text-lg text-white/80 max-w-md mb-8">
                        Publish your research, connect with peers, and contribute to African scholarship.
                    </p>

                    <div className="flex flex-col gap-4 text-white/70 text-sm">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="size-5 text-white/90" />
                            <span>Open access publication model</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="size-5 text-white/90" />
                            <span>Rigorous double-blind peer review</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="size-5 text-white/90" />
                            <span>SDG-aligned research focus</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="size-5 text-white/90" />
                            <span>Student-friendly submission fees</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
                                <Sparkles className="size-6 text-primary-foreground" strokeWidth={2} />
                            </div>
                            <span className="text-xl font-bold text-foreground">Ejo Innovation</span>
                        </Link>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Create account</h2>
                        <p className="text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/signin" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {displayError && (
                        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                            <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{displayError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                                Full name <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    placeholder="Dr. John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                Email address <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    placeholder="you@university.edu"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="affiliation" className="block text-sm font-medium text-foreground mb-2">
                                Institution / Affiliation
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                <input
                                    id="affiliation"
                                    name="affiliation"
                                    type="text"
                                    value={formData.affiliation}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    placeholder="University of Rwanda"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                Password <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    placeholder="Min. 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                                Confirm password <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <input
                                id="isStudent"
                                name="isStudent"
                                type="checkbox"
                                checked={formData.isStudent}
                                onChange={handleChange}
                                className="mt-1 size-4 rounded border-border text-primary focus:ring-primary/50"
                            />
                            <label htmlFor="isStudent" className="text-sm text-muted-foreground">
                                I am a student (eligible for reduced submission fees)
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="size-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        By creating an account, you agree to our{' '}
                        <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
