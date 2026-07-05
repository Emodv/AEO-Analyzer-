export interface CheckpointResult {
  pass: boolean;
  label: string;
  detail: string;
}

export interface ChecksObject {
  checkpoint_1: CheckpointResult;
  checkpoint_2: CheckpointResult;
  checkpoint_3: CheckpointResult;
  checkpoint_4: CheckpointResult;
  checkpoint_5: CheckpointResult;
  checkpoint_6: CheckpointResult;
  checkpoint_7: CheckpointResult;
  checkpoint_8: CheckpointResult;
}

export interface AeoReport {
  id: string;
  domain: string;
  score: number;
  status: 'AI-Ready' | 'Needs Work' | 'Urgent Action Required';
  checks: ChecksObject;
  cached?: boolean;
  created_at: string;
}

export interface AeoLead {
  id: string;
  domain: string;
  email: string;
  name?: string;
  phone?: string;
  selected_tier?: 'Basic' | 'Pro' | 'Enterprise';
  report_id?: string;
  created_at: string;
}

export interface SaveScan {
  id: string;
  email: string;
  report_id: string;
  created_at: string;
}
