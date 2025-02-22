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
} 