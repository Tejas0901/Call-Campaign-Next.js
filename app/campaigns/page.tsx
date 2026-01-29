"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import CampaignCard from "@/components/CampaignCard";
import DraftCard from "@/components/DraftCard";
import MigrationCard from "@/components/MigrationCard";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import { campaignData } from "@/data/campaignData";
import { Plus, ChevronDown, Search } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCampaignSearch } from "@/hooks/useCampaignSearch";
import { CampaignSearchFilters } from "@/types/campaign";
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
import { HyrexLoginDialog } from "@/components/hyrex/HyrexLoginDialog";

type Draft = {
  id: string;
  jobCode: string;
  jobInfo: string;
  savedAt: string;
};

export default function Campaigns() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<
    "active" | "archived" | "drafts" | "migrations"
  >("active");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [hyrexToken, setHyrexToken] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<"create" | null>(null);

  const {
    campaigns: fetchedCampaigns,
    loading: campaignsLoading,
    error: campaignsError,
    fetchCampaigns,
  } = useCampaigns(authToken);
  const [campaigns, setCampaigns] = useState<any[]>([]);

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

  useEffect(() => {
    // Restore Hyrex token and drafts, and auth token for migrations
    try {
      if (typeof window !== "undefined") {
        const savedToken = window.localStorage.getItem("hyrex-auth-token");
        if (savedToken) setHyrexToken(savedToken);

        const savedAuthToken = window.localStorage.getItem("auth-token");
        if (savedAuthToken) setAuthToken(savedAuthToken);
      }

      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("campaignDrafts")
          : null;
      const parsed = raw ? JSON.parse(raw) : [];
      setDrafts(Array.isArray(parsed) ? parsed : []);
    } catch {
      setDrafts([]);
    }
  }, []);

  // Fetch campaigns when auth token is available
  useEffect(() => {
    if (authToken && !campaignsLoading) {
      fetchCampaigns();
    }
  }, [authToken]);

  // Update campaigns when fetched
  useEffect(() => {
    setCampaigns(fetchedCampaigns);
  }, [fetchedCampaigns]);

  // Handle search with debouncing
  useEffect(() => {
    if (!authToken || !useSearch) return;

    const timeoutId = setTimeout(() => {
      const filters = { ...searchFilters };
      if (searchQuery) {
        filters.q = searchQuery;
      }
      searchCampaigns(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFilters, authToken, useSearch]);

  // Determine which campaigns to display
  const displayCampaigns = useMemo(() => {
    if (view === "migrations") {
      return useSearch ? searchedCampaigns : campaigns;
    }
    return [];
  }, [view, useSearch, searchedCampaigns, campaigns]);

  const isLoading =
    view === "migrations"
      ? useSearch
        ? searchLoading
        : campaignsLoading
      : false;
  const displayError =
    view === "migrations" ? (useSearch ? searchError : campaignsError) : null;

  const handleApplyFilters = () => {
    if (authToken) {
      setUseSearch(true);
      const filters = { ...searchFilters };
      if (searchQuery) {
        filters.q = searchQuery;
      }
      searchCampaigns(filters);
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

  const handlePageChange = (newPage: number) => {
    setSearchFilters({ ...searchFilters, page: newPage });
    if (useSearch && authToken) {
      searchCampaigns({ ...searchFilters, page: newPage });
    }
  };

  const deleteDraft = (id: string) => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("campaignDrafts")
          : null;
      const parsed = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(parsed)
        ? parsed.filter((d: Draft) => d.id !== id)
        : [];
      if (typeof window !== "undefined") {
        window.localStorage.setItem("campaignDrafts", JSON.stringify(next));
      }
      setDrafts(next);
      setShowDeleteDialog(false);
      setDraftToDelete(null);
    } catch {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const confirmDeleteDraft = (id: string) => {
    setDraftToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleCreateClick = () => {
    if (hyrexToken) {
      setIsModalOpen(true);
      return;
    }

    setPendingAction("create");
    setShowLoginDialog(true);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      <CreateCampaignModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        authToken={hyrexToken || undefined}
      />

      <HyrexLoginDialog
        open={showLoginDialog}
        onOpenChange={(open) => {
          setShowLoginDialog(open);
          if (!open) setPendingAction(null);
        }}
        onSuccess={(token) => {
          setHyrexToken(token);
          if (pendingAction === "create") {
            setIsModalOpen(true);
          }
          setPendingAction(null);
        }}
        description="Enter your Hyrex credentials to fetch job codes."
      />

      <div className="flex gap-2 mb-6 pb-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === "active"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setView("active")}
        >
          Active{" "}
          <span className="ml-1 text-gray-500">
            {campaignData.campaigns.length.toString().padStart(2, "0")}
          </span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === "archived"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setView("archived")}
        >
          Archived <span className="ml-1 text-gray-500">00</span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === "drafts"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setView("drafts")}
        >
          Drafts{" "}
          <span className="ml-1 text-gray-500">
            {drafts.length.toString().padStart(2, "0")}
          </span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === "migrations"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => {
            setView("migrations");
            router.push("/campaigns/migrations");
          }}
        >
          Migrations{" "}
        </button>
      </div>

      {view === "migrations" && (
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
      )}

      {view !== "migrations" && (
        <div className="flex flex-wrap gap-3 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <span>Triggered By</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <span>Status</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <span>Tags</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <span>Sort by: Sent Email</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {view === "active" && (
        <div className="space-y-4">
          {campaignData.campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {view === "archived" && (
        <div className="text-gray-600">No archived campaigns.</div>
      )}

      {view === "drafts" && (
        <div className="space-y-4">
          {drafts.length === 0 ? (
            <div className="text-gray-600">No drafts saved yet.</div>
          ) : (
            drafts.map((d) => (
              <DraftCard
                key={d.id}
                draft={d}
                onContinue={(draft) => {
                  setSelectedDraft(draft);
                  setIsModalOpen(true);
                }}
                onDelete={confirmDeleteDraft}
              />
            ))
          )}
        </div>
      )}

      {view === "migrations" && (
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading campaigns...</p>
              </div>
            </div>
          )}

          {displayError && !isLoading && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{displayError}</p>
            </div>
          )}

          {!isLoading && displayCampaigns.length === 0 && (
            <div className="text-gray-600">
              {useSearch
                ? "No campaigns found matching your search criteria."
                : "No campaigns found. Create one to get started!"}
            </div>
          )}

          {!isLoading &&
            displayCampaigns.length > 0 &&
            displayCampaigns.map((campaign) =>
              useSearch ? (
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
                />
              )
            )}

          {pagination && pagination.total_pages > 1 && (
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

      <CreateCampaignModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedDraft(null);
        }}
        initialValues={selectedDraft ?? undefined}
        onCreated={(payload) => {
          if (payload.id) {
            deleteDraft(payload.id);
          }
        }}
        onDraftSaved={(next) => setDrafts(next)}
      />

      {/* Delete Draft Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this draft? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => draftToDelete && deleteDraft(draftToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
