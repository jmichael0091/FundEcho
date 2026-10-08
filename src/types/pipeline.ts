import { Opportunity, OpportunityType, OpportunityRegion } from './index';

export type PipelineStage = 
  | 'discover' 
  | 'import' 
  | 'validate' 
  | 'deduplicate' 
  | 'review' 
  | 'verify' 
  | 'publish';

export type PipelineStatus = 
  | 'Discovered' 
  | 'Imported' 
  | 'Validation Failed' 
  | 'Ready for Review' 
  | 'Duplicate Suspected' 
  | 'Under Verification' 
  | 'Verified' 
  | 'Rejected' 
  | 'Published';

export type SourceQuality = 
  | 'Official provider' 
  | 'Government/official institution' 
  | 'Established organization' 
  | 'Secondary source' 
  | 'Unknown source';

export type PipelineEventType = 
  | 'Created' 
  | 'Imported' 
  | 'Validation Ran' 
  | 'Edited' 
  | 'Reviewed' 
  | 'Verification status changed' 
  | 'Duplicate Ignored' 
  | 'Merged' 
  | 'Verified' 
  | 'Published' 
  | 'Rejected' 
  | 'Ignored' 
  | 'Updated';

export interface PipelineEvent {
  id: string;
  type: PipelineEventType;
  timestamp: string;
  actor: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface ValidationCheckItem {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message?: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  passedCount: number;
  issuesCount: number;
  checks: ValidationCheckItem[];
  validatedAt: string;
}

export interface DuplicateCandidate {
  opportunityId: string;
  title: string;
  organization: string;
  sourceUrl?: string;
  matchScore: number; // 0 to 100 percentage
  matchReasons: string[];
  isExistingInCatalog: boolean;
  existingRecord?: Partial<Opportunity>;
}

export interface VerificationRecord {
  officialProvider: string;
  sourceUrl: string;
  applicationUrl: string;
  fundingAmount: string;
  deadline: string;
  eligibility: string;
  lastCheckedDate: string;
  verifiedBy?: string;
  notes?: string;
  status: 'Unverified' | 'Under Review' | 'Verified' | 'Needs Review' | 'Rejected';
}

export interface IncomingOpportunity {
  id: string;
  title: string;
  organization: string;
  source: string;
  sourceUrl: string;
  applicationUrl?: string;
  sourceQuality: SourceQuality;
  fundingType: OpportunityType;
  category: string;
  country: string;
  region: OpportunityRegion;
  deadline?: string;
  amountMin?: number;
  amountMax?: number;
  amountDisplayText: string;
  currency?: string;
  isFullyFunded?: boolean;
  description: string;
  summary?: string;
  eligibility: string[];
  requirements: string[];
  targetAudience?: string;
  dateDiscovered: string;
  pipelineStatus: PipelineStatus;
  
  // Pipeline artifacts
  validationResult?: ValidationResult;
  duplicateCandidates?: DuplicateCandidate[];
  ignoredDuplicates?: string[];
  verificationRecord?: VerificationRecord;
  history: PipelineEvent[];
  
  // Link to published catalog record
  linkedOpportunityId?: string;
  publishedAt?: string;
}

export interface PipelineStats {
  totalIncoming: number;
  discovered: number;
  imported: number;
  validationFailed: number;
  readyForReview: number;
  duplicateSuspected: number;
  underVerification: number;
  verified: number;
  published: number;
  rejected: number;
}
