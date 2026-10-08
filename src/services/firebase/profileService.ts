/**
 * FUNDORA - USER PROFILE SERVICE (STEP 17)
 * Manages user profile details, demographics, and preferences in userProfiles/{userId}.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreUserProfile,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';
import { validateUserProfile } from './validators';

/**
 * Calculates a 0-100 profile completion percentage based on field population.
 */
export function calculateProfileCompletion(profile: Partial<FirestoreUserProfile>): number {
  let score = 0;
  const weights = {
    country: 15,
    region: 10,
    interests: 15,
    fundingTypes: 15,
    userType: 15,
    businessStage: 10,
    industry: 10,
    organizationName: 10,
  };

  if (profile.country && profile.country.trim()) score += weights.country;
  if (profile.region && profile.region.trim()) score += weights.region;
  if (profile.interests && profile.interests.length > 0) score += weights.interests;
  if (profile.fundingTypes && profile.fundingTypes.length > 0) score += weights.fundingTypes;
  if (profile.userType && profile.userType.trim()) score += weights.userType;
  if (profile.businessStage && profile.businessStage.trim()) score += weights.businessStage;
  if (profile.industry && profile.industry.trim()) score += weights.industry;
  if (profile.organizationName && profile.organizationName.trim()) score += weights.organizationName;

  return Math.min(100, Math.max(0, score));
}

/**
 * Fetches user profile from userProfiles/{userId}.
 */
export async function getUserProfile(userId: string): Promise<FirestoreUserProfile | null> {
  if (!isFirebaseConfigured() || !userId) {
    return null;
  }

  try {
    const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      return snap.data() as FirestoreUserProfile;
    }
    return null;
  } catch (error) {
    console.error(`[ProfileService] Error fetching profile for ${userId}:`, error);
    return null;
  }
}

/**
 * Creates or overwrites user profile in userProfiles/{userId}.
 */
export async function setUserProfile(
  userId: string,
  profileData: Partial<FirestoreUserProfile>
): Promise<FirestoreUserProfile> {
  const completion = calculateProfileCompletion(profileData);
  const now = serverTimestamp();

  const fullProfile: FirestoreUserProfile = {
    userId,
    country: profileData.country || '',
    region: profileData.region || 'Global',
    interests: profileData.interests || [],
    fundingTypes: profileData.fundingTypes || [],
    opportunityCategories: profileData.opportunityCategories || [],
    userType: profileData.userType || '',
    businessStage: profileData.businessStage || '',
    industry: profileData.industry || '',
    organizationName: profileData.organizationName || '',
    profileCompletion: completion,
    preferences: {
      emailAlerts: true,
      weeklyDigest: true,
      deadlineReminders: true,
      matchThreshold: 75,
      ...profileData.preferences,
    },
    createdAt: profileData.createdAt || now,
    updatedAt: now,
  };

  const validation = validateUserProfile(fullProfile);
  if (!validation.isValid) {
    throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`);
  }

  if (isFirebaseConfigured()) {
    try {
      const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);
      await setDoc(profileRef, fullProfile, { merge: true });
    } catch (error) {
      console.error(`[ProfileService] Error saving profile for ${userId}:`, error);
      throw error;
    }
  }

  return fullProfile;
}

/**
 * Incrementally updates fields in userProfiles/{userId}.
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<FirestoreUserProfile>
): Promise<void> {
  if (!isFirebaseConfigured() || !userId) return;

  try {
    const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);
    const current = await getUserProfile(userId);
    const merged = { ...(current || {}), ...updates };
    const completion = calculateProfileCompletion(merged);

    await updateDoc(profileRef, {
      ...updates,
      profileCompletion: completion,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[ProfileService] Error updating profile for ${userId}:`, error);
    throw error;
  }
}
