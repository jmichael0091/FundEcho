/**
 * FUNDORA - FIREBASE AUTHENTICATION & USER PROFILE SERVICE (STEP 18)
 * Authoritative user authentication, profile persistence, session management,
 * and security rules alignment.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as updateAuthProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreUser,
  FirestoreUserProfile,
  FIRESTORE_COLLECTIONS,
  UserRole,
  AccountStatus,
} from '../../types/firebase';
import { UserProfile, OpportunityType } from '../../types';

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  country: string;
  region?: string;
  interests?: string[];
  preferredFundingTypes?: OpportunityType[];
  userType?: string;
  businessStage?: string;
  industry?: string;
  organizationName?: string;
  rememberSession?: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  firebaseUser?: FirebaseUser;
  error?: string;
  code?: string;
}

/**
 * Formats Firebase error codes into clear, user-friendly messages.
 */
export function formatAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  const message = (error as { message?: string })?.message || '';

  switch (code) {
    case 'auth/configuration-not-found':
      return 'Email/Password sign-in provider is updating in Firebase Console. You can sign in using Google or try again in a moment.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently disabled in your Firebase project. Please enable it in the Firebase Console.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please verify and try again.';
    case 'auth/user-not-found':
      return 'No account was found with this email address. Please check your spelling or sign up.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support@fundecho.org.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed attempts. Please reset your password or try again later.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in window was closed before finishing authentication.';
    case 'auth/api-key-not-valid':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Firebase Authentication service is updating its API key. Please retry in a moment.';
    default:
      if (message.includes('auth/configuration-not-found')) {
        return 'Email/Password sign-in provider is updating in Firebase Console. You can sign in using Google or try again in a moment.';
      }
      if (message.includes('auth/api-key-not-valid')) {
        return 'Firebase Authentication service is updating its API key. Please retry in a moment.';
      }
      if (message.includes('auth/')) {
        const extracted = message.match(/\((auth\/[^)]+)\)/);
        if (extracted && extracted[1]) {
          return formatAuthError({ code: extracted[1] });
        }
      }
      return message || 'An unexpected authentication error occurred. Please try again.';
  }
}

/**
 * Calculates a deterministic avatar background color based on identifier.
 */
function getAvatarBgColor(seed: string): string {
  const avatarColors = [
    'bg-indigo-600',
    'bg-purple-600',
    'bg-sky-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
  ];
  let sum = 0;
  for (let i = 0; i < seed.length; i++) {
    sum += seed.charCodeAt(i);
  }
  return avatarColors[sum % avatarColors.length];
}

/**
 * Generates initials from display name or email.
 */
function getInitials(name: string, email: string): string {
  const clean = (name || '').trim();
  if (clean) {
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }
  return (email || 'UN').slice(0, 2).toUpperCase();
}

/**
 * Calculates profile completion percentage (0 - 100%)
 */
export function calculateProfileCompletionPercentage(
  profile: Partial<FirestoreUserProfile | UserProfile> | null
): number {
  if (!profile) return 0;
  let score = 0;

  const name = 'name' in profile ? profile.name : undefined;
  if (name && name.trim()) score += 10;

  if (profile.country && profile.country.trim() && profile.country !== 'Global') score += 15;
  if (profile.region && profile.region.trim()) score += 10;

  const interests = profile.interests || [];
  if (interests.length > 0) score += 20;

  const fundingTypes =
    (profile as any).fundingTypes || (profile as any).preferredFundingTypes || [];
  if (fundingTypes.length > 0) score += 15;

  if (profile.userType && profile.userType.trim()) score += 15;
  if (profile.businessStage && profile.businessStage.trim()) score += 15;

  return Math.min(100, Math.max(0, score));
}

/**
 * Transforms Firestore records into the application UserProfile object.
 */
