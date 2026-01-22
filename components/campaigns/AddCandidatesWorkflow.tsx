"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { FileText, UploadCloud, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CandidateRow } from "@/components/ui/candidates-table";

interface AddCandidatesWorkflowProps {
  entityId: string; // draftId or campaignId
  jobId?: number | null;
  jobCode?: string;
  candidates: CandidateRow[];
  setCandidates: React.Dispatch<React.SetStateAction<CandidateRow[]>>;
  routePrefix: "drafts" | "migrations"; // For navigation paths
  entityType?: "draft" | "migration"; // For dialog labels
}

export default function AddCandidatesWorkflow({
  entityId,
  jobId,
  jobCode,
  candidates,
  setCandidates,
  routePrefix,
  entityType = "draft",
}: AddCandidatesWorkflowProps) {
  const router = useRouter();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAtsDialog, setShowAtsDialog] = useState(false);
  const [showImportManuallyDialog, setShowImportManuallyDialog] =
    useState(false);
  const [showSingleUploadDialog, setShowSingleUploadDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [manualResumes, setManualResumes] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");

  const singleInputRef = useRef<HTMLInputElement | null>(null);
  const bulkInputRef = useRef<HTMLInputElement | null>(null);

  const acceptedExt = [".pdf", ".doc", ".docx"];
  const isAccepted = (file: File) =>
    acceptedExt.some((ext) => file.name.toLowerCase().endsWith(ext));

  const entityLabel = entityType === "draft" ? "draft" : "campaign";

  return (
    <>
      <Button
        variant="default"
        className="bg-primary-600 text-white hover:bg-primary-700 whitespace-nowrap"
        onClick={() => setShowAddDialog(true)}
      >
        Add candidates
      </Button>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add candidates</DialogTitle>
            <DialogDescription>
              Import candidates into this {entityLabel}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-primary-200 text-primary-700 hover:bg-primary-50"
              onClick={() => {
                setUploadError("");
                setShowImportManuallyDialog(true);
              }}
            >
              Excel import
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-primary-200 text-primary-700 hover:bg-primary-50"
              onClick={() => {
                setUploadError("");
                setShowImportManuallyDialog(true);
              }}
            >
              Import manually
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-primary-200 text-primary-700 hover:bg-primary-50"
              onClick={() => setShowAtsDialog(true)}
            >
              ATS
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAtsDialog} onOpenChange={setShowAtsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ATS Integration</DialogTitle>
            <DialogDescription>
              Fetch candidates from your ATS for this {entityLabel}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              We will fetch candidates using the saved job code for this{" "}
              {entityLabel}.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAtsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!jobId) {
                    alert(`Job ID missing for this ${entityLabel}`);
                    return;
                  }
                  setShowAtsDialog(false);
                  router.push(
                    `/campaigns/${routePrefix}/${entityId}/ats-candidates`,
                  );
                }}
                disabled={!jobCode}
              >
                Fetch Candidates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showImportManuallyDialog}
        onOpenChange={setShowImportManuallyDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import manually</DialogTitle>
            <DialogDescription>
              Choose how you want to upload resumes for this {entityLabel}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between border-gray-200 text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setUploadError("");
                  setSingleFile(null);
                  setShowSingleUploadDialog(true);
                }}
              >
                <span>File upload</span>
                <span className="text-xs text-gray-500">Single resume</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between border-gray-200 text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setUploadError("");
                  setBulkFiles([]);
                  setShowBulkUploadDialog(true);
                }}
              >
                <span>Bulk upload</span>
                <span className="text-xs text-gray-500">Up to 50 resumes</span>
              </Button>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Selected resumes
                  </p>
                  <p className="text-xs text-gray-600">
                    {manualResumes.length} added in this session
                  </p>
                </div>
                {manualResumes.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2 text-red-600 hover:text-red-700"
                    onClick={() => setManualResumes([])}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              {manualResumes.length > 0 && (
                <ul className="mt-2 max-h-40 overflow-auto space-y-1 text-xs text-gray-700">
                  {manualResumes.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate mr-2">{f.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-6 px-1 text-gray-500 hover:text-gray-700"
                        onClick={() =>
                          setManualResumes((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSingleUploadDialog}
        onOpenChange={setShowSingleUploadDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload a single resume</DialogTitle>
            <DialogDescription>Accepted: .pdf, .doc, .docx</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              ref={singleInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                setUploadError("");
                const f = e.target.files?.[0] ?? null;
                if (f && !isAccepted(f)) {
                  setUploadError("Only .pdf, .doc, .docx are allowed.");
                  setSingleFile(null);
                  return;
                }
                setSingleFile(f);
              }}
            />

            <div
              className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors p-6 text-center cursor-pointer"
              onClick={() => singleInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUploadError("");
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                if (!isAccepted(file)) {
                  setUploadError("Only .pdf, .doc, .docx are allowed.");
                  return;
                }
                setSingleFile(file);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="h-8 w-8 text-gray-500" />
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Click to upload</span> or drag &
                  drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => singleInputRef.current?.click()}
                  >
                    Choose file
                  </Button>
                </div>
              </div>
            </div>

            {singleFile && (
              <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="truncate text-sm text-gray-800">
                    {singleFile.name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSingleFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSingleUploadDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!singleFile}
                onClick={() => {
                  if (!singleFile) return;
                  setManualResumes((prev) => [singleFile, ...prev]);
                  setSingleFile(null);
                  setShowSingleUploadDialog(false);
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showBulkUploadDialog}
        onOpenChange={setShowBulkUploadDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk upload resumes</DialogTitle>
            <DialogDescription>Upload up to 50 files</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              ref={bulkInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                setUploadError("");
                const files = Array.from(e.target.files ?? []).filter(
                  isAccepted,
                );
                if (files.length > 50) {
                  setUploadError("You can upload a maximum of 50 files.");
                }
                setBulkFiles(files.slice(0, 50));
              }}
            />

            <div
              className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors p-6 text-center cursor-pointer"
              onClick={() => bulkInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUploadError("");
                let files = Array.from(e.dataTransfer.files ?? []).filter(
                  isAccepted,
                );
                if (files.length === 0) return;
                const combined = [...bulkFiles, ...files];
                if (combined.length > 50) {
                  setUploadError("You can upload a maximum of 50 files.");
                }
                setBulkFiles(combined.slice(0, 50));
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="h-8 w-8 text-gray-500" />
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Click to upload</span> or drag &
                  drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX • Up to 50 files
                </p>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => bulkInputRef.current?.click()}
                  >
                    Choose files
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-700">
              Selected: <span className="font-medium">{bulkFiles.length}</span>
            </div>
            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}
            {bulkFiles.length > 0 && (
              <ul className="max-h-48 overflow-auto space-y-1 text-xs text-gray-700 border border-gray-200 rounded p-2 bg-white">
                {bulkFiles.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-gray-500" />
                      <span className="truncate">{f.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-6 px-1 text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        setBulkFiles((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-600"
                onClick={() => setBulkFiles([])}
                disabled={bulkFiles.length === 0}
              >
                Clear
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBulkUploadDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={bulkFiles.length === 0}
                  onClick={() => {
                    if (bulkFiles.length === 0) return;
                    setManualResumes((prev) => {
                      const existingKeys = new Set(
                        prev.map((f) => `${f.name}-${f.size}`),
                      );
                      const toAdd = bulkFiles.filter(
                        (f) => !existingKeys.has(`${f.name}-${f.size}`),
                      );
                      return [...toAdd, ...prev];
                    });
                    setBulkFiles([]);
                    setShowBulkUploadDialog(false);
                  }}
                >
                  Add all
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
