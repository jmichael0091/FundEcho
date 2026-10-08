/**
 * FUNDECHO - CRAWLER PIPELINE & FIRESTORE DATA STRUCTURE (STEP 2)
 * Scalable schemas, relationships, enums, and types for FundEcho's global
 * web crawler, AI extraction pipeline, verification queue, and administrative auditing.
 *
 * Core Collections:
 * 1. "opportunities"     - Published & verified opportunities catalog
 * 2. "drafts"            - Opportunities discovered by crawler awaiting review
 * 3. "sources"           - Websites & organizations monitored by FundEcho
 * 4. "crawlJobs"         - Crawler execution tasks, schedules, and statuses
 * 5. "crawlResults"      - Raw page captures, content hashes, and AI extractions
 * 6. "verificationQueue" - Admin curation & audit queue records
 * 7. "duplicates"        - Detected duplicate opportunities & resolution tracking
 * 8. "adminLogs"         - Comprehensive audit log of editorial & administrative actions
 */

import { FieldValue, Timestamp } from 'firebase/firestore';
import {
  FundEchoOpportunityDoc,
  FundEchoOpportunityType,
  FundEchoOpportunityStatus,
  FundingAmountStructure,
  FirestoreDateTime,
} from './opportunitySchema';

export type { FirestoreDateTime };

// =============================================================================
// 1. COLLECTION NAMES DEFINITION
// =============================================================================

export const PIPELINE_COLLECTIONS = {
  OPPORTUNITIES: 'opportunities',
  DRAFTS: 'drafts',
  SOURCES: 'sources',
  CRAWL_JOBS: 'crawlJobs',
  CRAWL_RESULTS: 'crawlResults',
  VERIFICATION_QUEUE: 'verificationQueue',
  DUPLICATES: 'duplicates',
  ADMIN_LOGS: 'adminLogs',
} as const;

// =============================================================================
// 2. DRAFTS COLLECTION ("drafts/{draftId}")
// =============================================================================

