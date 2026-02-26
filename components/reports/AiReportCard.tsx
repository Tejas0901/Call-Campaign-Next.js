"use client";

import { CandidateReportData, RedFlag } from "./ai-report-card";

const getScoreColor = (score: number): string => {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 6.5) return "bg-orange-400";
  return "bg-yellow-400";
};

const getConfidenceBadge = (confidence: string): string => {
  switch (confidence) {
    case "high":
      return "bg-emerald-600";
    case "medium":
      return "bg-blue-600";
    case "low":
      return "bg-red-600";
    default:
      return "bg-gray-600";
  }
};

const ScoreBar = ({
  value,
  maxValue = 10,
}: {
  value: number;
  maxValue?: number;
}) => {
  const percentage = (value / maxValue) * 100;
  const color = getScoreColor(value);

  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const Header = ({ data }: { data: CandidateReportData }) => (
  <div className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {data.call_info.candidate_name}
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Python Developer | {data.screening_data.experience_years} YOE
      </p>
      <p className="text-sm text-gray-600">
        {data.screening_data.current_company} |{" "}
        {data.screening_data.current_location}
      </p>
    </div>
    <button
      className={`${getConfidenceBadge(
        data.verdict_confidence
      )} rounded-xl px-8 py-4 text-center text-white shadow-md`}
    >
      <div className="text-lg font-bold">{data.verdict.toUpperCase()}</div>
      <div className="text-xs capitalize">
        Confidence: {data.verdict_confidence}
      </div>
    </button>
  </div>
);

const ScoreCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-lg font-bold text-gray-900">
        {value.toFixed(1)}
      </span>
    </div>
    <div className="mt-2">
      <ScoreBar value={value} />
    </div>
  </div>
);

const PrimaryScoresGrid = ({ data }: { data: CandidateReportData }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <ScoreCard label="Motivation" value={data.motivation_score} />
    <ScoreCard label="Trust" value={data.trust_score} />
    <ScoreCard label="Interest" value={data.interest_score} />
    <ScoreCard label="Communication" value={data.communication_score} />
  </div>
);

const SecondaryScoresGrid = ({ data }: { data: CandidateReportData }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <ScoreCard label="Fluency" value={data.fluency_score} />
    <ScoreCard label="Confidence" value={data.confidence_score} />
    <ScoreCard label="Professionalism" value={data.professionalism_score} />
    <ScoreCard label="Engagement" value={data.engagement_score} />
  </div>
);

const MTIAnalysisBox = ({
  title,
  mtiData,
}: {
  title: "motivation" | "trust" | "interest";
  mtiData: any;
}) => (
  <div className="rounded-lg bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="font-semibold text-gray-800 capitalize">{title}</span>
      <span className="text-lg font-bold text-gray-900">
        {mtiData.score.toFixed(1)}
      </span>
    </div>
    <div className="mt-3 space-y-2">
      {mtiData.signals.map((signal: string, idx: number) => (
        <div key={`signal-${idx}`} className="flex items-start gap-2 text-sm">
          <span className="text-emerald-600">✓</span>
          <span className="text-gray-700">{signal}</span>
        </div>
      ))}
      {mtiData.concerns.map((concern: string, idx: number) => (
        <div key={`concern-${idx}`} className="flex items-start gap-2 text-sm">
          <span className="text-orange-500">⚠</span>
          <span className="text-gray-700">{concern}</span>
        </div>
      ))}
    </div>
  </div>
);

const MTISection = ({ data }: { data: CandidateReportData }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <MTIAnalysisBox title="motivation" mtiData={data.mti_analysis.motivation} />
    <MTIAnalysisBox title="trust" mtiData={data.mti_analysis.trust} />
    <MTIAnalysisBox title="interest" mtiData={data.mti_analysis.interest} />
  </div>
);

const RedFlagBox = ({ flag }: { flag: RedFlag }) => (
  <div className="rounded-lg bg-yellow-50 p-4 shadow-sm">
    <div className="flex items-start gap-2">
      <span className="text-xl">⚠</span>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{flag.flag}</h3>
        <p className="text-xs text-gray-600">Category: {flag.category}</p>
        <p className="mt-1 text-sm text-gray-700">{flag.evidence}</p>
      </div>
    </div>
  </div>
);

