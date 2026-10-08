/**
 * FUNDORA - CREDIT SYSTEM SERVICE (STEP 17)
 * Manages user credit balances in creditWallets/{userId}
 * and immutable transaction ledger in creditTransactions/{transactionId}.
 *
 * CRITICAL SECURITY PRINCIPLE:
 * Direct client-side arbitrary balance manipulation is prohibited by Firestore Security Rules.
 * Balance deductions and additions are executed via server-side logic / Cloud Functions.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreCreditWallet,
  FirestoreCreditTransaction,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';

/**
 * Retrieves the credit wallet for a user.
 */
export async function getUserCreditWallet(
  userId: string
): Promise<FirestoreCreditWallet | null> {
  if (!isFirebaseConfigured() || !userId) return null;

  try {
    const walletRef = doc(db, FIRESTORE_COLLECTIONS.CREDIT_WALLETS, userId);
    const snap = await getDoc(walletRef);

    if (snap.exists()) {
      return snap.data() as FirestoreCreditWallet;
    }
    return null;
  } catch (error) {
    console.error(`[CreditService] Error fetching wallet for ${userId}:`, error);
    return null;
  }
}

/**
 * Retrieves the user's credit transaction ledger history.
 */
export async function getUserCreditTransactions(
  userId: string,
  limitCount = 50
): Promise<FirestoreCreditTransaction[]> {
  if (!isFirebaseConfigured() || !userId) return [];

  try {
    const txColl = collection(db, FIRESTORE_COLLECTIONS.CREDIT_TRANSACTIONS);
    const q = query(
      txColl,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirestoreCreditTransaction[];
  } catch (error) {
    console.error(`[CreditService] Error fetching transactions for ${userId}:`, error);
    return [];
  }
}
