"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useRouter } from "next/navigation";
import MigrationCard from "@/components/MigrationCard";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
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

interface Campaign {
  id: string;
  job_role: string;
  status: "draft" | "active";
  created_at: string;
}

export default function MigrationsPage() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [deletingCampaigns, setDeletingCampaigns] = useState<Set<string>>(
    new Set(),
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">(
    "all",
  );

  const {
    campaigns: fetchedCampaigns,
    loading,
    error,
    fetchCampaigns,
  } = useCampaigns(authToken);

  // Get auth token on mount
  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem("auth-token")
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
      fetchCampaigns();
    }
  }, [authToken]);

  // Update campaigns when fetched
  useEffect(() => {
    setCampaigns(fetchedCampaigns);
  }, [fetchedCampaigns]);

  // Filter campaigns based on status
  useEffect(() => {
    let filtered = campaigns;
    if (statusFilter === "active") {
      filtered = campaigns.filter((c) => c.status === "active");
    } else if (statusFilter === "draft") {
      filtered = campaigns.filter((c) => c.status === "draft");
    }
    // Sort by created_at descending
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    setFilteredCampaigns(filtered);
  }, [campaigns, statusFilter]);

  const deleteCampaign = async (id: string) => {
    setDeletingCampaigns((prev) => new Set(prev).add(id));
    try {
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
          `Failed to delete campaign: ${response.status} ${response.statusText}`,
        );
      }

      // Remove from local state
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
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
    }
  };

  const confirmDeleteCampaign = (id: string) => {
    setCampaignToDelete(id);
    setShowDeleteDialog(true);
  };

  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const draftCount = campaigns.filter((c) => c.status === "draft").length;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Campaign Migrations
        </h1>
        <button
          onClick={() => router.push("/campaigns")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Campaigns
        </button>
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
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>Sort by: Date Created</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-700 font-medium">Error</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading campaigns...</p>
          </div>
        </div>
      )}

      {!loading && filteredCampaigns.length === 0 ? (
        <div className="text-gray-600">
          {campaigns.length === 0
            ? "No campaigns found. Create one to get started!"
            : `No ${
                statusFilter === "all" ? "" : statusFilter
              } campaigns found.`}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <MigrationCard
              key={campaign.id}
              campaign={campaign}
              onView={(id) => router.push(`/campaigns/migrations/${id}`)}
              onDelete={confirmDeleteCampaign}
            />
          ))}
        </div>
      )}

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
    </MainLayout>
  );
}
