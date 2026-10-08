/**
 * FUNDORA - DATA VALIDATION FOR FIRESTORE WRITES (STEP 17)
 * Reusable validation suite protecting database integrity before executing writes.
 */

import {
  FirestoreOpportunity,
  FirestoreUserProfile,
  FirestoreAffiliateOffer,
  FirestoreApplication,
  OpportunityStatus,
  VerificationStatus,
  SourceType,
  ApplicationStatus,
} from '../../../types/firebase';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// =============================================================================
// HELPER VALIDATORS
// =============================================================================

export function isValidId(id: string): boolean {
  return typeof id === 'string' && id.trim().length > 0 && id.length <= 128 && !id.includes('/');
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 254;
}

export function isSafeUrl(url: string): boolean {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isValidDateString(dateStr: string): boolean {
  if (typeof dateStr !== 'string') return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export function isNonEmptyString(val: any, minLen = 1, maxLen = 5000): boolean {
  return typeof val === 'string' && val.trim().length >= minLen && val.trim().length <= maxLen;
}

export function isValidStringArray(arr: any, minItems = 0, maxItems = 100): boolean {
  if (!Array.isArray(arr)) return false;
  if (arr.length < minItems || arr.length > maxItems) return false;
  return arr.every((item) => typeof item === 'string' && item.trim().length > 0 && item.length <= 200);
}

// =============================================================================
// USER PROFILE VALIDATOR
// =============================================================================

export function validateUserProfile(profile: Partial<FirestoreUserProfile>): ValidationResult {
  const errors: string[] = [];

  if (!profile.userId || !isValidId(profile.userId)) {
    errors.push('Invalid or missing userId.');
  }

  if (profile.country !== undefined && !isNonEmptyString(profile.country, 1, 100)) {
    errors.push('Country must be a valid string (1-100 characters).');
  }

  if (profile.interests && !isValidStringArray(profile.interests, 0, 50)) {
    errors.push('Interests must be an array of valid strings.');
  }

  if (profile.fundingTypes && !isValidStringArray(profile.fundingTypes, 0, 20)) {
    errors.push('Funding types must be an array of valid strings.');
  }

  if (profile.profileCompletion !== undefined) {
    if (typeof profile.profileCompletion !== 'number' || profile.profileCompletion < 0 || profile.profileCompletion > 100) {
      errors.push('Profile completion must be a number between 0 and 100.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// OPPORTUNITY VALIDATOR
// =============================================================================

const VALID_OPPORTUNITY_STATUSES: string[] = [
  'draft',
  'pendingReview',
  'published',
  'expired',
  'archived',
  'Draft',
  'Pending Review',
  'Published',
  'Expired',
  'Rejected',
];

const VALID_VERIFICATION_STATUSES: string[] = [
  'unverified',
  'underReview',
  'verified',
  'verificationExpired',
  'Unverified',
  'Under Review',
  'Verified',
  'Verification Expired',
  'Rejected',
];

export function validateOpportunity(
  opportunity: Partial<FirestoreOpportunity & { provider?: string; officialSourceUrl?: string }>
): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(opportunity.title, 3, 300)) {
    errors.push('Title is required and must be between 3 and 300 characters.');
  }

  const provider = opportunity.providerName || opportunity.provider;
  if (!isNonEmptyString(provider, 2, 200)) {
    errors.push('Provider name is required and must be between 2 and 200 characters.');
  }

  if (!isNonEmptyString(opportunity.description, 10, 20000)) {
    errors.push('Description is required (minimum 10 characters).');
  }

  if (!opportunity.category || !isNonEmptyString(opportunity.category, 2, 100)) {
    errors.push('Category is required.');
  }

  if (opportunity.deadline && !isValidDateString(opportunity.deadline) && opportunity.deadline.toLowerCase() !== 'rolling') {
    errors.push('Deadline must be a valid date string or "Rolling".');
  }

  if (opportunity.applicationUrl && !isSafeUrl(opportunity.applicationUrl)) {
    errors.push('Application URL must be a valid http or https URL.');
  }

  const sourceUrl = opportunity.sourceUrl || opportunity.officialSourceUrl;
  if (sourceUrl && !isSafeUrl(sourceUrl)) {
    errors.push('Source URL must be a valid http or https URL.');
  }

  if (opportunity.status && !VALID_OPPORTUNITY_STATUSES.includes(opportunity.status)) {
    errors.push(`Invalid opportunity status: ${opportunity.status}`);
  }

  if (opportunity.verificationStatus && !VALID_VERIFICATION_STATUSES.includes(opportunity.verificationStatus)) {
    errors.push(`Invalid verification status: ${opportunity.verificationStatus}`);
  }

  if (opportunity.eligibleCountries && !isValidStringArray(opportunity.eligibleCountries, 0, 300)) {
    errors.push('Eligible countries must be a valid array of strings.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// APPLICATION VALIDATOR
// =============================================================================

const VALID_APPLICATION_STATUSES: ApplicationStatus[] = [
  'draft',
  'inProgress',
  'readyForReview',
  'submitted',
  'archived',
];

export function validateApplication(app: Partial<FirestoreApplication>): ValidationResult {
  const errors: string[] = [];

  if (!app.userId || !isValidId(app.userId)) {
    errors.push('Application must specify a valid userId.');
  }

  if (!app.opportunityId || !isValidId(app.opportunityId)) {
    errors.push('Application must specify a valid opportunityId.');
  }

  if (app.currentStep !== undefined && (typeof app.currentStep !== 'number' || app.currentStep < 1 || app.currentStep > 9)) {
    errors.push('Application currentStep must be an integer between 1 and 9.');
  }

  if (app.status && !VALID_APPLICATION_STATUSES.includes(app.status)) {
    errors.push(`Invalid application status: ${app.status}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// AFFILIATE OFFER VALIDATOR
// =============================================================================

export function validateAffiliateOffer(offer: Partial<FirestoreAffiliateOffer>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(offer.partnerName, 2, 200)) {
    errors.push('Partner name is required.');
  }

  if (!isNonEmptyString(offer.title, 3, 200)) {
    errors.push('Title is required.');
  }

  if (!offer.affiliateUrl || !isSafeUrl(offer.affiliateUrl)) {
    errors.push('Affiliate URL must be a valid safe URL.');
  }

  if (offer.minimumMatchScore !== undefined && (typeof offer.minimumMatchScore !== 'number' || offer.minimumMatchScore < 0 || offer.minimumMatchScore > 100)) {
    errors.push('Minimum match score must be between 0 and 100.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
