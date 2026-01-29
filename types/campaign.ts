// Campaign types based on API documentation

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  job_id: number;
  job_code: string;
  job_role: string;
  job_type: "fulltime" | "contract" | "parttime";
  hiring_company_name: string;
  client_name: string | null;
  job_location: string;
  job_locations: string[];
  work_mode: "remote" | "onsite" | "hybrid";
  shift_type: "day" | "night" | "rotational" | "general";
  interview_mode: "video" | "telephonic" | "in_person";
  is_drive: boolean;
  drive_date: string | null;
  drive_location: string | null;
  drive_time: string | null;
  experience_min: number;
  experience_max: number;
  min_ctc: number;
  max_ctc: number;
  ctc_negotiable: boolean;
  status: "draft" | "active" | "paused" | "completed";
  total_contacts: number;
  completed_calls: number;
  failed_calls: number;
  pending_calls: number;
  audio_generated: boolean;
  audio_approved: boolean;
  voice_gender: "male" | "female";
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface CampaignSearchFilters {
  // Text search
  q?: string;
  name?: string;
  job_role?: string;
  hiring_company_name?: string;
  client_name?: string;
  job_code?: string;
  job_location?: string;

  // Multi-value filters
  status?: ("draft" | "active" | "paused" | "completed")[];
  work_mode?: ("remote" | "onsite" | "hybrid")[];
  job_type?: ("fulltime" | "contract" | "parttime")[];
  shift_type?: ("day" | "night" | "rotational" | "general")[];
  interview_mode?: ("video" | "telephonic" | "in_person")[];
  voice_gender?: ("male" | "female")[];

  // Boolean filters
  is_drive?: boolean;
  ctc_negotiable?: boolean;
  audio_generated?: boolean;
  audio_approved?: boolean;
  is_deleted?: boolean;

  // Numeric range filters
  experience_min_from?: number;
  experience_min_to?: number;
  experience_max_from?: number;
  experience_max_to?: number;
  min_ctc_from?: number;
  min_ctc_to?: number;
  max_ctc_from?: number;
  max_ctc_to?: number;
  total_contacts_min?: number;
  total_contacts_max?: number;
  completed_calls_min?: number;
  completed_calls_max?: number;

  // Date range filters
  created_after?: string;
  created_before?: string;
  started_after?: string;
  started_before?: string;
  completed_after?: string;
  completed_before?: string;
  drive_date_after?: string;
  drive_date_before?: string;

  // Sorting
  sort_by?:
    | "created_at"
    | "updated_at"
    | "name"
    | "job_role"
    | "status"
    | "total_contacts"
    | "completed_calls"
    | "min_ctc"
    | "max_ctc";
  sort_order?: "asc" | "desc";

  // Pagination
  page?: number;
  page_size?: number;
}

export interface CampaignSearchResponse {
  success: boolean;
  data: {
    campaigns: Campaign[];
    count: number;
  };
  filters_applied: Record<string, any>;
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  sort: {
    sort_by: string;
    sort_order: string;
  };
}

// Helper function to build search URL
export function buildCampaignSearchUrl(filters: CampaignSearchFilters): string {
  const params = new URLSearchParams();

  // Text search
  if (filters.q) params.append("q", filters.q);
  if (filters.name) params.append("name", filters.name);
  if (filters.job_role) params.append("job_role", filters.job_role);
  if (filters.hiring_company_name)
    params.append("hiring_company_name", filters.hiring_company_name);
  if (filters.client_name) params.append("client_name", filters.client_name);
  if (filters.job_code) params.append("job_code", filters.job_code);
  if (filters.job_location) params.append("job_location", filters.job_location);

  // Multi-value filters (join with comma)
  if (filters.status?.length)
    params.append("status", filters.status.join(","));
  if (filters.work_mode?.length)
    params.append("work_mode", filters.work_mode.join(","));
  if (filters.job_type?.length)
    params.append("job_type", filters.job_type.join(","));
  if (filters.shift_type?.length)
    params.append("shift_type", filters.shift_type.join(","));
  if (filters.interview_mode?.length)
    params.append("interview_mode", filters.interview_mode.join(","));
  if (filters.voice_gender?.length)
    params.append("voice_gender", filters.voice_gender.join(","));

  // Boolean filters
  if (filters.is_drive !== undefined)
    params.append("is_drive", String(filters.is_drive));
  if (filters.ctc_negotiable !== undefined)
    params.append("ctc_negotiable", String(filters.ctc_negotiable));
  if (filters.audio_generated !== undefined)
    params.append("audio_generated", String(filters.audio_generated));
  if (filters.audio_approved !== undefined)
    params.append("audio_approved", String(filters.audio_approved));
  if (filters.is_deleted !== undefined)
    params.append("is_deleted", String(filters.is_deleted));

  // Range filters
  if (filters.experience_min_from)
    params.append("experience_min_from", String(filters.experience_min_from));
  if (filters.experience_min_to)
    params.append("experience_min_to", String(filters.experience_min_to));
  if (filters.experience_max_from)
    params.append("experience_max_from", String(filters.experience_max_from));
  if (filters.experience_max_to)
    params.append("experience_max_to", String(filters.experience_max_to));
  if (filters.min_ctc_from)
    params.append("min_ctc_from", String(filters.min_ctc_from));
  if (filters.min_ctc_to)
    params.append("min_ctc_to", String(filters.min_ctc_to));
  if (filters.max_ctc_from)
    params.append("max_ctc_from", String(filters.max_ctc_from));
  if (filters.max_ctc_to)
    params.append("max_ctc_to", String(filters.max_ctc_to));
  if (filters.total_contacts_min)
    params.append("total_contacts_min", String(filters.total_contacts_min));
  if (filters.total_contacts_max)
    params.append("total_contacts_max", String(filters.total_contacts_max));
  if (filters.completed_calls_min)
    params.append("completed_calls_min", String(filters.completed_calls_min));
  if (filters.completed_calls_max)
    params.append("completed_calls_max", String(filters.completed_calls_max));

  // Date filters
  if (filters.created_after)
    params.append("created_after", filters.created_after);
  if (filters.created_before)
    params.append("created_before", filters.created_before);
  if (filters.started_after)
    params.append("started_after", filters.started_after);
  if (filters.started_before)
    params.append("started_before", filters.started_before);
  if (filters.completed_after)
    params.append("completed_after", filters.completed_after);
  if (filters.completed_before)
    params.append("completed_before", filters.completed_before);
  if (filters.drive_date_after)
    params.append("drive_date_after", filters.drive_date_after);
  if (filters.drive_date_before)
    params.append("drive_date_before", filters.drive_date_before);

  // Pagination
  params.append("page", String(filters.page || 1));
  params.append("page_size", String(filters.page_size || 50));

  // Sorting
  if (filters.sort_by) params.append("sort_by", filters.sort_by);
  if (filters.sort_order) params.append("sort_order", filters.sort_order);

  return params.toString();
}
