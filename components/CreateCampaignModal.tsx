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
import { SearchBox } from "@/components/ui/search-box";
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
import { LocationMultiSelect } from "@/components/LocationMultiSelect";

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authToken?: string;
  initialValues?: {
    id?: string;
    jobCode?: string;
    jobInfo?: string; // kept for backward-compatibility with drafts
    jobId?: number; // Added for ATS integration
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
      jobId?: number; // Added for ATS integration
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
  // Basic Information Section
  const [campaignName, setCampaignName] = useState("");
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobCode, setJobCode] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [description, setDescription] = useState("");

  // Company Details Section
  const [companyName, setCompanyName] = useState("");
  const [clientName, setClientName] = useState("");

  // Job Details Section
  const [jobType, setJobType] = useState<string>("full_time");
  const [workMode, setWorkMode] = useState<string>("");
  const [location, setLocation] = useState("");
  const [multipleLocations, setMultipleLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");

  // Compensation Section
  const [minCTC, setMinCTC] = useState("");
  const [maxCTC, setMaxCTC] = useState("");

  // Experience Section
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");

  // Shift & Interview Section
  const [shiftType, setShiftType] = useState<string>("");
  const [interviewMode, setInterviewMode] = useState<string>("");

  // Walk-in Drive Section
  const [isWalkinDrive, setIsWalkinDrive] = useState(false);
  const [driveDate, setDriveDate] = useState("");
  const [driveLocation, setDriveLocation] = useState("");
  const [driveTime, setDriveTime] = useState("");

  // Voice Settings Section
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");

  // Legacy fields (for backward compatibility)
  const [primarySkills, setPrimarySkills] = useState("");
  const [frontendSkills, setFrontendSkills] = useState("");
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
    () => {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("hyrex-auth-token");
        if (stored) {
          console.log(
            "[CreateCampaignModal] Token loaded from localStorage on mount:",
            !!stored
          );
          return stored;
        }
      }
      return undefined;
    }
  );

  useEffect(() => {
    if (!authToken && !tokenFromStorage && typeof window !== "undefined") {
      const stored = window.localStorage.getItem("hyrex-auth-token");
      if (stored) {
        setTokenFromStorage(stored);
        console.log(
          "[CreateCampaignModal] Token read from localStorage:",
          !!stored
        );
      }
    }
  }, [authToken, tokenFromStorage, open]);

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
        // Auto-fill all fields from API data
        setJobId(selectedJob.id ?? null);
        setJobRole(selectedJob.title || "");
        setCompanyName(selectedJob.client_name || "");

        const parts = [
          selectedJob.city,
          selectedJob.state,
          selectedJob.country,
        ].filter(Boolean) as string[];
        const composed =
          parts.join(", ") || selectedJob.address || selectedJob.location || "";
        setLocation(composed);

        if (selectedJob.remote) {
          const rv = String(selectedJob.remote).toLowerCase();
          const mapped = rv === "yes" ? "remote" : rv === "no" ? "office" : rv;
          setWorkMode(mapped);
        } else {
          setWorkMode("");
        }

        if (selectedJob.experience) {
          const exp = Number(selectedJob.experience);
          if (!Number.isNaN(exp) && exp > 0) {
            const val = String(exp);
            setMinExp(val);
            setMaxExp(val);
          }
        } else {
          setMinExp("");
          setMaxExp("");
        }

        if (selectedJob.description) {
          const plainDescription = toPlainText(selectedJob.description);
          setJobDetails(plainDescription);
          setDescription(plainDescription);
        } else {
          setJobDetails("");
          setDescription("");
        }

        if (selectedJob.created_by?.email) {
          setEmail(selectedJob.created_by.email);
        } else {
          setEmail("");
        }
      }
    }
  }, [jobCode, jobs]);

  // Fetch job codes when modal opens
  useEffect(() => {
    if (open && jobs.length === 0 && !jobsLoading) {
      fetchJobCodes();
    }
  }, [open, jobs.length, jobsLoading]);

  // Candidate import/migration and uploads state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportManuallyDialog, setShowImportManuallyDialog] =
    useState(false);
  const [showAtsDialog, setShowAtsDialog] = useState(false);
  const [showAtsCandidatesModal, setShowAtsCandidatesModal] = useState(false);
  const [showSingleUploadDialog, setShowSingleUploadDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [manualResumes, setManualResumes] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [atsCandidates, setAtsCandidates] = useState<any[]>([]);
  const [atsCandidatesLoading, setAtsCandidatesLoading] = useState(false);
  const [atsCandidatesError, setAtsCandidatesError] = useState<string>("");
  const [atsPage, setAtsPage] = useState(1);
  const [atsPageSize, setAtsPageSize] = useState(25);
  const [atsSearch, setAtsSearch] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    new Set()
  );
  const [selectAllPages, setSelectAllPages] = useState(false);
  const [atsTotalCount, setAtsTotalCount] = useState(0);
  const atsTotalCountRef = useRef(0); // Keep track of total count across renders
  const singleInputRef = useRef<HTMLInputElement | null>(null);
  const bulkInputRef = useRef<HTMLInputElement | null>(null);

  // Get stored auth format preference
  const getStoredAuthFormat = (): string => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hyrex-auth-format") || "Bearer";
    }
    return "Bearer";
  };

  const setStoredAuthFormat = (format: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hyrex-auth-format", format);
    }
  };

  const acceptedExt = [".pdf", ".doc", ".docx"];
  const isAccepted = (file: File) => {
    const name = file.name.toLowerCase();
    return acceptedExt.some((ext) => name.endsWith(ext));
  };

  const getCandidateKey = (
    candidate: any,
    idx: number,
    pageOverride?: number
  ) => {
    return (
      candidate?.id?.toString() ||
      candidate?.submission_id?.toString() ||
      candidate?.candidate_id?.toString() ||
      `${
        candidate?.candidate_email ||
        candidate?.candidate_mobile ||
        candidate?.candidate_name ||
        "candidate"
      }-${candidate?.job_code || "job"}-${(pageOverride ?? atsPage) - 1}-${idx}`
    );
  };

  // Fetch ATS candidates with server-side pagination (API max page_size = 25)
  const fetchAtsCandidates = async (
    jobId: number,
    page: number = 1,
    pageSize: number = 25,
    knownTotalCount?: number
  ) => {
    setAtsCandidatesLoading(true);
    setAtsCandidatesError("");
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Try with stored format first (or Bearer as default)
      let authFormat = getStoredAuthFormat();
      if (effectiveToken) {
        headers["Authorization"] = `${authFormat} ${effectiveToken}`;
        console.log(
          `[fetchAtsCandidates] Using ${authFormat} format on page ${page}`
        );
      }

      let response = await fetch(
        `/api/candidates/submissions?job_id=${jobId}&page=${page}&page_size=${pageSize}`,
        {
          method: "GET",
          headers,
        }
      );

      console.log("[fetchAtsCandidates] Response status:", response.status);

      // If 401, try alternate format
      if (response.status === 401 && effectiveToken) {
        const alternateFormat = authFormat === "Bearer" ? "Token" : "Bearer";
        console.log(
          `[fetchAtsCandidates] Got 401 with ${authFormat}, trying ${alternateFormat}...`
        );
        headers["Authorization"] = `${alternateFormat} ${effectiveToken}`;
        response = await fetch(
          `/api/candidates/submissions?job_id=${jobId}&page=${page}&page_size=${pageSize}`,
          {
            method: "GET",
            headers,
          }
        );
        console.log(
          `[fetchAtsCandidates] ${alternateFormat} attempt status:`,
          response.status
        );

        // If successful with alternate format, remember it
        if (response.ok) {
          authFormat = alternateFormat;
          setStoredAuthFormat(alternateFormat);
          console.log(
            `[fetchAtsCandidates] Saved ${alternateFormat} as preferred format`
          );
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[fetchAtsCandidates] Error response:", errorData);
        throw new Error(errorData?.error || "Failed to fetch candidates");
      }

      const data = await response.json();
      const resultsReceived = data.results?.length || 0;
      console.log(
        `[fetchAtsCandidates] Page ${page}: Got ${resultsReceived} candidates, API count: ${data.count}`
      );

      // Store total count
      let actualTotalCount = data.count;
      if (
        (actualTotalCount === undefined ||
          actualTotalCount === null ||
          actualTotalCount === 0) &&
        knownTotalCount
      ) {
        actualTotalCount = knownTotalCount;
        console.log(
          `[fetchAtsCandidates] API didn't return count, using known count: ${actualTotalCount}`
        );
      }

      if (actualTotalCount > 0) {
        atsTotalCountRef.current = actualTotalCount;
      }

      // Update candidates and total count
      const candidatesToShow = data.results || data.data || [];
      setAtsCandidates(candidatesToShow);
      setAtsTotalCount(actualTotalCount || 0);

      // If "select all" is enabled, auto-add current page candidates to the selection set
      if (selectAllPages) {
        setSelectedCandidates((prev) => {
          const next = new Set(prev);
          candidatesToShow.forEach((candidate: any, idx: number) => {
            next.add(getCandidateKey(candidate, idx, page));
          });
          return next;
        });
      }

      // Validate pagination
      if (actualTotalCount > 0) {
        const maxPage = Math.ceil(actualTotalCount / pageSize);
        console.log(
          `[fetchAtsCandidates] Total: ${actualTotalCount}, MaxPage: ${maxPage}, CurrentPage: ${page}`
        );

        // If requested page exceeds max, redirect to last page
        if (page > maxPage && page > 1) {
          console.log(
            `[fetchAtsCandidates] Page ${page} > max ${maxPage}, redirecting...`
          );
          setAtsPage(maxPage);
          await fetchAtsCandidates(jobId, maxPage, pageSize, actualTotalCount);
          return;
        }
      }
    } catch (err: any) {
      console.error("[fetchAtsCandidates] Error:", err);
      setAtsCandidatesError(err?.message || "Failed to fetch candidates");
      setAtsCandidates([]);
    } finally {
      setAtsCandidatesLoading(false);
    }
  };

  // Get the selected job's ID for ATS
  const getSelectedJobId = (): number | null => {
    // If jobId is directly provided in initialValues, use it (for drafts)
    if (initialValues?.jobId) {
      return initialValues.jobId;
    }

    // Otherwise, look it up from the jobs array
    if (jobCode) {
      const selectedJob = jobs.find((j) => j.job_code === jobCode);
      if (selectedJob && selectedJob.id) {
        return selectedJob.id;
      }
    }
    return null;
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
      setJobId(initialValues.jobId ?? null);
      // Map legacy jobInfo (from drafts) to jobRole for continuity
      setJobRole(initialValues.jobInfo ?? "");
    }
  }, [open, initialValues]);

  const saveDraft = () => {
    try {
      // Get jobId from the selected job
      const selectedJob = jobs.find((j) => j.job_code === jobCode);
      const jobId = selectedJob?.id ?? initialValues?.jobId;

      const draft = {
        id:
          initialValues?.id ??
          (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now())),
        jobCode,
        // Store jobRole into legacy jobInfo field for compatibility in drafts pages
        jobInfo: jobRole,
        jobId, // Store jobId for ATS integration
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
    if (minCTCNum > maxCTCNum) {
      setError("Min CTC cannot exceed max CTC.");
      return;
    }

    // Validate that job code is selected (required for ATS import)
    if (!jobCode || jobCode.trim() === "") {
      setError(
        "Please select a job code from Hyrex. This is required to import candidates from ATS."
      );
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

    if (!API_BASE_URL || !TENANT_ID) {
      console.error(
        "Missing NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_TENANT_ID"
      );
    }

    setSubmitting(true);
    try {
      // Parse skills from comma-separated strings
      const parsedPrimarySkills = primarySkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const parsedFrontendSkills = frontendSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Get the numeric job_id from the selected job if not manually set
      const selectedJob = jobs.find((j) => j.job_code === jobCode);
      const finalJobId = jobId || selectedJob?.id;

      const response = await fetch(`${API_BASE_URL}/api/v1/campaigns`, {
        method: "POST",
        headers: {
          "tenant-id": TENANT_ID || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Basic Information
          name: campaignName,
          job_id: finalJobId,
          job_code: jobCode,
          job_role: jobRole,
          description: description,

          // Company Details
          hiring_company_name: companyName,
          client_name: clientName,

          // Job Details
          job_type: jobType,
          work_mode: workMode,
          job_location: location,
          multiple_locations:
            multipleLocations.length > 0 ? multipleLocations : undefined,

          // Compensation
          min_ctc: minCTCNum,
          max_ctc: maxCTCNum,

          // Experience
          min_experience: minExpNum,
          max_experience: maxExpNum,

          // Shift & Interview
          shift_type: shiftType || undefined,
          interview_mode: interviewMode || undefined,

          // Walk-in Drive (conditional)
          ...(isWalkinDrive && {
            is_walkin_drive: true,
            drive_date: driveDate,
            drive_time: driveTime,
            drive_location: driveLocation,
          }),

          // Voice Settings
          voice_gender: voiceGender,

          // Legacy fields
          negotiation_margin_percent: 10,
          job_details: {
            primary_skills: parsedPrimarySkills,
            frontend_skills: parsedFrontendSkills,
            role_type: jobRole,
          },
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
      setCampaignName("");
      setJobId(null);
      setJobCode("");
      setJobRole("");
      setDescription("");
      setCompanyName("");
      setClientName("");
      setJobType("full_time");
      setWorkMode("");
      setLocation("");
      setMultipleLocations([]);
      setLocationInput("");
      setMinCTC("");
      setMaxCTC("");
      setMinExp("");
      setMaxExp("");
      setShiftType("");
      setInterviewMode("");
      setIsWalkinDrive(false);
      setDriveDate("");
      setDriveLocation("");
      setDriveTime("");
      setVoiceGender("female");
      setPrimarySkills("");
      setFrontendSkills("");
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
            className="space-y-8 mt-4 overflow-y-auto flex-1 pr-4"
          >
            {/* Basic Information Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    type="text"
                    placeholder="e.g., Java FSE Hiring - Cognizant"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobId">Job ID</Label>
                  <Input
                    id="jobId"
                    type="number"
                    placeholder="e.g., 123"
                    value={jobId || ""}
                    onChange={(e) =>
                      setJobId(e.target.value ? Number(e.target.value) : null)
                    }
                  />
                  <p className="text-xs text-gray-500">
                    For ATS linking (optional)
                  </p>
                </div>

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
                  <Label htmlFor="jobRole">Job Role *</Label>
                  <Input
                    id="jobRole"
                    type="text"
                    placeholder="e.g., Senior Python Developer"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional description about the role..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Company Details Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Company Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Hiring Company Name *</Label>
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
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    type="text"
                    placeholder="e.g., Cognizant Client"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Job Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Type *</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="part_time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Work Mode</Label>
                  <Select value={workMode} onValueChange={setWorkMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Primary Location</Label>
                  <LocationMultiSelect
                    value={location ? [location] : []}
                    onChange={(locs) => setLocation(locs[0] || "")}
                    label=""
                    placeholder="Search and select primary city..."
                    maxLocations={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationInput">Multiple Locations</Label>
                  <LocationMultiSelect
                    value={multipleLocations}
                    onChange={setMultipleLocations}
                    label=""
                    placeholder="Search and select Indian cities..."
                    maxLocations={10}
                  />
                </div>
              </div>
            </div>

            {/* Compensation Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Compensation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum CTC (in lakhs) *</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="e.g., 5"
                    value={minCTC}
                    onChange={(e) => setMinCTC(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum CTC (in lakhs) *</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="e.g., 10"
                    value={maxCTC}
                    onChange={(e) => setMaxCTC(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Experience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Experience (years)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="e.g., 3"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Experience (years)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="e.g., 7"
                    value={maxExp}
                    onChange={(e) => setMaxExp(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Shift & Interview Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Shift & Interview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shift Type</Label>
                  <Select value={shiftType} onValueChange={setShiftType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                      <SelectItem value="rotational">Rotational</SelectItem>
                      <SelectItem value="flexible">General/Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Interview Mode</Label>
                  <Select
                    value={interviewMode}
                    onValueChange={setInterviewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="telephonic">Telephonic</SelectItem>
                      <SelectItem value="in_person">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Walk-in Drive Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Walk-in Drive
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isWalkinDrive"
                    checked={isWalkinDrive}
                    onChange={(e) => setIsWalkinDrive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <Label
                    htmlFor="isWalkinDrive"
                    className="font-normal cursor-pointer"
                  >
                    This is a walk-in drive
                  </Label>
                </div>

                {isWalkinDrive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-primary-200">
                    <div className="space-y-2">
                      <Label htmlFor="driveDate">Drive Date</Label>
                      <Input
                        id="driveDate"
                        type="date"
                        value={driveDate}
                        onChange={(e) => setDriveDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driveTime">Drive Time</Label>
                      <Input
                        id="driveTime"
                        type="text"
                        placeholder="e.g., 10:00 AM - 4:00 PM"
                        value={driveTime}
                        onChange={(e) => setDriveTime(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="driveLocation">
                        Drive Location (Venue Address)
                      </Label>
                      <Textarea
                        id="driveLocation"
                        placeholder="Enter the venue address for the walk-in drive"
                        value={driveLocation}
                        onChange={(e) => setDriveLocation(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Voice Settings Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Voice Settings
              </h3>
              <div className="space-y-3">
                <Label>Voice Gender</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="voiceFemale"
                      name="voiceGender"
                      value="female"
                      checked={voiceGender === "female"}
                      onChange={(e) => setVoiceGender("female")}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Label
                      htmlFor="voiceFemale"
                      className="font-normal cursor-pointer"
                    >
                      Female (default)
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="voiceMale"
                      name="voiceGender"
                      value="male"
                      checked={voiceGender === "male"}
                      onChange={(e) => setVoiceGender("male")}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Label
                      htmlFor="voiceMale"
                      className="font-normal cursor-pointer"
                    >
                      Male
                    </Label>
                  </div>
                </div>
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
              <Button
                type="submit"
                disabled={!jobCode || !jobRole || submitting}
              >
                {submitting ? "Creating..." : "Create Campaign"}
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
          <div className="grid grid-cols-1 gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Excel import
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-primary-200 text-primary-700 hover:bg-primary-50"
              onClick={() => setShowImportManuallyDialog(true)}
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

      {/* ATS Dialog */}
      <Dialog open={showAtsDialog} onOpenChange={setShowAtsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ATS Integration</DialogTitle>
            <DialogDescription>
              Connect to your Applicant Tracking System to import candidates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select your ATS provider to connect and import candidates.
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
                onClick={async () => {
                  const jobId = getSelectedJobId();
                  if (!jobId) {
                    setAtsCandidatesError("Please select a job code first");
                    return;
                  }
                  setAtsPage(1); // Reset to first page
                  setSelectedCandidates(new Set()); // Clear selection
                  await fetchAtsCandidates(jobId, 1, atsPageSize);
                  setShowAtsDialog(false);
                  setShowAtsCandidatesModal(true);
                }}
                disabled={!jobCode}
              >
                Fetch Candidates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ATS Candidates Modal */}
      <Dialog
        open={showAtsCandidatesModal}
        onOpenChange={setShowAtsCandidatesModal}
      >
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              ATS Candidates
            </DialogTitle>
            <DialogDescription className="text-sm">
              {atsTotalCount > 0 ? `Found ${atsTotalCount} candidates. ` : ""}
              Select candidates to import for this campaign.
            </DialogDescription>
          </DialogHeader>

          {atsCandidatesLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading candidates...</p>
              </div>
            </div>
          )}

          {atsCandidatesError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700 font-medium">Error</p>
              <p className="text-sm text-red-600 mt-1">{atsCandidatesError}</p>
            </div>
          )}

          {!atsCandidatesLoading &&
            !atsCandidatesError &&
            atsCandidates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 mb-3">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No candidates found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try adjusting your filters or check back later
                </p>
              </div>
            )}

          {!atsCandidatesLoading && atsCandidates.length > 0 && (
            <>
              <div className="flex flex-col gap-3 px-1 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={
                        selectAllPages ||
                        (atsCandidates.length > 0 &&
                          atsCandidates.every((candidate, idx) =>
                            selectedCandidates.has(
                              getCandidateKey(candidate, idx)
                            )
                          ))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Enable select-all across pages and add current page
                          setSelectAllPages(true);
                          setSelectedCandidates((prev) => {
                            const next = new Set(prev);
                            atsCandidates.forEach((candidate, idx) => {
                              next.add(getCandidateKey(candidate, idx));
                            });
                            return next;
                          });
                        } else {
                          setSelectAllPages(false);
                          setSelectedCandidates(new Set());
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">
                      {selectAllPages
                        ? `All${
                            atsTotalCount ? ` (${atsTotalCount})` : ""
                          } selected`
                        : selectedCandidates.size > 0
                        ? `${selectedCandidates.size} selected`
                        : "Select all"}
                    </span>
                  </div>
                  {(selectAllPages || selectedCandidates.size > 0) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-600 hover:text-gray-900"
                      onClick={() => {
                        setSelectAllPages(false);
                        setSelectedCandidates(new Set());
                      }}
                    >
                      Clear selection
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <SearchBox
                    value={atsSearch}
                    onChange={setAtsSearch}
                    onClear={() => setAtsSearch("")}
                    placeholder="Search candidates by name, email, mobile, job code, or location"
                    containerClassName="w-full"
                    inputClassName="rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {atsSearch && (
                    <div className="text-xs text-gray-500">
                      Showing results for "{atsSearch}"
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-auto flex-1 -mx-6 px-6">
                <div className="min-w-225">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="w-12 px-3 py-3 text-left">
                          <span className="sr-only">Select</span>
                        </th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                          Job
                        </th>
                        <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                          Submitted By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {atsCandidates
                        .filter((candidate) => {
                          if (!atsSearch.trim()) return true;
                          const q = atsSearch.toLowerCase();
                          const fields = [
                            candidate.candidate_name,
                            candidate.candidate_email,
                            candidate.candidate_mobile,
                            candidate.candidate_location,
                            candidate.job_code,
                            candidate.job_title,
                          ]
                            .filter(Boolean)
                            .map((v: string) => v.toLowerCase());
                          return fields.some((field: string) =>
                            field.includes(q)
                          );
                        })
                        .map((candidate: any, idx: number) => {
                          const key = getCandidateKey(candidate, idx);
                          const isSelected =
                            selectAllPages || selectedCandidates.has(key);
                          return (
                            <tr
                              key={key}
                              className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                                isSelected ? "bg-blue-50" : ""
                              }`}
                              onClick={() => {
                                setSelectedCandidates((prev) => {
                                  const next = new Set(prev);
                                  if (isSelected) {
                                    next.delete(key);
                                    setSelectAllPages(false);
                                  } else {
                                    next.add(key);
                                  }
                                  return next;
                                });
                              }}
                            >
                              <td className="px-3 py-4">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="px-3 py-4 text-gray-700 whitespace-nowrap text-xs">
                                {candidate.submission_on
                                  ? new Date(
                                      candidate.submission_on
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </td>
                              <td className="px-3 py-4">
                                <div className="font-medium text-gray-900">
                                  {candidate.candidate_name || "—"}
                                </div>
                                {candidate.candidate_email && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {candidate.candidate_email}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                                {candidate.candidate_mobile || "—"}
                              </td>
                              <td className="px-3 py-4 text-gray-600 text-xs">
                                {candidate.candidate_location || "—"}
                              </td>
                              <td className="px-3 py-4">
                                <div className="font-medium text-gray-900 text-xs">
                                  {candidate.job_code || "—"}
                                </div>
                                {candidate.job_title && (
                                  <div className="text-xs text-gray-500 mt-0.5 max-w-50 truncate">
                                    {candidate.job_title}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-4">
                                <div className="text-gray-700 text-xs">
                                  {candidate.submitted_by_name || "—"}
                                </div>
                                {candidate.updated_by_name &&
                                  candidate.updated_by_name !==
                                    candidate.submitted_by_name && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      Updated: {candidate.updated_by_name}
                                    </div>
                                  )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Info */}
              {atsTotalCount > 0 && (
                <div className="flex items-center justify-between px-1 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    {Math.min((atsPage - 1) * atsPageSize + 1, atsTotalCount)}{" "}
                    to {Math.min(atsPage * atsPageSize, atsTotalCount)} of{" "}
                    {atsTotalCount} candidate{atsTotalCount !== 1 ? "s" : ""}
                  </p>
                  {atsTotalCount > atsPageSize && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={atsPage === 1 || atsCandidatesLoading}
                        onClick={async () => {
                          const newPage = atsPage - 1;
                          setAtsPage(newPage);
                          const jobId = getSelectedJobId();
                          if (jobId)
                            await fetchAtsCandidates(
                              jobId,
                              newPage,
                              atsPageSize
                            );
                        }}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-3 text-sm text-gray-700">
                        Page {atsPage} of{" "}
                        {Math.ceil(atsTotalCount / atsPageSize)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          atsPage >= Math.ceil(atsTotalCount / atsPageSize) ||
                          atsCandidatesLoading
                        }
                        onClick={async () => {
                          const newPage = atsPage + 1;
                          setAtsPage(newPage);
                          const jobId = getSelectedJobId();
                          if (jobId)
                            await fetchAtsCandidates(
                              jobId,
                              newPage,
                              atsPageSize
                            );
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-gray-600">
              {(selectAllPages || selectedCandidates.size > 0) && (
                <span className="font-medium text-primary-600">
                  {selectAllPages && atsTotalCount > 0
                    ? atsTotalCount
                    : selectedCandidates.size}{" "}
                  candidate
                  {(selectAllPages && atsTotalCount > 1) ||
                  (!selectAllPages && selectedCandidates.size !== 1)
                    ? "s"
                    : ""}{" "}
                  ready to import
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAtsCandidatesModal(false);
                  setSelectAllPages(false);
                  setSelectedCandidates(new Set());
                }}
              >
                Close
              </Button>
              <Button
                type="button"
                disabled={!selectAllPages && selectedCandidates.size === 0}
                onClick={() => {
                  // TODO: Implement import functionality
                  const selected = selectAllPages
                    ? atsCandidates
                    : atsCandidates.filter((candidate, idx) =>
                        selectedCandidates.has(getCandidateKey(candidate, idx))
                      );
                  console.log("Importing candidates:", selected);
                  // For now, just close the modal
                  setShowAtsCandidatesModal(false);
                  setSelectedCandidates(new Set());
                }}
              >
                Import{" "}
                {selectAllPages
                  ? atsTotalCount > 0
                    ? `(${atsTotalCount})`
                    : "(All)"
                  : selectedCandidates.size > 0
                  ? `(${selectedCandidates.size})`
                  : "Selected"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
