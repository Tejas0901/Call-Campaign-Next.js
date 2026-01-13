import { useState, useCallback, useEffect } from "react";

export interface JobData {
  id: number;
  job_code: string;
  title: string;
  client_name: string;
  description: string;
  location?: string;
  job_type?: string;
  remote?: string;
  vertical_name?: string;
  job_status?: string;
  primary_skills?: Array<{ id: number; name: string }>;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  experience?: string;
  created_by?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    team_id: number;
    empcode: number;
  };
}

import { fetchJobsFromHyrex, filterJobsByCode } from "@/lib/api-integrations";

export function useJobCodes(authToken?: string) {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("[useJobCodes] Hook called with authToken:", !!authToken, authToken ? `${authToken.substring(0, 30)}...` : "undefined/null");

  useEffect(() => {
    console.log("[useJobCodes] useEffect - authToken changed:", !!authToken);
  }, [authToken]);

  // Fetch all job codes from the API
  const fetchJobCodes = useCallback(async () => {
    console.log("[fetchJobCodes] Called, authToken available:", !!authToken, authToken ? `${authToken.substring(0, 30)}...` : "undefined/null");
    setLoading(true);
    setError(null);
    try {
      console.log("[fetchJobCodes] Calling fetchJobsFromHyrex with authToken");
      const data = await fetchJobsFromHyrex(1, 100, authToken);
      console.log("[fetchJobCodes] Success, got", data.results?.length || 0, "jobs");
      setJobs(data.results || []);
      return data.results || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch job codes";
      console.error("[fetchJobCodes] Error:", errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Fetch job details by job code
  const fetchJobByCode = useCallback(
    async (jobCode: string): Promise<JobData | null> => {
      try {
        // First check if we already have it in our jobs list
        const existing = jobs.find((j) => j.job_code === jobCode);
        if (existing) {
          return existing;
        }

        // Otherwise fetch it with filter


          const data = await filterJobsByCode(jobCode, authToken);
        return data.results?.[0] || null;
      } catch (err) {
        console.error("Error fetching job by code:", err);
        return null;
      }
    },
    [jobs, authToken]
  );

  // Search jobs by query string
  const searchJobs = useCallback(
    (query: string): JobData[] => {
      if (!query.trim()) {
        return jobs;
      }

      const lowerQuery = query.toLowerCase();
      return jobs.filter(
        (job) =>
          job.job_code.toLowerCase().includes(lowerQuery) ||
          job.title.toLowerCase().includes(lowerQuery) ||
          job.client_name.toLowerCase().includes(lowerQuery)
      );
    },
    [jobs]
  );

  return {
    jobs,
    loading,
    error,
    fetchJobCodes,
    fetchJobByCode,
    searchJobs,
  };
}