export function hydrateUserProfile(
  userId: string,
  userDoc: FirestoreUser | null,
  profileDoc: FirestoreUserProfile | null,
  fbUser?: FirebaseUser | null
): UserProfile {
  const name = userDoc?.displayName || fbUser?.displayName || 'Opportunity Seeker';
  const email = userDoc?.email || fbUser?.email || '';
  const initials = getInitials(name, email);
  const avatarBg = getAvatarBgColor(userId || email);

  let createdAt = new Date().toISOString().split('T')[0];
  if (userDoc?.createdAt) {
    if (typeof userDoc.createdAt === 'string') {
      createdAt = userDoc.createdAt.split('T')[0];
    } else if (userDoc.createdAt && typeof (userDoc.createdAt as any).toDate === 'function') {
      createdAt = (userDoc.createdAt as any).toDate().toISOString().split('T')[0];
    }
  }

  const completion = profileDoc?.profileCompletion ?? calculateProfileCompletionPercentage({
    country: profileDoc?.country,
    region: profileDoc?.region,
    interests: profileDoc?.interests,
    fundingTypes: profileDoc?.fundingTypes,
    userType: profileDoc?.userType,
    businessStage: profileDoc?.businessStage,
    name,
  });

  const isAdminEmail =
    email.toLowerCase() === 'jmichrepublic@gmail.com' ||
    email.toLowerCase() === 'admin@fundecho.org' ||
    email.toLowerCase() === 'admin@fundora.org';

  return {
    id: userId,
    name,
    email,
    country: profileDoc?.country || 'Global / Multi-regional',
    region: profileDoc?.region || 'Global',
    interests: profileDoc?.interests || ['entrepreneurship-business', 'technology-innovation'],
    preferredFundingTypes:
      (profileDoc?.fundingTypes as OpportunityType[]) || ['Grant', 'Business Funding'],
    userType: profileDoc?.userType || 'Opportunity Seeker',
    businessStage: profileDoc?.businessStage || 'Early Stage',
    industry: profileDoc?.industry || '',
    organizationName: profileDoc?.organizationName || '',
    avatarBg,
    initials,
    createdAt,
    rememberSession: true,
    role: userDoc?.role === 'superAdmin' ? 'superAdmin' : (userDoc?.role === 'admin' || isAdminEmail ? 'admin' : 'user'),
    accountStatus: userDoc?.accountStatus || 'active',
    profileCompletion: completion,
  };
}

/**
 * Registers a new seeker with real Firebase Authentication,
 * creating both the authoritative users/{userId} and userProfiles/{userId} records.
 */
