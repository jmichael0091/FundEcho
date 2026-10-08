/**
 * FUNDORA - FIRESTORE SERVICE ENGINE (STEP 19)
 * Direct connection layer for Firestore collections:
 * - funding_opportunities
 * - saved_opportunities
 * - users
 * - applications
 * - notifications
 * - categories
 * - affiliate_offers
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  orderBy,
  serverTimestamp,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FIRESTORE_COLLECTIONS,
  FirestoreFundingOpportunityDoc,
  FundingOpportunityStatus,
  FirestoreSavedOpportunityDoc,
  FirestoreUserDoc,
} from '../../types/firebase';
import { Opportunity, OpportunityType, OpportunityRegion } from '../../types';
import { OpportunityFormData } from '../../types/admin';
import { SAMPLE_OPPORTUNITIES } from '../../data/sampleOpportunities';

export type OperationType = 'create' | 'read' | 'update' | 'delete' | 'list';

export interface FirestoreErrorDetails {
  message: string;
  code: string;
  operationType: OperationType;
  path: string | null;
}

/**
 * Standardized Firestore error handler adhering to skill standards.
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorDetails {
  const code = (error as { code?: string })?.code || 'unknown';
  const rawMessage = (error as { message?: string })?.message || String(error);
  let userFriendly = 'An error occurred while communicating with the database.';

  if (code === 'permission-denied') {
    userFriendly = 'Permission denied. Please verify that your account has appropriate permissions.';
  } else if (code === 'not-found') {
    userFriendly = 'The requested opportunity or record was not found.';
  } else if (code === 'unavailable') {
    userFriendly = 'The database service is currently offline or unreachable. Please verify your connection.';
  } else if (rawMessage.includes('client is offline')) {
    userFriendly = 'You appear to be offline. Please check your internet connection.';
  }

  console.warn(`[FUNDORA Firestore] ${operationType.toUpperCase()} on ${path || 'unknown'} failed:`, error);

  return {
    message: userFriendly,
    code,
    operationType,
    path,
  };
}

/**
 * Validates Firestore connectivity as mandated by the skill rules.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  try {
    // Attempt real server ping per Firebase skill specification
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[FUNDORA Firestore] Offline or restricted network detected. Operating with offline resilience.');
      return false;
    }
    // A permission-denied or not-found response from server also confirms connection is alive
    return true;
  }
}

/**
 * Helper to calculate remaining days until a deadline.
 */
function calculateDaysRemaining(deadlineStr: string): number {
  if (!deadlineStr) return 30;
  try {
    const deadlineDate = new Date(deadlineStr);
    deadlineDate.setHours(23, 59, 59, 999);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 30 : diffDays;
  } catch {
    return 30;
  }
}

/**
 * Formats monetary amounts gracefully.
 */
function formatAmountDisplay(amount: number | string, currency = 'USD'): string {
  if (typeof amount === 'string' && (amount.includes('$') || amount.includes('€') || amount.includes('£') || amount.includes('–') || amount.includes('-'))) {
    return amount;
  }
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(numeric) || numeric === 0) {
    return 'Fully Funded / Award-Based';
  }
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  return `${symbol}${numeric.toLocaleString()}`;
}

/**
 * Maps country/string to a primary OpportunityRegion.
 */
function deriveRegion(country: string): OpportunityRegion {
  const c = (country || '').toLowerCase();
  if (c.includes('global') || c.includes('worldwide') || c.includes('any')) return 'Global';
  if (c.includes('nigeria') || c.includes('ghana') || c.includes('kenya') || c.includes('south africa') || c.includes('rwanda') || c.includes('africa')) return 'Africa';
  if (c.includes('united states') || c.includes('usa') || c.includes('canada') || c.includes('america')) return 'North America';
  if (c.includes('uk') || c.includes('united kingdom') || c.includes('germany') || c.includes('france') || c.includes('europe')) return 'Europe';
  if (c.includes('singapore') || c.includes('india') || c.includes('japan') || c.includes('australia') || c.includes('asia')) return 'Asia-Pacific';
  if (c.includes('brazil') || c.includes('mexico') || c.includes('colombia') || c.includes('latin')) return 'Latin America';
  if (c.includes('uae') || c.includes('emirates') || c.includes('saudi') || c.includes('middle east')) return 'Middle East';
  return 'Global';
}

/**
 * Converts a Firestore funding_opportunities document into the frontend Opportunity model.
 * Implements Step 20 deadline-aware automatic expiration detection without permanently deleting.
 */
