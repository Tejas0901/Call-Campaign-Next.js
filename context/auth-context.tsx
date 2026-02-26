'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import authService from '@/lib/authService';
import tokenStorage, { StoredUser } from '@/lib/tokenStorage';

// Role constants
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  VIEWER: 'viewer',
};

// Role hierarchy — higher index = more permissions
const ROLE_RANK: Record<string, number> = {
  superadmin: 4,
  admin: 3,
  recruiter: 2,
  viewer: 1,
};

export interface User extends StoredUser {}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
  hasRole: (requiredRole: string) => boolean;
  isRole: (role: string) => boolean;
  isLoggedIn: boolean;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      tokenStorage.save(data.access_token, data.refresh_token, data.user);
      
      // Also set token as cookie for middleware to read
      document.cookie = `callbot_access_token=${data.access_token}; path=/; SameSite=Lax; Max-Age=3600`;
      document.cookie = `callbot_refresh_token=${data.refresh_token}; path=/; SameSite=Lax; Max-Age=604800`;
      
      setUser(data.user as User);
      return data.user as User;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const token = tokenStorage.getAccessToken();
      if (token) {
        await authService.logout(token);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      tokenStorage.clear();
      // Clear cookies
      document.cookie = 'callbot_access_token=; path=/; Max-Age=0';
      document.cookie = 'callbot_refresh_token=; path=/; Max-Age=0';
      setUser(null);
      setError(null);
    }
  }, []);

  // Refresh token
  const refresh = useCallback(async (): Promise<string | null> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      await logout();
      return null;
    }
    try {
      const data = await authService.refreshToken(refreshToken);
      tokenStorage.save(data.access_token, data.refresh_token, data.user);
      setUser(data.user as User);
      return data.access_token;
    } catch (err) {
      console.error('Token refresh failed:', err);
      await logout();
      return null;
    }
  }, [logout]);

  // Check if user has a minimum role
  const hasRole = useCallback((requiredRole: string): boolean => {
    if (!user) return false;
    const userRank = ROLE_RANK[user.role?.toLowerCase() || ''] || 0;
    const requiredRank = ROLE_RANK[requiredRole?.toLowerCase() || ''] || 0;
    return userRank >= requiredRank;
  }, [user]);

  // Check if user has exact role
  const isRole = useCallback((role: string): boolean => {
    return user?.role?.toLowerCase() === role?.toLowerCase();
  }, [user]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedUser = tokenStorage.getUser();
        if (savedUser) {
          setUser(savedUser as User);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    refresh,
    hasRole,
    isRole,
    isLoggedIn: !!user,
    getAccessToken: () => tokenStorage.getAccessToken(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook for role-based features
 */
export function useRole() {
  const { hasRole, isRole, user } = useAuth();
  return {
    role: user?.role?.toLowerCase(),
    hasRole,
    isRole,
    isSuperAdmin: isRole(ROLES.SUPERADMIN),
    isAdmin: hasRole(ROLES.ADMIN),
    isRecruiter: hasRole(ROLES.RECRUITER),
    isViewer: !!user,
  };
}
