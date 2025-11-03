export type Professional = {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  source: 'direct' | 'partner' | 'internal';
  created_at?: string;
};
