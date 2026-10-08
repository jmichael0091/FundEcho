/**
 * FUNDORA - ADMIN SERVICE (STEP 17)
 * Manages administrative profiles and permissions in adminProfiles/{userId}.
 * Real security is enforced via Firestore Security Rules and server authorization.
 */

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreAdminProfile,
  AdminPermission,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';

/**
 * Retrieves the administrative profile and permissions for a user.
 */
export async function getAdminProfile(
  userId: string
): Promise<FirestoreAdminProfile | null> {
  if (!isFirebaseConfigured() || !userId) return null;

  try {
    const adminRef = doc(db, FIRESTORE_COLLECTIONS.ADMIN_PROFILES, userId);
    const snap = await getDoc(adminRef);

    if (snap.exists()) {
      return snap.data() as FirestoreAdminProfile;
    }
    return null;
  } catch (error) {
    console.error(`[AdminService] Error fetching admin profile for ${userId}:`, error);
    return null;
  }
}

/**
 * Checks if a user holds a specific administrative permission.
 */
export async function hasAdminPermission(
  userId: string,
  permission: AdminPermission
): Promise<boolean> {
  const profile = await getAdminProfile(userId);
  if (!profile || profile.status !== 'active') return false;
  if (profile.role === 'superAdmin') return true;
  return profile.permissions.includes(permission);
}

/**
 * Provisions or updates an admin profile (SuperAdmin operation).
 */
export async function setAdminProfile(
  profile: FirestoreAdminProfile
): Promise<void> {
  if (!isFirebaseConfigured()) return;

  try {
    const adminRef = doc(db, FIRESTORE_COLLECTIONS.ADMIN_PROFILES, profile.userId);
    await setDoc(adminRef, {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error(`[AdminService] Error setting admin profile for ${profile.userId}:`, error);
    throw error;
  }
}
