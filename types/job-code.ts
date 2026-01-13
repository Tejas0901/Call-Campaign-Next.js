/**
 * Type definitions for Job Code API integration
 */

/**
 * Job data structure from Hyrex API
 */
export interface Job {
  id: number;
  job_code: string;
  title: string;
  client_name: string;
  description: string;
  location?: string;
  job_type?: string;
  remote?: "yes" | "no";
  vertical_name?: string;
  job_status?: string;
  priority?: "high" | "medium" | "low";
  created_at?: string;
  updated_at?: string;
  experience?: string;
  amount?: number;
  currency?: string;
  number_of_position?: number;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  start_date?: string;
  end_date?: string;
  submission_count?: number;
  primary_skills?: Skill[];
  secondary_skills?: Skill[];
  contact_manager_name?: string;
  account_manager_name?: string;
  delivery_manager_name?: string;
  created_by?: User;
  updated_by?: User;
  assign?: any[];
  assign_details?: any[];
}

/**
 * Skill data structure
 */
export interface Skill {
  id: number;
  name: string;
}

/**
 * User data structure
 */
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  team_id?: number;
  empcode?: number;
}

/**
 * API response structure for jobs list
 */
export interface JobsListResponse {
  count: number;
  results: Job[];
  next?: string;
  previous?: string;
}

/**
 * Combobox option structure
 */
export interface ComboboxOption {
  value: string;
  label: string;
  [key: string]: any;
}

/**
 * Job code selection event
 */
export interface JobCodeSelection {
  code: string;
  job: Job;
}

/**
 * Auto-filled campaign fields from job
 */
export interface AutoFilledCampaignData {
  jobCode: string;
  jobRole: string;
  companyName: string;
  location: string;
}

/**
 * API filter options
 */
export interface JobFilterOptions {
  job_code?: string;
  status?: string;
  job_created_start?: string;
  job_created_end?: string;
  page?: number;
  size?: number;
}

/**
 * Error response structure
 */
export interface ApiErrorResponse {
  message: string;
  status: number;
  code?: string;
}

/**
 * Hook return type for useJobCodes
 */
export interface UseJobCodesReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobCodes: () => Promise<Job[]>;
  fetchJobByCode: (jobCode: string) => Promise<Job | null>;
  searchJobs: (query: string) => Job[];
}
