/**
 * API integrations for external services
 */

const HYREX_API_BASE = process.env.NEXT_PUBLIC_HYREX_API_BASE_URL || "https://api.hyrexai.com/api/v1";

type AuthHeader = { Authorization?: string };

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

const buildHeaders = (authToken?: string, format?: string): HeadersInit => {
  const base: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    const authFormat = format || getStoredAuthFormat();
    (base as AuthHeader).Authorization = `${authFormat} ${authToken}`;
    console.log(`[API Headers] Authorization set with ${authFormat} format`);
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
    let authFormat = getStoredAuthFormat();
    let headers = buildHeaders(authToken, authFormat);
    
    // Try with stored format first
    let response = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log("[fetchJobsFromHyrex] Response status:", response.status);

    // If 401, try alternate format
    if (response.status === 401 && authToken) {
      const alternateFormat = authFormat === "Bearer" ? "Token" : "Bearer";
      console.log(`[fetchJobsFromHyrex] Got 401 with ${authFormat}, trying ${alternateFormat}...`);
      headers = buildHeaders(authToken, alternateFormat);
      response = await fetch(url, {
        method: "GET",
        headers,
      });
      console.log(`[fetchJobsFromHyrex] ${alternateFormat} attempt status:`, response.status);
      
      // If successful with alternate format, remember it
      if (response.ok) {
        authFormat = alternateFormat;
        setStoredAuthFormat(alternateFormat);
        console.log(`[fetchJobsFromHyrex] Saved ${alternateFormat} as preferred format`);
      }
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
    const authFormat = getStoredAuthFormat();
    const headers = buildHeaders(authToken, authFormat);
    
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
    const authFormat = getStoredAuthFormat();
    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(filters.authToken, authFormat),
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
