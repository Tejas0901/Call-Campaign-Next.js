'use client';

import { useRole } from '@/context/auth-context';

interface RoleGateProps {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Show children only if user has the required role or higher
 */
export function RoleGate({ role, children, fallback = null }: RoleGateProps) {
  const { hasRole } = useRole();
  return hasRole(role) ? children : fallback;
}

/**
 * Show children only for exact role match
 */
export function ExactRole({ role, children, fallback = null }: RoleGateProps) {
  const { isRole } = useRole();
  return isRole(role) ? children : fallback;
}
