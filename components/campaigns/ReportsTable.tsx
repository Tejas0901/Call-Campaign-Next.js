"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PhoneCall,
  PhoneMissed,
  Voicemail,
  Search,
  Eye,
  Loader2,
} from "lucide-react";
import tokenStorage from "@/lib/tokenStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

// Types for the screening data API response
interface ScreeningRecord {
  id: string;
  session_id: string;
  campaign_id: string;
  candidate_name: string;
  candidate_phone: string;
  experience_years: number | null;
  current_ctc_lpa: number | null;
  expected_ctc_lpa: number | null;
  ctc_hike_percent: number | null;
  ctc_within_budget: boolean | null;
  notice_period_days: number | null;
  is_immediate_joiner: boolean;
  current_location: string;
  location_matches_job: boolean;
  candidate_agreed_to_proceed: boolean | null;
  call_outcome:
    | "completed"
    | "missed"
    | "voicemail"
    | "answered"
    | "incomplete";
  call_date: string;
  qualification_score: number;
  recommendation: "proceed" | "not_proceed" | "pending" | "review";
  verdict: "proceed" | "not_proceed" | "review";
  job_role: string;
  job_location: string;
}

interface ScreeningDataResponse {
  success: boolean;
  data: {
    records: ScreeningRecord[];
    count: number;
    total: number;
    skip: number;
    limit: number;
  };
}

// Map API call_outcome to component outcome type
type OutcomeType = "answered" | "missed" | "voicemail";

interface CallRecord {
  id: string;
  sessionId: string;
  candidateName: string;
  phone: string;
  outcome: OutcomeType;
  verdict: "proceed" | "not_proceed" | "review";
  analysisScore: number;
  date: string;
}

interface ReportsTableProps {
  campaignId: string;
  campaignName: string;
  jobRole: string;
}

// Remove mock data - will fetch from API instead
const mockCallRecords: Record<string, CallRecord[]> = {};

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

export default function ReportsTable({
  campaignId,
  campaignName,
  jobRole,
}: ReportsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch screening data from API
  useEffect(() => {
    const fetchScreeningData = async () => {
      if (!campaignId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = tokenStorage.getAccessToken();
        const response = await fetch(
          `/api/screening-data?campaign_id=${campaignId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
              ...(TENANT_ID && { "tenant-id": TENANT_ID }),
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data: ScreeningDataResponse = await response.json();

        if (data.success && data.data.records) {
          // Map API response to component's CallRecord type
          const mappedRecords: CallRecord[] = data.data.records.map(
            (record) => ({
              id: record.id,
              sessionId: record.session_id,
              candidateName: record.candidate_name,
              phone: record.candidate_phone,
              // Map call_outcome to outcome type
              outcome: mapCallOutcome(record.call_outcome),
              verdict: record.verdict,
              analysisScore: record.qualification_score,
              date: record.call_date,
            })
          );
          setRecords(mappedRecords);
        } else {
          setRecords([]);
        }
      } catch (err) {
        console.error("Error fetching screening data:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load data";
        setError(errorMessage);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScreeningData();
  }, [campaignId]);

  // Helper to map API call_outcome to component outcome type
  const mapCallOutcome = (callOutcome: string): OutcomeType => {
    switch (callOutcome) {
      case "completed":
      case "answered":
        return "answered";
      case "missed":
        return "missed";
      case "voicemail":
        return "voicemail";
      default:
        return "missed"; // Default to missed for unknown outcomes
    }
  };

  const handleSelectAll = (checked: boolean) => {
    // Selection functionality removed
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    // Selection functionality removed
  };

  const isAllSelected = false;
  const isPartiallySelected = false;

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewReport = (record: CallRecord) => {
    // Open report in new tab using sessionId
    const reportUrl = `/reports/candidate/${record.sessionId || record.id}`;
    window.open(reportUrl, "_blank");
  };

  return (
    <div className="overflow-x-auto">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading data</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Candidate Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Score
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Outcome
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Verdict
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className={`border-b border-gray-200 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-orange-50`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {record.candidateName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {record.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {record.analysisScore.toFixed(1)}
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
                    ) : record.verdict === "not_proceed" ? (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        Not Proceed
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Review
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReport(record)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="View report"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {records.length === 0
                    ? "No call records found for this campaign"
                    : "No records match your search criteria"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
