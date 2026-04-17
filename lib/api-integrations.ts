/**
 * API integrations for external services
 * All Hyrex API calls are proxied through /api/hyrex/* to avoid CORS issues.
 */

// Get stored auth format preference (Bearer or Token)
const getStoredAuthFormat = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hyrex-auth-format") || "Bearer";
  }
  return "Bearer";
};

const setStoredAuthFormat = (format: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hyrex-auth-format", format);
  }
};

export interface JobsListResponse {
  count: number;
  results: any[];
  next?: string;
  previous?: string;
  _authFormat?: string;
}

/**
 * Fetch jobs from Hyrex API (via server proxy)
 */
export async function fetchJobsFromHyrex(
  page: number = 1,
  size: number = 100,
  authToken?: string
): Promise<JobsListResponse> {
  const url = `/api/hyrex/jobs?page=${page}&size=${size}`;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authToken) {
    const authFormat = getStoredAuthFormat();
    headers["Authorization"] = `${authFormat} ${authToken}`;
  }

  const response = await fetch(url, { method: "GET", headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data: JobsListResponse = await response.json();

  // If the proxy found a working auth format, remember it
  if (data._authFormat) {
    setStoredAuthFormat(data._authFormat);
  }

  return data;
}

/**
 * Filter jobs by job code (via server proxy)
 */
export async function filterJobsByCode(
  jobCode: string,
  authToken?: string
): Promise<JobsListResponse> {
  const url = `/api/hyrex/jobs?job_code=${encodeURIComponent(jobCode)}`;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authToken) {
    const authFormat = getStoredAuthFormat();
    headers["Authorization"] = `${authFormat} ${authToken}`;
  }

  const response = await fetch(url, { method: "GET", headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data: JobsListResponse = await response.json();

  if (data._authFormat) {
    setStoredAuthFormat(data._authFormat);
  }

  return data;
}

/**
 * Search jobs with multiple filters (via server proxy)
 */
export async function searchJobs(filters: {
  job_code?: string;
  status?: string;
  job_created_start?: string;
  job_created_end?: string;
  page?: number;
  size?: number;
  authToken?: string;
}): Promise<JobsListResponse> {
  const params = new URLSearchParams();

  if (filters.job_code) params.append("job_code", filters.job_code);
  if (filters.status) params.append("status", filters.status);
  if (filters.job_created_start)
    params.append("job_created_start", filters.job_created_start);
  if (filters.job_created_end)
    params.append("job_created_end", filters.job_created_end);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.size) params.append("size", String(filters.size));

  const url = `/api/hyrex/jobs?${params.toString()}`;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (filters.authToken) {
    const authFormat = getStoredAuthFormat();
    headers["Authorization"] = `${authFormat} ${filters.authToken}`;
  }

  const response = await fetch(url, { method: "GET", headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}
