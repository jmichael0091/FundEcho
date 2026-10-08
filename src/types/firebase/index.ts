/**
 * FUNDORA - FIREBASE & FIRESTORE DATABASE FOUNDATION (STEP 17)
 * Complete schema and type definitions for all core Firestore collections and documents.
 */

import { FieldValue, Timestamp } from 'firebase/firestore';

// Flexible Timestamp representation supporting Firestore Timestamp, FieldValue (serverTimestamp), Date, or ISO String
export type FirestoreDateTime = Timestamp | FieldValue | Date | string;

// =============================================================================
// 1. USERS COLLECTION (users/{userId})
// Stores account-level identity, authentication state, and platform role.
// =============================================================================
export type UserRole = 'user' | 'admin' | 'superAdmin';
export type AccountStatus = 'active' | 'suspended' | 'pendingVerification' | 'deactivated';

export interface FirestoreUser {
  id: string; // matches Firebase Auth UID
  uid?: string; // Step 19 alias
  fullName?: string;
  email: string;
  displayName: string;
  country?: string;
  interests?: string[];
  organizationType?: string;
  profileCompleted?: boolean;
  photoURL?: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
  lastLoginAt: FirestoreDateTime;
}

// =============================================================================
// 2. USER PROFILES (userProfiles/{userId})
// Stores non-auth profile data, demographics, preferences, and completion score.
// =============================================================================
export interface UserPreferences {
  emailAlerts?: boolean;
  weeklyDigest?: boolean;
  deadlineReminders?: boolean;
  currency?: string;
  matchThreshold?: number; // 0 to 100
  notificationCategories?: string[];
}

