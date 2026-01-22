"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Mail,
  MessageSquare,
  Eye,
  MousePointerClick,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { campaignData } from "@/data/campaignData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import CandidatesTable, {
  CandidateRow,
} from "@/components/ui/candidates-table";
import AddCandidatesWorkflow from "@/components/campaigns/AddCandidatesWorkflow";
import { filterJobsByCode } from "@/lib/api-integrations";
import { SearchBox } from "@/components/ui/search-box";

export default function MigrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [hyrexAuthToken, setHyrexAuthToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [jobId, setJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [candidateSearch, setCandidateSearch] = useState("");

  // Get auth tokens on mount
  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem("auth-token")
          : null;
      if (stored) {
        setAuthToken(stored);
      }

      const hyrexStored =
        typeof window !== "undefined"
          ? window.localStorage.getItem("hyrex-auth-token")
          : null;
      if (hyrexStored) {
        setHyrexAuthToken(hyrexStored);
      }
    } catch (e) {
      console.error("[MigrationDetailPage] Error reading auth token:", e);
    }
  }, []);

  // Fetch campaign data from API or fallback to static data
  useEffect(() => {
    const fetchCampaign = async () => {
      // First, try to find in static data by numeric ID
      const numericId = parseInt(campaignId);
      if (!isNaN(numericId)) {
        const foundCampaign = campaignData.campaigns.find(
          (camp: any) => camp.id === numericId,
        );
        if (foundCampaign) {
          console.log(
            "[MigrationDetailPage] Found in static data:",
            foundCampaign,
          );
          setCampaign(foundCampaign);
          setLoading(false);
          return;
        }
      }

      // For UUID campaigns, wait for auth token before trying API
      if (!authToken) {
        console.log("[MigrationDetailPage] Waiting for auth token...");
        return;
      }

      // Try API with auth token
      try {
        setLoading(true);
        const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

        console.log("[MigrationDetailPage] Fetching campaign:", {
          campaignId,
          TENANT_ID,
          hasToken: !!authToken,
        });

        if (!TENANT_ID) {
          console.error("[MigrationDetailPage] Missing TENANT_ID");
          setCampaign(null);
          setLoading(false);
          return;
        }

        // Use Next.js API route as proxy to avoid CORS issues
        const response = await fetch(`/api/campaigns/${campaignId}`, {
          headers: {
            "tenant-id": TENANT_ID,
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        console.log(
          "[MigrationDetailPage] Response status:",
          response.status,
          response.statusText,
        );

        // Check content-type but try parsing anyway
        const contentType = response.headers.get("content-type");
        console.log("[MigrationDetailPage] Content-Type:", contentType);

        let responseData;
        try {
          const responseText = await response.text();
          console.log("[MigrationDetailPage] Raw response:", responseText);
          responseData = responseText ? JSON.parse(responseText) : {};
          console.log(
            "[MigrationDetailPage] Parsed API response:",
            responseData,
          );
        } catch (parseError) {
          console.error(
            "[MigrationDetailPage] Failed to parse JSON:",
            parseError,
          );
          setCampaign(null);
          setLoading(false);
          return;
        }

        if (response.ok) {
          // Extract campaign data from nested response structure
          const fetchedCampaign = responseData.data || responseData;
          console.log(
            "[MigrationDetailPage] Extracted campaign:",
            fetchedCampaign,
          );
          setCampaign(fetchedCampaign);
        } else {
          console.error(
            "[MigrationDetailPage] API returned error status:",
            response.status,
          );
          console.error(
            "[MigrationDetailPage] Error response data:",
            responseData,
          );
          setCampaign(null);
        }
      } catch (error) {
        console.error("[MigrationDetailPage] Error fetching campaign:", error);
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, authToken]);

  // Fetch job_id from Hyrex API when we have job_code
  useEffect(() => {
    const fetchJobId = async () => {
      const jobCode = campaign?.job_code || campaign?.jobCode;
      if (!jobCode || !hyrexAuthToken) {
        console.log("[MigrationDetailPage] Skipping job_id fetch:", {
          hasJobCode: !!jobCode,
          hasHyrexToken: !!hyrexAuthToken,
        });
        return;
      }

      try {
        console.log(
          "[MigrationDetailPage] Fetching job_id for job_code:",
          jobCode,
          "with Hyrex token:",
          !!hyrexAuthToken,
        );
        const response = await filterJobsByCode(jobCode, hyrexAuthToken);
        console.log("[MigrationDetailPage] Job lookup response:", response);

        if (response.results && response.results.length > 0) {
          const fetchedJobId = response.results[0].id;
          console.log("[MigrationDetailPage] Found job_id:", fetchedJobId);
          setJobId(fetchedJobId);
        } else {
          console.warn("[MigrationDetailPage] No job found for code:", jobCode);
          setJobId(null);
        }
      } catch (error) {
        console.error("[MigrationDetailPage] Error fetching job_id:", error);
        setJobId(null);
      }
    };

    fetchJobId();
  }, [campaign?.job_code, campaign?.jobCode, hyrexAuthToken]);

  // Fetch contacts for this campaign
  useEffect(() => {
    const fetchContacts = async () => {
      if (!authToken || !campaignId) {
        console.log(
          "[MigrationDetailPage] Skipping contacts fetch: missing token or campaignId",
        );
        return;
      }

      setCandidatesLoading(true);
      setCandidatesError(null);

      try {
        const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;
        if (!TENANT_ID) {
          throw new Error("Missing TENANT_ID configuration");
        }

        console.log(
          "[MigrationDetailPage] Fetching contacts for campaign:",
          campaignId,
        );

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!baseUrl) {
          throw new Error("Missing NEXT_PUBLIC_API_BASE_URL configuration");
        }

        const response = await fetch(
          `${baseUrl.replace(/\/$/, "")}/api/v1/contacts/${campaignId}`,
          {
            method: "GET",
            headers: {
              "tenant-id": TENANT_ID,
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
              "ngrok-skip-browser-warning": "69420",
            },
          },
        );

        const contentType = response.headers.get("content-type") || "";

        // For non-JSON responses, read the text once so we don't exhaust the stream twice
        const isJson = contentType.includes("application/json");
        const responseText = isJson ? null : await response.text();

        if (!response.ok) {
          if (isJson) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData?.error ||
                errorData?.message ||
                `Failed to fetch contacts: ${response.status}`,
            );
          }

          console.error(
            "[MigrationDetailPage] Non-JSON error response:",
            (responseText || "").substring(0, 300),
          );
          throw new Error(
            `Failed to fetch contacts (${response.status}): ${(responseText || "").substring(0, 160)}`,
          );
        }

        let result: any;
        try {
          if (!isJson) {
            console.error(
              "[MigrationDetailPage] Expected JSON but got:",
              (responseText || "").substring(0, 300),
            );
            throw new Error("Contacts API did not return JSON");
          }

          result = await response.json();
        } catch (parseError) {
          console.error(
            "[MigrationDetailPage] Failed to parse contacts JSON:",
            parseError,
          );
          throw new Error("Failed to parse contacts response as JSON");
        }
        console.log("[MigrationDetailPage] Contacts response:", result);

        // Transform API response to CandidateRow format
        if (result.success && result.data?.contacts) {
          const transformedCandidates: CandidateRow[] =
            result.data.contacts.map((contact: any) => ({
              id: contact.id,
              name: contact.candidate_name || "Unknown",
              phone: contact.phone_number || "—",
              email: contact.email || "—",
              resume: contact.resume_url || null,
              resumeFileName: contact.resume_url
                ? contact.resume_url.split("/").pop()
                : null,
              candidateId: contact.ats_candidate_id || contact.id,
            }));
          setCandidates(transformedCandidates);
          console.log(
            "[MigrationDetailPage] Transformed candidates:",
            transformedCandidates,
          );
        } else {
          setCandidates([]);
        }
      } catch (err: any) {
        console.error("[MigrationDetailPage] Error fetching contacts:", err);
        setCandidatesError(err?.message || "Failed to fetch contacts");
        setCandidates([]);
      } finally {
        setCandidatesLoading(false);
      }
    };

    fetchContacts();
  }, [authToken, campaignId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-red-500">
          Campaign not found
        </div>
      </div>
    );
  }

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case "Mail":
        return <Mail className="w-5 h-5 text-white" />;
      case "MessageSquare":
        return <MessageSquare className="w-5 h-5 text-white" />;
      default:
        return <Mail className="w-5 h-5 text-white" />;
    }
  };

  // Map API status to display status
  const getDisplayStatus = (status: string) => {
    if (status === "active") return "Running";
    if (status === "draft") return "Paused";
    return status;
  };

  const displayStatus = campaign?.status
    ? getDisplayStatus(campaign.status)
    : "Unknown";

  const statusStyles: Record<string, { container: string; dot: string }> = {
    Running: { container: "bg-green-50 text-green-700", dot: "bg-green-500" },
    Closed: { container: "bg-red-50 text-red-700", dot: "bg-red-500" },
    Paused: { container: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  };

  const statusClass = statusStyles[displayStatus] || {
    container: "bg-gray-50 text-gray-700",
    dot: "bg-gray-500",
  };

  const filteredCandidates = candidates.filter((candidate) => {
    if (!candidateSearch.trim()) return true;
    const query = candidateSearch.toLowerCase();
    const fields = [
      candidate.name,
      candidate.email,
      candidate.phone,
      candidate.candidateId,
      candidate.resumeFileName,
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase());
    return fields.some((field) => field.includes(query));
  });

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Back Button */}
              <div className="mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/campaigns/migrations")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Migrations
                </Button>
              </div>

              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 ${
                        campaign.iconBg || "bg-primary-100"
                      } rounded-xl flex items-center justify-center`}
                    >
                      {campaign.icon ? (
                        getIconComponent(campaign.icon)
                      ) : (
                        <Mail className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {campaign.name ||
                          campaign.job_role ||
                          "Campaign Details"}
                      </h1>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${statusClass.container}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${statusClass.dot}`}
                          ></span>
                          {displayStatus}
                        </span>
                        <span className="text-gray-600">
                          {campaign.messagesCount || 0} messages
                        </span>
                        <span className="text-gray-600">
                          {campaign.actionsCount || 0} actions
                        </span>
                      </div>
                    </div>
                  </div>
                  <AddCandidatesWorkflow
                    entityId={campaignId}
                    jobId={jobId}
                    jobCode={campaign?.job_code || campaign?.jobCode}
                    candidates={candidates}
                    setCandidates={setCandidates}
                    routePrefix="migrations"
                    entityType="migration"
                  />
                </div>
                <p className="text-gray-600 max-w-2xl">
                  {campaign.description || "No description available"}
                </p>
              </div>

              {/* Tags */}
              {campaign.tags && campaign.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {campaign.tags.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Delivered
                    </CardTitle>
                    <Mail className="w-4 h-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaign.metrics?.delivered || "0"}
                    </div>
                    <p className="text-xs text-gray-500">
                      {campaign.metrics?.deliveredPeriod || "No data"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Opened
                    </CardTitle>
                    <Eye className="w-4 h-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaign.metrics?.opened || "0"}
                    </div>
                    <p className="text-xs text-gray-500">
                      {campaign.metrics?.openedPeriod || "No data"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Clicked
                    </CardTitle>
                    <MousePointerClick className="w-4 h-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaign.metrics?.clicked || "0"}
                    </div>
                    <p className="text-xs text-gray-500">
                      {campaign.metrics?.clickedPeriod || "No data"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Converted
                    </CardTitle>
                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaign.metrics?.converted || "0"}
                    </div>
                    <p className="text-xs text-gray-500">
                      {campaign.metrics?.convertedPeriod || "No data"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Candidates Table */}
              <div className="mt-10 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Candidates
                    </h2>
                    <p className="text-sm text-gray-600">
                      Imported candidate data for this campaign
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {candidateSearch
                      ? `${filteredCandidates.length} matching · ${candidates.length} total`
                      : `${candidates.length} total`}
                  </span>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <SearchBox
                      value={candidateSearch}
                      onChange={setCandidateSearch}
                      onClear={() => setCandidateSearch("")}
                      placeholder="Search candidates by name, email, phone, ID, or resume file"
                    />
                    {candidateSearch && (
                      <p className="mt-2 text-xs text-gray-500">
                        Showing {filteredCandidates.length} of{" "}
                        {candidates.length}
                      </p>
                    )}
                  </div>
                  {candidatesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                        <p className="text-gray-600 text-sm">
                          Loading candidates...
                        </p>
                      </div>
                    </div>
                  ) : candidatesError ? (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                      <p className="text-sm text-red-700 font-medium">Error</p>
                      <p className="text-sm text-red-600 mt-1">
                        {candidatesError}
                      </p>
                    </div>
                  ) : (
                    <CandidatesTable
                      data={filteredCandidates}
                      onDataChange={setCandidates}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
