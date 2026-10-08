/**
 * FUNDORA - OPPORTUNITY SERVICE (STEP 17)
 * Manages institutional funding opportunities, grants, and scholarships in opportunities/{opportunityId}.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreOpportunity,
  FIRESTORE_COLLECTIONS,
  OpportunityStatus,
  VerificationStatus,
  FundEchoOpportunityDoc,
  FundEchoOpportunityCreateInput,
} from '../../types/firebase';
import { validateOpportunity } from './validators';
import { handleFirestoreError } from './firestoreService';
import {
  normalizeOpportunityToSchema,
  validateFundEchoOpportunity,
  generateOpportunityDeduplicationHash,
} from '../../utils/opportunitySchemaValidator';

export interface OpportunityQueryFilters {
  category?: string;
  country?: string;
  fundingType?: string;
  status?: string;
  verificationStatus?: VerificationStatus;
  limitCount?: number;
}

/**
 * Fetches opportunities from funding_opportunities collection for catalog view.
 */
export async function getPublishedOpportunities(
  filters: OpportunityQueryFilters = {}
): Promise<FirestoreOpportunity[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const oppsRef = collection(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES);
    const constraints: any[] = [];

    if (filters.status && filters.status !== 'all') {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters.fundingType && filters.fundingType !== 'all') {
      constraints.push(where('fundingType', '==', filters.fundingType));
    }

    constraints.push(limit(filters.limitCount || 50));

    const q = query(oppsRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirestoreOpportunity[];
  } catch (error) {
    handleFirestoreError(error, 'list', FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES);
    return [];
  }
}

/**
 * Fetches a single opportunity by its ID.
 */
export async function getOpportunityById(
  opportunityId: string
): Promise<FirestoreOpportunity | null> {
  if (!isFirebaseConfigured() || !opportunityId) {
    return null;
  }

  try {
    const oppRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, opportunityId);
    const snap = await getDoc(oppRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as FirestoreOpportunity;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, 'read', `${FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES}/${opportunityId}`);
    return null;
  }
}

/**
 * Creates or stages a new opportunity. (Admin/curator operation)
 * Default verificationStatus is strictly 'unverified'.
 */
export async function createOpportunity(
  opportunity: Omit<FirestoreOpportunity, 'createdAt' | 'updatedAt'>
): Promise<FirestoreOpportunity> {
  const now = serverTimestamp();
  
  const fullRecord: FirestoreOpportunity = {
    ...opportunity,
    status: opportunity.status || 'draft',
    // Rule: Do NOT automatically mark imported or created opportunities as verified
    verificationStatus: opportunity.verificationStatus || 'unverified',
    createdAt: now,
    updatedAt: now,
  };

  const validation = validateOpportunity(fullRecord);
  if (!validation.isValid) {
    throw new Error(`Opportunity validation failed: ${validation.errors.join(', ')}`);
  }

  if (isFirebaseConfigured()) {
    try {
      const oppRef = doc(db, FIRESTORE_COLLECTIONS.OPPORTUNITIES, fullRecord.id);
      await setDoc(oppRef, fullRecord);
    } catch (error) {
      console.error('[OpportunityService] Error persisting opportunity:', error);
      throw error;
    }
  }

  return fullRecord;
}

/**
 * Updates an opportunity's attributes (Admin operation).
 */
export async function updateOpportunity(
  opportunityId: string,
  updates: Partial<FirestoreOpportunity>
): Promise<void> {
  if (!isFirebaseConfigured() || !opportunityId) return;

  try {
    const oppRef = doc(db, FIRESTORE_COLLECTIONS.OPPORTUNITIES, opportunityId);
    await updateDoc(oppRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[OpportunityService] Error updating opportunity ${opportunityId}:`, error);
    throw error;
  }
}

/**
 * Updates opportunity verification status (Only via authorized audit workflow).
 */
export async function updateOpportunityVerification(
  opportunityId: string,
  verificationStatus: VerificationStatus
): Promise<void> {
  if (!isFirebaseConfigured() || !opportunityId) return;

  try {
    const oppRef = doc(db, FIRESTORE_COLLECTIONS.OPPORTUNITIES, opportunityId);
    await updateDoc(oppRef, {
      verificationStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[OpportunityService] Error updating verification status for ${opportunityId}:`, error);
    throw error;
  }
}

/**
 * Saves or updates an opportunity conforming to the FundEcho Opportunity Data Schema (Step 1).
 * Supports automatic deduplication hashing, crawler metadata tracking, and validation.
 */
export async function saveFundEchoOpportunity(
  input: Partial<FundEchoOpportunityDoc>
): Promise<{ success: boolean; opportunity: FundEchoOpportunityDoc; isDuplicate?: boolean }> {
  const normalized = normalizeOpportunityToSchema(input);
  const now = serverTimestamp();

  // Validate against Step 1 requirements
  const validation = validateFundEchoOpportunity(normalized);
  if (!validation.isValid) {
    throw new Error(`Opportunity schema validation failed: ${validation.errors.join('; ')}`);
  }

  // Ensure deduplication hash is generated
  if (!normalized.duplicateDetection?.deduplicationHash) {
    normalized.duplicateDetection = {
      ...normalized.duplicateDetection,
      deduplicationHash: generateOpportunityDeduplicationHash(
        normalized.title,
        normalized.provider,
        normalized.deadline
      ),
      isCanonical: true,
    };
  }

  const recordToSave: FundEchoOpportunityDoc = {
    ...normalized,
    createdAt: normalized.createdAt || now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const oppRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, recordToSave.id);
      await setDoc(oppRef, recordToSave, { merge: true });
    } catch (error) {
      console.error('[OpportunityService] Error persisting FundEcho opportunity:', error);
      handleFirestoreError(error, 'create', `${FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES}/${recordToSave.id}`);
      throw error;
    }
  }

  return { success: true, opportunity: recordToSave };
}

/**
 * Retrieves a FundEcho Opportunity document by ID, normalizing it to the Step 1 schema.
 */
export async function getFundEchoOpportunityById(
  opportunityId: string
): Promise<FundEchoOpportunityDoc | null> {
  if (!opportunityId) return null;
  if (!isFirebaseConfigured()) return null;

  try {
    const oppRef = doc(db, FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES, opportunityId);
    const snap = await getDoc(oppRef);
    if (snap.exists()) {
      return normalizeOpportunityToSchema({ id: snap.id, ...snap.data() });
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, 'read', `${FIRESTORE_COLLECTIONS.FUNDING_OPPORTUNITIES}/${opportunityId}`);
    return null;
  }
}
