export interface Template {
  id: string;
  name: string;
  questions: Question[];
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  followUps: FollowUpQuestion[];
}

export interface NewTemplateForm {
  template_name: string;
  description: string;
  template_type: string;
  category: string;
  industry: string;
  role_type: string;
  experience_level: string;
  tags: string;
  difficulty_level: string;
  language: string;
  estimated_duration_seconds: number;
  created_by: string;
  owner_id: string;
}