export interface FirestoreUserProfile {
  userId: string;
  country: string;
  region: string;
  interests: string[];
  fundingTypes: string[];
  opportunityCategories: string[];
  userType: string; // e.g. 'Startup Founder', 'Researcher', 'Student', 'Non-profit'
  businessStage: string; // e.g. 'Ideation', 'Early Stage', 'Growth', 'Established', 'N/A'
  industry: string;
  organizationName: string;
  profileCompletion: number; // 0 to 100
  preferences: UserPreferences;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 3. OPPORTUNITIES (opportunities/{opportunityId})
// Institutional funding, grants, fellowships, and scholarships.
// =============================================================================
export type OpportunityStatus = 'draft' | 'pendingReview' | 'published' | 'expired' | 'archived';
export type VerificationStatus = 'unverified' | 'underReview' | 'verified' | 'verificationExpired';

export interface FirestoreOpportunity {
  id: string;
  title: string;
  providerName: string;
  description: string;
  fundingType: string; // e.g. 'Grant', 'Fellowship', 'Scholarship', etc.
  category: string;
  subcategory?: string;
  amount: number | string;
  currency: string;
  deadline: string; // ISO date string (YYYY-MM-DD or full timestamp)
  country: string;
  eligibleCountries: string[];
  regions: string[];
  eligibilitySummary: string;
  requirements: string[];
  applicationUrl: string;
  sourceUrl: string;
  sourceName: string;
  sourceId?: string;
  status: OpportunityStatus;
  verificationStatus: VerificationStatus;
  publishedAt?: FirestoreDateTime | null;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 4. OPPORTUNITY SOURCES (opportunitySources/{sourceId})
// Preserves the provenance, institution type, and rating of every source.
// =============================================================================
export type SourceType = 
  | 'official'
  | 'government'
  | 'university'
  | 'foundation'
  | 'nonprofit'
  | 'organization'
  | 'other';

export type SourceStatus = 'active' | 'inactive' | 'flagged' | 'underReview';

export interface FirestoreOpportunitySource {
  id: string;
  name: string;
  website: string;
  sourceType: SourceType;
  sourceUrl: string;
  qualityRating: number; // 1 to 5
  verificationPolicy: string;
  status: SourceStatus;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 5. VERIFICATION RECORDS (verificationRecords/{verificationId})
// Immutable, auditable verification history for opportunities.
// =============================================================================
export interface VerificationEvidence {
  url?: string;
  documentId?: string;
  method?: 'official_domain_check' | 'direct_contact' | 'portal_verification' | 'api_sync';
  notes?: string;
  evidenceSnapshotUrl?: string;
}

export interface FirestoreVerificationRecord {
  id: string;
  opportunityId: string;
  reviewerId: string;
  previousStatus: VerificationStatus;
  newStatus: VerificationStatus;
  verificationNotes: string;
  evidence: VerificationEvidence;
  checkedAt: FirestoreDateTime;
  expiresAt?: FirestoreDateTime | null;
  createdAt: FirestoreDateTime;
}

// =============================================================================
// 6. SAVED OPPORTUNITIES (users/{userId}/savedOpportunities/{opportunityId})
// Subcollection for user saved items.
// =============================================================================
export interface FirestoreSavedOpportunity {
  opportunityId: string;
  savedAt: FirestoreDateTime;
  notes?: string;
}

// =============================================================================
// 7. APPLICATION TRACKING SYSTEM (applications/{applicationId}) - STEP 22
// Stores real-time application tracking records and workspace data.
// =============================================================================
export type ApplicationTrackerStatus = 
  | 'Planning'
  | 'In Progress'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Withdrawn';

export type ApplicationStatus = ApplicationTrackerStatus | 'draft' | 'inProgress' | 'readyForReview' | 'submitted' | 'archived';

// =============================================================================
// APPLICATION PREPARATION WORKSPACE TYPES - STEP 26
// =============================================================================
export type RequirementCategory = 'eligibility' | 'document' | 'form' | 'custom' | 'action';

export interface ApplicationRequirement {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  completed: boolean;
  category?: RequirementCategory;
  linkedDocumentId?: string;
}

export type DocumentPreparationStatus = 'Needed' | 'Preparing' | 'Ready' | 'Uploaded';

export interface ApplicationDocument {
  id: string;
  userId: string;
  applicationId: string;
  name: string;
  type: string; // e.g., 'application/pdf', 'pdf', 'image/png'
  size?: number; // bytes
  storagePath?: string;
  downloadUrl?: string;
  uploadedAt: string;
  status: DocumentPreparationStatus;
  notes?: string;
  required?: boolean;
}

export interface ApplicationResponse {
  id: string;
  question: string;
  answer: string;
  required: boolean;
  completed: boolean;
  updatedAt: string;
  guidelines?: string;
  wordLimit?: number;
}

export interface FirestoreApplication {
  id: string;
  userId: string;
  opportunityId: string;
  opportunityTitle: string;
  provider: string;
  status: ApplicationTrackerStatus;
  notes: string;
  deadline: string;
  startedAt: FirestoreDateTime;
  submittedAt?: FirestoreDateTime | null;
  updatedAt: FirestoreDateTime;
  createdAt?: FirestoreDateTime;
  // Step 26: Application Workspace extensions
  progress?: number; // 0-100 overall readiness percentage
  requirements?: ApplicationRequirement[];
  documents?: ApplicationDocument[];
  responses?: ApplicationResponse[];
  // Optional multi-step proposal workspace state
  currentStep?: number;
  applicantInformation?: Record<string, any>;
  organizationInformation?: Record<string, any>;
  fundingRequest?: Record<string, any>;
  problem?: Record<string, any>;
  solution?: Record<string, any>;
  goals?: Record<string, any>;
  beneficiaries?: Record<string, any>;
  budget?: Record<string, any>;
  timeline?: Record<string, any>;
  additionalQuestions?: Record<string, any>;
  finalReview?: Record<string, any>;
}

// =============================================================================
// 8. NOTIFICATIONS (notifications/{notificationId}) - STEP 23
// Root collection for authenticated user notifications and deadline alerts.
// =============================================================================
export type NotificationType = 
  | 'Deadline Reminder'
  | 'Application Update'
  | 'Opportunity Update'
  | 'System Notification'
  | 'deadline'
  | 'recommendation'
  | 'application'
  | 'system'
  | 'account'
  | string;

export interface FirestoreNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  opportunityId?: string | null;
  applicationId?: string | null;
  read: boolean;
  createdAt: FirestoreDateTime;
  scheduledFor?: FirestoreDateTime | null;
  deliveredAt?: FirestoreDateTime | null;
  // Extensible / UX helper fields
  relatedOpportunityId?: string | null;
  opportunityTitle?: string;
  urgency?: 'urgent' | 'high' | 'normal' | 'low';
  actionLabel?: string;
  daysRemaining?: number;
  targetPage?: string;
  isRead?: boolean; // Client-side alias
}

export interface UserNotificationPreferences {
  deadlineReminders: boolean;
  applicationUpdates: boolean;
  opportunityUpdates: boolean;
  systemNotifications: boolean;
  defaultReminderOffsets?: number[];
  recommendedOpportunities?: boolean;
  applicationDraftReminders?: boolean;
  emailDigestPreview?: boolean;
}

export interface FirestoreFCMTokenDoc {
  token: string;
  userId: string;
  platform?: string;
  userAgent?: string;
  createdAt: FirestoreDateTime;
  lastActive: FirestoreDateTime;
}

export interface FirestoreReminderRecordDoc {
  id: string; // Deterministic: userId + applicationId + reminderType + deadline
  userId: string;
  applicationId: string;
  opportunityId: string;
  reminderInterval: string; // '14d' | '7d' | '3d' | '1d' | '0d'
  deadline: string;
  generatedAt: FirestoreDateTime;
}

// =============================================================================
// 9. AFFILIATE OFFERS (affiliateOffers/{offerId})
// Contextual, verified third-party support and service partners.
// =============================================================================
export type AffiliateOfferStatus = 'active' | 'inactive' | 'paused' | 'archived';

export interface FirestoreAffiliateOffer {
  id: string;
  partnerName: string;
  title: string;
  description: string;
  category: string;
  offerType: string;
  logo: string;
  affiliateUrl: string; // Real URL stored as data, not hardcoded
  disclosure: string;
  countries: string[];
  regions: string[];
  userTypes: string[];
  interests: string[];
  fundingTypes: string[];
  opportunityCategories: string[];
  businessStages: string[];
  industries: string[];
  intentSignals: string[];
  premiumEligibility: boolean;
  minimumMatchScore: number;
  priority: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: AffiliateOfferStatus;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 10. SUBSCRIPTIONS (subscriptions/{subscriptionId})
// Subscription states.
// =============================================================================
export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid' 
  | 'incomplete';

export interface FirestoreSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: FirestoreDateTime;
  endDate: FirestoreDateTime;
  autoRenew: boolean;
  provider: string; // e.g. 'stripe', 'lemonsqueezy', 'custom'
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 11. SUBSCRIPTION PLANS (subscriptionPlans/{planId})
// Dynamic pricing and plan definitions.
// =============================================================================
export type PlanStatus = 'active' | 'deprecated' | 'hidden';

export interface FirestoreSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  includedCredits: number;
  features: string[];
  usageLimits: Record<string, number>;
  status: PlanStatus;
  recommended: boolean;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 12. CREDIT WALLET & TRANSACTIONS
// creditWallets/{userId} and creditTransactions/{transactionId}
// =============================================================================
export interface FirestoreCreditWallet {
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeUsed: number;
  updatedAt: FirestoreDateTime;
}

export type CreditTransactionType = 
  | 'purchase' 
  | 'usage' 
  | 'refund' 
  | 'bonus' 
  | 'subscription_grant' 
  | 'admin_adjustment';

export interface FirestoreCreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number; // positive for credits added, negative for credits deducted
  feature: string;
  description: string;
  reference?: string;
  createdAt: FirestoreDateTime;
}

// =============================================================================
// 13. ADMIN PROFILES (adminProfiles/{userId})
// Granular RBAC permissions for administrative personnel.
// =============================================================================
export type AdminPermission = 
  | 'manageUsers'
  | 'manageOpportunities'
  | 'manageSources'
  | 'verifyOpportunities'
  | 'manageAffiliates'
  | 'manageSubscriptions'
  | 'manageCredits'
  | 'viewAnalytics'
  | 'manageSystem';

export type AdminProfileStatus = 'active' | 'suspended' | 'revoked';

export interface FirestoreAdminProfile {
  userId: string;
  role: 'admin' | 'superAdmin';
  permissions: AdminPermission[];
  status: AdminProfileStatus;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// FIRESTORE COLLECTION CONSTANTS
// Centralized, typo-free collection names.
// =============================================================================
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  FUNDING_OPPORTUNITIES: 'funding_opportunities',
  SAVED_OPPORTUNITIES: 'saved_opportunities',
  APPLICATIONS: 'applications',
  NOTIFICATIONS: 'notifications',
  REMINDER_RECORDS: 'reminder_records',
  FCM_TOKENS: 'fcmTokens',
  CATEGORIES: 'categories',
  AFFILIATE_OFFERS: 'affiliate_offers',
  // Step 2 Crawler Pipeline Core Collections
  DRAFTS: 'drafts',
  SOURCES: 'sources',
  CRAWL_JOBS: 'crawlJobs',
  CRAWL_RESULTS: 'crawlResults',
  VERIFICATION_QUEUE: 'verificationQueue',
  DUPLICATES: 'duplicates',
  ADMIN_LOGS: 'adminLogs',
  // Backward compatibility aliases
  OPPORTUNITIES: 'opportunities',
  LEGACY_FUNDING_OPPORTUNITIES: 'funding_opportunities',
  USER_PROFILES: 'userProfiles',
  OPPORTUNITY_SOURCES: 'opportunitySources',
  VERIFICATION_RECORDS: 'verificationRecords',
  SUBSCRIPTIONS: 'subscriptions',
  SUBSCRIPTION_PLANS: 'subscriptionPlans',
  CREDIT_WALLETS: 'creditWallets',
  CREDIT_TRANSACTIONS: 'creditTransactions',
  ADMIN_PROFILES: 'adminProfiles',
} as const;

// Step 19 Master Models
export type FundingOpportunityStatus = 'Open' | 'Verifying' | 'Expired';

export interface FirestoreFundingOpportunityDoc {
  id: string;
  title: string;
  provider: string;
  description: string;
  category: string;
  fundingType: string;
  amount: number | string;
  currency: string;
  country: string;
  eligibleCountries: string[];
  eligibility: string | string[];
  eligibilityCriteria?: any;
  deadline: string;
  applicationUrl: string;
  imageUrl?: string;
  status: FundingOpportunityStatus;
  tags: string[];
  featured: boolean;
  verified: boolean;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
  isSampleData?: boolean;
  slug?: string;
  requirements?: string[];
  targetAudience?: string;
  awardDetails?: string;
  datePosted?: string;
}

export interface FirestoreUserDoc {
  uid: string;
  id?: string;
  fullName: string;
  displayName?: string;
  email: string;
  country: string;
  interests: string[];
  organizationType: string;
  profileCompleted: boolean;
  role?: UserRole;
  accountStatus?: AccountStatus;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
  photoURL?: string | null;
}

export interface FirestoreSavedOpportunityDoc {
  id: string;
  userId: string;
  opportunityId: string;
  createdAt: FirestoreDateTime;
  notes?: string;
}

export * from '../opportunitySchema';
export * from '../crawlerPipelineSchema';
