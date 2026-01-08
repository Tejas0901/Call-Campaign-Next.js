"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import CampaignCard from "@/components/CampaignCard";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import { campaignData } from "@/data/campaignData";
import { Plus, ChevronDown } from "lucide-react";
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

type Draft = {
  id: string;
  jobCode: string;
  jobInfo: string;
  savedAt: string;
};

export default function Campaigns() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<"active" | "archived" | "drafts">("active");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
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

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      <CreateCampaignModal open={isModalOpen} onOpenChange={setIsModalOpen} />

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
              <div
                key={d.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Saved {new Date(d.savedAt).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                      onClick={() => {
                        setSelectedDraft(d);
                        setIsModalOpen(true);
                      }}
                    >
                      Continue
                    </button>
                    <button
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
                      onClick={() => confirmDeleteDraft(d.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Job Code:</span>{" "}
                    {d.jobCode || "-"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Job Info:</span>{" "}
                    {d.jobInfo || "-"}
                  </div>
                </div>
              </div>
            ))
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
