/**
 * FUNDECHO - OPPORTUNITY SCHEMA VALIDATOR & NORMALIZER (STEP 1)
 * Validation, normalization, duplicate detection hashing, and bidirectional
 * mapping between Firestore opportunity documents and UI representations.
 */

import {
  FundEchoOpportunityDoc,
  FundEchoOpportunityStatus,
  FundEchoOpportunityType,
  FundingAmountStructure,
} from '../types/opportunitySchema';
import { Opportunity } from '../types';

export interface OpportunityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_STATUSES: FundEchoOpportunityStatus[] = [
  'Draft',
  'Pending Review',
  'Published',
  'Expired',
  'Rejected',
];

/**
 * Validates a FundEcho opportunity against Step 1 requirements.
 */
export function validateFundEchoOpportunity(
  data: Partial<FundEchoOpportunityDoc>
): OpportunityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Title
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters.');
  }

  // 2. Provider / Organization
  const provider = data.provider || data.organization;
  if (!provider || typeof provider !== 'string' || provider.trim().length < 2) {
    errors.push('Provider / Organization is required.');
  }

  // 3. Opportunity Type
  const oppType = data.opportunityType || data.type;
  if (!oppType || typeof oppType !== 'string' || oppType.trim().length === 0) {
    errors.push('Opportunity Type is required (e.g. Grant, Scholarship, Fellowship, Competition, etc.).');
  }

  // 4. Category
  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    errors.push('Category is required.');
  }

  // 5. Description
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
    errors.push('Description is required (minimum 10 characters).');
  }

  // 6. Funding Amount & Currency
  if (data.fundingAmount === undefined || data.fundingAmount === null) {
    warnings.push('Funding Amount is not specified.');
  }
  if (!data.currency || typeof data.currency !== 'string') {
    warnings.push('Currency should be specified (defaulting to USD).');
  }

  // 7. Deadline
  if (!data.deadline || typeof data.deadline !== 'string') {
    warnings.push('Deadline is missing or not set.');
  } else {
    const parsed = new Date(data.deadline);
    if (isNaN(parsed.getTime()) && data.deadline.toLowerCase() !== 'rolling') {
      errors.push('Deadline must be a valid date format (YYYY-MM-DD) or "Rolling".');
    }
  }

  // 8. Application URL & Official Source URL
  if (data.applicationUrl) {
    if (!isValidUrl(data.applicationUrl)) {
      warnings.push('Application URL does not appear to be a valid HTTP/HTTPS URL.');
    }
  } else {
    warnings.push('Application URL is recommended.');
  }

  if (data.officialSourceUrl) {
    if (!isValidUrl(data.officialSourceUrl)) {
      warnings.push('Official Source URL does not appear to be a valid HTTP/HTTPS URL.');
    }
  }

  // 9. Status
  if (data.status) {
    const normalizedStatus = normalizeStatusString(data.status);
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
    }
  }

  // 10. AI Confidence check
  if (data.aiConfidence !== undefined && (typeof data.aiConfidence !== 'number' || data.aiConfidence < 0 || data.aiConfidence > 100)) {
    warnings.push('AI Confidence score should be a number between 0 and 100.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Checks if a string is a valid URL.
 */
function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes any variation of status strings into the strict Step 1 status enum.
 */
export function normalizeStatusString(rawStatus?: string): FundEchoOpportunityStatus {
  if (!rawStatus) return 'Draft';
  const clean = rawStatus.trim().toLowerCase();
  if (clean === 'published' || clean === 'open') return 'Published';
  if (clean === 'pending review' || clean === 'pending' || clean === 'reviewing' || clean === 'verifying') return 'Pending Review';
  if (clean === 'expired' || clean === 'closed') return 'Expired';
  if (clean === 'rejected') return 'Rejected';
  return 'Draft';
}

/**
 * Calculates a deterministic deduplication hash to identify duplicate
 * opportunities across different web crawler sources.
 */
export function generateOpportunityDeduplicationHash(
  title: string,
  provider: string,
  deadline?: string
): string {
  const normTitle = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
  const normProvider = (provider || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
  const normDeadline = (deadline || '').split('T')[0].trim();

  // Simple, deterministic string hash algorithm
  const combined = `${normTitle}|${normProvider}|${normDeadline}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `dedup_${Math.abs(hash).toString(36)}`;
}

/**
 * Calculates days left from a deadline string.
 */
export function calculateDeadlineDaysLeft(deadlineStr?: string): number {
  if (!deadlineStr || deadlineStr.toLowerCase() === 'rolling') return 999;
  const deadlineDate = new Date(deadlineStr);
  if (isNaN(deadlineDate.getTime())) return 0;

  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formats a funding amount structure or number into a display text.
 */
export function formatFundingAmountDisplay(
  amount: FundingAmountStructure | number | string | undefined,
  currency = 'USD'
): string {
  if (amount === undefined || amount === null) return 'Funding Available';
  if (typeof amount === 'string') return amount;
  if (typeof amount === 'number') {
    if (amount <= 0) return 'Fully Funded';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  if (amount.displayText) return amount.displayText;
  if (amount.isFullyFunded) return 'Fully Funded';
  if (amount.max) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: amount.currency || currency,
      maximumFractionDigits: 0,
    }).format(amount.max);
  }
  return 'Award Details in Guidelines';
}

/**
 * Normalizes raw input from crawlers, forms, or APIs into a complete FundEchoOpportunityDoc.
 */
export function normalizeOpportunityToSchema(raw: any): FundEchoOpportunityDoc {
  const provider = raw.provider || raw.organization || 'Verified Provider';
  const title = raw.title || 'Untitled Opportunity';
  const deadline = raw.deadline || 'Rolling';
  const deduplicationHash =
    raw.duplicateDetection?.deduplicationHash ||
    generateOpportunityDeduplicationHash(title, provider, deadline);

  const daysLeft = calculateDeadlineDaysLeft(deadline);

  // Normalize amount
  let fundingAmount: FundingAmountStructure | number | string = raw.fundingAmount ?? raw.amount;
  if (typeof fundingAmount === 'number') {
    fundingAmount = {
      max: fundingAmount,
      currency: raw.currency || 'USD',
      displayText: formatFundingAmountDisplay(fundingAmount, raw.currency || 'USD'),
    };
  } else if (!fundingAmount) {
    fundingAmount = {
      max: 0,
      currency: raw.currency || 'USD',
      displayText: 'Varies / Fully Funded',
      isFullyFunded: true,
    };
  }

  // Normalize arrays
  const eligibleCountries = Array.isArray(raw.eligibleCountries)
    ? raw.eligibleCountries
    : raw.country
    ? [raw.country]
    : ['Global'];

  const eligibleRegions = Array.isArray(raw.eligibleRegions)
    ? raw.eligibleRegions
    : raw.region
    ? [raw.region]
    : ['Global'];

  const applicantType = Array.isArray(raw.applicantType)
    ? raw.applicantType
    : raw.targetAudience
    ? [raw.targetAudience]
    : typeof raw.applicantType === 'string'
    ? [raw.applicantType]
    : ['Individual', 'Organization'];

  const eligibilityRequirements = Array.isArray(raw.eligibilityRequirements)
    ? raw.eligibilityRequirements
    : Array.isArray(raw.eligibility)
    ? raw.eligibility
    : typeof raw.eligibility === 'string'
    ? [raw.eligibility]
    : [];

  const requiredDocuments = Array.isArray(raw.requiredDocuments)
    ? raw.requiredDocuments
    : [];

  const applicationProcess = Array.isArray(raw.applicationProcess)
    ? raw.applicationProcess
    : typeof raw.applicationProcess === 'string'
    ? [raw.applicationProcess]
    : [];

  const industry = Array.isArray(raw.industry)
    ? raw.industry
    : Array.isArray(raw.industryField)
    ? raw.industryField
    : raw.category
    ? [raw.category]
    : ['General Innovation'];

  const nowIso = new Date().toISOString();

  return {
    id: raw.id || `opp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slug: raw.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title,
    provider,
    organization: provider,
    opportunityType: (raw.opportunityType || raw.type || 'Grant') as FundEchoOpportunityType,
    type: (raw.opportunityType || raw.type || 'Grant') as FundEchoOpportunityType,
    category: raw.category || 'entrepreneurship-business',
    subcategory: raw.subcategory || '',
    description: raw.description || raw.summary || 'Comprehensive opportunity details will be available shortly.',
    fundingAmount,
    currency: raw.currency || 'USD',
    eligibleCountries,
    eligibleRegions,
    applicantType,
    eligibilityRequirements,
    eligibility: eligibilityRequirements,
    ageRequirements: raw.ageRequirements,
    genderRequirements: raw.genderRequirements,
    industry,
    industryField: industry,
    deadline,
    applicationUrl: raw.applicationUrl || raw.url || '#',
    officialSourceUrl: raw.officialSourceUrl || raw.sourceUrl || raw.applicationUrl || '#',
    sourceUrl: raw.officialSourceUrl || raw.sourceUrl || raw.applicationUrl || '#',
    requiredDocuments,
    applicationProcess,
    status: normalizeStatusString(raw.status || raw.publicationStatus),
    dateDiscovered: raw.dateDiscovered || raw.datePosted || nowIso.split('T')[0],
    lastVerified: raw.lastVerified || raw.lastVerifiedDate || nowIso.split('T')[0],
    sourceName: raw.sourceName || raw.source || 'FundEcho Network',
    aiConfidence: typeof raw.aiConfidence === 'number' ? raw.aiConfidence : 90,
    adminNotes: raw.adminNotes || raw.internalNotes || '',
    createdAt: raw.createdAt || nowIso,
    updatedAt: raw.updatedAt || nowIso,
    featured: Boolean(raw.featured),
    verified: Boolean(raw.verified),
    imageUrl: raw.imageUrl,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    daysLeft,
    duplicateDetection: {
      deduplicationHash,
      isCanonical: raw.duplicateDetection?.isCanonical ?? true,
    },
    deadlineMonitoring: {
      deadline,
      daysLeft,
      isPassed: daysLeft === 0 && deadline.toLowerCase() !== 'rolling',
      isRolling: deadline.toLowerCase() === 'rolling',
      lastCheckedAt: nowIso,
    },
  };
}

/**
 * Bidirectional conversion: Maps a FundEchoOpportunityDoc to the existing UI Opportunity model.
 */
export function mapOpportunityDocToUIOpportunity(doc: FundEchoOpportunityDoc): Opportunity {
  const amountObj = typeof doc.fundingAmount === 'object' && doc.fundingAmount !== null && 'max' in doc.fundingAmount
    ? (doc.fundingAmount as FundingAmountStructure)
    : {
        max: typeof doc.fundingAmount === 'number' ? doc.fundingAmount : 0,
        currency: doc.currency || 'USD',
        displayText: formatFundingAmountDisplay(doc.fundingAmount, doc.currency),
      };

  const statusMap: Record<FundEchoOpportunityStatus, 'Open' | 'Closing Soon' | 'Reviewing' | 'Closed'> = {
    Published: (doc.daysLeft ?? 999) <= 7 ? 'Closing Soon' : 'Open',
    Draft: 'Reviewing',
    'Pending Review': 'Reviewing',
    Expired: 'Closed',
    Rejected: 'Closed',
  };

  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug || doc.id,
    organization: doc.provider || doc.organization || 'Verified Provider',
    provider: doc.provider || doc.organization || 'Verified Provider',
    type: (doc.opportunityType || doc.type || 'Grant') as any,
    category: doc.category,
    amount: amountObj,
    deadline: doc.deadline,
    daysLeft: doc.daysLeft ?? calculateDeadlineDaysLeft(doc.deadline),
    location: doc.eligibleCountries?.join(', ') || doc.eligibleRegions?.join(', ') || 'Global',
    eligibleCountries: doc.eligibleCountries,
    region: (doc.eligibleRegions?.[0] || 'Global') as any,
    verified: Boolean(doc.verified),
    featured: Boolean(doc.featured),
    status: statusMap[doc.status] || 'Open',
    publicationStatus: doc.status === 'Published' ? 'Published' : doc.status === 'Pending Review' ? 'Pending Review' : doc.status === 'Expired' ? 'Expired' : 'Draft',
    tags: doc.tags || [],
    summary: doc.description ? doc.description.slice(0, 160) + (doc.description.length > 160 ? '...' : '') : '',
    description: doc.description,
    eligibility: Array.isArray(doc.eligibilityRequirements)
      ? doc.eligibilityRequirements
      : typeof doc.eligibilityRequirements === 'string'
      ? [doc.eligibilityRequirements]
      : [],
    requirements: Array.isArray(doc.requiredDocuments) && doc.requiredDocuments.length > 0
      ? doc.requiredDocuments
      : ['Valid ID / Organization registration', 'Application proposal form'],
    requiredDocuments: doc.requiredDocuments || [],
    applicationProcess: Array.isArray(doc.applicationProcess)
      ? doc.applicationProcess
      : typeof doc.applicationProcess === 'string'
      ? [doc.applicationProcess]
      : ['Review guidelines', 'Submit application portal'],
    targetAudience: Array.isArray(doc.applicantType) ? doc.applicantType.join(', ') : doc.applicantType || 'Eligible Applicants',
    awardDetails: formatFundingAmountDisplay(doc.fundingAmount, doc.currency),
    applicationUrl: doc.applicationUrl,
    officialSourceUrl: doc.officialSourceUrl,
    datePosted: doc.dateDiscovered || new Date().toISOString().split('T')[0],
    lastUpdated: typeof doc.updatedAt === 'string' ? doc.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
    source: doc.sourceName,
    internalNotes: doc.adminNotes,
  };
}