export type DraftStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface OpportunityDraftDoc extends Omit<FundEchoOpportunityDoc, 'id' | 'status'> {
  id: string; // Document ID: e.g. "draft_1727568000_abc12"
  status: DraftStatus;

  // Provenance & Linkages
  sourceId: string; // References sources/{sourceId}
  sourceName: string;
  sourceDomain?: string;
  crawlJobId?: string; // References crawlJobs/{jobId}
  crawlResultId?: string; // References crawlResults/{resultId}
  rawContentHash?: string; // SHA-256 for change detection

  // AI Extraction Quality
  aiConfidence: number; // 0 to 100 percentage
  extractionModel?: string; // e.g. "gemini-2.5-flash"
  extractionFlags?: string[]; // e.g. ['inferred_deadline', 'partial_eligibility']

  // Duplicate Check
  deduplicationHash: string; // Hash: lower(title) + lower(provider) + deadline
  isDuplicateSuspected: boolean;
  suspectedDuplicateOfId?: string; // References opportunities/{oppId} or drafts/{draftId}
  duplicateSimilarityScore?: number; // 0 to 100

  // Admin Review State
  assignedToAdminId?: string;
  reviewedBy?: string;
  reviewedAt?: FirestoreDateTime | null;
  publishedOpportunityId?: string; // Set when approved into opportunities collection
  rejectionReason?: string;
  adminNotes?: string;

  // Timestamps
  discoveredAt: FirestoreDateTime;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 3. SOURCES COLLECTION ("sources/{sourceId}")
// =============================================================================

export type SourceType =
  | 'Government'
  | 'Foundation'
  | 'NGO'
  | 'University'
  | 'Corporation'
  | 'Accelerator'
  | 'official_funder'
  | 'government_portal'
  | 'international_org'
  | 'aggregator'
  | 'university'
  | 'corporate_csr'
  | 'foundation'
  | string;

export type SourceFeedType =
  | 'html_scraper'
  | 'rss_atom'
  | 'json_api'
  | 'sitemap_crawler'
  | 'manual_entry';

export type SourceStatus = 'Active' | 'Paused' | 'active' | 'paused' | 'error' | 'deprecated';

export type SourceTrustLevel = 'High' | 'Medium' | 'Low' | 'Verified' | string;

export interface CrawlerSourceDoc {
  id: string; // Document ID: e.g. "source_gates_foundation"
  
  // Step 3 Core Identity & Configuration
  sourceName: string; // Source display name
  name: string; // Alias for sourceName
  organization: string; // Organization / Legal entity name
  websiteUrl: string; // Target root URL (e.g. "https://www.gatesfoundation.org")
  baseUrl: string; // Alias for websiteUrl
  domain: string; // Normalized domain: "gatesfoundation.org"
  targetUrls: string[]; // Specific URLs, feeds, or endpoints to monitor
  
  countryRegion: string; // Geographic scope e.g. "Global", "United States", "Europe"
  region: string; // Alias for countryRegion
  countries: string[]; // List of specific country ISO codes / names
  
  sourceType: SourceType; // Government, Foundation, NGO, University, Corporation, Accelerator
  opportunityCategories: string[]; // Target opportunity categories
  categories: string[]; // Alias for opportunityCategories
  fundingTypes?: FundEchoOpportunityType[]; // ["Grant", "Fellowship"]
  
  trustLevel: SourceTrustLevel; // High, Medium, Low, Verified
  status: SourceStatus; // Active / Paused
  crawlFrequency: string; // e.g. "Every 6 Hours", "Every 12 Hours", "Daily (24h)", "Weekly"
  crawlFrequencyHours: number; // Numeric interval in hours (e.g. 6, 12, 24, 72, 168)
  
  lastCrawled?: string | FirestoreDateTime | null;
  lastCrawledAt?: FirestoreDateTime | null;
  nextScheduledCrawl?: string | FirestoreDateTime | null;
  nextCrawlScheduledAt?: FirestoreDateTime | null;
  
  notes?: string; // Editorial and administrative notes
  
  // Feed Architecture & Operational Metrics
  feedType?: SourceFeedType;
  reliabilityScore?: number; // 0 to 100 based on validation success history
  rateLimitMs?: number; // Delay between requests in milliseconds (default 1000ms)
  totalOpportunitiesDiscovered?: number;
  totalOpportunitiesPublished?: number;
  consecutiveErrors?: number;
  lastErrorMessage?: string;

  crawlerConfig?: {
    selectorOverrides?: Record<string, string>;
    headers?: Record<string, string>;
    customPaginationParam?: string;
    maxDepth?: number;
    requiresJavascript?: boolean;
  };

  // Timestamps
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 4. CRAWL JOBS COLLECTION ("crawlJobs/{jobId}")
// =============================================================================

export type CrawlJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type CrawlTriggerType = 'scheduler' | 'manual_admin' | 'webhook' | 'retry';

export interface CrawlJobErrorLog {
  url?: string;
  message: string;
  statusCode?: number;
  timestamp: string;
}

export interface CrawlJobDoc {
  id: string; // Document ID: e.g. "job_1727568000_source123"
  sourceId: string; // References sources/{sourceId}
  sourceName: string;
  sourceDomain: string;
  status: CrawlJobStatus;
  triggeredBy: CrawlTriggerType;
  triggeredByUserId?: string; // Admin UID if manually triggered

  // Execution Metrics
  startedAt?: FirestoreDateTime | null;
  completedAt?: FirestoreDateTime | null;
  durationSeconds?: number;
  pagesScrapedCount: number;
  opportunitiesFoundCount: number;
  draftsCreatedCount: number;
  duplicatesSkippedCount: number;
  errorsCount: number;

  // Detailed Logs & Diagnostics
  errorLogs?: CrawlJobErrorLog[];
  summaryMessage?: string;
  crawlerWorkerId?: string; // Worker container/instance identifier

  // Timestamps
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 5. CRAWL RESULTS COLLECTION ("crawlResults/{resultId}")
// =============================================================================

export type CrawlResultStatus =
  | 'unprocessed'
  | 'drafted'
  | 'discarded'
  | 'duplicate_skipped'
  | 'failed';

export interface CrawlResultDoc {
  id: string; // Document ID: e.g. "cres_1727568000_abc"
  crawlJobId: string; // References crawlJobs/{jobId}
  sourceId: string; // References sources/{sourceId}
  sourceName?: string; // Source portal name
  sourceUrl: string; // Scraped web page URL
  url?: string; // Alias for sourceUrl
  pageTitle?: string;

  // Step 4 Discovery Metadata
  opportunityType?: string; // Grant, Scholarship, Fellowship, Funding, Competition, Accelerator, Award, etc.
  discoveryDate?: string; // Date string: YYYY-MM-DD
  discoveredAt?: FirestoreDateTime | string;
  relevanceKeywords?: string[]; // Matched opportunity indicators
  confidenceScore?: number; // 0 to 100

  // Deduplication & Content Fingerprint
  rawContentHash: string; // SHA-256 hash of extracted text/HTML
  rawHtmlSnippet?: string; // Stored excerpt for debugging / verification
  pageLanguage?: string;
  httpStatusCode?: number;

  // AI Extraction Result
  aiExtractionModel?: string; // e.g. "gemini-2.5-flash"
  aiConfidence?: number; // 0 to 100
  extractedPayload?: Record<string, unknown>; // Parsed raw JSON structure
  parsedOpportunityDraftId?: string; // References drafts/{draftId} if created

  status: CrawlResultStatus;
  processingError?: string;

  // Timestamps
  createdAt: FirestoreDateTime;
  updatedAt?: FirestoreDateTime;
}

// =============================================================================
// 6. VERIFICATION QUEUE COLLECTION ("verificationQueue/{queueId}")
// =============================================================================

export type VerificationQueueItemType =
  | 'opportunity_draft'
  | 'opportunity_update'
  | 'reported_issue'
  | 'deadline_extension';

export type VerificationQueuePriority = 'urgent' | 'high' | 'medium' | 'low';
export type VerificationQueueStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'escalated';

export interface VerificationChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  checkedBy?: string;
  checkedAt?: string;
}

export interface VerificationQueueDoc {
  id: string; // Document ID: e.g. "vq_draft_123"
  itemType: VerificationQueueItemType;
  targetId: string; // References drafts/{draftId} or opportunities/{oppId}
  targetTitle: string;
  targetProvider: string;
  sourceId?: string; // References sources/{sourceId}
  sourceName?: string;

  priority: VerificationQueuePriority;
  status: VerificationQueueStatus;
  aiConfidence: number; // 0 to 100

  // Admin Assignment & Decision
  assignedAdminId?: string;
  assignedAdminName?: string;
  assignedAt?: FirestoreDateTime | null;
  completedAt?: FirestoreDateTime | null;
  completedByAdminId?: string;
  verificationNotes?: string;
  rejectionReason?: string;

  // Verification Checklist Items
  checklist: VerificationChecklistItem[];
  tags: string[];
  deadline?: string;

  // Timestamps
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 7. DUPLICATES COLLECTION ("duplicates/{duplicateId}")
// =============================================================================

export type DuplicateDetectionStrategy =
  | 'deterministic_hash'
  | 'ai_semantic'
  | 'fuzzy_title_org'
  | 'canonical_url_match';

export type DuplicateResolutionStatus =
  | 'detected'
  | 'merged'
  | 'dismissed'
  | 'pending_admin_decision';

export interface DuplicateRecordDoc {
  id: string; // Document ID: e.g. "dup_deduphash_123"
  deduplicationHash: string;
  detectionStrategy: DuplicateDetectionStrategy;
  similarityScore: number; // 0 to 100 percentage match

  // Opportunity Entities
  canonicalOpportunityId: string; // Master opportunity ID (in opportunities or drafts)
  duplicateCandidateId: string; // Duplicate opportunity ID (in drafts or crawlResults)
  canonicalTitle: string;
  duplicateTitle: string;
  canonicalProvider: string;
  duplicateProvider: string;
  canonicalDeadline?: string;
  duplicateDeadline?: string;
  canonicalUrl?: string;
  duplicateUrl?: string;

  // Resolution Lifecycle
  status: DuplicateResolutionStatus;
  resolutionDecision?: 'kept_canonical' | 'merged_data' | 'marked_unique' | 'superseded';
  decisionNotes?: string;
  resolvedByAdminId?: string;
  resolvedAt?: FirestoreDateTime | null;

  // Timestamps
  detectedAt: FirestoreDateTime;
  createdAt: FirestoreDateTime;
  updatedAt: FirestoreDateTime;
}

// =============================================================================
// 8. ADMIN LOGS COLLECTION ("adminLogs/{logId}")
// =============================================================================

export type AdminActionType =
  | 'opportunity_publish'
  | 'opportunity_edit'
  | 'opportunity_archive'
  | 'opportunity_delete'
  | 'draft_approve'
  | 'draft_reject'
  | 'draft_edit'
  | 'source_create'
  | 'source_update'
  | 'source_pause'
  | 'source_delete'
  | 'crawl_trigger'
  | 'crawl_cancel'
  | 'duplicate_merge'
  | 'duplicate_dismiss'
  | 'verification_assigned'
  | 'verification_completed'
  | 'system_settings_update';

export interface AdminLogDoc {
  id: string; // Document ID: e.g. "alog_1727568000_abc"
  adminId: string; // UID of admin
  adminEmail: string;
  adminName?: string;
  actionType: AdminActionType;

  // Target Entity Details
  targetCollection:
    | 'opportunities'
    | 'drafts'
    | 'sources'
    | 'crawlJobs'
    | 'crawlResults'
    | 'verificationQueue'
    | 'duplicates'
    | string;
  targetId: string;
  targetTitle?: string;

  // Change Tracking
  details: string; // Human-readable summary: "Approved draft opp_123 and published to global catalog"
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;

  // Environment & Audit Context
  ipAddress?: string;
  userAgent?: string;
  timestamp: FirestoreDateTime;
  createdAt: FirestoreDateTime;
}