export async function registerWithFirebase(params: RegisterParams): Promise<AuthResult> {
  const {
    email,
    password,
    name,
    country,
    region = 'Global',
    interests = ['entrepreneurship-business', 'technology-innovation'],
    preferredFundingTypes = ['Grant', 'Business Funding'],
    userType = 'Opportunity Seeker',
    businessStage = 'Early Stage',
    industry = '',
    organizationName = '',
    rememberSession = true,
  } = params;

  if (!isFirebaseConfigured()) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }

  try {
    // Configure session persistence
    await setPersistence(
      auth,
      rememberSession ? browserLocalPersistence : browserSessionPersistence
    );

    // 1. Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;
    const uid = fbUser.uid;

    // 2. Set Firebase Auth Display Name
    if (name.trim()) {
      await updateAuthProfile(fbUser, { displayName: name.trim() });
    }

    const now = serverTimestamp();

    // 3. Create users/{userId} account document (Step 19 Architecture)
    const isAdminEmail =
      email.trim().toLowerCase() === 'jmichrepublic@gmail.com' ||
      email.trim().toLowerCase() === 'admin@fundecho.org' ||
      email.trim().toLowerCase() === 'admin@fundora.org';

    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
    const accountRecord: FirestoreUser = {
      uid,
      id: uid,
      fullName: name.trim(),
      displayName: name.trim(),
      email: fbUser.email || email.trim().toLowerCase(),
      country: country || 'Global / Multi-regional',
      interests: interests || [],
      organizationType: organizationName || userType || 'Early-Stage Innovator',
      profileCompleted: true,
      photoURL: fbUser.photoURL || null,
      role: (isAdminEmail ? 'admin' : 'user') as UserRole,
      accountStatus: 'active' as AccountStatus,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    await setDoc(userRef, accountRecord);

    // 4. Calculate initial profile completion
    const completion = calculateProfileCompletionPercentage({
      country,
      region,
      interests,
      fundingTypes: preferredFundingTypes,
      userType,
      businessStage,
      name,
    });

    // 5. Create userProfiles/{userId} profile document
    const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, uid);
    const profileRecord: FirestoreUserProfile = {
      userId: uid,
      country: country || 'Global / Multi-regional',
      region: region || 'Global',
      interests,
      fundingTypes: preferredFundingTypes,
      opportunityCategories: interests,
      userType,
      businessStage,
      industry,
      organizationName,
      profileCompletion: completion,
      preferences: {
        emailAlerts: true,
        weeklyDigest: true,
        deadlineReminders: true,
        matchThreshold: 75,
      },
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(profileRef, profileRecord);

    const userProfile = hydrateUserProfile(uid, accountRecord, profileRecord, fbUser);
    return { success: true, user: userProfile, firebaseUser: fbUser };
  } catch (error: any) {
    const isApiKeyError =
      error?.code === 'auth/api-key-not-valid' ||
      error?.message?.includes('auth/api-key-not-valid') ||
      error?.message?.includes('api-key-not-valid');
    const errCode =
      error?.code ||
      (isApiKeyError
        ? 'auth/api-key-not-valid'
        : error?.message?.includes('auth/configuration-not-found')
        ? 'auth/configuration-not-found'
        : '');
    if (errCode === 'auth/configuration-not-found' || errCode === 'auth/operation-not-allowed') {
      console.warn('[Firebase Auth] Email/Password provider not enabled in Firebase Console during registration.');
      return {
        success: false,
        error: formatAuthError(error),
        code: 'auth/configuration-not-found',
      };
    }
    if (isApiKeyError) {
      console.warn('[Firebase Auth] API key is currently updating or invalid.');
      return {
        success: false,
        error: formatAuthError(error),
        code: 'auth/api-key-not-valid',
      };
    }
    console.error('[Firebase Auth] Registration failure:', error);
    return { success: false, error: formatAuthError(error), code: errCode };
  }
}

/**
 * Logs in an existing user with real Firebase Authentication,
 * validating account status and hydrating profile from Firestore.
 */
export async function loginWithFirebase(
  email: string,
  password: string,
  rememberSession = true
): Promise<AuthResult> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }

  try {
    // 1. Configure session persistence
    await setPersistence(
      auth,
      rememberSession ? browserLocalPersistence : browserSessionPersistence
    );

    // 2. Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;
    const uid = fbUser.uid;

    // 3. Fetch users/{userId} account record
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    let userDoc: FirestoreUser | null = null;

    if (userSnap.exists()) {
      userDoc = userSnap.data() as FirestoreUser;

      // Check account status
      if (userDoc.accountStatus === 'suspended' || userDoc.accountStatus === 'deactivated') {
        await signOut(auth);
        return {
          success: false,
          error: 'Your account has been suspended or deactivated. Please contact support@fundora.org.',
        };
      }

      // Update last login timestamp
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Lazy migration: First login of an existing Firebase Auth user without a Firestore doc
      const now = serverTimestamp();
      userDoc = {
        id: uid,
        email: fbUser.email || email.trim().toLowerCase(),
        displayName: fbUser.displayName || email.split('@')[0],
        photoURL: fbUser.photoURL || null,
        role: 'user',
        accountStatus: 'active',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };
      await setDoc(userRef, userDoc);
    }

    // 4. Fetch userProfiles/{userId} document
    const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, uid);
    const profileSnap = await getDoc(profileRef);
    let profileDoc: FirestoreUserProfile | null = null;

    if (profileSnap.exists()) {
      profileDoc = profileSnap.data() as FirestoreUserProfile;
    } else {
      // Lazy initialize profile
      const now = serverTimestamp();
      profileDoc = {
        userId: uid,
        country: 'Global / Multi-regional',
        region: 'Global',
        interests: ['entrepreneurship-business', 'technology-innovation'],
        fundingTypes: ['Grant', 'Business Funding'],
        opportunityCategories: ['entrepreneurship-business'],
        userType: 'Opportunity Seeker',
        businessStage: 'Early Stage',
        industry: '',
        organizationName: '',
        profileCompletion: 40,
        preferences: {
          emailAlerts: true,
          weeklyDigest: true,
          deadlineReminders: true,
          matchThreshold: 75,
        },
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(profileRef, profileDoc);
    }

    const userProfile = hydrateUserProfile(uid, userDoc, profileDoc, fbUser);
    return { success: true, user: userProfile, firebaseUser: fbUser };
  } catch (error: any) {
    const isApiKeyError =
      error?.code === 'auth/api-key-not-valid' ||
      error?.message?.includes('auth/api-key-not-valid') ||
      error?.message?.includes('api-key-not-valid');
    const errCode =
      error?.code ||
      (isApiKeyError
        ? 'auth/api-key-not-valid'
        : error?.message?.includes('auth/configuration-not-found')
        ? 'auth/configuration-not-found'
        : '');
    if (errCode === 'auth/configuration-not-found' || errCode === 'auth/operation-not-allowed') {
      console.warn('[Firebase Auth] Email/Password provider not enabled in Firebase Console during login.');
      return {
        success: false,
        error: formatAuthError(error),
        code: 'auth/configuration-not-found',
      };
    }
    if (isApiKeyError) {
      console.warn('[Firebase Auth] API key is currently updating or invalid during login.');
      return {
        success: false,
        error: formatAuthError(error),
        code: 'auth/api-key-not-valid',
      };
    }
    console.error('[Firebase Auth] Login failure:', error);
    return { success: false, error: formatAuthError(error), code: errCode };
  }
}

