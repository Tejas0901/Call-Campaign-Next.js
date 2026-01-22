"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

interface Campaign {
  id: string;
  job_code: string;
  job_role: string;
  job_id?: string | number;
}

export default function AtsCandidatesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const jobCodeParam = searchParams.get("job_code");

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [atsCandidates, setAtsCandidates] = useState<any[]>([]);
  const [atsCandidatesLoading, setAtsCandidatesLoading] = useState(false);
  const [atsCandidatesError, setAtsCandidatesError] = useState("");
  const [atsPage, setAtsPage] = useState(1);
  const [atsPageSize] = useState(25);
  const [atsTotalCount, setAtsTotalCount] = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    new Set(),
  );
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Get auth token on mount
  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem("hyrex-auth-token")
          : null;
      if (stored) {
        setAuthToken(stored);
      }
    } catch (e) {
      console.error("[AtsCandidatesPage] Error reading auth token:", e);
    }
  }, []);

  // Fetch campaign data to get job code
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!authToken) return;

      try {
        const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;
        if (!TENANT_ID) return;

        const response = await fetch(`/api/campaigns/${campaignId}`, {
          headers: {
            "tenant-id": TENANT_ID,
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          const fetchedCampaign = responseData.data || responseData;
          console.log("[AtsCandidatesPage] Fetched campaign:", fetchedCampaign);
          setCampaign(fetchedCampaign);
        } else {
          console.error(
            "[AtsCandidatesPage] Failed to fetch campaign:",
            response.status,
          );
        }
      } catch (error) {
        console.error("[AtsCandidatesPage] Error fetching campaign:", error);
      }
    };

    fetchCampaign();
  }, [campaignId, authToken]);

  const getCandidateKey = (candidate: any, idx: number, page?: number) =>
    candidate?.id?.toString() ||
    candidate?.submission_id?.toString() ||
    candidate?.candidate_id?.toString() ||
    `${
      candidate?.candidate_email ||
      candidate?.candidate_mobile ||
      candidate?.candidate_name ||
      "candidate"
    }-${candidate?.job_code || "job"}-${(page ?? atsPage) - 1}-${idx}`;

  const getStoredAuthFormat = (): string => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("hyrex-auth-format") || "Bearer";
    }
    return "Bearer";
  };

  const setStoredAuthFormat = (format: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hyrex-auth-format", format);
    }
  };

  // Fetch numeric job_id from job_code
  const fetchJobId = async (jobCode: string) => {
    try {
      const token =
        authToken ||
        (typeof window !== "undefined"
          ? window.localStorage.getItem("hyrex-auth-token")
          : null);
      console.log("[AtsCandidatesPage] fetchJobId - token:", !!token);

      if (!token) {
        console.warn("[AtsCandidatesPage] No token available for fetchJobId!");
        setAtsCandidatesError("No authentication token available");
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log("[AtsCandidatesPage] Fetching job_id for job_code:", jobCode);

      let response = await fetch(
        `/api/jobs/by-code?job_code=${encodeURIComponent(jobCode)}`,
        {
          method: "GET",
          headers,
        },
      );

      console.log(
        "[AtsCandidatesPage] Job lookup response status:",
        response.status,
      );

      if (response.status === 401 && token) {
        console.warn(
          "[AtsCandidatesPage] Got 401 on job lookup, trying Token format",
        );
        headers["Authorization"] = `Token ${token}`;
        response = await fetch(
          `/api/jobs/by-code?job_code=${encodeURIComponent(jobCode)}`,
          {
            method: "GET",
            headers,
          },
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to fetch job_id");
      }

      const data = await response.json();
      console.log("[AtsCandidatesPage] Job lookup response:", data);

      if (data.success && data.job_id) {
        console.log("[AtsCandidatesPage] Got numeric job_id:", data.job_id);
        // Now fetch candidates using the numeric job_id
        fetchAtsCandidates(data.job_id, atsPage, atsPageSize);
      } else {
        throw new Error(data.error || "No job_id returned");
      }
    } catch (err: any) {
      console.error("[AtsCandidatesPage] Error fetching job_id:", err);
      setAtsCandidatesError(err?.message || "Failed to lookup job");
      setAtsCandidates([]);
    }
  };

  const fetchAtsCandidates = async (
    jobId: string | number,
    page: number = 1,
    pageSize: number = 25,
  ) => {
    setAtsCandidatesLoading(true);
    setAtsCandidatesError("");
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Ensure we have the token
      const token =
        authToken ||
        (typeof window !== "undefined"
          ? window.localStorage.getItem("hyrex-auth-token")
          : null);
      console.log("[AtsCandidatesPage] fetchAtsCandidates token:", !!token);

      if (token) {
        // Always use Bearer format for Hyrex API
        headers["Authorization"] = `Bearer ${token}`;
        console.log(
          "[AtsCandidatesPage] Authorization header set with Bearer format",
        );
      } else {
        console.warn("[AtsCandidatesPage] No token available for API call!");
      }

      let response = await fetch(
        `/api/candidates/submissions?job_id=${jobId}&page=${page}&page_size=${pageSize}`,
        {
          method: "GET",
          headers,
        },
      );
      console.log(
        "[AtsCandidatesPage] Submissions API response status:",
        response.status,
      );

      if (response.status === 401 && token) {
        console.warn(
          "[AtsCandidatesPage] Got 401, trying with Token format instead",
        );
        headers["Authorization"] = `Token ${token}`;
        response = await fetch(
          `/api/candidates/submissions?job_id=${jobId}&page=${page}&page_size=${pageSize}`,
          {
            method: "GET",
            headers,
          },
        );
        console.log(
          "[AtsCandidatesPage] Retry with Token format, status:",
          response.status,
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to fetch candidates");
      }

      const data = await response.json();
      const candidatesToShow = data.results || data.data || [];
      setAtsCandidates(candidatesToShow);
      setAtsTotalCount(data.count || 0);
    } catch (err: any) {
      console.error("[AtsCandidatesPage] ATS fetch error", err);
      setAtsCandidatesError(err?.message || "Failed to fetch candidates");
      setAtsCandidates([]);
    } finally {
      setAtsCandidatesLoading(false);
    }
  };

  // Load candidates when job code is available
  useEffect(() => {
    console.log("[AtsCandidatesPage] Campaign data:", campaign);
    console.log("[AtsCandidatesPage] Campaign job_code:", campaign?.job_code);

    const resolvedJobCode = jobCodeParam || campaign?.job_code;

    if (resolvedJobCode) {
      console.log(
        "[AtsCandidatesPage] Fetching job_id for job_code:",
        resolvedJobCode,
      );
      fetchJobId(resolvedJobCode);
    } else {
      console.warn(
        "[AtsCandidatesPage] No job_code found. Available fields:",
        campaign ? Object.keys(campaign) : "campaign is null",
      );
      setAtsCandidatesError("Campaign does not have a job_code");
    }
  }, [campaign?.job_code, jobCodeParam, atsPage]);

  const importSelectedCandidates = () => {
    const selected = atsCandidates.filter((candidate, idx) =>
      selectedCandidates.has(getCandidateKey(candidate, idx)),
    );

    if (selected.length === 0) {
      alert("Please select at least one candidate");
      return;
    }

    // Store selected candidates in sessionStorage for campaign page to pick up
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        `ats-candidates-${campaignId}`,
        JSON.stringify(selected),
      );
    }

    // Return to campaign page
    router.back();
  };

  const toggleCandidate = (candidate: any, idx: number) => {
    const key = getCandidateKey(candidate, idx);
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAllCandidates = () => {
    const allKeys = new Set<string>();
    atsCandidates.forEach((candidate, idx) => {
      allKeys.add(getCandidateKey(candidate, idx));
    });
    setSelectedCandidates(allKeys);
  };

  const clearSelection = () => {
    setSelectedCandidates(new Set());
  };

  // Filter candidates based on search query
  const filteredCandidates = atsCandidates.filter((candidate) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const name = (
      candidate.candidate_name ||
      candidate.name ||
      ""
    ).toLowerCase();
    const email = (
      candidate.candidate_email ||
      candidate.email ||
      ""
    ).toLowerCase();
    const phone = (
      candidate.candidate_mobile ||
      candidate.phone ||
      ""
    ).toLowerCase();
    const location = (
      candidate.candidate_location ||
      candidate.location ||
      ""
    ).toLowerCase();
    const job = (candidate.job_role || candidate.role || "").toLowerCase();

    return (
      name.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      location.includes(query) ||
      job.includes(query)
    );
  });

  if (!campaign) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Loading campaign...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Import Candidates from ATS
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {campaign.job_role || "Campaign"} - {campaign.job_code}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {atsCandidatesError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
                <p className="text-sm text-red-700 font-medium">Error</p>
                <p className="text-sm text-red-600 mt-1">
                  {atsCandidatesError}
                </p>
              </div>
            )}

            {/* Loading State */}
            {atsCandidatesLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading candidates...</p>
                </div>
              </div>
            )}

            {/* Candidates List */}
            {!atsCandidatesLoading && atsCandidates.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Available Candidates
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedCandidates.size} of {filteredCandidates.length}{" "}
                        selected
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedCandidates.size > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSelection}
                        >
                          Clear
                        </Button>
                      )}
                      {selectedCandidates.size < filteredCandidates.length && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllCandidates}
                        >
                          Select All
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search Box */}
                  <div className="max-w-md">
                    <Input
                      type="text"
                      placeholder="Search by name, phone, email, location, or job..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Candidates Table */}
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={
                              filteredCandidates.length > 0 &&
                              selectedCandidates.size ===
                                filteredCandidates.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                selectAllCandidates();
                              } else {
                                clearSelection();
                              }
                            }}
                            className="w-4 h-4"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                          Mobile
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                          Job
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                          Submitted By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCandidates.map((candidate, idx) => {
                        const isSelected = selectedCandidates.has(
                          getCandidateKey(candidate, idx),
                        );
                        return (
                          <tr
                            key={getCandidateKey(candidate, idx)}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleCandidate(candidate, idx)}
                                className="w-4 h-4"
                              />
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-900">
                              {candidate.submission_date || candidate.date
                                ? new Date(
                                    candidate.submission_date || candidate.date,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-900">
                              <div>
                                <div className="font-medium">
                                  {candidate.candidate_name ||
                                    candidate.name ||
                                    "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {candidate.candidate_email ||
                                    candidate.email ||
                                    ""}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600">
                              {candidate.candidate_mobile ||
                                candidate.phone ||
                                "N/A"}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600">
                              {candidate.candidate_location ||
                                candidate.location ||
                                "N/A"}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600">
                              {candidate.job_role ||
                                candidate.role ||
                                campaign.job_role ||
                                "N/A"}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600">
                              {candidate.submitted_by ||
                                candidate.recruiter ||
                                "N/A"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Page {atsPage} of{" "}
                      {Math.ceil(atsTotalCount / atsPageSize) || 1}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAtsPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={atsPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAtsPage((prev) => prev + 1)}
                        disabled={
                          atsPage >= Math.ceil(atsTotalCount / atsPageSize)
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button
                      onClick={importSelectedCandidates}
                      disabled={selectedCandidates.size === 0}
                      className="bg-primary-600 text-white hover:bg-primary-700"
                    >
                      Import Selected
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!atsCandidatesLoading && atsCandidates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No candidates found for this job code.
                </p>
              </div>
            )}

            {/* No Results from Search */}
            {!atsCandidatesLoading &&
              atsCandidates.length > 0 &&
              filteredCandidates.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <p className="text-gray-600">
                    No candidates match your search criteria.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
