/**
 * FUNDORA - AFFILIATE OFFER SERVICE (STEP 17)
 * Manages institutional and commercial partner affiliate offers in affiliateOffers/{offerId}.
 * The affiliate URL is stored as dynamic data in Firestore rather than hard-coded in components.
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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreAffiliateOffer,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';
import { validateAffiliateOffer } from './validators';

/**
 * Fetches all active affiliate offers.
 * Enforces status == 'active' for public consumption.
 */
export async function getActiveAffiliateOffers(): Promise<FirestoreAffiliateOffer[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const offersRef = collection(db, FIRESTORE_COLLECTIONS.AFFILIATE_OFFERS);
    const q = query(
      offersRef,
      where('status', '==', 'active'),
      orderBy('priority', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirestoreAffiliateOffer[];
  } catch (error) {
    console.error('[AffiliateService] Error fetching active offers:', error);
    return [];
  }
}

/**
 * Fetches a single affiliate offer by ID.
 */
export async function getAffiliateOfferById(
  offerId: string
): Promise<FirestoreAffiliateOffer | null> {
  if (!isFirebaseConfigured() || !offerId) return null;

  try {
    const offerRef = doc(db, FIRESTORE_COLLECTIONS.AFFILIATE_OFFERS, offerId);
    const snap = await getDoc(offerRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as FirestoreAffiliateOffer;
    }
    return null;
  } catch (error) {
    console.error(`[AffiliateService] Error fetching offer ${offerId}:`, error);
    return null;
  }
}

/**
 * Creates a new partner affiliate offer (Admin operation).
 */
export async function createAffiliateOffer(
  offer: Omit<FirestoreAffiliateOffer, 'createdAt' | 'updatedAt'>
): Promise<FirestoreAffiliateOffer> {
  const now = serverTimestamp();
  const fullOffer: FirestoreAffiliateOffer = {
    ...offer,
    createdAt: now,
    updatedAt: now,
  };

  const validation = validateAffiliateOffer(fullOffer);
  if (!validation.isValid) {
    throw new Error(`Affiliate offer validation failed: ${validation.errors.join(', ')}`);
  }

  if (isFirebaseConfigured()) {
    try {
      const offerRef = doc(db, FIRESTORE_COLLECTIONS.AFFILIATE_OFFERS, fullOffer.id);
      await setDoc(offerRef, fullOffer);
    } catch (error) {
      console.error('[AffiliateService] Error creating affiliate offer:', error);
      throw error;
    }
  }

  return fullOffer;
}

/**
 * Updates an affiliate offer (Admin operation).
 */
export async function updateAffiliateOffer(
  offerId: string,
  updates: Partial<FirestoreAffiliateOffer>
): Promise<void> {
  if (!isFirebaseConfigured() || !offerId) return;

  try {
    const offerRef = doc(db, FIRESTORE_COLLECTIONS.AFFILIATE_OFFERS, offerId);
    await updateDoc(offerRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[AffiliateService] Error updating offer ${offerId}:`, error);
    throw error;
  }
}