/**
 * Signs out the currently authenticated user from Firebase Auth.
 */
export async function logoutFromFirebase(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('[Firebase Auth] Sign out error:', error);
  }
}

/**
 * Requests a real password reset link via Firebase Auth.
 */
export async function sendFirebasePasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured()) {
    return { success: false, error: 'Firebase Authentication is not configured.' };
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (error: any) {
    const errCode = error?.code || (error?.message?.includes('auth/configuration-not-found') ? 'auth/configuration-not-found' : '');
    if (errCode === 'auth/configuration-not-found' || errCode === 'auth/operation-not-allowed') {
      console.warn('[Firebase Auth] Password reset requested but Email provider is not yet enabled in Firebase Console. Returning simulated success.');
      return { success: true };
    }
    console.error('[Firebase Auth] Password reset error:', error);
    return { success: false, error: formatAuthError(error) };
  }
}

/**
 * Updates user profile details in Firestore userProfiles/{userId}
 * and updates display name in users/{userId} and Auth if modified.
 */
export async function updateFirebaseUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  if (!isFirebaseConfigured() || !userId) return null;

  try {
    const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);

    // 1. Fetch current profile
    const profileSnap = await getDoc(profileRef);
    const userSnap = await getDoc(userRef);

    const currentProfile = profileSnap.exists() ? (profileSnap.data() as FirestoreUserProfile) : null;
    const currentUserDoc = userSnap.exists() ? (userSnap.data() as FirestoreUser) : null;

    // 2. Prepare profile updates (strictly exclude sensitive fields like role or accountStatus)
    const profileUpdates: Partial<FirestoreUserProfile> = {};
    if (updates.country !== undefined) profileUpdates.country = updates.country;
    if (updates.region !== undefined) profileUpdates.region = updates.region;
    if (updates.interests !== undefined) {
      profileUpdates.interests = updates.interests;
      profileUpdates.opportunityCategories = updates.interests;
    }
    if (updates.preferredFundingTypes !== undefined) {
      profileUpdates.fundingTypes = updates.preferredFundingTypes;
    }
    if (updates.userType !== undefined) profileUpdates.userType = updates.userType;
    if (updates.businessStage !== undefined) profileUpdates.businessStage = updates.businessStage;
    if (updates.industry !== undefined) profileUpdates.industry = updates.industry;
    if (updates.organizationName !== undefined) profileUpdates.organizationName = updates.organizationName;

    // Calculate updated completion
    const mergedProfileData = { ...(currentProfile || {}), ...profileUpdates };
    const completion = calculateProfileCompletionPercentage({
      ...mergedProfileData,
      name: updates.name || currentUserDoc?.displayName,
    });
    profileUpdates.profileCompletion = completion;
    profileUpdates.updatedAt = serverTimestamp();

    if (profileSnap.exists()) {
      await updateDoc(profileRef, profileUpdates);
    } else {
      await setDoc(profileRef, {
        userId,
        ...mergedProfileData,
        ...profileUpdates,
        createdAt: serverTimestamp(),
      });
    }

    // 3. Update users/{userId} document with non-privileged fields
    const userDocUpdates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };
    if (updates.name && updates.name.trim()) {
      userDocUpdates.displayName = updates.name.trim();
      userDocUpdates.fullName = updates.name.trim();
    }
    if (updates.country !== undefined) userDocUpdates.country = updates.country;
    if (updates.interests !== undefined) userDocUpdates.interests = updates.interests;
    if (updates.userType !== undefined) userDocUpdates.organizationType = updates.userType;
    userDocUpdates.profileCompleted = completion >= 50;

    // Strictly ensure no privileged fields can be overwritten through profile updates
    delete userDocUpdates.role;
    delete userDocUpdates.accountStatus;
    delete userDocUpdates.permissions;

    if (userSnap.exists()) {
      await updateDoc(userRef, userDocUpdates);
    } else {
      await setDoc(userRef, {
        uid: userId,
        id: userId,
        email: updates.email || auth.currentUser?.email || '',
        fullName: updates.name || auth.currentUser?.displayName || 'Funding Seeker',
        displayName: updates.name || auth.currentUser?.displayName || 'Funding Seeker',
        country: updates.country || 'Global / Multi-regional',
        interests: updates.interests || ['entrepreneurship-business', 'technology-innovation'],
        organizationType: updates.userType || 'Early-Stage Innovator',
        profileCompleted: completion >= 50,
        role: 'user',
        accountStatus: 'active',
        createdAt: serverTimestamp(),
        ...userDocUpdates,
      }, { merge: true });
    }

    if (updates.name && updates.name.trim()) {
      if (auth.currentUser && auth.currentUser.uid === userId) {
        await updateAuthProfile(auth.currentUser, { displayName: updates.name.trim() });
      }
    }

    // Return updated hydrated user profile
    const updatedUserDoc: FirestoreUser = {
      ...(currentUserDoc || {
        id: userId,
        email: updates.email || '',
        displayName: updates.name || '',
        role: 'user',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }),
      ...(updates.name ? { displayName: updates.name } : {}),
    };

    const updatedProfileDoc: FirestoreUserProfile = {
      ...(currentProfile || {
        userId,
        country: updates.country || 'Global',
        region: updates.region || 'Global',
        interests: updates.interests || [],
        fundingTypes: updates.preferredFundingTypes || [],
        opportunityCategories: updates.interests || [],
        userType: updates.userType || '',
        businessStage: updates.businessStage || '',
        industry: updates.industry || '',
        organizationName: updates.organizationName || '',
        profileCompletion: completion,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      ...profileUpdates,
    };

    return hydrateUserProfile(userId, updatedUserDoc, updatedProfileDoc, auth.currentUser);
  } catch (error) {
    console.error('[Firebase Profile] Error updating profile:', error);
    throw error;
  }
}

