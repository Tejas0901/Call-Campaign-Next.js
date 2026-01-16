"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import CandidatesTable, {
  CandidateRow,
} from "@/components/ui/candidates-table";

interface Draft {
  id: string;
  jobCode: string;
  jobInfo: string;
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
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  Draft
                </Badge>
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
  );
}
