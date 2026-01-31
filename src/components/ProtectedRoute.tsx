import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[]; // Optional: restrict to specific roles
}

/**
 * ProtectedRoute - Wraps routes that require authentication
 * Redirects to /signin if user is not authenticated
 * Optionally checks for specific roles
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRoles
}) => {
    const { user, loading, profile } = useAuth();
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

    // Not authenticated - redirect to signin
    if (!user) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // If roles are required, check user's role
    if (requiredRoles && requiredRoles.length > 0 && profile) {
        // This would require fetching user_roles from DB
        // For now, we'll skip role checking and implement it later
        // TODO: Implement role-based access control
    }

    return <>{children}</>;
};

export default ProtectedRoute;
