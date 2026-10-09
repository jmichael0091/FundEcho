/**
 * FUNDORA - NOTIFICATION & DEADLINE ALERT SERVICE (STEP 23)
 * Manages Firestore-backed notifications in collection "notifications".
 * Supports real-time listeners, unread badge metrics, deadline reminders,
 * application updates, and persisted user notification preferences.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreNotification,
  FIRESTORE_COLLECTIONS,
  NotificationType,
  UserNotificationPreferences,
} from '../../types/firebase';
import {
  AppNotification,
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../../types/notification';

const LOCAL_PREFS_KEY = 'fundora_notification_preferences';
const LOCAL_NOTIFS_CACHE_PREFIX = 'fundora_cached_notifications_';

/**
 * Normalizes raw Firestore document data or cached data into a clean notification model.
 */
export function normalizeNotification(
  docId: string,
  data: any
): FirestoreNotification & AppNotification {
  const readStatus = Boolean(data.read ?? data.isRead ?? false);

  // Convert Firestore Timestamp / string / number to ISO string
  let isoDate = new Date().toISOString();
  if (data.createdAt) {
    if (typeof data.createdAt === 'string') {
      isoDate = data.createdAt;
    } else if (typeof data.createdAt.toDate === 'function') {
      isoDate = data.createdAt.toDate().toISOString();
    } else if (data.createdAt.seconds) {
      isoDate = new Date(data.createdAt.seconds * 1000).toISOString();
    }
  } else if (data.timestamp) {
    isoDate = typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString();
  }

  return {
    id: docId || data.id,
    userId: data.userId || '',
    type: data.type || 'System Notification',
    title: data.title || 'Notification',
    message: data.message || '',
    opportunityId: data.opportunityId || data.relatedOpportunityId || null,
    applicationId: data.applicationId || null,
    read: readStatus,
    isRead: readStatus,
    createdAt: data.createdAt || isoDate,
    timestamp: isoDate,
    scheduledFor: data.scheduledFor || null,
    deliveredAt: data.deliveredAt || isoDate,
    opportunityTitle: data.opportunityTitle || '',
    urgency: data.urgency || 'normal',
    actionLabel:
      data.actionLabel ||
      (data.opportunityId
        ? 'View Opportunity'
        : data.applicationId
        ? 'View Application'
        : undefined),
    daysRemaining: typeof data.daysRemaining === 'number' ? data.daysRemaining : undefined,
    targetPage:
      data.targetPage ||
      (data.opportunityId
        ? 'opportunity-detail'
        : data.applicationId
        ? 'application-tracker'
        : undefined),
    isDemoLocal: false,
  };
}

/**
 * Reads local cached notifications for fast immediate loading.
 */
function getLocalCache(userId: string): AppNotification[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_NOTIFS_CACHE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[NotificationService] Failed to read local notification cache:', err);
    return [];
  }
}

/**
 * Saves notifications to local cache.
 */
function setLocalCache(userId: string, notifs: AppNotification[]): void {
  if (!userId) return;
  try {
    localStorage.setItem(`${LOCAL_NOTIFS_CACHE_PREFIX}${userId}`, JSON.stringify(notifs.slice(0, 50)));
  } catch (err) {
    console.warn('[NotificationService] Failed to write local notification cache:', err);
  }
}

/**
 * Subscribes to the authenticated user's notifications in real-time.
 * Strictly queries documents where userId == authenticated user's UID.
 */
