/**
 * Error Message Utilities
 * Provides consistent error message handling across the application
 */

export function getAuthErrorMessage(status: number, detail?: string): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your data.',
    401: 'Session expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'Resource not found.',
    422: 'Invalid input. Please check your data.',
    500: 'Server error. Please try again later.',
    503: 'Service unavailable. Please try again later.',
  };

  return detail || messages[status] || 'An unexpected error occurred.';
}

export function parseApiError(error: any): {
  status: number;
  message: string;
} {
  if (error instanceof Error) {
    const status = (error as any).status || 500;
    return {
      status,
      message: getAuthErrorMessage(status, error.message),
    };
  }

  return {
    status: 500,
    message: 'An unexpected error occurred.',
  };
}
