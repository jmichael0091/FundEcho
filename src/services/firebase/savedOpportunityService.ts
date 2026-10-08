/**
 * FUNDORA - SAVED OPPORTUNITY SERVICE (STEP 19)
 * Manages user saved opportunities in both top-level saved_opportunities/{userId_opportunityId}
 * and subcollection users/{userId}/savedOpportunities/{opportunityId}.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreSavedOpportunity,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';
import { handleFirestoreError } from './firestoreService';

/**
 * Saves an opportunity to the top-level "saved_opportunities" collection
 * and mirrors to the user subcollection.
 */
export async function saveOpportunity(
  userId: string,
  opportunityId: string,
  notes?: string
): Promise<FirestoreSavedOpportunity> {
  const savedRecord: FirestoreSavedOpportunity = {
    opportunityId,
    savedAt: serverTimestamp(),
    notes: notes || '',
  };

  if (isFirebaseConfigured() && userId) {
    try {
      // 1. Top-level saved_opportunities collection (Step 19)
      const topLevelDocId = `${userId}_${opportunityId}`;
      const topLevelRef = doc(db, FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES, topLevelDocId);
      await setDoc(topLevelRef, {
        id: topLevelDocId,
        userId,
        opportunityId,
        notes: notes || '',
        createdAt: serverTimestamp(),
      });

      // 2. Subcollection for legacy/subcollection listeners
      const subRef = doc(
        db,
        FIRESTORE_COLLECTIONS.USERS,
        userId,
        'savedOpportunities',
        opportunityId
      );
      await setDoc(subRef, savedRecord);
    } catch (error) {
      handleFirestoreError(error, 'create', `${FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES}/${userId}_${opportunityId}`);
      throw error;
    }
  }

  return savedRecord;
}

/**
 * Removes an opportunity from the saved collections.
 */
export async function unsaveOpportunity(
  userId: string,
  opportunityId: string
): Promise<void> {
  if (!isFirebaseConfigured() || !userId) return;

  try {
    const topLevelDocId = `${userId}_${opportunityId}`;
    const topLevelRef = doc(db, FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES, topLevelDocId);
    await deleteDoc(topLevelRef);

    const subRef = doc(
      db,
      FIRESTORE_COLLECTIONS.USERS,
      userId,
      'savedOpportunities',
      opportunityId
    );
    await deleteDoc(subRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `${FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES}/${userId}_${opportunityId}`);
    throw error;
  }
}

/**
 * Checks if a specific opportunity is saved by the user.
 */
export async function isOpportunitySaved(
  userId: string,
  opportunityId: string
): Promise<boolean> {
  if (!isFirebaseConfigured() || !userId || !opportunityId) return false;

  try {
    const topLevelDocId = `${userId}_${opportunityId}`;
    const topLevelRef = doc(db, FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES, topLevelDocId);
    const snap = await getDoc(topLevelRef);
    if (snap.exists()) return true;

    // Fallback check subcollection
    const subRef = doc(
      db,
      FIRESTORE_COLLECTIONS.USERS,
      userId,
      'savedOpportunities',
      opportunityId
    );
    const subSnap = await getDoc(subRef);
    return subSnap.exists();
  } catch (error) {
    handleFirestoreError(error, 'read', `${FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES}/${userId}_${opportunityId}`);
    return false;
  }
}

/**
 * Fetches all saved opportunity IDs for a user.
 */
export async function getUserSavedOpportunities(
  userId: string
): Promise<FirestoreSavedOpportunity[]> {
  if (!isFirebaseConfigured() || !userId) return [];

  try {
    // Query top-level collection
    const savedColl = collection(db, FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES);
    const q = query(savedColl, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          opportunityId: (data.opportunityId as string) || docSnap.id.replace(`${userId}_`, ''),
          savedAt: data.createdAt || data.savedAt,
          notes: data.notes || '',
        };
      });
    }

    // Fallback to subcollection if top-level was empty
    const subColl = collection(
      db,
      FIRESTORE_COLLECTIONS.USERS,
      userId,
      'savedOpportunities'
    );
    const subSnap = await getDocs(subColl);
    return subSnap.docs.map((docSnap) => ({
      ...docSnap.data(),
      opportunityId: docSnap.id,
    })) as FirestoreSavedOpportunity[];
  } catch (error) {
    handleFirestoreError(error, 'list', FIRESTORE_COLLECTIONS.SAVED_OPPORTUNITIES);
    return [];
  }
}