const RedFlagsSection = ({ data }: { data: CandidateReportData }) => (
  <div className="rounded-lg bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <span className="text-2xl">⚠</span>
      <h2 className="text-lg font-bold text-gray-900">
        {data.red_flags_count} Warning{data.red_flags_count !== 1 ? "s" : ""} |{" "}
        {data.critical_flags_count} Critical
      </h2>
    </div>
    {data.red_flags.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {data.red_flags.map((flag) => (
          <RedFlagBox key={flag.id} flag={flag} />
        ))}
      </div>
    ) : (
      <p className="text-gray-600">No red flags detected.</p>
    )}
  </div>
);

const SummarySection = ({
  summary,
  candidateSummary,
}: {
  summary: string;
  candidateSummary: string;
}) => (
  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 shadow-sm">
    <h2 className="mb-4 text-lg font-bold text-gray-900">Profile Summary</h2>
    <p className="leading-relaxed text-gray-700 mb-4">{candidateSummary}</p>
    <div className="mt-4 border-t border-blue-100 pt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Verdict Reasoning
      </h3>
      <p className="leading-relaxed text-gray-600 text-sm">{summary}</p>
    </div>
  </div>
);

const StrengthsConcernsGrid = ({ data }: { data: CandidateReportData }) => (
  <div className="grid gap-6 md:grid-cols-2">
    <div className="rounded-lg bg-green-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">✓</span>
        <h2 className="text-lg font-bold text-gray-900">Key Strengths</h2>
      </div>
      <ul className="space-y-2">
        {data.key_strengths.map((item: string, idx: number) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="rounded-lg bg-red-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">⚠</span>
        <h2 className="text-lg font-bold text-gray-900">Key Concerns</h2>
      </div>
      <ul className="space-y-2">
        {data.key_concerns.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-orange-500">⚠</span>
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const ScreeningSnapshot = ({ data }: { data: CandidateReportData }) => (
  <div className="rounded-lg bg-white p-6 shadow-sm">
    <h2 className="mb-6 text-lg font-bold text-gray-900">Screening Snapshot</h2>
    <div className="grid gap-6 md:grid-cols-3">
      <div className="border-l-2 border-gray-200 pl-4">
        <p className="text-xs font-medium uppercase text-gray-500">
          Experience
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {data.screening_data.experience_years} Years
        </p>
      </div>
      <div className="border-l-2 border-gray-200 pl-4">
        <p className="text-xs font-medium uppercase text-gray-500">
          Current CTC
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {data.screening_data.current_ctc_lpa} LPA
        </p>
      </div>
      <div className="border-l-2 border-gray-200 pl-4">
        <p className="text-xs font-medium uppercase text-gray-500">
          Expected CTC
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {data.screening_data.expected_ctc_lpa} LPA
        </p>
      </div>
      <div className="border-l-2 border-gray-200 pl-4">
        <p className="text-xs font-medium uppercase text-gray-500">
          Notice Period
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {data.screening_data.notice_period_days} Days
        </p>
      </div>
      <div className="border-l-2 border-gray-200 pl-4">
        <p className="text-xs font-medium uppercase text-gray-500">
          Current Location
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {data.screening_data.current_location}
        </p>
      </div>
      <div className="border-l-2 border-gray-200 pl-4">
        <p className="text-xs font-medium uppercase text-gray-500">
          Relocation
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {data.screening_data.relocation_willing ? "Yes" : "No"}
        </p>
      </div>
    </div>
  </div>
);

const CallMetadataSection = ({ data }: { data: CandidateReportData }) => (
  <div className="rounded-lg bg-white p-6 shadow-sm">
    <h2 className="mb-6 text-lg font-bold text-gray-900">Call Metadata</h2>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="text-xs font-medium uppercase text-gray-500">Duration</p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {Math.round(data.call_info.duration_seconds / 60)} min
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-gray-500">Outcome</p>
        <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
          {data.call_info.outcome}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-gray-500">
          Completion
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {data.completion_percentage}%
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-gray-500">
          Talk Ratio
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {(data.talk_ratio * 100).toFixed(0)}%
        </p>
      </div>
    </div>
  </div>
);

export default function AiReportCard({ data }: { data: CandidateReportData }) {
  return (
    <div className="space-y-6 bg-gray-50 p-6">
      <Header data={data} />
      <SummarySection
        summary={data.verdict_reasoning}
        candidateSummary={data.candidate_summary}
      />
      <ScreeningSnapshot data={data} />
      <RedFlagsSection data={data} />
      <PrimaryScoresGrid data={data} />
      <MTISection data={data} />
      <SecondaryScoresGrid data={data} />
      <StrengthsConcernsGrid data={data} />
      <CallMetadataSection data={data} />
    </div>
  );
}
