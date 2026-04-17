/**
 * Authentication Service
 * Handles all API calls for authentication including login, logout, token refresh,
 * and user management operations
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper to get default headers for all requests
function getDefaultHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420', // Required for ngrok
    'User-Agent': 'CallCampaign/1.0',
  };
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    username?: string;
    role?: string;
    tenant_id?: string;
    is_active?: boolean;
    is_verified?: boolean;
  };
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    username?: string;
    role?: string;
    tenant_id?: string;
    is_active?: boolean;
    is_verified?: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  role?: string;
  tenant_id?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  tenant_id?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        ...getDefaultHeaders(),
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Login failed');
    }

    // Debug: Log token payload structure
    if (data.access_token) {
      try {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        console.log('[AuthService] Login token payload:', payload);
        console.log('[AuthService] Has sub:', payload.sub !== undefined);
        console.log('[AuthService] Has tenant_id:', payload.tenant_id !== undefined);
        console.log('[AuthService] Has user_id:', payload.user_id !== undefined);
      } catch (e) {
        console.error('[AuthService] Failed to decode token:', e);
      }
    }

    return data;
  },

  /**
   * Logout - invalidate token on server
   */
  async logout(accessToken: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Always clear tokens locally regardless of response
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        ...getDefaultHeaders(),
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Session expired');
    }

    return data;
  },

  /**
   * Get current user profile
   */
  async getMe(accessToken: string): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: {
        ...getDefaultHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Check content type before parsing
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response from server (not JSON)');
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to fetch profile');
    }

    return data.data || data;
  },

  /**
   * Update user profile (username, email)
   */
  async updateMe(
    accessToken: string,
    updates: { username?: string; email?: string }
  ): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      method: 'PATCH',
      headers: {
        ...getDefaultHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Update failed');
    }

    return data.data || data;
  },

  /**
   * Change password
   */
  async changePassword(
    accessToken: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: {
        ...getDefaultHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Password change failed');
    }

    return data;
  },

  /**
   * List all users (admin+ only)
   */
  async listUsers(
    accessToken: string,
    params: { skip?: number; limit?: number } = {}
  ): Promise<{ users: User[]; count: number }> {
    const { skip = 0, limit = 50 } = params;
    const res = await fetch(
      `${BASE_URL}/api/v1/auth/users?skip=${skip}&limit=${limit}`,
      {
        headers: {
          ...getDefaultHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to list users');
    }

    return data.data || data;
  },

  /**
   * Create new user (admin+ only)
   */
  async createUser(
    accessToken: string,
    userData: {
      email: string;
      username: string;
      password: string;
      role: string;
    }
  ): Promise<User> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/users`, {
      method: 'POST',
      headers: {
        ...getDefaultHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to create user');
    }

    return data.data || data;
  },

  /**
   * Update user (admin+ only)
   */
  async updateUser(
    accessToken: string,
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/users/${userId}`, {
      method: 'PATCH',
      headers: {
        ...getDefaultHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to update user');
    }

    return data.data || data;
  },

  /**
   * Deactivate/delete user (admin+ only)
   */
  async deactivateUser(accessToken: string, userId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/users/${userId}`, {
      method: 'DELETE',
      headers: {
        ...getDefaultHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to deactivate user');
    }

    return data;
  },

  /**
   * Create superadmin user (superadmin only)
   */
  async createSuperAdmin(
    accessToken: string,
    userData: {
      email: string;
      username: string;
      password: string;
    }
  ): Promise<User> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/users/superadmin-create`, {
      method: 'POST',
      headers: {
        ...getDefaultHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to create superadmin');
    }

    return data.data || data;
  },

  /**
   * Validate if the token is still valid by checking if it's expired
   * @param token JWT token to validate
   * @returns boolean indicating if token is valid
   */
  isTokenValid(token: string): boolean {
    try {
      if (!token) return false;
      
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      
      // Decode JWT token without verification (we're just checking expiration)
      const parts = cleanToken.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (with 5 minute buffer)
      return payload.exp && payload.exp > currentTime + 300;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },
};

export default authService;
