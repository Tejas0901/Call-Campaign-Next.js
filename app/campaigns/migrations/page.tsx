"use client";

import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useRouter } from "next/navigation";
import MigrationCard from "@/components/MigrationCard";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import { HyrexLoginDialog } from "@/components/hyrex/HyrexLoginDialog";
import { ChevronDown, Search, Plus } from "lucide-react";
import { useCampaigns, LegacyCampaign } from "@/hooks/useCampaigns";
import { useLoading } from "@/context/loading-context";
import { useCampaignSearch } from "@/hooks/useCampaignSearch";
import { Campaign, CampaignSearchFilters } from "@/types/campaign";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { CampaignSearchCard } from "@/components/campaigns/CampaignSearchCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/auth-context";

// Legacy campaign type is now imported from useCampaigns hook

export default function MigrationsPage() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();
  const { user, getAccessToken } = useAuth();
  const [authToken, setAuthToken] = useState<string | undefined>(() => {
    // Get token from localStorage immediately on initial render
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("callbot_access_token") || undefined;
    }
    return undefined;
  });
  const [hyrexToken, setHyrexToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [deletingCampaigns, setDeletingCampaigns] = useState<Set<string>>(
    new Set()
  );
  const [restoringCampaigns, setRestoringCampaigns] = useState<Set<string>>(
    new Set()
  );
  const [permanentlyDeletingCampaigns, setPermanentlyDeletingCampaigns] =
    useState<Set<string>>(new Set());
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] =
    useState(false);
  const [campaignToPermDeleteId, setCampaignToPermDeleteId] = useState<
    string | null
  >(null);
  const [campaigns, setCampaigns] = useState<LegacyCampaign[]>([]);
  const [deletedCampaigns, setDeletedCampaigns] = useState<LegacyCampaign[]>(
    []
  );
  const [filteredCampaigns, setFilteredCampaigns] = useState<
    (LegacyCampaign | Campaign)[]
  >([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "paused" | "completed" | "draft" | "deleted"
  >("all");
  const [showDeletedSection, setShowDeletedSection] = useState(false);

  const {
    campaigns: fetchedCampaigns,
    loading,
    error,
    fetchCampaigns,
  } = useCampaigns(
    authToken,
    user ? { id: user.id, role: user.role || "viewer" } : undefined
  );

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<CampaignSearchFilters>({
    page: 1,
    page_size: 50,
    is_deleted: false,
  });
  const [useSearch, setUseSearch] = useState(false);
  const {
    campaigns: searchedCampaigns,
    loading: searchLoading,
    error: searchError,
    pagination,
    searchCampaigns,
  } = useCampaignSearch(authToken);

  // Get auth token on mount
  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem("callbot_access_token")
          : null;
      if (stored) {
        setAuthToken(stored);
        console.log("[MigrationsPage] Auth token loaded from localStorage");
      }
    } catch (e) {
      console.error("[MigrationsPage] Error reading auth token:", e);
    }
  }, []);

  // Fetch campaigns when token is available
  useEffect(() => {
    if (authToken && !loading) {
      showLoading();
      Promise.all([fetchCampaigns(), fetchDeletedCampaigns()])
        .then(() => {
          hideLoading();
        })
        .catch(() => {
          hideLoading();
        });
    }
  }, [authToken]);

  // Fetch deleted campaigns
  const fetchDeletedCampaigns = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

      if (!API_BASE_URL || !TENANT_ID || !authToken) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/campaigns?include_deleted=true`,
        {
          method: "GET",
          headers: {
            "tenant-id": TENANT_ID,
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch deleted campaigns");
      }

      const result = await response.json();
      if (result.success && result.data?.campaigns) {
        const deleted = result.data.campaigns.filter(
          (c: LegacyCampaign) => c.is_deleted === true
        );
        setDeletedCampaigns(deleted);
      }
    } catch (err) {
      console.error("[MigrationsPage] Error fetching deleted campaigns:", err);
    }
  };

  // Update campaigns when fetched
  useEffect(() => {
    console.log(
      "[MigrationsPage] Fetched campaigns updated:",
      fetchedCampaigns
    );
    setCampaigns(fetchedCampaigns);
  }, [fetchedCampaigns]);

  // Convert legacy campaign to full campaign format for display
  const convertLegacyCampaign = (legacy: LegacyCampaign): Campaign => {
    console.log("[MigrationsPage] Converting legacy campaign:", legacy);
    const converted = {
      id: legacy.id,
      tenant_id: "", // Not available in legacy format
      name: legacy.job_role, // Use job_role as name
      description: null,
      job_id: 0, // Not available in legacy format
      job_code: "",
      job_role: legacy.job_role,
      job_type: "fulltime" as const, // Default value
      hiring_company_name: "", // Not available in legacy format
      client_name: null,
      job_location: "", // Not available in legacy format
      job_locations: [],
      work_mode: "remote" as const, // Default value
      shift_type: "day" as const, // Default value
      interview_mode: "video" as const, // Default value
      is_drive: false, // Default value
      drive_date: null,
      drive_location: null,
      drive_time: null,
      experience_min: 0, // Default value
      experience_max: 5, // Default value
      min_ctc: 0, // Default value
      max_ctc: 0, // Default value
      ctc_negotiable: false, // Default value
      status: (legacy.status === "inactive"
        ? "paused"
        : legacy.status === "active"
        ? "active"
        : "draft") as "draft" | "active" | "paused" | "completed",
      total_contacts: 0, // Default value
      completed_calls: 0, // Default value
      failed_calls: 0, // Default value
      pending_calls: 0, // Default value
      audio_generated: false, // Default value
      audio_approved: false, // Default value
      voice_gender: "female" as const, // Default value
      is_deleted: !!legacy.is_deleted,
      deleted_at: legacy.deleted_at || null,
      created_at: legacy.created_at,
      updated_at: legacy.created_at, // Default to created_at
      started_at: null,
      completed_at: null,
    };
    console.log("[MigrationsPage] Converted to:", converted);
    return converted;
  };

  // Filter campaigns based on status
  useEffect(() => {
    console.log(
      "[MigrationsPage] Filtering campaigns. Status filter:",
      statusFilter,
      "Campaigns:",
      campaigns
    );

    // Convert all campaigns to the new format first
    const convertedCampaigns = campaigns.map(convertLegacyCampaign);

    let filtered: Campaign[] = [];
    if (statusFilter === "active") {
      filtered = convertedCampaigns.filter((c) => c.status === "active");
    } else if (statusFilter === "paused") {
      filtered = convertedCampaigns.filter((c) => c.status === "paused");
    } else if (statusFilter === "completed") {
      filtered = convertedCampaigns.filter((c) => c.status === "completed");
    } else if (statusFilter === "draft") {
      filtered = convertedCampaigns.filter((c) => c.status === "draft");
    } else if (statusFilter === "deleted") {
      filtered = deletedCampaigns.map(convertLegacyCampaign);
    } else {
      // "all" filter
      filtered = convertedCampaigns;
    }

    console.log("[MigrationsPage] Filtered campaigns:", filtered);
    setFilteredCampaigns(filtered);
  }, [campaigns, deletedCampaigns, statusFilter]);

  // Handle search with debouncing
  useEffect(() => {
    if (!authToken || !useSearch) return;

    const timeoutId = setTimeout(() => {
      showLoading();
      const filters = { ...searchFilters };
      if (searchQuery) {
        filters.q = searchQuery;
      }
      searchCampaigns(filters)
        .then(() => {
          hideLoading();
        })
        .catch(() => {
          hideLoading();
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFilters, authToken, useSearch]);

  // Determine which campaigns to display
  const displayCampaigns = useMemo(() => {
    console.log(
      "[MigrationsPage] Computing displayCampaigns. useSearch:",
      useSearch,
      "filteredCampaigns:",
      filteredCampaigns
    );
    if (useSearch) {
      console.log("[MigrationsPage] Using search results:", searchedCampaigns);
      return searchedCampaigns;
    }
    // When not using search, convert legacy campaigns to full format
    const converted = filteredCampaigns.map((c) => {
      // Check if it's a legacy campaign (has job_role property)
      if ((c as LegacyCampaign).job_role !== undefined) {
        console.log("[MigrationsPage] Converting legacy campaign:", c);
        return convertLegacyCampaign(c as LegacyCampaign);
      }
      // Otherwise it's already a full Campaign object
      console.log("[MigrationsPage] Using existing campaign:", c);
      return c as Campaign;
    });
    console.log("[MigrationsPage] Converted display campaigns:", converted);
    return converted;
  }, [useSearch, searchedCampaigns, filteredCampaigns]);

  const isLoading = useSearch ? searchLoading : loading;
  const displayError = useSearch ? searchError : error;

  const handleApplyFilters = () => {
    if (authToken) {
      showLoading();
      setUseSearch(true);
      const filters = { ...searchFilters };
      if (searchQuery) {
        filters.q = searchQuery;
      }
      searchCampaigns(filters)
        .then(() => {
          hideLoading();
        })
        .catch(() => {
          hideLoading();
        });
    }
  };

  const handleClearFilters = () => {
    setSearchFilters({
      page: 1,
      page_size: 50,
      is_deleted: false,
    });
    setSearchQuery("");
    setUseSearch(false);
  };

  const handleCreateCampaign = () => {
    // Check if user has Hyrex token
    const storedHyrexToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("hyrex-auth-token")
        : null;

    if (storedHyrexToken) {
      setHyrexToken(storedHyrexToken);
      setIsModalOpen(true);
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleHyrexLoginSuccess = (token: string) => {
    setHyrexToken(token);
    setShowLoginDialog(false);
    setIsModalOpen(true);
  };

  const handleCampaignCreated = () => {
    setIsModalOpen(false);
    // Refresh campaigns after creation
    if (authToken) {
      showLoading();
      fetchCampaigns()
        .then(() => {
          hideLoading();
        })
        .catch(() => {
          hideLoading();
        });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (useSearch && authToken) {
      showLoading();
      setSearchFilters({ ...searchFilters, page: newPage });
      searchCampaigns({ ...searchFilters, page: newPage })
        .then(() => {
          hideLoading();
        })
        .catch(() => {
          hideLoading();
        });
    }
  };

  const deleteCampaign = async (id: string) => {
    setDeletingCampaigns((prev) => new Set(prev).add(id));
    try {
      showLoading();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

      if (!API_BASE_URL || !TENANT_ID) {
        throw new Error("Missing API configuration");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${id}`, {
        method: "DELETE",
        headers: {
          "tenant-id": TENANT_ID,
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete campaign: ${response.status} ${response.statusText}`
        );
      }

      // Remove from local state and refresh deleted campaigns
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      await fetchDeletedCampaigns();
      setShowDeleteDialog(false);
      setCampaignToDelete(null);
    } catch (err: any) {
      console.error("[MigrationsPage] Error deleting campaign:", err);
      // Could show error toast here
    } finally {
      setDeletingCampaigns((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      hideLoading();
    }
  };

  const restoreCampaign = async (id: string) => {
    setRestoringCampaigns((prev) => new Set(prev).add(id));
    try {
      showLoading();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

      if (!API_BASE_URL || !TENANT_ID) {
        throw new Error("Missing API configuration");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/campaigns/${id}/restore`,
        {
          method: "POST",
          headers: {
            "tenant-id": TENANT_ID,
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to restore campaign: ${response.status} ${response.statusText}`
        );
      }

      // Refresh both lists
      await fetchCampaigns();
      await fetchDeletedCampaigns();
    } catch (err: any) {
      console.error("[MigrationsPage] Error restoring campaign:", err);
    } finally {
      setRestoringCampaigns((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      hideLoading();
    }
  };

  const confirmDeleteCampaign = (id: string) => {
    setCampaignToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmPermanentDeleteCampaign = (id: string) => {
    setCampaignToPermDeleteId(id);
    setShowPermanentDeleteDialog(true);
  };

  const permanentlyDeleteCampaign = async (id: string) => {
    setPermanentlyDeletingCampaigns((prev) => new Set(prev).add(id));
    try {
      showLoading();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

      if (!API_BASE_URL || !TENANT_ID) {
        throw new Error("Missing API configuration");
      }

      if (!authToken) {
        throw new Error("Auth token is missing");
      }

      const permanentDeleteUrl = `${API_BASE_URL.replace(
        /\/$/,
        ""
      )}/api/v1/campaigns/${id}/permanent?confirm=true`;
      console.log("[Permanent Delete] Calling URL:", permanentDeleteUrl);

      const response = await fetch(permanentDeleteUrl, {
        method: "DELETE",
        headers: {
          "tenant-id": TENANT_ID,
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "69420",
        },
      });

      console.log("[Permanent Delete Response]", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
      });

      if (!response.ok) {
        let errorMessage = `Failed to permanently delete campaign: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error("[Permanent Delete Raw Response]", errorText);

          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              console.error("[Permanent Delete Error Data]", errorData);
              errorMessage =
                errorData?.message ||
                errorData?.detail ||
                errorData?.error ||
                errorMessage;
            } catch (parseE) {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          console.error("[Permanent Delete Error]", e);
        }
        throw new Error(errorMessage);
      }

      // Refresh the deleted campaigns list
      await fetchDeletedCampaigns();
      setShowPermanentDeleteDialog(false);
    } catch (err: any) {
      console.error(
        "[MigrationsPage] Error permanently deleting campaign:",
        err
      );
    } finally {
      setPermanentlyDeletingCampaigns((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      hideLoading();
    }
  };

  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const pausedCount = campaigns.filter((c) => c.status === "inactive").length; // "inactive" maps to "paused"
  const completedCount = 0; // Legacy campaigns don't have completed status
  const draftCount = campaigns.filter((c) => c.status === "draft").length;
  const deletedCount = deletedCampaigns.length;

  // Debug logging
  useEffect(() => {
    console.log("[MigrationsPage] State debug:", {
      campaigns: campaigns.length,
      filteredCampaigns: filteredCampaigns.length,
      displayCampaigns: displayCampaigns.length,
      useSearch,
      statusFilter,
      loading,
      searchLoading,
      error,
      searchError,
    });
  }, [
    campaigns,
    filteredCampaigns,
    displayCampaigns,
    useSearch,
    statusFilter,
    loading,
    searchLoading,
    error,
    searchError,
  ]);

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Campaign Migrations
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleCreateCampaign}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Campaign
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search campaigns by name, job role, company, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setUseSearch(true);
              }}
              className="pl-10"
            />
          </div>
          <CampaignFilters
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 pb-4 border-b border-gray-200">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            statusFilter === "all"
              ? "text-primary-600 border-primary-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          All Campaigns{" "}
          <span className="ml-1 text-gray-500">
            {campaigns.length.toString().padStart(2, "0")}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            statusFilter === "active"
              ? "text-green-600 border-green-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          Active{" "}
          <span className="ml-1 text-gray-500">
            {activeCount.toString().padStart(2, "0")}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("paused")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            statusFilter === "paused"
              ? "text-yellow-600 border-yellow-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          Paused{" "}
          <span className="ml-1 text-gray-500">
            {pausedCount.toString().padStart(2, "0")}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            statusFilter === "completed"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          Completed{" "}
          <span className="ml-1 text-gray-500">
            {completedCount.toString().padStart(2, "0")}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("draft")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            statusFilter === "draft"
              ? "text-amber-600 border-amber-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          Drafts{" "}
          <span className="ml-1 text-gray-500">
            {draftCount.toString().padStart(2, "0")}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("deleted")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            statusFilter === "deleted"
              ? "text-red-600 border-red-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          Deleted{" "}
          <span className="ml-1 text-gray-500">
            {deletedCount.toString().padStart(2, "0")}
          </span>
        </button>
      </div>

      {displayError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-700 font-medium">Error</p>
          <p className="text-sm text-red-600 mt-1">{displayError}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading campaigns...</p>
          </div>
        </div>
      )}

      {!isLoading && displayCampaigns.length === 0 ? (
        <div className="text-gray-600">
          {useSearch
            ? "No campaigns found matching your search criteria."
            : campaigns.length === 0 && statusFilter !== "deleted"
            ? "No campaigns found. Create one to get started!"
            : statusFilter === "deleted" && deletedCount === 0
            ? "No deleted campaigns."
            : `No ${
                statusFilter === "all" ? "" : statusFilter
              } campaigns found.`}
        </div>
      ) : (
        <div className="space-y-4">
          {displayCampaigns.map((campaign) => {
            return useSearch ? (
              <CampaignSearchCard
                key={campaign.id}
                campaign={campaign}
                onView={(id) => router.push(`/campaigns/migrations/${id}`)}
              />
            ) : (
              <MigrationCard
                key={campaign.id}
                campaign={campaign}
                onView={(id) => router.push(`/campaigns/migrations/${id}`)}
                onDelete={confirmDeleteCampaign}
                isDeleted={statusFilter === "deleted"}
                onRestore={
                  statusFilter === "deleted" ? restoreCampaign : undefined
                }
                isRestoring={restoringCampaigns.has(campaign.id)}
                onPermanentDelete={
                  statusFilter === "deleted"
                    ? confirmPermanentDeleteCampaign
                    : undefined
                }
                isPermanentDeleting={permanentlyDeletingCampaigns.has(
                  campaign.id
                )}
              />
            );
          })}

          {useSearch && pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.total_pages}{" "}
                (Total: {pagination.total} campaigns)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_prev}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_next}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        authToken={hyrexToken || undefined}
        onCreated={handleCampaignCreated}
      />

      {/* Hyrex Login Dialog */}
      <HyrexLoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onSuccess={handleHyrexLoginSuccess}
        description="Enter your Hyrex credentials to fetch job codes and create campaigns."
      />

      {/* Delete Campaign Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                campaignToDelete && deleteCampaign(campaignToDelete)
              }
              disabled={
                campaignToDelete
                  ? deletingCampaigns.has(campaignToDelete)
                  : false
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {campaignToDelete && deletingCampaigns.has(campaignToDelete)
                ? "Deleting..."
                : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Campaign Confirmation */}
      <AlertDialog
        open={showPermanentDeleteDialog}
        onOpenChange={setShowPermanentDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this campaign and all associated data
              from the system. This action cannot be undone and is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                campaignToPermDeleteId &&
                permanentlyDeleteCampaign(campaignToPermDeleteId)
              }
              disabled={
                campaignToPermDeleteId
                  ? permanentlyDeletingCampaigns.has(campaignToPermDeleteId)
                  : false
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {campaignToPermDeleteId &&
              permanentlyDeletingCampaigns.has(campaignToPermDeleteId)
                ? "Permanently Deleting..."
                : "Yes, Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
