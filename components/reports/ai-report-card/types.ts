export interface RedFlag {
  id: string;
  category: string;
  flag: string;
  severity: 'warning' | 'critical';
  evidence: string;
  source: 'computed' | 'llm';
}

export interface MTIAnalysis {
  motivation: {
    score: number;
    signals: string[];
    concerns: string[];
  };
  trust: {
    score: number;
    signals: string[];
    concerns: string[];
  };
  interest: {
    score: number;
    signals: string[];
    concerns: string[];
  };
}

export interface ScreeningData {
  experience_years: number;
  current_ctc_lpa: number;
  expected_ctc_lpa: number;
  notice_period_days: number;
  current_location: string;
  current_company: string;
  is_employed: boolean;
  is_resigned: boolean;
  has_other_offers: boolean;
  relocation_willing: boolean;
  interview_availability: string;
  job_change_reason: string;
  email: string;
}

export interface CallInfo {
  candidate_name: string;
  phone: string;
  duration_seconds: number;
  outcome: 'completed' | 'incomplete' | 'failed';
  identity_confirmed: boolean;
  consent_given: boolean;
}

export interface DataValidation {
  field: string;
  system_value: string;
  conversation_value: string;
  status: 'verified' | 'mismatch' | 'not_discussed';
  note: string;
}

export interface CandidateReportData {
  session_id: string;
  qualification_score: number;
  recommendation: 'proceed' | 'consider' | 'reject';
  
  // Scores
  motivation_score: number;
  trust_score: number;
  interest_score: number;
  communication_score: number;
  fluency_score: number;
  confidence_score: number;
  professionalism_score: number;
  engagement_score: number;
  responsiveness_score: number;
  honesty_score: number;
  cooperation_score: number;
  
  // Core data
  red_flags: RedFlag[];
  mti_analysis: MTIAnalysis;
  transcript_path: string;
  
  // Verdict
  verdict: 'proceed' | 'consider' | 'reject';
  verdict_confidence: 'low' | 'medium' | 'high';
  verdict_reasoning: string;
  
  // Summaries
  candidate_summary: string;
  key_strengths: string[];
  key_concerns: string[];
  
  // Counts
  red_flags_count: number;
  critical_flags_count: number;
  top_red_flag: string;
  
  // Metadata
  avg_stt_confidence: number;
  retry_count: number;
  completion_percentage: number;
  talk_ratio: number;
  avg_response_length: number;
  
  // Screening details
  screening_data: ScreeningData;
  call_info: CallInfo;
  data_validation: DataValidation[];
  model_used: string;
}
