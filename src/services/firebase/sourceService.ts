/**
 * FUNDORA - OPPORTUNITY SOURCE SERVICE (STEP 17)
 * Manages verified institutional sources in opportunitySources/{sourceId}.
 * Preserves the provenance and source classification of every opportunity.
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
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreOpportunitySource,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';

/**
 * Fetches all active opportunity sources.
 */
export async function getOpportunitySources(): Promise<FirestoreOpportunitySource[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const sourcesRef = collection(db, FIRESTORE_COLLECTIONS.OPPORTUNITY_SOURCES);
    const q = query(sourcesRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirestoreOpportunitySource[];
  } catch (error) {
    console.error('[SourceService] Error fetching opportunity sources:', error);
    return [];
  }
}

/**
 * Fetches an opportunity source by its ID.
 */
export async function getSourceById(
  sourceId: string
): Promise<FirestoreOpportunitySource | null> {
  if (!isFirebaseConfigured() || !sourceId) return null;

  try {
    const sourceRef = doc(db, FIRESTORE_COLLECTIONS.OPPORTUNITY_SOURCES, sourceId);
    const snap = await getDoc(sourceRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as FirestoreOpportunitySource;
    }
    return null;
  } catch (error) {
    console.error(`[SourceService] Error fetching source ${sourceId}:`, error);
    return null;
  }
}

/**
 * Registers or updates an opportunity source (Admin operation).
 */
export async function setOpportunitySource(
  source: Omit<FirestoreOpportunitySource, 'createdAt' | 'updatedAt'>
): Promise<FirestoreOpportunitySource> {
  const now = serverTimestamp();
  const fullSource: FirestoreOpportunitySource = {
    ...source,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const sourceRef = doc(db, FIRESTORE_COLLECTIONS.OPPORTUNITY_SOURCES, fullSource.id);
      await setDoc(sourceRef, fullSource, { merge: true });
    } catch (error) {
      console.error(`[SourceService] Error persisting source ${fullSource.id}:`, error);
      throw error;
    }
  }

  return fullSource;
}
