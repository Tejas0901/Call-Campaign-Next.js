"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  Clock,
  UploadCloud,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import CandidatesTable, {
  CandidateRow,
} from "@/components/ui/candidates-table";

interface Draft {
  id: string;
  jobCode: string;
  jobInfo: string;
  jobId?: number; // For ATS integration
  candidateInfo?: string;
  savedAt: string;
}

export default function DraftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.id as string;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateRow[]>([
    {
      id: "1",
      name: "Alice Johnson",
      phone: "+1 (555) 210-1122",
      email: "alice.johnson@example.com",
      resume: null,
      resumeFileName: "alice-johnson.pdf",
      role: "Sales Lead",
      company: "Acme Corp",
    },
    {
      id: "2",
      name: "Brian Lee",
      phone: "+1 (555) 455-7821",
      email: "brian.lee@example.com",
      resume: null,
      resumeFileName: "brian-lee.pdf",
      role: "Account Executive",
      company: "Northwind",
    },
    {
      id: "3",
      name: "Chloe Patel",
      phone: "+1 (555) 318-0044",
      email: "chloe.patel@example.com",
      resume: null,
      resumeFileName: "chloe-patel.pdf",
      role: "BDR",
      company: "Globex",
    },
    {
      id: "4",
      name: "Daniel Kim",
      phone: "+1 (555) 980-2211",
      email: "daniel.kim@example.com",
      resume: null,
      resumeFileName: "daniel-kim.pdf",
      role: "SDR",
      company: "Initech",
    },
    {
      id: "5",
      name: "Emma Garcia",
      phone: "+1 (555) 441-7788",
      email: "emma.garcia@example.com",
      resume: null,
      resumeFileName: "emma-garcia.pdf",
      role: "Marketing Ops",
      company: "Soylent",
    },
    {
      id: "6",
      name: "Felix Braun",
      phone: "+1 (555) 667-9023",
      email: "felix.braun@example.com",
      resume: null,
      resumeFileName: "felix-braun.pdf",
      role: "Product Marketing",
      company: "Umbrella",
    },
    {
      id: "7",
      name: "Grace Liu",
      phone: "+1 (555) 744-1199",
      email: "grace.liu@example.com",
      resume: null,
      resumeFileName: "grace-liu.pdf",
      role: "Customer Success",
      company: "Acme Corp",
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAtsDialog, setShowAtsDialog] = useState(false);
  const [showAtsCandidatesModal, setShowAtsCandidatesModal] = useState(false);
  const [atsCandidates, setAtsCandidates] = useState<any[]>([]);
  const [atsCandidatesLoading, setAtsCandidatesLoading] = useState(false);
  const [atsCandidatesError, setAtsCandidatesError] = useState("");
  const [atsPage, setAtsPage] = useState(1);
  const [atsPageSize] = useState(25);
  const [atsTotalCount, setAtsTotalCount] = useState(0);
  const [atsSearch, setAtsSearch] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    new Set()
  );
  const [selectAllPages, setSelectAllPages] = useState(false);
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

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("campaignDrafts")
          : null;
      const parsed = raw ? JSON.parse(raw) : [];
      const found = Array.isArray(parsed)
        ? parsed.find((d: Draft) => d.id === draftId)
        : null;
      setDraft(found || null);
    } catch (e) {
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("hyrex-auth-token");
    if (stored) setAuthToken(stored);
  }, []);

  const getStoredAuthFormat = (): string => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("hyrex-auth-format") || "Bearer";
    }
    return "Bearer";
  };

  const setStoredAuthFormat = (format: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hyrex-auth-format", format);
    }
  };

  const getCandidateKey = (
    candidate: any,
    idx: number,
    pageOverride?: number
  ) =>
    candidate?.id?.toString() ||
    candidate?.submission_id?.toString() ||
    candidate?.candidate_id?.toString() ||
    `${
      candidate?.candidate_email ||
      candidate?.candidate_mobile ||
      candidate?.candidate_name ||
      "candidate"
    }-${candidate?.job_code || "job"}-${(pageOverride ?? atsPage) - 1}-${idx}`;

  const getSelectedJobId = (): number | null => {
    if (draft?.jobId) return draft.jobId;
    return null;
  };

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

      let authFormat = getStoredAuthFormat();
      if (authToken) {
        headers["Authorization"] = `${authFormat} ${authToken}`;
        console.log(`[DraftDetail] Using ${authFormat} format on page ${page}`);
      }

      let response = await fetch(
        `/api/candidates/submissions?job_id=${jobId}&page=${page}&page_size=${pageSize}`,
        {
          method: "GET",
          headers,
        }
      );

      if (response.status === 401 && authToken) {
        const alternateFormat = authFormat === "Bearer" ? "Token" : "Bearer";
        headers["Authorization"] = `${alternateFormat} ${authToken}`;
        response = await fetch(
          `/api/candidates/submissions?job_id=${jobId}&page=${page}&page_size=${pageSize}`,
          {
            method: "GET",
            headers,
          }
        );

        if (response.ok) {
          authFormat = alternateFormat;
          setStoredAuthFormat(alternateFormat);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to fetch candidates");
      }

      const data = await response.json();
      const resultsReceived = data.results?.length || 0;
      console.log(
        `[DraftDetail] Page ${page}: received ${resultsReceived}, count ${data.count}`
      );

      let actualTotalCount = data.count;
      if (
        (actualTotalCount === undefined ||
          actualTotalCount === null ||
          actualTotalCount === 0) &&
        knownTotalCount
      ) {
        actualTotalCount = knownTotalCount;
      }

      const candidatesToShow = data.results || data.data || [];
      setAtsCandidates(candidatesToShow);
      setAtsTotalCount(actualTotalCount || 0);

      if (selectAllPages) {
        setSelectedCandidates((prev) => {
          const next = new Set(prev);
          candidatesToShow.forEach((candidate: any, idx: number) => {
            next.add(getCandidateKey(candidate, idx, page));
          });
          return next;
        });
      }

      if (actualTotalCount > 0) {
        const maxPage = Math.ceil(actualTotalCount / pageSize);
        if (page > maxPage && page > 1) {
          setAtsPage(maxPage);
          await fetchAtsCandidates(jobId, maxPage, pageSize, actualTotalCount);
          return;
        }
      }
    } catch (err: any) {
      console.error("[DraftDetail] ATS fetch error", err);
      setAtsCandidatesError(err?.message || "Failed to fetch candidates");
      setAtsCandidates([]);
    } finally {
      setAtsCandidatesLoading(false);
    }
  };

  const importSelectedCandidates = () => {
    const selected = selectAllPages
      ? atsCandidates
      : atsCandidates.filter((candidate, idx) =>
          selectedCandidates.has(getCandidateKey(candidate, idx))
        );

    if (selected.length === 0) return;

    setCandidates((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const mapped: CandidateRow[] = selected.map(
        (candidate: any, idx: number) => ({
          id: getCandidateKey(candidate, idx),
          name: candidate.candidate_name || "Unnamed Candidate",
          phone: candidate.candidate_mobile || "—",
          email: candidate.candidate_email || "—",
          resume: null,
          resumeFileName: candidate.resume_file_name || undefined,
          role: candidate.job_title || draft?.jobInfo || "Candidate",
          company:
            candidate.submitted_by_name ||
            candidate.candidate_current_company ||
            "—",
        })
      );

      const deduped = mapped.filter((c) => !existingIds.has(c.id));
      return [...prev, ...deduped];
    });

    setShowAtsCandidatesModal(false);
    setSelectedCandidates(new Set());
    setSelectAllPages(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto p-8">
            <div className="text-gray-600">Loading draft...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto p-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Draft not found</p>
              <Button
                onClick={() => router.push("/campaigns/drafts")}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Drafts
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              {/* Header */}
              <div className="mb-8">
                <Button
                  onClick={() => router.push("/campaigns/drafts")}
                  variant="ghost"
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Drafts
                </Button>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {draft.jobInfo || "Untitled Draft"}
                        </h1>
                        <p className="text-gray-600">
                          Job Code:{" "}
                          <span className="font-medium">{draft.jobCode}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Draft
                    </Badge>
                    <Button
                      variant="default"
                      className="bg-primary-600 text-white hover:bg-primary-700"
                      onClick={() => setShowAddDialog(true)}
                    >
                      Add candidates
                    </Button>
                  </div>
                </div>
              </div>

              {/* Draft Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      In Progress
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Job Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      {draft.jobCode}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Last Saved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(draft.savedAt)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Candidates Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Imported Candidates</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    {candidates.length} candidates ready for your campaign
                  </p>
                </CardHeader>
                <CardContent>
                  <CandidatesTable data={candidates} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add candidates</DialogTitle>
            <DialogDescription>
              Import candidates into this draft.
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
              Fetch candidates from your ATS for this job.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              We will fetch candidates using the saved job code for this draft.
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
                    alert("Job ID missing for this draft");
                    return;
                  }
                  setShowAtsDialog(false);
                  router.push(`/campaigns/drafts/${draftId}/ats-candidates`);
                }}
                disabled={!draft?.jobCode}
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
              Choose how you want to upload resumes for this draft.
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
