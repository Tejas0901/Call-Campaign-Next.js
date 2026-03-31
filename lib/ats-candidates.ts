export interface FetchAtsCandidatesParams {
  jobId: string | number;
  page?: number;
  pageSize?: number;
  authToken?: string | null;
  tenantId?: string | null;
  getStoredAuthFormat: () => string;
  setStoredAuthFormat: (format: string) => void;
  knownTotalCount?: number;
}

export interface FetchAtsCandidatesResult {
  candidates: any[];
  totalCount: number;
  authFormatUsed: string;
}

// Shared ATS submissions fetcher used by draft and migration pages.
export async function fetchAtsCandidatesShared(
  params: FetchAtsCandidatesParams,
): Promise<FetchAtsCandidatesResult> {
  const {
    jobId,
    page = 1,
    pageSize = 25,
    authToken,
    tenantId,
    getStoredAuthFormat,
    setStoredAuthFormat,
    knownTotalCount,
  } = params;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (tenantId) {
    headers["tenant-id"] = tenantId;
  }

  let authFormat = getStoredAuthFormat();
  if (authToken) {
    headers["Authorization"] = `${authFormat} ${authToken}`;
  }

  const url = `/api/candidates/submissions?job_id=${jobId}&page=${page}&page_size=${pageSize}`;

  let response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (response.status === 401 && authToken) {
    const alternateFormat = authFormat === "Bearer" ? "Token" : "Bearer";
    headers["Authorization"] = `${alternateFormat} ${authToken}`;
    response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      authFormat = alternateFormat;
      setStoredAuthFormat(alternateFormat);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || "Failed to fetch candidates");
  }

  const data = await response.json();
  let actualTotalCount = data.count;
  if (
    (actualTotalCount === undefined ||
      actualTotalCount === null ||
      actualTotalCount === 0) &&
    knownTotalCount
  ) {
    actualTotalCount = knownTotalCount;
  }

  const candidatesToShow = data.results || data.data || [];

  return {
    candidates: candidatesToShow,
    totalCount: actualTotalCount || 0,
    authFormatUsed: authFormat,
  };
}
