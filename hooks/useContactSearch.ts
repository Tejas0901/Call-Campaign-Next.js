import { useState, useEffect, useCallback } from 'react';
import { 
  Contact, 
  ContactSearchFilters, 
  ContactSearchResponse, 
  Pagination 
} from '@/types/contact';

/**
 * Helper function to build query string from filter object
 */
function buildSearchQuery(filters: ContactSearchFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.append(key, value.join(','));
        }
      } else {
        params.append(key, String(value));
      }
    }
  });

  return params.toString();
}

/**
 * Custom hook for contact search with filtering and pagination
 */
export function useContactSearch(
  campaignId: string | null, 
  authToken: string | undefined,
  onTokenExpired?: () => void
) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filtersApplied, setFiltersApplied] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ContactSearchFilters>({
    page: 1,
    page_size: 25,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const fetchContacts = useCallback(async () => {
    // Don't attempt fetch if we don't have required parameters
    if (!campaignId) {
      console.log('[useContactSearch] No campaign ID provided, skipping fetch');
      return;
    }
    
    if (!authToken) {
      // Don't show error if we're just waiting for auth token
      console.log('[useContactSearch] Waiting for auth token...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!TENANT_ID || !API_BASE_URL) {
        throw new Error('Missing environment configuration');
      }

      // Validate campaignId
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }

      const query = buildSearchQuery(filters);
      const url = `${API_BASE_URL.replace(/\/$/, '')}/api/v1/contacts/${campaignId}/search?${query}`;
    
      console.log('[useContactSearch] Fetching contacts from:', url);
      console.log('[useContactSearch] Headers:', {
        'tenant-id': TENANT_ID,
        'Authorization': authToken ? `Bearer ${authToken.substring(0, 10)}...` : 'undefined'
      });

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url, {
          headers: {
            'tenant-id': TENANT_ID,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'ngrok-skip-browser-warning': '69420',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
        
          // If it's a 401 Unauthorized error, the token is invalid/expired
          if (response.status === 401) {
            console.error('[useContactSearch] Invalid or expired token received');
            // Call the callback if provided to handle token expiration
            if (onTokenExpired) {
              onTokenExpired();
            }
            throw new Error('Invalid or expired authentication token. Please log in again.');
          }
        
          throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
        }

        const data: ContactSearchResponse = await response.json();

        if (data.success) {
          setContacts(data.data.contacts);
          setPagination(data.pagination);
          setFiltersApplied(data.filters_applied);
        } else {
          throw new Error('Failed to fetch contacts');
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        // Handle network errors specifically
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Network error: Unable to connect to the server. Please check your internet connection.');
          console.error('[useContactSearch] Network error:', err);
        } else if (err.name === 'AbortError') {
          setError('Request timeout: The server is taking too long to respond.');
          console.error('[useContactSearch] Request timeout:', err);
        } else {
          setError(err.message);
          console.error('[useContactSearch] Error fetching contacts:', err);
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error('[useContactSearch] Error in fetchContacts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, campaignId, authToken]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const updateFilters = useCallback((newFilters: Partial<ContactSearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to page 1 when filters change unless page is explicitly provided
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      page_size: 25,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  }, []);

  return {
    contacts,
    pagination,
    filtersApplied,
    loading,
    error,
    filters,
    updateFilters,
    goToPage,
    clearFilters,
    refetch: fetchContacts
  };
}
