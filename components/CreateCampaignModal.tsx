"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronsUpDown,
  UploadCloud,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample job codes - replace with your actual data
const jobCodes = [
  { value: "JC001", label: "Marketing Campaign - Email" },
  { value: "JC002", label: "Sales Outreach - Phone" },
  { value: "JC003", label: "Customer Support - SMS" },
  { value: "JC004", label: "Product Launch - Multi-Channel" },
  { value: "JC005", label: "Event Promotion - Social Media" },
  { value: "JC006", label: "Lead Generation - Email" },
  { value: "JC007", label: "Customer Retention - SMS" },
  { value: "JC008", label: "Brand Awareness - Multi-Channel" },
];

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: {
    id?: string;
    jobCode?: string;
    jobInfo?: string;
  };
  onCreated?: (payload: {
    id?: string;
    jobCode: string;
    jobInfo: string;
  }) => void;
  onDraftSaved?: (
    drafts: Array<{
      id: string;
      jobCode: string;
      jobInfo: string;
      savedAt: string;
    }>
  ) => void;
}

export default function CreateCampaignModal({
  open,
  onOpenChange,
  initialValues,
  onCreated,
  onDraftSaved,
}: CreateCampaignModalProps) {
  const [jobCode, setJobCode] = useState("");
  const [jobInfo, setJobInfo] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMigrateDialog, setShowMigrateDialog] = useState(false);
  const [showImportManuallyDialog, setShowImportManuallyDialog] =
    useState(false);
  const [showSingleUploadDialog, setShowSingleUploadDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [manualResumes, setManualResumes] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const singleInputRef = useRef<HTMLInputElement | null>(null);
  const bulkInputRef = useRef<HTMLInputElement | null>(null);

  const acceptedExt = [".pdf", ".doc", ".docx"];
  const isAccepted = (file: File) => {
    const name = file.name.toLowerCase();
    return acceptedExt.some((ext) => name.endsWith(ext));
  };

  // Prefill form when opening with initial values

  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (typeof window !== "undefined") {
    // no-op, ensure window exists for localStorage inside functions below
  }

  const readDrafts = (): any[] => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("campaignDrafts")
          : null;
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeDrafts = (drafts: any[]) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("campaignDrafts", JSON.stringify(drafts));
    }
  };

  const removeDraftById = (id?: string) => {
    if (!id) return;
    const existing = readDrafts();
    writeDrafts(existing.filter((d: any) => d.id !== id));
  };

  const upsertDraft = (draft: any) => {
    const existing = readDrafts();
    const idx = existing.findIndex((d: any) => d.id === draft.id);
    if (idx >= 0) {
      existing[idx] = draft;
      writeDrafts(existing);
      return existing;
    } else {
      const next = [draft, ...existing];
      writeDrafts(next);
      return next;
    }
  };

  // Sync state when opening with initialValues
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (open && initialValues) {
      setJobCode(initialValues.jobCode ?? "");
      setJobInfo(initialValues.jobInfo ?? "");
    }
  }, [open, initialValues]);

  const saveDraft = () => {
    try {
      const draft = {
        id:
          initialValues?.id ??
          (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now())),
        jobCode,
        jobInfo,
        savedAt: new Date().toISOString(),
      };
      const nextDrafts = upsertDraft(draft);
      onDraftSaved?.(nextDrafts);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save draft", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Handle form submission here
    const payload = { id: initialValues?.id, jobCode, jobInfo };
    console.log("Campaign created:", payload);

    // If this was from a draft, remove it
    removeDraftById(initialValues?.id);

    // Notify parent if needed
    onCreated?.(payload);

    // Reset form
    setJobCode("");
    setJobInfo("");

    // Close modal
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new campaign.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="jobCode">Job Code</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    id="jobCode"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {jobCode
                      ? jobCodes.find((code) => code.value === jobCode)?.label
                      : "Select job code..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-112.5 p-0">
                  <Command>
                    <CommandInput placeholder="Search job code..." />
                    <CommandList>
                      <CommandEmpty>No job code found.</CommandEmpty>
                      <CommandGroup>
                        {jobCodes.map((code) => (
                          <CommandItem
                            key={code.value}
                            value={code.value}
                            onSelect={(currentValue) => {
                              setJobCode(
                                currentValue === jobCode ? "" : currentValue
                              );
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                jobCode === code.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {code.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobInfo">Job Info</Label>
              <Input
                id="jobInfo"
                type="text"
                placeholder="Enter job information..."
                value={jobInfo}
                onChange={(e) => setJobInfo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  className="flex-1 justify-center bg-primary-600 text-white hover:bg-primary-700"
                  onClick={() => setShowAddDialog(true)}
                >
                  Add candidates
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 justify-center border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => setShowMigrateDialog(true)}
                >
                  Migrate
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={saveDraft}
                disabled={!jobCode && !jobInfo}
              >
                Save as Draft
              </Button>
              <Button type="submit" disabled={!jobCode || !jobInfo}>
                Create Campaign
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add candidates</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Excel import
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50"
              onClick={() => setShowImportManuallyDialog(true)}
            >
              Import manually
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMigrateDialog} onOpenChange={setShowMigrateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Migrate candidates</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              From existing DB
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              From Excel sheet
            </Button>
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
              Choose how you want to upload resumes for this campaign.
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
                            prev.filter((_, idx) => idx !== i)
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

      {/* Single Upload Dialog */}
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

      {/* Bulk Upload Dialog */}
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
                  isAccepted
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
                  isAccepted
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
                          prev.filter((_, idx) => idx !== i)
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
                    // Append new files; avoid duplicates by name+size
                    setManualResumes((prev) => {
                      const existingKeys = new Set(
                        prev.map((f) => `${f.name}-${f.size}`)
                      );
                      const toAdd = bulkFiles.filter(
                        (f) => !existingKeys.has(`${f.name}-${f.size}`)
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
