'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import AuthModal from '../auth/AuthModal';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    fallback?: ReactNode;
}

/**
 * Protected route wrapper that can require authentication.
 * If requireAuth is true and user is not authenticated, shows auth modal.
 * If requireAuth is false (default), shows content to all users.
 */
export default function ProtectedRoute({
    children,
    requireAuth = false,
    fallback
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        if (!isLoading && requireAuth && !isAuthenticated) {
            setShowAuthModal(true);
        }
    }, [isLoading, requireAuth, isAuthenticated]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[var(--accent-blue)]/30 border-t-[var(--accent-blue)] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)]">Loading...</p>
                </div>
            </div>
        );
    }

    // If auth required but not authenticated
    if (requireAuth && !isAuthenticated) {
        return (
            <>
                {fallback || (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <p className="text-[var(--text-secondary)]">Please sign in to continue</p>
                        </div>
                    </div>
                )}
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                />
            </>
        );
    }

    return <>{children}</>;
}
