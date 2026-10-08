/**
 * FUNDECHO - OPPORTUNITY DATA SCHEMA (STEP 1)
 * Foundational schema and data structures for opportunities populated by
 * FundEcho's global web crawler, AI extraction pipeline, and admin curator workflows.
 *
 * Designed for Firestore storage and future extensions:
 * - Automated web crawling & RSS ingestion
 * - AI extraction & structured field parsing
 * - Duplicate detection & canonical grouping
 * - Multi-tier admin verification & editorial publishing
 * - Automated deadline monitoring & notification triggers
 */

import { FieldValue, Timestamp } from 'firebase/firestore';

export type FirestoreDateTime = Timestamp | FieldValue | Date | string;

// =============================================================================
// 1. CORE ENUMS & LITERAL TYPES
// =============================================================================

export type FundEchoOpportunityType =
  | 'Grant'
  | 'Scholarship'
  | 'Fellowship'
  | 'Funding'
  | 'Competition'
  | 'Accelerator'
  | 'Award'
  | 'Prize'
  | 'Incubator'
  | 'Residency'
  | 'Sponsorship'
  | 'NGO & Non-Profit'
  | 'Business Funding'
  | 'Research Grant'
  | string;

export type FundEchoOpportunityStatus =
  | 'Draft'
  | 'Pending Review'
  | 'Published'
  | 'Expired'
  | 'Rejected';

export type FundEchoApplicantType =
  | 'Individual'
  | 'Startup'
  | 'Non-Profit'
  | 'Student'
  | 'Researcher'
  | 'Small Business'
  | 'SME'
  | 'Artist'
  | 'Educator'
  | 'Institution'
  | 'Consortium'
  | string;

export type FundEchoRegion =
  | 'Global'
  | 'North America'
  | 'Europe'
  | 'Asia-Pacific'
  | 'Africa'
  | 'Latin America'
  | 'Middle East'
  | string;

// =============================================================================
// 2. SUB-STRUCTURES
// =============================================================================

export interface FundingAmountStructure {
  min?: number;
  max: number;
  currency: string; // ISO 4217 (USD, EUR, GBP, CAD, etc.)
  displayText: string; // e.g. "$50,000", "€10,000 - €25,000", "Fully Funded"
  isFullyFunded?: boolean;
  awardType?: 'lump_sum' | 'recurring' | 'equity_free' | 'stipend' | 'reimbursement' | 'in_kind' | string;
  notes?: string;
}

export interface AgeRequirements {
  hasAgeLimit?: boolean;
  minAge?: number;
  maxAge?: number;
  description?: string; // Human-readable e.g. "Between 18 and 35 years old"
}

export interface GenderRequirements {
  hasGenderRestrictions?: boolean;
  eligibleGenders?: ('all' | 'female' | 'male' | 'non-binary' | 'other' | string)[];
  description?: string; // e.g. "Women founders in STEM", "Open to all genders"
}

export interface CrawlerMetadata {
  crawlerRunId?: string;
  discoveredAt: string; // ISO date-time string
  sourceDomain?: string; // e.g. "grants.gov", "ec.europa.eu"
  sourceUrl: string; // Original URL where discovered
  rawContentHash?: string; // SHA-256 hash of scraped raw HTML/text
  deduplicationFingerprint?: string; // Fingerprint for fast lookup
  crawlDepth?: number;
  httpStatus?: number;
  pageLanguage?: string;
  lastCrawledAt?: string;
}

export interface AIExtractionMetadata {
  modelName?: string; // e.g. "gemini-2.5-pro", "gemini-2.5-flash"
  extractedAt?: string; // ISO timestamp
  aiConfidence: number; // 0 to 100 confidence percentage score
  confidenceBreakdown?: {
    title?: number;
    deadline?: number;
    amount?: number;
    eligibility?: number;
    requirements?: number;
  };
  extractionFlags?: string[]; // e.g. ['estimated_deadline', 'inferred_category', 'unspecified_amount']
  promptVersion?: string;
  rawAiExtraction?: Record<string, unknown>;
}

export interface DuplicateDetectionMetadata {
  deduplicationHash: string; // Deterministic normalized hash: lower(title) + lower(provider) + deadline
  duplicateOfId?: string; // Points to primary canonical opportunity ID if duplicate
  similarityScore?: number; // 0 to 100 percentage match against canonical
  isCanonical?: boolean; // Whether this is the master record
  matchedPreviousIds?: string[];
}

export interface AdminVerificationMetadata {
  verifiedBy?: string; // Admin user ID or email
  verifiedAt?: string; // ISO date-time
  verificationStatus: 'Unverified' | 'Under Review' | 'Verified' | 'Verification Expired' | 'Rejected';
  adminNotes?: string; // Internal editorial review notes
  rejectionReason?: string; // Reason if status is 'Rejected'
  manualOverrides?: string[]; // List of fields manually edited by an admin
}

