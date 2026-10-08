/**
 * FUNDORA - PUSH NOTIFICATION & FCM PREPARATION (STEP 23)
 * Provides device registration and token storage for Firebase Cloud Messaging (FCM).
 * 
 * Multi-Device Architecture:
 * Tokens are stored per user under: users/{userId}/fcmTokens/{tokenId}
 * This securely supports multiple devices per account and prevents exposing tokens publicly.
 * 
 * Required Firebase Configuration for Live Web Push:
 * 1. Generate Web Push Certificate (VAPID Key) in Firebase Console -> Project Settings -> Cloud Messaging.
 * 2. Set environment variable: VITE_FIREBASE_VAPID_KEY=<your_public_key>.
 * 3. Place 'firebase-messaging-sw.js' service worker in /public directory.
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { FIRESTORE_COLLECTIONS, FirestoreFCMTokenDoc } from '../../types/firebase';

export interface RegisterDeviceTokenParams {
  userId: string;
  token: string;
  platform?: string;
  userAgent?: string;
}

/**
 * Creates a deterministic, URL-safe document ID from an FCM token string.
 */
function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const cleanPrefix = token.substring(0, 12).replace(/[^a-zA-Z0-9]/g, '');
  return `fcm_${cleanPrefix}_${Math.abs(hash)}`;
}

/**
 * Registers a device FCM token under the user's private tokens collection.
 * Securely supports multiple devices (laptop, mobile, tablet).
 */
export async function registerDeviceToken(params: RegisterDeviceTokenParams): Promise<boolean> {
  const { userId, token, platform = 'web', userAgent } = params;
  if (!userId || !token) return false;

  if (!isFirebaseConfigured()) {
    console.log('[FCMService] (Offline/Demo) Registered device token locally:', token.substring(0, 10) + '...');
    return true;
  }

  try {
    const tokenId = hashToken(token);
    const tokenRef = doc(
      db,
      FIRESTORE_COLLECTIONS.USERS,
      userId,
      FIRESTORE_COLLECTIONS.FCM_TOKENS,
      tokenId
    );

    const payload: Partial<FirestoreFCMTokenDoc> = {
      token,
      userId,
      platform,
      userAgent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    };

    await setDoc(tokenRef, payload, { merge: true });
    console.log(`[FCMService] Successfully registered device token for user ${userId} (${platform})`);
    return true;
  } catch (error) {
    console.error('[FCMService] Error registering device token in Firestore:', error);
    return false;
  }
}

/**
 * Unregisters a device token when user logs out or disables push notifications.
 */
export async function unregisterDeviceToken(userId: string, token: string): Promise<void> {
  if (!userId || !token) return;
  if (!isFirebaseConfigured()) return;

  try {
    const tokenId = hashToken(token);
    const tokenRef = doc(
      db,
      FIRESTORE_COLLECTIONS.USERS,
      userId,
      FIRESTORE_COLLECTIONS.FCM_TOKENS,
      tokenId
    );
    await deleteDoc(tokenRef);
    console.log(`[FCMService] Unregistered device token ${tokenId} for user ${userId}`);
  } catch (error) {
    console.error('[FCMService] Error unregistering device token:', error);
  }
}

/**
 * Retrieves all active registered device tokens for an authenticated user.
 */
export async function getUserDeviceTokens(userId: string): Promise<string[]> {
  if (!userId || !isFirebaseConfigured()) return [];

  try {
    const tokensRef = collection(
      db,
      FIRESTORE_COLLECTIONS.USERS,
      userId,
      FIRESTORE_COLLECTIONS.FCM_TOKENS
    );
    const snapshot = await getDocs(tokensRef);
    return snapshot.docs
      .map((docSnap) => docSnap.data().token)
      .filter((t): t is string => Boolean(t));
  } catch (error) {
    console.error(`[FCMService] Error fetching device tokens for ${userId}:`, error);
    return [];
  }
}

/**
 * Requests browser Notification permission and returns the status.
 */
export async function requestWebPushPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('[FCMService] Error requesting notification permission:', err);
    return 'denied';
  }
}
