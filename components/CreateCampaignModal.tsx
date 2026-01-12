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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, FileText, Trash2, X } from "lucide-react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useJobCodes } from "@/hooks/useJobCodes";

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authToken?: string;
  initialValues?: {
    id?: string;
    jobCode?: string;
    jobInfo?: string; // kept for backward-compatibility with drafts
  };
  onCreated?: (payload: {
    id?: string;
    jobCode: string;
    jobInfo: string; // returns jobRole in this field for compatibility
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
  authToken,
  initialValues,
  onCreated,
  onDraftSaved,
}: CreateCampaignModalProps) {
  // Form fields
  const [jobCode, setJobCode] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<string>("");
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");
  const [minCTC, setMinCTC] = useState("");
  const [maxCTC, setMaxCTC] = useState("");
  const [jobDetails, setJobDetails] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

  const toPlainText = (html: string) =>
    html
      .replace(/<br\s*\/?>(\n)?/gi, "\n")
      .replace(/<\/(p|div)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  // Read token from localStorage if not provided as prop
  const [tokenFromStorage, setTokenFromStorage] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (!authToken && typeof window !== "undefined") {
      const stored = window.localStorage.getItem("hyrex-auth-token");
      if (stored) {
        setTokenFromStorage(stored);
        console.log(
          "[CreateCampaignModal] Token read from localStorage:",
          !!stored
        );
      }
    }
  }, [authToken, open]);

  // Use prop token first, fallback to storage
  const effectiveToken = authToken || tokenFromStorage;
  console.log(
    "[CreateCampaignModal] Effective authToken:",
    !!effectiveToken,
    effectiveToken ? `${effectiveToken.substring(0, 30)}...` : "undefined"
  );

  const {
    jobs,
    loading: jobsLoading,
    fetchJobCodes,
  } = useJobCodes(effectiveToken);

  // Convert jobs to combobox options
  const jobCodeOptions: ComboboxOption[] = jobs.map((job) => ({
    value: job.job_code,
    label: `${job.job_code} - ${job.title} (${job.client_name})`,
    job,
  }));

  // Auto-populate job role and other details when a job code is selected
  useEffect(() => {
    if (jobCode) {
      const selectedJob = jobs.find((j) => j.job_code === jobCode);
      if (selectedJob) {
        // Only set jobRole if it's empty to avoid overwriting user input
        if (!jobRole) {
          setJobRole(selectedJob.title || "");
        }
        // Auto-fill other fields from API data
        if (!companyName && selectedJob.client_name) {
          setCompanyName(selectedJob.client_name);
        }
        if (!location) {
          const parts = [
            selectedJob.city,
            selectedJob.state,
            selectedJob.country,
          ].filter(Boolean) as string[];
          const composed =
            parts.join(", ") ||
            selectedJob.address ||
            selectedJob.location ||
            "";
          if (composed) setLocation(composed);
        }
        if (!workMode && selectedJob.remote) {
          const rv = String(selectedJob.remote).toLowerCase();
          const mapped = rv === "yes" ? "remote" : rv === "no" ? "office" : rv;
          if (mapped) setWorkMode(mapped);
        }
        if (!minExp && !maxExp && selectedJob.experience) {
          const exp = Number(selectedJob.experience);
          if (!Number.isNaN(exp) && exp > 0) {
            const val = String(exp);
            setMinExp(val);
            setMaxExp(val);
          }
        }
        if (!jobDetails && selectedJob.description) {
          setJobDetails(toPlainText(selectedJob.description));
        }
      }
    }
  }, [jobCode, jobs, jobRole, companyName, location]);

  // Fetch job codes when modal opens
  useEffect(() => {
    if (open && jobs.length === 0 && !jobsLoading) {
      fetchJobCodes();
    }
  }, [open, jobs.length, jobsLoading]);

  // Candidate import/migration and uploads state
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
  useEffect(() => {
    if (open && initialValues) {
      setJobCode(initialValues.jobCode ?? "");
      // Map legacy jobInfo (from drafts) to jobRole for continuity
      setJobRole(initialValues.jobInfo ?? "");
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
        // Store jobRole into legacy jobInfo field for compatibility in drafts pages
        jobInfo: jobRole,
        savedAt: new Date().toISOString(),
      };
      const nextDrafts = upsertDraft(draft);
      onDraftSaved?.(nextDrafts);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save draft", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validations
    const minExpNum = Number(minExp);
    const maxExpNum = Number(maxExp);
    const minCTCNum = Number(minCTC);
    const maxCTCNum = Number(maxCTC);

    if (Number.isNaN(minExpNum) || Number.isNaN(maxExpNum)) {
      setError("Experience must be valid numbers.");
      return;
    }
    if (Number.isNaN(minCTCNum) || Number.isNaN(maxCTCNum)) {
      setError("CTC must be valid numbers.");
      return;
    }
    if (minExpNum < 0 || maxExpNum < 0 || minCTCNum < 0 || maxCTCNum < 0) {
      setError("Values cannot be negative.");
      return;
    }
    if (minExpNum > maxExpNum) {
      setError("Min experience cannot exceed max experience.");
      return;
    }
    if (minCTCNum > maxCTCNum) {
      setError("Min CTC cannot exceed max CTC.");
      return;
    }

    if (!API_BASE_URL || !TENANT_ID) {
      console.error(
        "Missing NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_TENANT_ID"
      );
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/campaigns`, {
        method: "POST",
        headers: {
          "X-Tenant-ID": TENANT_ID || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_role: jobRole,
          hiring_company_name: companyName,
          job_location: location,
          work_mode: workMode,
          min_experience: minExpNum,
          max_experience: maxExpNum,
          min_ctc: minCTCNum,
          max_ctc: maxCTCNum,
          negotiation_margin_percent: 10,
          // Send textarea content directly; backend may accept string or object
          job_details: jobDetails,
          contact_email: email,
          contact_phone: phone,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error?.message || "Failed to create campaign");
      }

      // If this was from a draft, remove it
      removeDraftById(initialValues?.id);

      // Notify parent; keep jobInfo as jobRole for compatibility
      onCreated?.({ id: initialValues?.id, jobCode, jobInfo: jobRole });

      // Reset form
      setJobCode("");
      setJobRole("");
      setCompanyName("");
      setLocation("");
      setWorkMode("");
      setMinExp("");
      setMaxExp("");
      setMinCTC("");
      setMaxCTC("");
      setJobDetails("");
      setEmail("");
      setPhone("");

      onOpenChange(false);
    } catch (err: any) {
      console.error("Campaign creation failed:", err);
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new campaign.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 mt-4 overflow-y-auto flex-1 pr-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobCode">Job Code</Label>
                <Combobox
                  options={jobCodeOptions}
                  value={jobCode}
                  onValueChange={setJobCode}
                  placeholder="Select job code"
                  searchPlaceholder="Search by code, title, or company..."
                  noResultsText="No job codes found."
                  loading={jobsLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole">Job Role</Label>
                <Input
                  id="jobRole"
                  type="text"
                  placeholder="e.g., Senior Python Developer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="e.g., Tech Corp Inc"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Work Mode</Label>
                <Select value={workMode} onValueChange={setWorkMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience (min - max years)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Min"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Max"
                    value={maxExp}
                    onChange={(e) => setMaxExp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>CTC (in lakhs, min - max)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="Min"
                    value={minCTC}
                    onChange={(e) => setMinCTC(e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="Max"
                    value={maxCTC}
                    onChange={(e) => setMaxCTC(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="jobDetails">Job Details</Label>
                <Textarea
                  id="jobDetails"
                  placeholder="Describe the role, responsibilities, required skills, etc."
                  value={jobDetails}
                  onChange={(e) => setJobDetails(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
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

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={saveDraft}
                disabled={!jobCode && !jobRole}
              >
                Save as Draft
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Add candidates dialog */}
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

      {/* Migrate candidates dialog */}
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

      {/* Import manually dialog */}
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
