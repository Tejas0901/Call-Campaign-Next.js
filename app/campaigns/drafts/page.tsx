"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import Link from "next/link";
import CreateCampaignModal from "@/components/CreateCampaignModal";

type Draft = {
  id: string;
  jobCode: string;
  jobInfo: string;
  candidateInfo: string;
  savedAt: string;
};

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selected, setSelected] = useState<Draft | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaign Drafts</h1>
        <Link
          href="/campaigns"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to Campaigns
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="text-gray-600">No drafts saved yet.</div>
      ) : (
        <div className="space-y-4">
          {drafts.map((d) => (
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
                      setSelected(d);
                      setIsModalOpen(true);
                    }}
                  >
                    Continue
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
                    onClick={() => {
                      try {
                        const raw =
                          typeof window !== "undefined"
                            ? window.localStorage.getItem("campaignDrafts")
                            : null;
                        const parsed = raw ? JSON.parse(raw) : [];
                        const next = Array.isArray(parsed)
                          ? parsed.filter((x: Draft) => x.id !== d.id)
                          : [];
                        if (typeof window !== "undefined") {
                          window.localStorage.setItem(
                            "campaignDrafts",
                            JSON.stringify(next)
                          );
                        }
                        setDrafts(next);
                      } catch {}
                    }}
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
                <div className="text-sm">
                  <span className="font-medium">Candidate Info:</span>{" "}
                  {d.candidateInfo || "-"}
                </div>
              </div>
            </div>
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
            setDrafts((prev) => prev.filter((x) => x.id !== payload.id));
          }
        }}
      />
    </MainLayout>
  );
}