export function convertFirestoreDocToOpportunity(
  docId: string,
  data: Partial<FirestoreFundingOpportunityDoc> & Record<string, any>
): Opportunity {
  const rawDays = calculateDaysRemaining(data.deadline || '');
  const isDeadlinePassed = rawDays < 0;
  const days = Math.max(0, rawDays);
  const currency = data.currency || 'USD';
  const displayAmount = data.amount ? formatAmountDisplay(data.amount, currency) : '$50,000 – $100,000';
  
  // Extract or parse numeric amount bounds
  let maxAmount = 100000;
  let minAmount = 25000;
  if (typeof data.amount === 'number') {
    maxAmount = data.amount;
    minAmount = data.amount;
  } else if (typeof data.amount === 'string') {
    const numbers = data.amount.replace(/[^0-9]/g, ' ').trim().split(/\s+/).map(Number).filter(n => !isNaN(n) && n > 0);
    if (numbers.length >= 2) {
      minAmount = Math.min(...numbers);
      maxAmount = Math.max(...numbers);
    } else if (numbers.length === 1) {
      maxAmount = numbers[0];
      minAmount = numbers[0];
    }
  }

  const eligibilityArr = Array.isArray(data.eligibility)
    ? data.eligibility
    : data.eligibility
    ? [String(data.eligibility)]
    : ['Open to international founders, researchers, students, and organizations.'];

  const providerName = data.provider || data.organization || 'Funding Institution';
  const initials = providerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('') || 'FD';

  // Step 20: Deadline-aware expiration handling
  // If an opportunity has passed its deadline, it should no longer appear as Open.
  // The application identifies expired opportunities and displays "Expired" / "Closed" appropriately.
  const rawStatus = data.status || 'Open';
  const effectiveStatus: FundingOpportunityStatus = (isDeadlinePassed || rawStatus === 'Expired') ? 'Expired' : rawStatus;

  return {
    id: docId,
    title: data.title || 'Untitled Funding Opportunity',
    slug: data.slug || (data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : docId),
    organization: providerName,
    orgInitials: initials,
    orgLogoBg: 'bg-indigo-600',
    type: (data.fundingType || data.type || 'Grant') as OpportunityType,
    category: data.category || 'Grants & Innovation',
    amount: {
      min: minAmount,
      max: maxAmount,
      currency,
      displayText: displayAmount,
      isFullyFunded: displayAmount.toLowerCase().includes('fully funded'),
    },
    deadline: data.deadline || '2026-12-31',
    daysLeft: days,
    location: data.country || data.location || 'Global (Any Country)',
    region: deriveRegion(data.country || data.location || ''),
    verified: Boolean(data.verified),
    featured: Boolean(data.featured),
    status: effectiveStatus === 'Verifying' ? 'Reviewing' : effectiveStatus === 'Expired' ? 'Closed' : 'Open',
    publicationStatus: effectiveStatus === 'Expired' ? 'Expired' : (effectiveStatus === 'Verifying' ? 'Pending Review' : 'Published'),
    adminVerificationStatus: data.verified ? 'Verified' : (effectiveStatus === 'Verifying' ? 'Under Review' : 'Unverified'),
    tags: Array.isArray(data.tags) ? data.tags : ['Verified', 'Funding'],
    eligibilityCriteria: data.eligibilityCriteria || { applicantTypes: [] },
    summary: data.description ? data.description.slice(0, 165) + (data.description.length > 165 ? '...' : '') : 'Comprehensive financial support and technical enablement.',
    description: data.description || 'Full opportunity details and guidelines provided by the sponsoring institution.',
    eligibility: eligibilityArr,
    requirements: Array.isArray(data.requirements) && data.requirements.length > 0
      ? data.requirements
      : [
          'Detailed proposal or program application',
          'Milestone roadmap and budget expenditure forecast',
          'Verified organizational registration or identity documentation',
        ],
    targetAudience: data.targetAudience || 'Eligible entrepreneurs, researchers, and innovators.',
    awardDetails: data.awardDetails || `Direct non-dilutive award with mentorship and networking support (${displayAmount}).`,
    applicationUrl: data.applicationUrl || '#',
    officialSourceUrl: data.applicationUrl || '#',
    imageUrl: data.imageUrl || '',
    datePosted: data.datePosted || (typeof data.createdAt === 'string' ? data.createdAt.split('T')[0] : '2026-08-01'),
    
  };
}

