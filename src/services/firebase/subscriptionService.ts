/**
 * FUNDORA - SUBSCRIPTION SERVICE (STEP 17)
 * Manages user subscriptions (subscriptions/{subscriptionId})
 * and dynamic pricing plans (subscriptionPlans/{planId}).
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreSubscription,
  FirestoreSubscriptionPlan,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';

/**
 * Retrieves the active subscription for a specific user.
 */
export async function getUserSubscription(
  userId: string
): Promise<FirestoreSubscription | null> {
  if (!isFirebaseConfigured() || !userId) return null;

  try {
    const subsRef = collection(db, FIRESTORE_COLLECTIONS.SUBSCRIPTIONS);
    const q = query(
      subsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as FirestoreSubscription;
    }
    return null;
  } catch (error) {
    console.error(`[SubscriptionService] Error fetching subscription for ${userId}:`, error);
    return null;
  }
}

/**
 * Retrieves published subscription plans for pricing pages and feature gates.
 */
export async function getSubscriptionPlans(): Promise<FirestoreSubscriptionPlan[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const plansRef = collection(db, FIRESTORE_COLLECTIONS.SUBSCRIPTION_PLANS);
    const snapshot = await getDocs(plansRef);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirestoreSubscriptionPlan[];
  } catch (error) {
    console.error('[SubscriptionService] Error fetching plans:', error);
    return [];
  }
}

/**
 * Creates or seeds a subscription plan (Admin operation).
 */
export async function setSubscriptionPlan(
  plan: FirestoreSubscriptionPlan
): Promise<void> {
  if (!isFirebaseConfigured()) return;

  try {
    const planRef = doc(db, FIRESTORE_COLLECTIONS.SUBSCRIPTION_PLANS, plan.id);
    await setDoc(planRef, {
      ...plan,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error(`[SubscriptionService] Error setting plan ${plan.id}:`, error);
    throw error;
  }
}