export function subscribeToUserNotifications(
  userId: string,
  onUpdate: (notifications: AppNotification[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  // Supply instant cached data
  const initialCached = getLocalCache(userId);
  if (initialCached.length > 0) {
    onUpdate(initialCached);
  }

  if (!isFirebaseConfigured()) {
    console.warn('[NotificationService] Firebase not configured; using local cache.');
    onUpdate(initialCached);
    return () => {};
  }

  try {
    const notifsRef = collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notifsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((docSnap) =>
          normalizeNotification(docSnap.id, docSnap.data())
        );
        setLocalCache(userId, notifs);
        onUpdate(notifs);
      },
      async (err) => {
        // In case composite index on (userId + createdAt) is pending, fallback to query by userId only
        console.warn('[NotificationService] Ordered query error, falling back to simple query:', err);
        try {
          const fallbackQ = query(notifsRef, where('userId', '==', userId), limit(50));
          const fallbackSnapshot = await getDocs(fallbackQ);
          const fallbackNotifs = fallbackSnapshot.docs
            .map((docSnap) => normalizeNotification(docSnap.id, docSnap.data()))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setLocalCache(userId, fallbackNotifs);
          onUpdate(fallbackNotifs);
        } catch (fallbackErr) {
          console.error('[NotificationService] Error in fallback query:', fallbackErr);
          if (onError) onError(fallbackErr);
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error(`[NotificationService] Error setting up listener for user ${userId}:`, error);
    if (onError) onError(error);
    return () => {};
  }
}

/**
 * Retrieves recent notifications for an authenticated user directly.
 */
export async function getUserNotifications(
  userId: string,
  limitCount = 50
): Promise<AppNotification[]> {
  if (!userId) return [];

  const cached = getLocalCache(userId);

  if (!isFirebaseConfigured()) {
    return cached;
  }

  try {
    const notifsRef = collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notifsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    const notifs = snapshot.docs.map((docSnap) =>
      normalizeNotification(docSnap.id, docSnap.data())
    );
    setLocalCache(userId, notifs);
    return notifs;
  } catch (error) {
    console.warn(`[NotificationService] Falling back to unordered query for ${userId}:`, error);
    try {
      const fallbackQ = query(
        collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        limit(limitCount)
      );
      const snapshot = await getDocs(fallbackQ);
      const notifs = snapshot.docs
        .map((docSnap) => normalizeNotification(docSnap.id, docSnap.data()))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLocalCache(userId, notifs);
      return notifs;
    } catch (innerError) {
      console.error(`[NotificationService] Error retrieving notifications:`, innerError);
      return cached;
    }
  }
}

/**
 * Marks an individual notification as read.
 * Updates Firestore and updates local cache.
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!userId || !notificationId) return;

  // Optimistic local update
  const cached = getLocalCache(userId);
  const updatedCache = cached.map((n) =>
    n.id === notificationId ? { ...n, read: true, isRead: true } : n
  );
  setLocalCache(userId, updatedCache);

  if (!isFirebaseConfigured()) return;

  try {
    const notifRef = doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(notifRef, {
      read: true,
      isRead: true,
    });
    console.log(`[NotificationService] Notification ${notificationId} marked read in Firestore.`);
  } catch (error) {
    console.error(`[NotificationService] Error marking notification as read:`, error);
  }
}

/**
 * Marks all notifications for a user as read in Firestore.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!userId) return;

  // Optimistic local update
  const cached = getLocalCache(userId);
  const updatedCache = cached.map((n) => ({ ...n, read: true, isRead: true }));
  setLocalCache(userId, updatedCache);

  if (!isFirebaseConfigured()) return;

  try {
    const notifsRef = collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notifsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true, isRead: true });
    });

    await batch.commit();
    console.log(`[NotificationService] Marked ${snapshot.size} notifications as read for ${userId}`);
  } catch (error) {
    console.error(`[NotificationService] Error marking all read:`, error);
  }
}

/**
 * Deletes an individual notification.
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!userId || !notificationId) return;

  const cached = getLocalCache(userId);
  setLocalCache(
    userId,
    cached.filter((n) => n.id !== notificationId)
  );

  if (!isFirebaseConfigured()) return;

  try {
    const notifRef = doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, notificationId);
    await deleteDoc(notifRef);
  } catch (error) {
    console.error(`[NotificationService] Error deleting notification:`, error);
  }
}

/**
 * Creates and persists a notification in Firestore collection "notifications".
 * Supports custom deterministic ID for deduplication.
 */
export async function createNotification(
  payload: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    opportunityId?: string | null;
    applicationId?: string | null;
    scheduledFor?: string | null;
    deliveredAt?: string | null;
    opportunityTitle?: string;
    urgency?: 'urgent' | 'high' | 'normal' | 'low';
    actionLabel?: string;
    targetPage?: string;
    customId?: string;
  }
): Promise<AppNotification> {
  const { userId, type, title, message } = payload;
  if (!userId) {
    throw new Error('User ID is required to create a notification.');
  }

  const notifId =
    payload.customId ||
    `notif_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const record: FirestoreNotification = {
    id: notifId,
    userId,
    type,
    title,
    message,
    opportunityId: payload.opportunityId || null,
    applicationId: payload.applicationId || null,
    read: false,
    createdAt: nowIso,
    scheduledFor: payload.scheduledFor || null,
    deliveredAt: payload.deliveredAt || nowIso,
    opportunityTitle: payload.opportunityTitle || '',
    urgency: payload.urgency || 'normal',
    targetPage: payload.targetPage,
    actionLabel: payload.actionLabel,
    isRead: false,
  };

  // Optimistically store in local cache
  const cached = getLocalCache(userId);
  setLocalCache(userId, [normalizeNotification(notifId, record), ...cached]);

  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, notifId);
      await setDoc(docRef, {
        id: notifId,
        userId,
        type,
        title,
        message,
        opportunityId: payload.opportunityId || null,
        applicationId: payload.applicationId || null,
        read: false,
        isRead: false,
        createdAt: serverTimestamp(),
        scheduledFor: payload.scheduledFor || null,
        deliveredAt: serverTimestamp(),
        opportunityTitle: payload.opportunityTitle || '',
        urgency: payload.urgency || 'normal',
        targetPage: payload.targetPage || null,
      });
      console.log(`[NotificationService] Created notification ${notifId} in Firestore.`);
    } catch (error) {
      console.error(`[NotificationService] Error writing notification to Firestore:`, error);
    }
  }

  return normalizeNotification(notifId, record);
}

/**
 * Creates an Application Update notification when an application status changes.
 */
export async function createApplicationUpdateNotification(params: {
  userId: string;
  applicationId: string;
  opportunityId?: string | null;
  opportunityTitle: string;
  status: string;
  previousStatus?: string;
}): Promise<AppNotification | null> {
  const { userId, applicationId, opportunityId, opportunityTitle, status } = params;
  if (!userId || !applicationId) return null;

  let title = `Application Status: ${status}`;
  let message = `Your application for "${opportunityTitle}" is now marked as ${status}.`;
  let urgency: 'urgent' | 'high' | 'normal' | 'low' = 'normal';

  switch (status) {
    case 'Submitted':
      title = `Application Submitted`;
      message = `Your application for "${opportunityTitle}" has been successfully recorded as Submitted. Good luck!`;
      urgency = 'high';
      break;
    case 'Approved':
      title = `Application Approved!`;
      message = `Congratulations! Your funding application for "${opportunityTitle}" has been approved.`;
      urgency = 'urgent';
      break;
    case 'Rejected':
      title = `Application Update`;
      message = `Your application for "${opportunityTitle}" was not selected. Explore additional matching opportunities in the catalog.`;
      urgency = 'normal';
      break;
    case 'Under Review':
      title = `Application Under Review`;
      message = `Your application for "${opportunityTitle}" is currently being evaluated by the committee.`;
      urgency = 'normal';
      break;
    case 'In Progress':
      title = `Application In Progress`;
      message = `You are actively drafting your proposal for "${opportunityTitle}". Continue your work in the workspace.`;
      urgency = 'normal';
      break;
    case 'Planning':
      title = `Application Tracking Started`;
      message = `You started tracking "${opportunityTitle}". We will remind you as the deadline approaches.`;
      urgency = 'low';
      break;
  }

  // Create deterministic notification ID to prevent duplicates if fired multiple times
  const customId = `notif_app_status_${applicationId}_${status.toLowerCase().replace(/\s+/g, '_')}`;

  return createNotification({
    userId,
    type: 'Application Update',
    title,
    message,
    opportunityId: opportunityId || null,
    applicationId,
    opportunityTitle,
    urgency,
    customId,
    targetPage: 'application-tracker',
  });
}

/**
 * Creates an Opportunity Update notification (e.g. deadline changed, terms updated).
 */
export async function createOpportunityUpdateNotification(params: {
  userId: string;
  opportunityId: string;
  opportunityTitle: string;
  updateTitle: string;
  updateMessage: string;
}): Promise<AppNotification> {
  const { userId, opportunityId, opportunityTitle, updateTitle, updateMessage } = params;

  return createNotification({
    userId,
    type: 'Opportunity Update',
    title: updateTitle,
    message: updateMessage,
    opportunityId,
    opportunityTitle,
    urgency: 'normal',
    targetPage: 'opportunity-detail',
  });
}

// =============================================================================
// USER NOTIFICATION PREFERENCES PERSISTENCE
// Stored in Firestore user document (or userProfiles) with localStorage fallback.
// =============================================================================

/**
 * Retrieves persisted user notification preferences.
 */
export async function getUserNotificationPreferences(
  userId?: string
): Promise<NotificationPreferences> {
  // Read local storage first
  let localPrefs: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const raw = localStorage.getItem(LOCAL_PREFS_KEY);
    if (raw) {
      localPrefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('[NotificationService] Failed reading local notification preferences:', e);
  }

  if (!userId || !isFirebaseConfigured()) {
    return localPrefs;
  }

  try {
    const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists() && userDocSnap.data().notificationPreferences) {
      const remotePrefs = userDocSnap.data().notificationPreferences;
      const merged: NotificationPreferences = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...localPrefs,
        ...remotePrefs,
      };
      localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    console.error(`[NotificationService] Error fetching preferences from Firestore:`, error);
  }

  return localPrefs;
}

/**
 * Saves user notification preferences to Firestore and localStorage.
 */
export async function saveUserNotificationPreferences(
  userId: string | undefined,
  preferences: NotificationPreferences
): Promise<void> {
  // 1. Save to local storage
  try {
    localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(preferences));
  } catch (err) {
    console.error('[NotificationService] Error saving preferences locally:', err);
  }

  // 2. Persist to Firestore if authenticated
  if (userId && isFirebaseConfigured()) {
    try {
      const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId);
      await setDoc(
        userDocRef,
        {
          notificationPreferences: {
            deadlineReminders: preferences.deadlineReminders,
            applicationUpdates: preferences.applicationUpdates,
            opportunityUpdates: preferences.opportunityUpdates,
            systemNotifications: preferences.systemNotifications,
            defaultReminderOffsets: preferences.defaultReminderOffsets,
            recommendedOpportunities: preferences.recommendedOpportunities,
            applicationDraftReminders: preferences.applicationDraftReminders,
            emailDigestPreview: preferences.emailDigestPreview,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`[NotificationService] Persisted notification preferences for ${userId} to Firestore.`);
    } catch (error) {
      console.error(`[NotificationService] Error persisting preferences to Firestore:`, error);
    }
  }
}
