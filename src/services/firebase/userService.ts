/**
 * FUNDORA - FIREBASE USER SERVICE (STEP 17)
 * Manages account-level data in users/{userId}.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreUser,
  FIRESTORE_COLLECTIONS,
  UserRole,
  AccountStatus,
} from '../../types/firebase';
import { isValidEmail } from './validators';
import { handleFirestoreError } from './firestoreService';

export async function getUserRecord(userId: string): Promise<FirestoreUser | null> {
  if (!isFirebaseConfigured() || !userId) {
    return null;
  }

  try {
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as FirestoreUser;
    }
    return null;
  } catch (error) {
    console.error(`[UserService] Error fetching user ${userId}:`, error);
    return null;
  }
}

export async function createUserRecord(
  userId: string,
  email: string,
  displayName: string,
  photoURL?: string | null,
  role: UserRole = 'user'
): Promise<FirestoreUser> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address provided for user creation.');
  }

  const now = serverTimestamp();
  const userData: FirestoreUser = {
    id: userId,
    email,
    displayName: displayName || email.split('@')[0],
    photoURL: photoURL || null,
    role: role || 'user',
    accountStatus: 'active',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error('[UserService] Error creating user record:', error);
    }
  }

  return userData;
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  if (!isFirebaseConfigured() || !userId) return;

  try {
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[UserService] Failed to update last login for ${userId}:`, error);
  }
}

export async function updateUserAccountStatus(
  userId: string,
  status: AccountStatus
): Promise<void> {
  if (!isFirebaseConfigured() || !userId) return;

  try {
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      accountStatus: status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `${FIRESTORE_COLLECTIONS.USERS}/${userId}`);
    throw error;
  }
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<void> {
  if (!isFirebaseConfigured() || !userId) return;

  try {
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `${FIRESTORE_COLLECTIONS.USERS}/${userId}`);
    throw error;
  }
}

export async function fetchUsersFromFirestore(limitCount = 100): Promise<FirestoreUser[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const usersCol = collection(db, FIRESTORE_COLLECTIONS.USERS);
    const q = query(usersCol, limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FirestoreUser[];
  } catch (error) {
    handleFirestoreError(error, 'list', FIRESTORE_COLLECTIONS.USERS);
    return [];
  }
}

