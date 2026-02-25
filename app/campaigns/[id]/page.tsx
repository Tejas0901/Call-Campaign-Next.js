"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Mail,
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import CandidatesTable, {
  CandidateRow,
} from "@/components/ui/candidates-table";
import ReportsTable from "@/components/campaigns/ReportsTable";
import { useAuth } from "@/context/auth-context";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string; // Keep as string for UUID support

  const { user, getAccessToken } = useAuth();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [candidates, setCandidates] = useState<CandidateRow[]>([
    {
      id: "1",
      name: "Alice Johnson",
      phone: "+1 (555) 210-1122",
      email: "alice.johnson@example.com",
      resume: null,
      resumeFileName: "alice-johnson.pdf",
      role: "Sales Lead",
      company: "Acme Corp",
    },
    {
      id: "2",
      name: "Brian Lee",
      phone: "+1 (555) 455-7821",
      email: "brian.lee@example.com",
      resume: null,
      resumeFileName: "brian-lee.pdf",
      role: "Account Executive",
      company: "Northwind",
    },
    {
      id: "3",
      name: "Chloe Patel",
      phone: "+1 (555) 318-0044",
      email: "chloe.patel@example.com",
      resume: null,
      resumeFileName: "chloe-patel.pdf",
      role: "BDR",
      company: "Globex",
    },
    {
      id: "4",
      name: "Daniel Kim",
      phone: "+1 (555) 980-2211",
      email: "daniel.kim@example.com",
      resume: null,
      resumeFileName: "daniel-kim.pdf",
      role: "SDR",
      company: "Initech",
    },
    {
      id: "5",
      name: "Emma Garcia",
      phone: "+1 (555) 441-7788",
      email: "emma.garcia@example.com",
      resume: null,
      resumeFileName: "emma-garcia.pdf",
      role: "Marketing Ops",
      company: "Soylent",
    },
    {
      id: "6",
      name: "Felix Braun",
      phone: "+1 (555) 667-9023",
      email: "felix.braun@example.com",
      resume: null,
      resumeFileName: "felix-braun.pdf",
      role: "Product Marketing",
      company: "Umbrella",
    },
    {
      id: "7",
      name: "Grace Liu",
      phone: "+1 (555) 744-1199",
      email: "grace.liu@example.com",
      resume: null,
      resumeFileName: "grace-liu.pdf",
      role: "Customer Success",
      company: "Vehement",
    },
    {
      id: "8",
      name: "Hector Ramirez",
      phone: "+1 (555) 215-6644",
      email: "hector.ramirez@example.com",
      resume: null,
      resumeFileName: "hector-ramirez.pdf",
      role: "Sales Ops",
      company: "Stark Industries",
    },
    {
      id: "9",
      name: "Isabella Rossi",
      phone: "+1 (555) 839-7755",
      email: "isabella.rossi@example.com",
      resume: null,
      resumeFileName: "isabella-rossi.pdf",
      role: "AE",
      company: "Wayne Corp",
    },
    {
      id: "10",
      name: "Jack Wilson",
      phone: "+1 (555) 930-4433",
      email: "jack.wilson@example.com",
      resume: null,
      resumeFileName: "jack-wilson.pdf",
      role: "Outbound SDR",
      company: "Wonka Co",
    },
  ]);

  // Get auth token on mount
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setAuthToken(token);
    }
  }, [getAccessToken]);

  // Fetch campaign data from API
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!authToken) {
        console.log("[CampaignDetailPage] Waiting for auth token...");
        return;
      }

      try {
        setLoading(true);
        const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

        console.log("[CampaignDetailPage] Fetching campaign:", {
          campaignId,
          TENANT_ID,
          hasToken: !!authToken,
        });

        if (!TENANT_ID) {
          console.error("[CampaignDetailPage] Missing TENANT_ID");
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
          "[CampaignDetailPage] Response status:",
          response.status,
          response.statusText
        );

        // Check content-type but try parsing anyway
        const contentType = response.headers.get("content-type");
        console.log("[CampaignDetailPage] Content-Type:", contentType);

        let responseData;
        try {
          const responseText = await response.text();
          console.log("[CampaignDetailPage] Raw response:", responseText);
          responseData = responseText ? JSON.parse(responseText) : {};
          console.log(
            "[CampaignDetailPage] Parsed API response:",
            responseData
          );
        } catch (parseError) {
          console.error(
            "[CampaignDetailPage] Failed to parse JSON:",
            parseError
          );
          setCampaign(null);
          setLoading(false);
          return;
        }

        if (response.ok) {
          // Extract campaign data from nested response structure
          const fetchedCampaign = responseData.data || responseData;
          console.log(
            "[CampaignDetailPage] Extracted campaign:",
            fetchedCampaign
          );

          // Check if user has permission to access this campaign
          // For recruiters, they should only access campaigns they own
          if (
            user?.role === "recruiter" &&
            fetchedCampaign.created_by !== user.id
          ) {
            console.error(
              "[CampaignDetailPage] Recruiter attempting to access another user's campaign"
            );
            setCampaign(null);
          } else {
            setCampaign(fetchedCampaign);
          }
        } else {
          console.error(
            "[CampaignDetailPage] API returned error status:",
            response.status
          );
          console.error(
            "[CampaignDetailPage] Error response data:",
            responseData
          );

          // Handle unauthorized access (recruiter trying to access someone else's campaign)
          if (response.status === 403 || response.status === 404) {
            console.error(
              "[CampaignDetailPage] Unauthorized or campaign not found"
            );
          }

          setCampaign(null);
        }
      } catch (error) {
        console.error("[CampaignDetailPage] Error fetching campaign:", error);
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchCampaign();
    }
  }, [campaignId, authToken, user]);

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
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
                    {campaign.name || campaign.job_role || "Campaign Details"}
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
              <p className="text-gray-600 max-w-2xl">
                {campaign.description || "No description available"}
              </p>
            </div>

            {/* Tags */}
            {campaign.tags && campaign.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {campaign.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
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
                  <CardTitle className="text-sm font-medium">Opened</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Clicked</CardTitle>
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
                    Uploaded candidate data for this campaign
                  </p>
                </div>
                <span className="text-sm text-gray-500">10 total</span>
              </div>
              <div className="p-6">
                <CandidatesTable
                  data={candidates}
                  onDataChange={setCandidates}
                />
              </div>
            </div>

            {/* Reports Table */}
            <ReportsTable
              campaignId={campaignId}
              campaignName={campaign.name || campaign.job_role || "Campaign"}
              jobRole={campaign.job_role || "Position"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
