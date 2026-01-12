/**
 * API integrations for external services
 */

const HYREX_API_BASE = "https://api.hyrexai.com/api/v1";

type AuthHeader = { Authorization?: string };

const buildHeaders = (authToken?: string): HeadersInit => {
  const base: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    // Try Token format (Django token authentication)
    (base as AuthHeader).Authorization = `Token ${authToken}`;
    console.log("[API Headers] Authorization set with Token format");
  } else {
    console.warn("[API Headers] No auth token provided");
  }
  return base;
};

export interface JobsListResponse {
  count: number;
  results: any[];
  next?: string;
  previous?: string;
}

/**
 * Fetch jobs from Hyrex API
 * @param page Page number (default: 1)
 * @param size Items per page (default: 100)
 * @returns JobsListResponse
 */
export async function fetchJobsFromHyrex(
  page: number = 1,
  size: number = 100,
  authToken?: string
): Promise<JobsListResponse> {
  let url = `${HYREX_API_BASE}/jobs/jobview/?page=${page}&size=${size}`;
  
  // Add token as query parameter if available
  if (authToken) {
    url += `&token=${encodeURIComponent(authToken)}`;
  }
  
  console.log("[fetchJobsFromHyrex] Calling with token:", !!authToken);

  try {
    const headers = buildHeaders(authToken);
    
    // Try with Token format first
    let response = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log("[fetchJobsFromHyrex] Response status:", response.status);

    // If 401 with Token format, try Bearer format
    if (response.status === 401 && authToken) {
      console.log("[fetchJobsFromHyrex] Got 401 with Token format, trying Bearer...");
      const bearerHeaders: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };
      response = await fetch(url, {
        method: "GET",
        headers: bearerHeaders,
      });
      console.log("[fetchJobsFromHyrex] Bearer attempt status:", response.status);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("[fetchJobsFromHyrex] Error:", response.status, errorText.substring(0, 300));
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[fetchJobsFromHyrex] Success, got", data.results?.length || 0, "results");
    return data;
  } catch (error) {
    console.error("[fetchJobsFromHyrex] Error:", error);
    throw error;
  }
}

/**
 * Filter jobs by job code
 * @param jobCode Job code to filter by
 * @returns JobsListResponse with filtered results
 */
export async function filterJobsByCode(
  jobCode: string,
  authToken?: string
): Promise<JobsListResponse> {
  let url = `${HYREX_API_BASE}/jobs/jobview/?job_code=${encodeURIComponent(jobCode)}`;
  
  // Add token as query parameter if available
  if (authToken) {
    url += `&token=${encodeURIComponent(authToken)}`;
  }

  try {
    const headers = buildHeaders(authToken);
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[filterJobsByCode] Error:", error);
    throw error;
  }
}

/**
 * Search jobs with multiple filters
 * @param filters Object with filter parameters
 * @returns JobsListResponse with filtered results
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
  if (filters.authToken) params.append("token", filters.authToken);

  const url = `${HYREX_API_BASE}/jobs/jobview/?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(filters.authToken),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[searchJobs] Error:", error);
    throw error;
  }
}
