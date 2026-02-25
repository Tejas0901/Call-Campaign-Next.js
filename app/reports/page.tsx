"use client";

import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PhoneCall,
  PhoneMissed,
  Voicemail,
  Search,
  FileText,
} from "lucide-react";

interface CallRecord {
  id: string;
  campaignId: string;
  campaignName: string;
  jobRole: string;
  candidateName: string;
  phone: string;
  durationSeconds: number;
  outcome: "answered" | "missed" | "voicemail";
  verdict: "proceed" | "not_proceed";
  analysisScore: number;
  analysisSummary: string;
  date: string;
  time: string;
}

const mockCallRecords: CallRecord[] = [
  {
    id: "CALL-001",
    campaignId: "CAMP-001",
    campaignName: "Senior Backend Engineers Q1",
    jobRole: "Senior Backend Engineer",
    candidateName: "Alice Johnson",
    phone: "+1 (555) 210-1122",
    durationSeconds: 154,
    outcome: "answered",
    verdict: "proceed",
    analysisScore: 85,
    analysisSummary: "Positive engagement, discussed pricing options",
    date: "2026-02-23",
    time: "10:30 AM",
  },
  {
    id: "CALL-002",
    campaignId: "CAMP-001",
    campaignName: "Senior Backend Engineers Q1",
    jobRole: "Senior Backend Engineer",
    candidateName: "Brian Lee",
    phone: "+1 (555) 455-7821",
    durationSeconds: 45,
    outcome: "missed",
    verdict: "not_proceed",
    analysisScore: 0,
    analysisSummary: "Call not answered",
    date: "2026-02-23",
    time: "10:45 AM",
  },
  {
    id: "CALL-003",
    campaignId: "CAMP-002",
    campaignName: "React Frontend Developers",
    jobRole: "Senior React Developer",
    candidateName: "Chloe Patel",
    phone: "+1 (555) 318-0044",
    durationSeconds: 112,
    outcome: "voicemail",
    verdict: "proceed",
    analysisScore: 62,
    analysisSummary: "Left voicemail, interested in callback",
    date: "2026-02-22",
    time: "3:15 PM",
  },
  {
    id: "CALL-004",
    campaignId: "CAMP-001",
    campaignName: "Senior Backend Engineers Q1",
    jobRole: "Senior Backend Engineer",
    candidateName: "Daniel Kim",
    phone: "+1 (555) 980-2211",
    durationSeconds: 192,
    outcome: "answered",
    verdict: "proceed",
    analysisScore: 92,
    analysisSummary: "Strong interest, scheduled demo for next week",
    date: "2026-02-22",
    time: "2:00 PM",
  },
  {
    id: "CALL-005",
    campaignId: "CAMP-002",
    campaignName: "React Frontend Developers",
    jobRole: "Senior React Developer",
    candidateName: "Emma Garcia",
    phone: "+1 (555) 441-7788",
    durationSeconds: 125,
    outcome: "answered",
    verdict: "proceed",
    analysisScore: 78,
    analysisSummary: "Questions about features, sent follow-up email",
    date: "2026-02-21",
    time: "11:20 AM",
  },
  {
    id: "CALL-006",
    campaignId: "CAMP-003",
    campaignName: "QA Automation Engineers",
    jobRole: "QA Automation Lead",
    candidateName: "Frank Miller",
    phone: "+1 (555) 332-1199",
    durationSeconds: 90,
    outcome: "answered",
    verdict: "not_proceed",
    analysisScore: 71,
    analysisSummary: "Moderate interest, needs more information",
    date: "2026-02-21",
    time: "9:45 AM",
  },
  {
    id: "CALL-007",
    campaignId: "CAMP-001",
    campaignName: "Senior Backend Engineers Q1",
    jobRole: "Senior Backend Engineer",
    candidateName: "Grace Wilson",
    phone: "+1 (555) 667-2233",
    durationSeconds: 15,
    outcome: "missed",
    verdict: "not_proceed",
    analysisScore: 0,
    analysisSummary: "Call not answered",
    date: "2026-02-20",
    time: "4:30 PM",
  },
  {
    id: "CALL-008",
    campaignId: "CAMP-002",
    campaignName: "React Frontend Developers",
    jobRole: "Senior React Developer",
    candidateName: "Henry Brown",
    phone: "+1 (555) 889-4455",
    durationSeconds: 168,
    outcome: "answered",
    verdict: "proceed",
    analysisScore: 88,
    analysisSummary: "Very interested, requested pricing sheet",
    date: "2026-02-20",
    time: "2:15 PM",
  },
];

function getOutcomeIcon(outcome: CallRecord["outcome"]) {
  switch (outcome) {
    case "answered":
      return <PhoneCall className="w-4 h-4 text-green-600" />;
    case "missed":
      return <PhoneMissed className="w-4 h-4 text-red-600" />;
    case "voicemail":
      return <Voicemail className="w-4 h-4 text-yellow-600" />;
  }
}

function getOutcomeBadge(outcome: CallRecord["outcome"]) {
  switch (outcome) {
    case "answered":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Answered
        </Badge>
      );
    case "missed":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Missed
        </Badge>
      );
    case "voicemail":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Voicemail
        </Badge>
      );
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CallRecord | null>(null);

  const filteredRecords = mockCallRecords.filter((record) => {
    const matchesSearch =
      record.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm) ||
      record.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Group records by campaign
  const groupedByCampaign = filteredRecords.reduce(
    (acc, record) => {
      if (!acc[record.campaignId]) {
        acc[record.campaignId] = {
          campaignName: record.campaignName,
          jobRole: record.jobRole,
          records: [],
        };
      }
      acc[record.campaignId].records.push(record);
      return acc;
    },
    {} as Record<
      string,
      {
        campaignName: string;
        jobRole: string;
        records: CallRecord[];
      }
    >
  );

  const handleViewReport = (record: CallRecord) => {
    // Open report in new tab
    const reportUrl = `/reports/candidate/${record.id}`;
    window.open(reportUrl, "_blank");
  };

  return (
    <MainLayout>
      <PageHeader title="Reports" />

      {/* Search Filter */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by candidate name, phone, campaign, or call ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-96"
          />
        </div>
      </div>

      {/* Campaign Tables */}
      <div className="space-y-6">
        {Object.entries(groupedByCampaign).length > 0 ? (
          Object.entries(groupedByCampaign).map(
            ([campaignId, { campaignName, jobRole, records }]) => (
              <div
                key={campaignId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Campaign Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {campaignName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Position: {jobRole}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {records.length} call record
                    {records.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Candidate Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Duration (seconds)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Outcome
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Verdict
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {records.map((record, index) => (
                        <tr
                          key={record.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {record.candidateName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.phone}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.durationSeconds}s
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getOutcomeIcon(record.outcome)}
                              {getOutcomeBadge(record.outcome)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {record.verdict === "proceed" ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Proceed
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                Not Proceed
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(record)}
                              className="gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              Report
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              No call records found matching your search.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
