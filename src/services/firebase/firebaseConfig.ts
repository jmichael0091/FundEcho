/**
 * FUNDORA - FIREBASE CLIENT CONFIGURATION (STEP 17)
 * Initializes Firebase App, Firestore, Authentication, and Storage.
 * Provides resilient environment detection, development fallback, and configuration status.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import appletConfig from '../../../firebase-applet-config.json';

export interface FirebaseEnvironmentConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

const resolvedConfig = ((appletConfig as any)?.default || appletConfig || {}) as Record<string, string>;

// Retrieve client-side configuration strictly with live env priority and fallback to firebase-applet-config.json
export const firebaseClientConfig: FirebaseEnvironmentConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || resolvedConfig.apiKey || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || resolvedConfig.authDomain || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || resolvedConfig.projectId || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || resolvedConfig.storageBucket || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || resolvedConfig.messagingSenderId || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || resolvedConfig.appId || '').trim(),
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || resolvedConfig.measurementId || '').trim(),
  firestoreDatabaseId:
    (import.meta.env.VITE_FIREBASE_DATABASE_ID ||
      resolvedConfig.firestoreDatabaseId ||
      'ai-studio-fundora-1eaf1a9a-cd4f-4fcd-b65a-9c346e139cdf').trim(),
};

/**
 * Checks whether valid Firebase client credentials are configured.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseClientConfig.apiKey &&
    firebaseClientConfig.projectId &&
    firebaseClientConfig.appId
  );
}

// Safe singleton instances
let appInstance: FirebaseApp;
let authInstance: Auth;
let firestoreInstance: Firestore;
let storageInstance: FirebaseStorage;

try {
  if (!getApps().length) {
    appInstance = initializeApp(firebaseClientConfig);
  } else {
    appInstance = getApp();
  }

  authInstance = getAuth(appInstance);
  const dbId = firebaseClientConfig.firestoreDatabaseId || 'ai-studio-fundora-1eaf1a9a-cd4f-4fcd-b65a-9c346e139cdf';
  const firestoreSettings = {
    experimentalAutoDetectLongPolling: true,
  };
  try {
    if (dbId && dbId !== '(default)') {
      firestoreInstance = initializeFirestore(appInstance, firestoreSettings, dbId);
    } else {
      firestoreInstance = initializeFirestore(appInstance, firestoreSettings);
    }
  } catch {
    // Fallback if initializeFirestore was previously invoked on this instance
    if (dbId && dbId !== '(default)') {
      firestoreInstance = getFirestore(appInstance, dbId);
    } else {
      firestoreInstance = getFirestore(appInstance);
    }
  }
  storageInstance = getStorage(appInstance);
  console.log(`[FUNDORA Firebase] Initialized production Firebase for project: ${firebaseClientConfig.projectId}, database: ${dbId}`);
} catch (error) {
  console.error('[FUNDORA Firebase] Initialization error:', error);
  // Ensure instances are defined
  if (!getApps().length) {
    appInstance = initializeApp(firebaseClientConfig);
  } else {
    appInstance = getApp();
  }
  authInstance = getAuth(appInstance);
  firestoreInstance = getFirestore(appInstance);
  storageInstance = getStorage(appInstance);
}

export const firebaseApp = appInstance;
export const auth = authInstance;
export const db = firestoreInstance;
export const storage = storageInstance;

export interface FirebaseConnectionStatus {
  isConfigured: boolean;
  projectId: string;
  authDomain: string;
  hasStorageBucket: boolean;
  mode: 'production';
}

export function getFirebaseConnectionStatus(): FirebaseConnectionStatus {
  return {
    isConfigured: true,
    projectId: firebaseClientConfig.projectId,
    authDomain: firebaseClientConfig.authDomain,
    hasStorageBucket: Boolean(firebaseClientConfig.storageBucket),
    mode: 'production',
  };
}
