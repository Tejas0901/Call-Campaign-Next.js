// Contact interface
export interface Contact {
  id: string;
  campaign_id: string;
  candidate_name: string;
  phone_number: string;
  email: string | null;
  ats_candidate_id: string | null;
  experience_years: number | null;
  current_ctc: number | null;
  expected_ctc: number | null;
  notice_period_days: number | null;
  resume_url: string | null;
  source: string | null;
  call_status: string | null;
  call_attempts: number | null;
  call_outcome: string | null;
  priority: number | null;
  tags: string[] | null;
  is_reachable: boolean | null;
  name_audio_generated: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  last_call_at: string | null;
  next_retry_at: string | null;
}

// Pagination interface
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Search filters interface
export interface ContactSearchFilters {
  // Text search
  q?: string;
  candidate_name?: string;
  phone_number?: string;
  email?: string;
  ats_candidate_id?: string;

  // Multi-value filters (arrays will be joined with comma)
  call_status?: string[];
  call_outcome?: string[];
  source?: string[];
  tags?: string[];

  // Boolean filters
  is_reachable?: boolean;
  name_audio_generated?: boolean;

  // Numeric range filters
  experience_min?: number;
  experience_max?: number;
  current_ctc_min?: number;
  current_ctc_max?: number;
  expected_ctc_min?: number;
  expected_ctc_max?: number;
  notice_period_min?: number;
  notice_period_max?: number;
  call_attempts_min?: number;
  call_attempts_max?: number;
  priority_min?: number;
  priority_max?: number;

  // Date range filters (YYYY-MM-DD format)
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  last_call_after?: string;
  last_call_before?: string;
  next_retry_after?: string;
  next_retry_before?: string;

  // Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';

  // Pagination
  page?: number;
  page_size?: number;
}

// API Response interface
export interface ContactSearchResponse {
  success: boolean;
  data: {
    contacts: Contact[];
    count: number;
  };
  filters_applied: Record<string, any>;
  pagination: Pagination;
  sort: {
    sort_by: string;
    sort_order: string;
  };
}

// Filter UI Constants
export const CALL_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'busy', label: 'Busy' },
  { value: 'callback', label: 'Callback' }
];

export const CALL_OUTCOME_OPTIONS = [
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'callback', label: 'Callback' },
  { value: 'rejected', label: 'Rejected' }
];

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'candidate_name', label: 'Name' },
  { value: 'priority', label: 'Priority' },
  { value: 'experience_years', label: 'Experience' },
  { value: 'current_ctc', label: 'Current CTC' },
  { value: 'expected_ctc', label: 'Expected CTC' },
  { value: 'notice_period_days', label: 'Notice Period' },
  { value: 'call_attempts', label: 'Call Attempts' },
  { value: 'last_call_at', label: 'Last Called' },
  { value: 'call_status', label: 'Call Status' }
];
