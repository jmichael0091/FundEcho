/**
 * FUNDORA - VERIFICATION RECORD SERVICE (STEP 17)
 * Manages immutable verification history in verificationRecords/{verificationId}.
 * Provides auditable provenance and evidence logs for published funding opportunities.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreVerificationRecord,
  VerificationStatus,
  VerificationEvidence,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';
import { updateOpportunityVerification } from './opportunityService';

/**
 * Creates an immutable verification audit record and updates the opportunity status.
 * Admin/Reviewer authorized action.
 */
export async function recordOpportunityVerification(
  opportunityId: string,
  reviewerId: string,
  previousStatus: VerificationStatus,
  newStatus: VerificationStatus,
  verificationNotes: string,
  evidence: VerificationEvidence,
  expiresAt?: Date | string | null
): Promise<FirestoreVerificationRecord> {
  const verificationId = `verif_${opportunityId.slice(0, 8)}_${Date.now()}`;
  const now = serverTimestamp();

  const record: FirestoreVerificationRecord = {
    id: verificationId,
    opportunityId,
    reviewerId,
    previousStatus,
    newStatus,
    verificationNotes,
    evidence,
    checkedAt: now,
    expiresAt: expiresAt ? (typeof expiresAt === 'string' ? expiresAt : expiresAt.toISOString()) : null,
    createdAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      // 1. Persist the immutable audit log entry
      const verifRef = doc(db, FIRESTORE_COLLECTIONS.VERIFICATION_RECORDS, verificationId);
      await setDoc(verifRef, record);

      // 2. Synchronize the opportunity document's verificationStatus
      await updateOpportunityVerification(opportunityId, newStatus);
    } catch (error) {
      console.error(`[VerificationService] Error recording verification for ${opportunityId}:`, error);
      throw error;
    }
  }

  return record;
}

/**
 * Fetches the auditable verification history for a given opportunity.
 */
export async function getOpportunityVerificationHistory(
  opportunityId: string
): Promise<FirestoreVerificationRecord[]> {
  if (!isFirebaseConfigured() || !opportunityId) return [];

  try {
    const verifColl = collection(db, FIRESTORE_COLLECTIONS.VERIFICATION_RECORDS);
    const q = query(
      verifColl,
      where('opportunityId', '==', opportunityId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirestoreVerificationRecord[];
  } catch (error) {
    console.error(`[VerificationService] Error fetching history for ${opportunityId}:`, error);
    return [];
  }
}
