import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';

interface PublicRouteProps {
    children: React.ReactNode;
    redirectTo?: string; // Where to redirect if already authenticated
}

/**
 * PublicRoute - Wraps routes that should only be accessible when NOT authenticated
 * Redirects authenticated users to dashboard (or specified path)
 * Use for: signin, signup, forgot-password pages
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
    children,
    redirectTo = '/dashboard'
}) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Already authenticated - redirect to dashboard or intended destination
    if (user) {
        const from = (location.state as any)?.from?.pathname || redirectTo;
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;