/**
 * Initializes development opportunities in the "funding_opportunities" collection if empty.
 * Implements Step 10 Development Data requirement.
 */
export async function seedDevelopmentOpportunitiesIfEmpty(): Promise<number> {
  if (!isFirebaseConfigured()) return 0;

  try {
    const oppsRef = collection(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES);
    const checkSnap = await getDocs(query(oppsRef, limit(1)));
    if (!checkSnap.empty) {
      // Database already has records, no seeding needed
      return 0;
    }

    console.log('[FUNDORA Firestore] Seeding initial sample opportunities into "funding_opportunities"...');
    const batch = writeBatch(db);
    let count = 0;

    for (const sample of SAMPLE_OPPORTUNITIES) {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, sample.id);
      
      const firestoreRecord: FirestoreFundingOpportunityDoc = {
        id: sample.id,
        title: sample.title,
        provider: sample.organization,
        description: sample.description,
        category: sample.category,
        fundingType: sample.type,
        amount: sample.amount.displayText,
        currency: sample.amount.currency || 'USD',
        country: sample.location,
        eligibleCountries: sample.eligibilityCriteria?.eligibleCountries || ['Global'],
        eligibility: sample.eligibility.join('. '),
        deadline: sample.deadline,
        applicationUrl: sample.applicationUrl,
        imageUrl: (sample as any).imageUrl || '',
        status: (sample.status === 'Closed' ? 'Expired' : sample.status === 'Reviewing' ? 'Verifying' : 'Open') as FundingOpportunityStatus,
        tags: sample.tags,
        featured: Boolean(sample.featured),
        verified: Boolean(sample.verified),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isSampleData: true,
        slug: sample.slug,
        requirements: sample.requirements,
        targetAudience: sample.targetAudience,
        awardDetails: sample.awardDetails,
        datePosted: sample.datePosted,
      };

      batch.set(docRef, firestoreRecord);
      count++;
    }

    await batch.commit();
    console.log(`[FUNDORA Firestore] Successfully seeded ${count} development opportunities into Firestore.`);
    return count;
  } catch (error) {
    handleFirestoreError(error, 'create', FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES);
    return 0;
  }
}

export interface FetchOpportunitiesOptions {
  keyword?: string;
  country?: string;
  fundingType?: string;
  category?: string;
  status?: string;
  limitCount?: number;
}

/**
 * Retrieves opportunities from the "funding_opportunities" collection with resilient filtering.
 */
export async function fetchFundingOpportunitiesFromFirestore(
  options: FetchOpportunitiesOptions = {}
): Promise<{ opportunities: Opportunity[]; error?: string }> {
  if (!isFirebaseConfigured()) {
    return {
      opportunities: SAMPLE_OPPORTUNITIES,
      error: undefined,
    };
  }

  try {
    const oppsRef = collection(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES);
    const constraints: any[] = [];

    // Optional Firestore index-safe constraints
    if (options.status && options.status !== 'all') {
      constraints.push(where('status', '==', options.status));
    }
    if (options.category && options.category !== 'all') {
      constraints.push(where('category', '==', options.category));
    }
    if (options.fundingType && options.fundingType !== 'all') {
      constraints.push(where('fundingType', '==', options.fundingType));
    }

    // Default limit
    constraints.push(limit(options.limitCount || 100));

    let q = query(oppsRef, ...constraints);
    let snapshot = await getDocs(q);

    // If initial query returned empty and database might be unseeded, seed once
    if (snapshot.empty && !options.keyword && (!options.category || options.category === 'all')) {
      const seeded = await seedDevelopmentOpportunitiesIfEmpty();
      if (seeded > 0) {
        snapshot = await getDocs(query(oppsRef, limit(options.limitCount || 100)));
      }
    }

    let results: Opportunity[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return convertFirestoreDocToOpportunity(docSnap.id, data as any);
    });

    // In-memory client search refining for keyword and flexible country matching
    if (options.keyword && options.keyword.trim()) {
      const kw = options.keyword.toLowerCase().trim();
      results = results.filter((o) => {
        return (
          o.title.toLowerCase().includes(kw) ||
          o.organization.toLowerCase().includes(kw) ||
          o.description.toLowerCase().includes(kw) ||
          o.category.toLowerCase().includes(kw) ||
          o.tags.some((t) => t.toLowerCase().includes(kw)) ||
          o.location.toLowerCase().includes(kw)
        );
      });
    }

    if (options.country && options.country !== 'all') {
      const targetCountry = options.country.toLowerCase().trim();
      results = results.filter((o) => {
        const loc = o.location.toLowerCase();
        return loc.includes('global') || loc.includes(targetCountry);
      });
    }

    return { opportunities: results };
  } catch (error) {
    const errDetails = handleFirestoreError(error, 'list', FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES);
    return {
      opportunities: SAMPLE_OPPORTUNITIES,
      error: errDetails.message,
    };
  }
}

