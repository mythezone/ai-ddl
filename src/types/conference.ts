export interface Conference {
  title: string;
  year: number;
  id: string;
  full_name?: string;
  link: string;
  deadline: string;
  timezone: string;
  place: string;
  date: string;
  start?: string;
  end?: string;
  tags: string[];
  abstract_deadline?: string;
  note?: string;
  hindex?: number;
  commitment_deadline?: string;
  submission_deadline?: string;
  timezone_submission?: string;
  rebuttal_period_start?: string;
  rebuttal_period_end?: string;
  review_release_date?: string;
  final_decision_date?: string;
} 