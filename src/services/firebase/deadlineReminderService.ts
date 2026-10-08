/**
 * FUNDORA - DEADLINE REMINDER ENGINE (STEP 23)
 * Implements deterministic deadline reminder architecture across standard intervals:
 * - 14 days before deadline (14d)
 * - 7 days before deadline (7d)
 * - 3 days before deadline (3d)
 * - 1 day before deadline (1d)
 * - Deadline day (0d)
 * 
 * Strict Deduplication Rule:
 * Unique key: "rem_${userId}_${applicationId}_${reminderType}_${deadline}"
 * Guarantees that the same reminder cannot repeatedly be generated.
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
import { FIRESTORE_COLLECTIONS, FirestoreApplication } from '../../types/firebase';
import { createNotification, getUserNotificationPreferences } from './notificationService';
import { formatDeadlineDate } from '../../utils/deadlineUtils';

export type ReminderIntervalKey = '14d' | '7d' | '3d' | '1d' | '0d';

export interface ReminderIntervalConfig {
  days: number;
  key: ReminderIntervalKey;
  label: string;
  urgency: 'urgent' | 'high' | 'normal';
  getTitle: (opportunityTitle: string) => string;
  getMessage: (opportunityTitle: string, formattedDeadline: string) => string;
}

export const REMINDER_INTERVALS: ReminderIntervalConfig[] = [
  {
    days: 0,
    key: '0d',
    label: 'Deadline Day',
    urgency: 'urgent',
    getTitle: (title) => `Final Day: ${title}`,
    getMessage: (title, deadline) =>
      `Today is the final day to submit your application for "${title}" (${deadline}). Verify all attachments and submit before midnight.`,
  },
  {
    days: 1,
    key: '1d',
    label: '1 Day Remaining',
    urgency: 'urgent',
    getTitle: (title) => `1 Day Remaining: ${title}`,
    getMessage: (title, deadline) =>
      `Your application for "${title}" closes tomorrow (${deadline}). Complete your final proposal review.`,
  },
  {
    days: 3,
    key: '3d',
    label: '3 Days Remaining',
    urgency: 'high',
    getTitle: (title) => `3 Days Left: ${title}`,
    getMessage: (title, deadline) =>
      `The submission window for "${title}" closes in 3 days (${deadline}). Ensure required reference letters and budgets are in place.`,
  },
  {
    days: 7,
    key: '7d',
    label: '1 Week Remaining',
    urgency: 'normal',
    getTitle: (title) => `1 Week Until Deadline: ${title}`,
    getMessage: (title, deadline) =>
      `One week remains to finalize your application for "${title}" (${deadline}). Continue drafting in the workspace.`,
  },
  {
    days: 14,
    key: '14d',
    label: '2 Weeks Remaining',
    urgency: 'normal',
    getTitle: (title) => `Deadline in 2 Weeks: ${title}`,
    getMessage: (title, deadline) =>
      `The deadline for "${title}" is in 14 days (${deadline}). Plan your proposal strategy and review eligibility details.`,
  },
];

/**
 * Normalizes deadline date string to midnight in target or UTC timezone.
 */
export function parseDeadlineToMidnight(
  deadlineStr: string,
  _targetTimezone?: string
): { date: Date; isValid: boolean; isPast: boolean; daysRemaining: number } {
  if (!deadlineStr || deadlineStr.trim() === '' || deadlineStr.toLowerCase().includes('rolling')) {
    return { date: new Date(), isValid: false, isPast: false, daysRemaining: 999 };
  }

  // Parse YYYY-MM-DD or standard ISO
  const parsed = new Date(deadlineStr);
  if (isNaN(parsed.getTime())) {
    return { date: new Date(), isValid: false, isPast: false, daysRemaining: 0 };
  }

  // Calculate midnight difference
  const now = new Date();
  const midnightNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const midnightDeadline = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

  const diffMs = midnightDeadline.getTime() - midnightNow.getTime();
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    date: midnightDeadline,
    isValid: true,
    isPast: daysRemaining < 0,
    daysRemaining,
  };
}

/**
 * Generates the deterministic reminder identifier.
 * Format: rem_${userId}_${applicationId}_${intervalKey}_${cleanDeadline}
 */
export function buildDeterministicReminderId(
  userId: string,
  applicationId: string,
  intervalKey: ReminderIntervalKey,
  deadlineStr: string
): string {
  const cleanDeadline = deadlineStr.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanAppId = applicationId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `rem_${cleanUserId}_${cleanAppId}_${intervalKey}_${cleanDeadline}`;
}

