'use client';

import { useState, useCallback } from 'react';
import { parseApiError } from '@/lib/errorMessages';

export interface UseApiCallOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (message: string, status: number) => void;
}

/**
 * Hook for making API calls with consistent error handling
 */
export function useApiCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      options: UseApiCallOptions<T> = {}
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await fn();
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const { message, status } = parseApiError(err);
        setError(message);
        options.onError?.(message, status);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { call, loading, error, clearError };
}
