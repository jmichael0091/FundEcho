export type OpportunityType = 
  | 'Grant'
  | 'Scholarship'
  | 'Fellowship'
  | 'Competition'
  | 'NGO & Non-Profit'
  | 'Business Funding'
  | 'Research Grant';

export type OpportunityRegion = 
  | 'Global'
  | 'North America'
  | 'Europe'
  | 'Asia-Pacific'
  | 'Africa'
  | 'Latin America'
  | 'Middle East';

export interface ImportantDate {
  label: string;
  date: string;
  description?: string;
  isPassed?: boolean;
}

export type EducationLevel = 
  | 'none'
  | 'high_school'
  | 'bachelors'
  | 'masters'
  | 'phd'
  | 'postdoc';

export interface EligibilityQuestion {
  id: string;
  question: string;
  helperText?: string;
  type: 'boolean' | 'select' | 'number' | 'text';
  options?: { value: string; label: string }[];
  placeholder?: string;
  requiredAnswer?: string | boolean | number;
  acceptableAnswers?: (string | boolean | number)[];
  weight?: 'mandatory' | 'preferred';
  explanationOnPass?: string;
  explanationOnFail?: string;
}

export interface EligibilityCriteria {
  eligibleOrganizationTypes?: string[];
  eligibleIndustries?: string[];
  eligibleFundingTypes?: string[];
  eligibleAgeRange?: { min?: number; max?: number };
  eligibleGenders?: string[];
  eligibleEducationLevels?: string[];
  eligibleBusinessStages?: string[];
  eligibleBusinessSizes?: string[];
  eligibilityRequirements?: string[];
  eligibilityNotes?: string;
  eligibleCountries?: string[]; // e.g. ['Global'] or list of countries
  eligibleRegions?: OpportunityRegion[];
  excludedCountries?: string[];
  applicantTypes?: string[];
  minimumAge?: number;
  maximumAge?: number;
  eligibleCategories?: string[];
  educationRequirements?: string[];
  minEducationLevel?: EducationLevel;
  minExperienceYears?: number;
  allowedFundingPurposes?: string[];
  businessStageRequirements?: string[];
  additionalRequirements?: EligibilityQuestion[];
  isDemoData?: boolean;
}

export type EligibilityOverallStatus = 
  | 'likely_eligible' 
  | 'possibly_eligible' 
  | 'likely_not_eligible';

export type RequirementStatus = 'met' | 'needs_review' | 'failed';

export interface RequirementCheckResult {
  id: string;
  title: string;
  status: RequirementStatus;
  userValueDisplay?: string;
  requirementDisplay: string;
  explanation: string;
  isMandatory: boolean;
}

export interface UserEligibilityAnswers {
  country?: string;
  age?: number;
  applicantType?: string;
  organizationStatus?: string;
  educationLevel?: string;
  experienceYears?: number;
  fundingPurpose?: string;
  category?: string;
  customAnswers?: Record<string, string | boolean | number>;
}

export interface EligibilityAssessmentResult {
  opportunityId: string;
  opportunityTitle: string;
  overallStatus: EligibilityOverallStatus;
  headline: string;
  summary: string;
  disclaimer: string;
  metCount: number;
  totalCount: number;
  uncertainCount: number;
  failedCount: number;
  scorePercentage: number;
  requirementResults: RequirementCheckResult[];
  reasons: string[];
  uncertainRequirements: string[];
  recommendedAction: 'apply' | 'review' | 'explore_similar';
  assessedAt: string;
  userAnswers: UserEligibilityAnswers;
}

export interface UserProfile {
  stateProvince?: string;
  organizationType?: string;
  occupation?: string;
  fundingTypes?: string[];
  gender?: string;
  businessSize?: string;
  organizationSize?: string;
  goals?: string[];
  id: string;
  name: string;
  email: string;
  country: string;
  region?: string;
  interests: string[]; // category slugs
  preferredFundingTypes: OpportunityType[];
  userType?: string;
  businessStage?: string;
  industry?: string;
  organizationName?: string;
  age?: number;
  applicantType?: string;
  educationLevel?: string;
  yearsOfExperience?: number;
  avatarBg?: string;
  initials?: string;
  createdAt: string;
  rememberSession?: boolean;
  role?: 'user' | 'admin' | 'superAdmin';
  accountStatus?: 'active' | 'suspended' | 'pendingVerification' | 'deactivated';
  profileCompletion?: number;
}

export interface RecentlyViewedItem {
  opportunityId: string;
  viewedAt: string;
}

export interface Opportunity {
  matchResult?: any;
  id: string;
  title: string;
  slug: string;
  organization: string;
  orgInitials?: string;
  orgLogoBg?: string;
  type: OpportunityType;
  category: string;
  amount: {
    min?: number;
    max: number;
    currency: string;
    displayText: string;
    isFullyFunded?: boolean;
  };
  deadline: string; // YYYY-MM-DD or formatted
  daysLeft: number;
  location: string;
  country?: string;
  eligibleCountries?: string[];
  imageUrl?: string;
  provider?: string;
  fundingType?: string;
  region: OpportunityRegion;
  verified: boolean;
  featured: boolean;
  status?: 'Open' | 'Closing Soon' | 'Reviewing' | 'Closed';
  tags: string[];
  summary: string;
  description: string;
  eligibility: string[];
  requirements: string[];
  requiredDocuments?: string[];
  applicationProcess?: string[];
  importantDates?: ImportantDate[];
  targetAudience: string;
  awardDetails: string;
  applicationUrl: string;
  officialSourceUrl?: string;
  datePosted: string;
  lastUpdated?: string;
  eligibilityCriteria?: EligibilityCriteria;
  publicationStatus?: 'Draft' | 'Pending Review' | 'Published' | 'Expired' | 'Archived';
  adminVerificationStatus?: 'Unverified' | 'Under Review' | 'Verified' | 'Verification Expired';
  source?: string;
  lastVerifiedDate?: string;
  internalNotes?: string;
  reviewNotes?: string;
  applicationOpeningDate?: string;
  timezone?: string;
  applicationInstructions?: string;
  fundingDescription?: string;
  ageRequirementsText?: string;
  educationRequirementsText?: string;
  experienceRequirementsText?: string;
  additionalRequirementsText?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon: string;
  description: string;
  accentColor: string;
}

export type PageId = 
  | 'home' 
  | 'opportunities' 
  | 'opportunity-detail' 
  | 'category-landing'
  | 'country-landing'
  | 'funding-type-landing'
  | 'calendar'
  | 'funders'
  | 'funder-detail'
  | 'directory'
  | 'application-workspace'
  | 'pricing'
  | 'credits'
  | 'recommended'
  | 'about' 
  | 'contact'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'dashboard'
  | 'saved'
  | 'profile'
  | 'settings'
  | 'admin';

export type Theme = 'light' | 'dark';

export * from './application';
export * from './notification';
export * from './admin';
export * from './seo';
export * from './calendar';
export * from './funder';
export * from './monetization';
export * from './opportunitySchema';
export * from './crawlerPipelineSchema';

