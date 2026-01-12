"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useRouter } from "next/navigation";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import DraftCard from "@/components/DraftCard";
import { ChevronDown, ArrowLeft } from "lucide-react";
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
  candidateInfo?: string;
  savedAt: string;
};

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selected, setSelected] = useState<Draft | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    } catch (e) {
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
        ? parsed.filter((x: Draft) => x.id !== id)
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
        <h1 className="text-2xl font-bold text-gray-900">Campaign Drafts</h1>
        <button
          onClick={() => router.push("/campaigns")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Campaigns
        </button>
      </div>

      <div className="flex gap-2 mb-6 pb-4 border-b border-gray-200">
        <div className="px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
          Drafts{" "}
          <span className="ml-1 text-gray-500">
            {drafts.length.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>Sort by: Date Saved</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="text-gray-600">No drafts saved yet.</div>
      ) : (
        <div className="space-y-4">
          {drafts.map((d) => (
            <DraftCard
              key={d.id}
              draft={d}
              onContinue={(draft) => {
                setSelected(draft);
                setIsModalOpen(true);
              }}
              onDelete={confirmDeleteDraft}
            />
          ))}
        </div>
      )}

      {/* Modal for continuing a draft */}
      <CreateCampaignModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelected(null);
        }}
        initialValues={selected ?? undefined}
        onCreated={(payload) => {
          // Remove the draft from the list when created
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
