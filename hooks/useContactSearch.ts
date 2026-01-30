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
export function useContactSearch(campaignId: string | null, authToken: string | undefined) {
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
    if (!campaignId || !authToken) return;

    setLoading(true);
    setError(null);

    try {
      const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!TENANT_ID || !API_BASE_URL) {
        throw new Error('Missing environment configuration');
      }

      const query = buildSearchQuery(filters);
      const url = `${API_BASE_URL.replace(/\/$/, '')}/api/v1/contacts/${campaignId}/search?${query}`;

      const response = await fetch(url, {
        headers: {
          'tenant-id': TENANT_ID,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'ngrok-skip-browser-warning': '69420',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
      setError(err.message);
      console.error('Failed to fetch contacts:', err);
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