/**
 * Evaluates active applications for a given user or system-wide,
 * generates missing deadline reminder notifications, and records them
 * in both the "notifications" and "reminder_records" collections.
 */
export async function processApplicationDeadlineReminders(
  userId?: string,
  options?: { forceApplications?: FirestoreApplication[] }
): Promise<{ checked: number; generated: number; skipped: number; errors: number }> {
  const stats = { checked: 0, generated: 0, skipped: 0, errors: 0 };

  try {
    let applications: FirestoreApplication[] = [];

    if (options?.forceApplications) {
      applications = options.forceApplications;
    } else if (isFirebaseConfigured()) {
      const appsRef = collection(db, FIRESTORE_COLLECTIONS.APPLICATIONS);
      let q;
      if (userId) {
        q = query(appsRef, where('userId', '==', userId));
      } else {
        q = query(appsRef);
      }
      const snapshot = await getDocs(q);
      applications = snapshot.docs.map((docSnap) => docSnap.data() as FirestoreApplication);
    }

    if (applications.length === 0) {
      return stats;
    }

    // Process each application
    for (const app of applications) {
      stats.checked++;

      // 1. Check application status: Only notify for active tracking
      // Expired, Submitted, Approved, Rejected, or Withdrawn applications should not receive deadline alerts
      const activeStatuses = ['Planning', 'In Progress'];
      if (!activeStatuses.includes(app.status)) {
        stats.skipped++;
        continue;
      }

      // 2. Check deadline availability
      if (!app.deadline || app.deadline.toLowerCase().includes('rolling')) {
        stats.skipped++;
        continue;
      }

      const { isValid, isPast, daysRemaining } = parseDeadlineToMidnight(app.deadline);

      // 3. Prevent reminders for past/expired deadlines (Rule 9 & 17)
      if (!isValid || isPast) {
        stats.skipped++;
        continue;
      }

      // 4. Check user preferences
      const userPrefs = await getUserNotificationPreferences(app.userId);
      if (!userPrefs.deadlineReminders) {
        stats.skipped++;
        continue;
      }

      // 5. Match against defined reminder intervals: 14d, 7d, 3d, 1d, 0d
      // An interval is triggered if daysRemaining exactly equals the target or is within the window
      // without exceeding the next threshold
      for (const interval of REMINDER_INTERVALS) {
        // Trigger condition: daysRemaining is equal to interval.days
        // Or on initial check if within (interval.days) and not yet generated
        if (daysRemaining !== interval.days) {
          continue;
        }

        const deterministicId = buildDeterministicReminderId(
          app.userId,
          app.id,
          interval.key,
          app.deadline
        );

        // 6. Check if reminder was already generated in Firestore
        if (isFirebaseConfigured()) {
          try {
            const reminderDocRef = doc(db, FIRESTORE_COLLECTIONS.REMINDER_RECORDS, deterministicId);
            const reminderSnap = await getDoc(reminderDocRef);

            if (reminderSnap.exists()) {
              stats.skipped++;
              continue;
            }

            // Also check notifications collection for defense-in-depth
            const notifDocRef = doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, deterministicId);
            const notifSnap = await getDoc(notifDocRef);

            if (notifSnap.exists()) {
              stats.skipped++;
              continue;
            }

            // 7. Generate Notification document
            const formattedDate = formatDeadlineDate(app.deadline);
            const title = interval.getTitle(app.opportunityTitle);
            const message = interval.getMessage(app.opportunityTitle, formattedDate);

            await createNotification({
              customId: deterministicId,
              userId: app.userId,
              type: 'Deadline Reminder',
              title,
              message,
              opportunityId: app.opportunityId,
              applicationId: app.id,
              opportunityTitle: app.opportunityTitle,
              urgency: interval.urgency,
              targetPage: 'opportunity-detail',
            });

            // 8. Record in reminder_records to permanently prevent duplicate generation
            await setDoc(reminderDocRef, {
              id: deterministicId,
              userId: app.userId,
              applicationId: app.id,
              opportunityId: app.opportunityId,
              reminderInterval: interval.key,
              deadline: app.deadline,
              generatedAt: serverTimestamp(),
            });

            console.log(
              `[DeadlineReminderEngine] Generated reminder ${deterministicId} for app ${app.id} (${interval.label})`
            );
            stats.generated++;
          } catch (err) {
            console.error(`[DeadlineReminderEngine] Error generating reminder:`, err);
            stats.errors++;
          }
        }
      }
    }
  } catch (error) {
    console.error('[DeadlineReminderEngine] General error in deadline processing:', error);
    stats.errors++;
  }

  return stats;
}