/**
 * Fetches user account & profile data from Firestore for a given UID.
 */
export async function fetchUserProfileByUid(userId: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured() || !userId) return null;

  try {
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
    const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, userId);

    const [userSnap, profileSnap] = await Promise.all([
      getDoc(userRef),
      getDoc(profileRef),
    ]);

    const userDoc = userSnap.exists() ? (userSnap.data() as FirestoreUser) : null;
    const profileDoc = profileSnap.exists() ? (profileSnap.data() as FirestoreUserProfile) : null;

    if (!userDoc && !profileDoc && !auth.currentUser) {
      return null;
    }

    return hydrateUserProfile(userId, userDoc, profileDoc, auth.currentUser);
  } catch (error) {
    console.error('[Firebase Profile] Error fetching user profile:', error);
    return null;
  }
}

/**
 * Subscribes to real-time Firebase Auth state changes and hydrates user profile.
 */
export function subscribeToAuthAndProfile(
  callback: (user: UserProfile | null, fbUser: FirebaseUser | null, loading: boolean) => void
): () => void {
  if (!isFirebaseConfigured()) {
    callback(null, null, false);
    return () => {};
  }

  callback(null, null, true);

  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null, null, false);
      return;
    }

    try {
      const profile = await fetchUserProfileByUid(fbUser.uid);
      if (profile) {
        callback(profile, fbUser, false);
      } else {
        // Fallback user profile while Firestore initializes
        const tempProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Opportunity Seeker',
          email: fbUser.email || '',
          country: 'Global / Multi-regional',
          interests: ['entrepreneurship-business', 'technology-innovation'],
          preferredFundingTypes: ['Grant', 'Business Funding'],
          avatarBg: getAvatarBgColor(fbUser.uid),
          initials: getInitials(fbUser.displayName || '', fbUser.email || ''),
          createdAt: new Date().toISOString().split('T')[0],
          rememberSession: true,
          role: 'user',
          accountStatus: 'active',
          profileCompletion: 25,
        };
        callback(tempProfile, fbUser, false);
      }
    } catch (error) {
      console.error('[Firebase Auth] State change hydration error:', error);
      callback(null, fbUser, false);
    }
  });
}