/**
 * Fetches a single funding opportunity by its Firestore document ID.
 */
export async function fetchOpportunityByIdFromFirestore(
  opportunityId: string
): Promise<{ opportunity: Opportunity | null; error?: string }> {
  if (!isFirebaseConfigured() || !opportunityId) {
    const fallback = SAMPLE_OPPORTUNITIES.find((o) => o.id === opportunityId) || null;
    return { opportunity: fallback };
  }

  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, opportunityId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return {
        opportunity: convertFirestoreDocToOpportunity(snap.id, snap.data() as any),
      };
    }

    // Try fallback lookup
    const fallback = SAMPLE_OPPORTUNITIES.find((o) => o.id === opportunityId) || null;
    return { opportunity: fallback };
  } catch (error) {
    const errDetails = handleFirestoreError(error, 'read', `${FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES}/${opportunityId}`);
    const fallback = SAMPLE_OPPORTUNITIES.find((o) => o.id === opportunityId) || null;
    return {
      opportunity: fallback,
      error: errDetails.message,
    };
  }
}

/**
 * Saves an opportunity to the top-level "saved_opportunities" collection for an authenticated user.
 */
export async function saveOpportunityToFirestore(
  userId: string,
  opportunityId: string,
  notes = ''
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !userId || !opportunityId) {
    return { success: false, error: 'User must be authenticated to save opportunities.' };
  }

  try {
    const docId = `${userId}_${opportunityId}`;
    const savedRef = doc(db, FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES, docId);
    
    const record: FirestoreSavedOpportunityDoc = {
      id: docId,
      userId,
      opportunityId,
      notes,
      createdAt: serverTimestamp(),
    };

    await setDoc(savedRef, record);
    return { success: true };
  } catch (error) {
    const errDetails = handleFirestoreError(error, 'create', `${FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES}/${userId}_${opportunityId}`);
    return { success: false, error: errDetails.message };
  }
}

/**
 * Removes an opportunity from the "saved_opportunities" collection.
 */
export async function unsaveOpportunityFromFirestore(
  userId: string,
  opportunityId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !userId || !opportunityId) {
    return { success: false, error: 'User must be authenticated.' };
  }

  try {
    const docId = `${userId}_${opportunityId}`;
    const savedRef = doc(db, FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES, docId);
    await deleteDoc(savedRef);
    return { success: true };
  } catch (error) {
    const errDetails = handleFirestoreError(error, 'delete', `${FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES}/${userId}_${opportunityId}`);
    return { success: false, error: errDetails.message };
  }
}

/**
 * Retrieves all saved opportunity IDs for a specific user from Firestore.
 */
export async function fetchUserSavedOpportunityIds(
  userId: string
): Promise<{ savedIds: string[]; error?: string }> {
  if (!isFirebaseConfigured() || !userId) {
    return { savedIds: [] };
  }

  try {
    const savedColl = collection(db, FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES);
    const q = query(savedColl, where('userId', '==', userId));
    const snap = await getDocs(q);

    const ids = snap.docs.map((d) => {
      const data = d.data();
      return (data.opportunityId as string) || d.id.replace(`${userId}_`, '');
    });

    return { savedIds: ids };
  } catch (error) {
    const errDetails = handleFirestoreError(error, 'list', `${FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES}?userId=${userId}`);
    return { savedIds: [], error: errDetails.message };
  }
}

/**
 * Creates or synchronizes a user document in "users" collection with exact Step 19 fields.
 */