export interface DeadlineMonitoringMetadata {
  deadline: string; // Formatted YYYY-MM-DD or ISO string
  daysLeft?: number;
  isFlexible?: boolean;
  isRolling?: boolean;
  isPassed?: boolean;
  timezone?: string;
  applicationOpeningDate?: string;
  lastCheckedAt?: string;
}

// =============================================================================
// 3. MASTER OPPORTUNITY SCHEMA: FundEchoOpportunityDoc
// =============================================================================

export interface FundEchoOpportunityDoc {
  // Primary Identifiers
  id: string; // Firestore document ID
  slug?: string; // URL-friendly slug

  // Core Presentation Fields (Required by Step 1)
  title: string;
  provider: string; // Organization or institution offering the opportunity
  organization?: string; // Backward-compatible alias for provider
  opportunityType: FundEchoOpportunityType; // Grant, Scholarship, Fellowship, Funding, Competition, Accelerator, Award, etc.
  type?: FundEchoOpportunityType; // Backward-compatible alias for opportunityType

  category: string; // Primary category slug or title (e.g. 'entrepreneurship-business')
  subcategory?: string; // Specific discipline or niche (e.g. 'climate-tech', 'ai-research')
  description: string; // Full opportunity description & program overview

  // Funding Details
  fundingAmount: FundingAmountStructure | number | string;
  currency: string; // Currency code e.g. 'USD', 'EUR', 'GBP'

  // Geography & Eligibility
  eligibleCountries: string[]; // List of ISO country codes or names, e.g. ['Global'] or ['US', 'CA', 'UK']
  eligibleRegions: FundEchoRegion[]; // Continents/macro-regions, e.g. ['Global', 'Europe']
  applicantType: string[] | string; // e.g. ['Startup', 'Non-Profit'] or comma-separated
  eligibilityRequirements: string[] | string; // Bulleted requirements or summary
  eligibility?: string[] | string; // Backward-compatible alias

  // Demographic & Specific Restrictions
  ageRequirements?: AgeRequirements | string;
  genderRequirements?: GenderRequirements | string;
  industry: string[] | string; // e.g. ['Technology', 'Healthcare', 'Clean Energy']
  industryField?: string[] | string; // Alias for industry

  // Critical Dates & Links
  deadline: string; // Closing date (YYYY-MM-DD or ISO string)
  applicationUrl: string; // Direct link to portal or application form
  officialSourceUrl: string; // Primary announcement URL or institution homepage
  sourceUrl?: string; // Backward-compatible alias for officialSourceUrl

  // Application Materials & Guidelines
  requiredDocuments: string[]; // e.g. ['Pitch Deck', 'Financial Statements', 'Resume / CV', 'Letters of Support']
  applicationProcess: string[] | string; // Step-by-step instructions or phase descriptions

  // Lifecycle & Editorial Status (Required: Draft, Pending Review, Published, Expired, Rejected)
  status: FundEchoOpportunityStatus;

  // Provenance, AI & Crawler Tracking
  dateDiscovered: string; // When the crawler or creator first registered the record (YYYY-MM-DD or ISO string)
  lastVerified?: string; // Date of last human or automated verification check
  sourceName: string; // e.g. 'Grants.gov', 'European Commission', 'Direct Ingestion'
  aiConfidence?: number; // 0 to 100 confidence score from AI extraction engine
  adminNotes?: string; // Internal curation and editorial review notes

  // System & Firestore Audit Timestamps
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;

  // Extensible Feature Subsystems
  crawlerMetadata?: CrawlerMetadata;
  aiExtractionMetadata?: AIExtractionMetadata;
  duplicateDetection?: DuplicateDetectionMetadata;
  adminVerification?: AdminVerificationMetadata;
  deadlineMonitoring?: DeadlineMonitoringMetadata;

  // Auxiliary Presentation Helpers
  featured?: boolean;
  verified?: boolean;
  imageUrl?: string;
  tags?: string[];
  daysLeft?: number;
  isSampleData?: boolean;
}

// Type for creating a new opportunity document where timestamps can be omitted
export type FundEchoOpportunityCreateInput = Omit<FundEchoOpportunityDoc, 'createdAt' | 'updatedAt'> & {
  createdAt?: FirestoreDateTime;
  updatedAt?: FirestoreDateTime;
};

// Type for updating an existing opportunity document
export type FundEchoOpportunityUpdateInput = Partial<Omit<FundEchoOpportunityDoc, 'id' | 'createdAt'>> & {
  updatedAt?: FirestoreDateTime;
};
