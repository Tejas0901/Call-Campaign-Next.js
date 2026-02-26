'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRole, ROLES } from '@/context/auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

/**
 * Wrapper for protected routes that require authentication
 */
export function RequireAuth({ children, fallback }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isLoggedIn) {
    return fallback || <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

  return <>{children}</>;
}

/**
 * Wrapper for routes that require specific role or higher
 */
export function RequireRole({
  children,
  requiredRole = ROLES.VIEWER,
  fallback,
}: ProtectedRouteProps) {
  const { isLoggedIn, loading } = useAuth();
  const { hasRole } = useRole();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isLoggedIn) {
    return fallback || <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>;
  }

  if (!hasRole(requiredRole)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">You do not have permission to access this page.</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

/**
 * HOC for wrapping page components with role protection
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <RequireRole requiredRole={requiredRole}>
        <Component {...props} />
      </RequireRole>
    );
  };
}