export async function syncUserDocumentToFirestore(
  userProfile: {
    uid: string;
    fullName: string;
    email: string;
    country?: string;
    interests?: string[];
    organizationType?: string;
    profileCompleted?: boolean;
    role?: 'user' | 'admin' | 'superAdmin';
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !userProfile.uid) {
    return { success: false };
  }

  try {
    const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userProfile.uid);
    const now = serverTimestamp();

    const userData: FirestoreUserDoc = {
      uid: userProfile.uid,
      id: userProfile.uid,
      fullName: userProfile.fullName || 'Funding Seeker',
      displayName: userProfile.fullName || 'Funding Seeker',
      email: userProfile.email,
      country: userProfile.country || 'Global / Multi-regional',
      interests: userProfile.interests || ['entrepreneurship-business', 'technology-innovation'],
      organizationType: userProfile.organizationType || 'Early-Stage Innovator',
      profileCompleted: Boolean(userProfile.profileCompleted),
      role: userProfile.role || 'user',
      accountStatus: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userDocRef, userData, { merge: true });
    return { success: true };
  } catch (error) {
    const errDetails = handleFirestoreError(error, 'update', `${FIRESTORE_COLLECTIONS.USERS}/${userProfile.uid}`);
    return { success: false, error: errDetails.message };
  }
}

// =============================================================================
// STEP 20: ADMIN FUNDING OPPORTUNITY MANAGEMENT (FIRESTORE)
// Real persistent CRUD, status, verified, and featured controls.
// =============================================================================

/**
 * Validates whether a string is a valid web URL (http:// or https://).
 */
export function isValidOpportunityUrl(urlStr: string): boolean {
  if (!urlStr || !urlStr.trim()) return false;
  try {
    const parsed = new URL(urlStr.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates required fields for opportunity creation/editing.
 */
export function validateOpportunityFormData(formData: Partial<OpportunityFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!formData.title || !formData.title.trim()) {
    errors.push('Opportunity Title is required.');
  }

  const provider = formData.organization || formData.provider;
  if (!provider || !provider.trim()) {
    errors.push('Provider / Organization is required.');
  }

  if (!formData.description || !formData.description.trim()) {
    errors.push('Description is required.');
  }

  const fundingType = formData.type || formData.fundingType;
  if (!fundingType || !fundingType.trim()) {
    errors.push('Funding Type is required.');
  }

  if (!formData.category || !formData.category.trim()) {
    errors.push('Category is required.');
  }

  if (!formData.deadline || !formData.deadline.trim()) {
    errors.push('Application Deadline is required.');
  }

  if (!formData.applicationUrl || !formData.applicationUrl.trim()) {
    errors.push('Application URL is required.');
  } else if (!isValidOpportunityUrl(formData.applicationUrl)) {
    errors.push('Application URL must be a valid web address starting with http:// or https://');
  }

  if (formData.imageUrl && formData.imageUrl.trim() && !isValidOpportunityUrl(formData.imageUrl)) {
    errors.push('Image URL, if provided, must be a valid web address starting with http:// or https://');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Saves a funding opportunity to Firestore funding_opportunities collection.
 * Supports both creating new and updating existing opportunities.
 * Adheres to Step 20 specifications:
 * - Preserves original document ID when editing
 * - Automatically writes/updates createdAt and updatedAt via serverTimestamp()
 * - Does not overwrite createdAt on existing documents
 * - Validates required fields and URLs
 */
export async function saveOpportunityToFirestoreAdmin(
  formData: OpportunityFormData
): Promise<{ success: boolean; id: string; error?: string }> {
  if (!isFirebaseConfigured()) {
    return { success: false, id: '', error: 'Firebase is not initialized.' };
  }

  const validation = validateOpportunityFormData(formData);
  if (!validation.isValid) {
    return { success: false, id: '', error: validation.errors.join(' ') };
  }

  try {
    const isEdit = Boolean(formData.id && formData.id.trim());
    const docId = isEdit
      ? (formData.id as string).trim()
      : (formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) +
        '-' +
        Math.random().toString(36).substring(2, 7));

    const docRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, docId);
    const now = serverTimestamp();

    const provider = formData.organization || formData.provider || 'Funding Institution';
    const fundingType = formData.type || formData.fundingType || 'Grant';
    const currency = formData.currency || 'USD';
    const amountVal = formData.amountDisplayText || (formData.maxAmount ? `$${formData.maxAmount.toLocaleString()}` : '$50,000');
    const country = formData.country || formData.location || 'Global (Any Country)';
    const eligibleCountries = (formData.eligibleCountries && formData.eligibleCountries.length > 0)
      ? formData.eligibleCountries
      : ['Global'];

    const eligibilityText = formData.eligibility || formData.eligibilityRequirements || formData.categoryRequirements || 'Open to all eligible applicants';
    const statusVal: FundingOpportunityStatus = formData.status || 'Open';
    const isVerified = typeof formData.verified === 'boolean' ? formData.verified : (formData.adminVerificationStatus === 'Verified');
    const isFeatured = Boolean(formData.featured);

    const eligibilityCriteria = {
      applicantTypes: formData.applicantTypes || [],
      minimumAge: formData.minimumAge || null,
      maximumAge: formData.maximumAge || null,
      eligibleCountries,
    };
    
    if (isEdit) {
      // Check if doc exists to maintain createdAt
      const existingSnap = await getDoc(docRef);
      const updatePayload: Record<string, any> = {
        title: formData.title.trim(),
        provider: provider.trim(),
        description: formData.description.trim(),
        category: formData.category,
        fundingType,
        amount: amountVal,
        currency,
        country,
        eligibleCountries,
        eligibility: eligibilityText,
        eligibilityCriteria,
        deadline: formData.deadline,
        applicationUrl: formData.applicationUrl.trim(),
        imageUrl: formData.imageUrl ? formData.imageUrl.trim() : '',
        status: statusVal,
        tags: Array.isArray(formData.tags) ? formData.tags : ['Funding'],
        featured: isFeatured,
        verified: isVerified,
        updatedAt: now,
      };

      if (!existingSnap.exists()) {
        // Doc didn't exist yet, also set createdAt
        updatePayload.createdAt = now;
      }

      await setDoc(docRef, updatePayload, { merge: true });
      return { success: true, id: docId };
    } else {
      // New opportunity document
      const newDoc: FirestoreFundingOpportunityDoc = {
        id: docId,
        title: formData.title.trim(),
        provider: provider.trim(),
        description: formData.description.trim(),
        category: formData.category,
        fundingType,
        amount: amountVal,
        currency,
        country,
        eligibleCountries,
        eligibility: eligibilityText,
        eligibilityCriteria,
        deadline: formData.deadline,
        applicationUrl: formData.applicationUrl.trim(),
        imageUrl: formData.imageUrl ? formData.imageUrl.trim() : '',
        status: statusVal,
        tags: Array.isArray(formData.tags) && formData.tags.length > 0 ? formData.tags : ['Funding', 'Verified'],
        featured: isFeatured,
        verified: isVerified,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, newDoc);
      return { success: true, id: docId };
    }
  } catch (error) {
    const errDetails = handleFirestoreError(
      error,
      formData.id ? 'update' : 'create',
      `${FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES}/${formData.id || 'new'}`
    );
    return { success: false, id: '', error: errDetails.message };
  }
}

/**
 * Permanently deletes an opportunity from the Firestore funding_opportunities collection.
 * (Admin protected)
 */
export async function deleteOpportunityFromFirestoreAdmin(
  opportunityId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !opportunityId) {
    return { success: false, error: 'Firebase is not initialized or invalid opportunity ID.' };
  }

  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, opportunityId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    const errDetails = handleFirestoreError(
      error,
      'delete',
      `${FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES}/${opportunityId}`
    );
    return { success: false, error: errDetails.message };
  }
}

