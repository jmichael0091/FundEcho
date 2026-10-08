import { Opportunity, OpportunityType, OpportunityRegion } from './index';

export type PublicationStatus = 
  | 'Draft' 
  | 'Pending Review' 
  | 'Published' 
  | 'Expired' 
  | 'Archived';

export type AdminVerificationStatus = 
  | 'Unverified' 
  | 'Under Review' 
  | 'Verified' 
  | 'Verification Expired';

export type AccountStatus = 
  | 'Active' 
  | 'Inactive' 
  | 'Suspended' 
  | 'Pending Verification';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  country: string;
  registeredAt: string;
  accountStatus: AccountStatus;
  role: 'user' | 'admin';
  lastLoginAt?: string;
  applicantType?: string;
}

export type AdminTabId = 
  | 'dashboard' 
  | 'pipeline'
  | 'sources'
  | 'opportunities' 
  | 'add-opportunity' 
  | 'review-queue' 
  | 'categories' 
  | 'users'
  | 'affiliates'
  | 'monetization';

export interface OpportunityFormData {
  id?: string;
  title: string;
  organization: string;
  provider?: string;
  type: OpportunityType;
  fundingType?: string;
  category: string;
  description: string;
  summary: string;
  
  // Funding
  minAmount?: number;
  maxAmount: number;
  amount?: number | string;
  currency: string;
  amountDisplayText: string;
  fundingDescription?: string;
  isFullyFunded?: boolean;

  // Eligibility & Geography
  country?: string;
  eligibleCountries: string[];
  eligibility?: string;
  eligibilityRequirements?: string;
  applicantTypes: string[];
  minimumAge?: number;
  maximumAge?: number;
  ageRequirementsText?: string;
  categoryRequirements?: string;
  educationRequirementsText?: string;
  experienceRequirementsText?: string;
  additionalRequirementsText?: string;
  targetAudience?: string;
  awardDetails?: string;

  // Dates
  applicationOpeningDate?: string;
  deadline: string;
  timezone?: string;

  // Application
  applicationUrl: string;
  applicationInstructions?: string;
  imageUrl?: string;

  // Metadata & Status (Step 20)
  status?: 'Open' | 'Verifying' | 'Expired';
  verified?: boolean;
  featured?: boolean;
  publicationStatus: PublicationStatus;
  adminVerificationStatus: AdminVerificationStatus;
  source?: string;
  lastVerifiedDate?: string;
  internalNotes?: string;
  reviewNotes?: string;
  tags: string[];
  location?: string;
  region?: OpportunityRegion;
}

export interface AdminStats {
  totalOpportunities: number;
  openOpportunities: number;
  verifyingOpportunities: number;
  expiredOpportunities: number;
  featuredOpportunities: number;
  activeOpportunities: number;
  pendingReviewOpportunities: number;
  archivedOpportunities: number;
  draftOpportunities: number;
  totalRegisteredUsers: number;
  verifiedOpportunities: number;
}
