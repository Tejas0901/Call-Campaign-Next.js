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
 * TODO: Re-enable auth checks once backend credentials are configured
 */
export function RequireAuth({ children, fallback }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  // Temporarily bypass auth protection
  return <>{children}</>;
}

/**
 * Wrapper for routes that require specific role or higher
 * TODO: Re-enable role checks once backend credentials are configured
 */
export function RequireRole({
  children,
  requiredRole = ROLES.VIEWER,
  fallback,
}: ProtectedRouteProps) {
  // Temporarily bypass role protection
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
