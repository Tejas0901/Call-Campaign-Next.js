"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import CampaignCard from "@/components/CampaignCard";
import DraftCard from "@/components/DraftCard";
import MigrationCard from "@/components/MigrationCard";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import { campaignData } from "@/data/campaignData";
import { Plus, ChevronDown } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [hyrexToken, setHyrexToken] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);

  const {
    campaigns: fetchedCampaigns,
    loading: campaignsLoading,
    error: campaignsError,
    fetchCampaigns,
  } = useCampaigns(authToken);
  const [campaigns, setCampaigns] = useState<any[]>([]);

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
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleHyrexLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const response = await fetch("/api/hyrex/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();
      console.log("[Login Response]", { status: response.status, data });

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Login failed");
      }

      const token = data?.token;
      if (!token) {
        console.error("[Login Error] No token in response", data);
        throw new Error("Login succeeded but token is missing in response");
      }

      console.log("[Login Success] Storing token in localStorage");
      if (typeof window !== "undefined") {
        window.localStorage.setItem("hyrex-auth-token", token);
        const stored = window.localStorage.getItem("hyrex-auth-token");
        console.log(
          "[Token Verification] Token stored and retrieved:",
          !!stored,
        );
      }
      setHyrexToken(token);
      setShowLoginDialog(false);
      setIsModalOpen(true);
    } catch (err: any) {
      setLoginError(err?.message || "Unable to login. Please try again.");
    } finally {
      setLoginLoading(false);
    }
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

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login to Hyrex</DialogTitle>
            <DialogDescription>
              Enter your Hyrex credentials to fetch job codes.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleHyrexLogin}>
            <div className="space-y-2">
              <Label htmlFor="hyrexEmail">Email</Label>
              <Input
                id="hyrexEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hyrexPassword">Password</Label>
              <Input
                id="hyrexPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLoginDialog(false)}
                disabled={loginLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loginLoading}>
                {loginLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
          {campaignsLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading campaigns...</p>
              </div>
            </div>
          )}

          {campaignsError && !campaignsLoading && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{campaignsError}</p>
            </div>
          )}

          {!campaignsLoading && campaigns.length === 0 && (
            <div className="text-gray-600">
              No campaigns found. Create one to get started!
            </div>
          )}

          {!campaignsLoading &&
            campaigns.length > 0 &&
            campaigns.map((campaign) => (
              <MigrationCard
                key={campaign.id}
                campaign={campaign}
                onView={(id) => router.push(`/campaigns/migrations/${id}`)}
              />
            ))}
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