/**
 * Updates an opportunity's status ('Open' | 'Verifying' | 'Expired') in Firestore.
 */
export async function updateOpportunityStatusInFirestore(
  opportunityId: string,
  status: FundingOpportunityStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !opportunityId) {
    return { success: false, error: 'Firebase is not configured or missing ID.' };
  }

  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, opportunityId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    const errDetails = handleFirestoreError(
      error,
      'update',
      `${FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES}/${opportunityId}`
    );
    return { success: false, error: errDetails.message };
  }
}

/**
 * Updates an opportunity's verification boolean in Firestore.
 */
export async function updateOpportunityVerificationInFirestore(
  opportunityId: string,
  verified: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !opportunityId) {
    return { success: false, error: 'Firebase is not configured or missing ID.' };
  }

  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, opportunityId);
    await updateDoc(docRef, {
      verified,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    const errDetails = handleFirestoreError(
      error,
      'update',
      `${FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES}/${opportunityId}`
    );
    return { success: false, error: errDetails.message };
  }
}

/**
 * Updates an opportunity's featured boolean in Firestore.
 */
export async function updateOpportunityFeaturedInFirestore(
  opportunityId: string,
  featured: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !opportunityId) {
    return { success: false, error: 'Firebase is not configured or missing ID.' };
  }

  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, opportunityId);
    await updateDoc(docRef, {
      featured,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    const errDetails = handleFirestoreError(
      error,
      'update',
      `${FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES}/${opportunityId}`
    );
    return { success: false, error: errDetails.message };
  }
}
