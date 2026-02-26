export interface ScoreMetric {
  label: string;
  value: number;
  color: 'yellow' | 'green' | 'orange';
}

export interface SignalItem {
  icon: '✓' | '⚠';
  text: string;
  isPositive: boolean;
}

export interface SignalGroup {
  title: 'Motivation' | 'Trust' | 'Interest';
  score: number;
  signals: SignalItem[];
}

export interface Warning {
  icon: '⚠';
  title: string;
  category: string;
  evidence: string;
}

export interface StrengthConcern {
  icon: '✓' | '⚠';
  title: string;
  items: string[];
}

export interface ScreeningInfo {
  label: string;
  value: string;
}

export interface CandidateReportCardProps {
  candidateName: string;
  role: string;
  experience: string;
  company: string;
  location: string;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  scoreMetrics: ScoreMetric[];
  signalGroups: SignalGroup[];
  warningCount: number;
  criticalCount: number;
  warnings: Warning[];
  summary: string;
  keyStrengths: StrengthConcern;
  keyConcerns: StrengthConcern;
  screeningSnapshot: ScreeningInfo[];
}