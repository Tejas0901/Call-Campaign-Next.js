/**
 * Token Storage Manager
 * Handles secure storage and retrieval of authentication tokens and user data
 */

const ACCESS_TOKEN_KEY = 'callbot_access_token';
const REFRESH_TOKEN_KEY = 'callbot_refresh_token';
const USER_KEY = 'callbot_user';

export interface StoredUser {
  id: string;
  email: string;
  username?: string;
  role?: string;
  tenant_id?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

const tokenStorage = {
  /**
   * Save tokens and user data to localStorage
   */
  save(accessToken: string, refreshToken: string, user: StoredUser) {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving tokens to localStorage:', error);
    }
  },

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  },

  /**
   * Get stored user data
   */
  getUser(): StoredUser | null {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  /**
   * Clear all tokens and user data
   */
  clear() {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    try {
      return !!localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },
};

export default tokenStorage;