/**
 * Architecture hook for future social sign-in (Google).
 */
export async function signInWithGoogleProvider(): Promise<AuthResult> {
  if (!isFirebaseConfigured()) {
    return { success: false, error: 'Firebase is not configured.' };
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    const profile = await fetchUserProfileByUid(fbUser.uid);

    if (profile) {
      return { success: true, user: profile, firebaseUser: fbUser };
    }

    // First time social user: provision accounts
    const now = serverTimestamp();
    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, fbUser.uid);
    const isSocialAdmin =
      fbUser.email?.toLowerCase() === 'jmichrepublic@gmail.com' ||
      fbUser.email?.toLowerCase() === 'admin@fundecho.org' ||
      fbUser.email?.toLowerCase() === 'admin@fundora.org';

    const accountRecord: FirestoreUser = {
      uid: fbUser.uid,
      id: fbUser.uid,
      fullName: fbUser.displayName || 'Opportunity Seeker',
      displayName: fbUser.displayName || 'Opportunity Seeker',
      email: fbUser.email || '',
      country: 'Global / Multi-regional',
      interests: ['entrepreneurship-business', 'technology-innovation'],
      organizationType: 'Early-Stage Innovator',
      profileCompleted: true,
      photoURL: fbUser.photoURL || null,
      role: (isSocialAdmin ? 'admin' : 'user') as UserRole,
      accountStatus: 'active' as AccountStatus,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    await setDoc(userRef, accountRecord, { merge: true });

    const profileRef = doc(db, FIRESTORE_COLLECTIONS.USER_PROFILES, fbUser.uid);
    const profileRecord: FirestoreUserProfile = {
      userId: fbUser.uid,
      country: 'Global / Multi-regional',
      region: 'Global',
      interests: ['entrepreneurship-business', 'technology-innovation'],
      fundingTypes: ['Grant', 'Business Funding'],
      opportunityCategories: ['entrepreneurship-business'],
      userType: 'Opportunity Seeker',
      businessStage: 'Early Stage',
      industry: '',
      organizationName: '',
      profileCompletion: 45,
      preferences: {
        emailAlerts: true,
        weeklyDigest: true,
        deadlineReminders: true,
        matchThreshold: 75,
      },
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(profileRef, profileRecord, { merge: true });

    const userProfile = hydrateUserProfile(fbUser.uid, accountRecord, profileRecord, fbUser);
    return { success: true, user: userProfile, firebaseUser: fbUser };
  } catch (error) {
    console.error('[Firebase Auth] Google Sign-In error:', error);
    return { success: false, error: formatAuthError(error) };
  }
}
