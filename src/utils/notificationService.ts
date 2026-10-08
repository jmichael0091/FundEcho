import { 
  AppNotification, 
  NotificationPreferences, 
  DEFAULT_NOTIFICATION_PREFERENCES, 
  TrackedOpportunityDeadline 
} from '../types/notification';
import { Opportunity, UserProfile } from '../types';
import { ApplicationDraft } from '../types/application';
import { calculateDeadlineStatus } from './deadlineUtils';
import { getAllStoredApplications } from './applicationStorage';
import { getTrackedDeadlines } from './reminderStorage';

const PREFS_STORAGE_KEY = 'fundora_notification_preferences';
const NOTIFICATIONS_STORAGE_KEY = 'fundora_notifications';

/**
 * Retrieves user notification preferences.
 */
export function getNotificationPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...JSON.parse(raw),
    };
  } catch (err) {
    console.error('Error loading notification preferences:', err);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Saves user notification preferences.
 */
export function saveNotificationPreferences(preferences: NotificationPreferences): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
  } catch (err) {
    console.error('Error saving notification preferences:', err);
  }
}

/**
 * Retrieves stored notifications from localStorage.
 */
export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading notifications:', err);
    return [];
  }
}

/**
 * Saves notifications list to localStorage.
 */
export function saveStoredNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}

/**
 * Generates and synchronizes local notifications based on current app state,
 * tracked deadlines, application drafts, and user preferences.
 */
export function syncAndGenerateNotifications(
  allOpportunities: Opportunity[],
  user?: UserProfile | null
): AppNotification[] {
  const prefs = getNotificationPreferences();
  const existingNotifications = getStoredNotifications();
  const existingMap = new Map(existingNotifications.map((n) => [n.id, n]));

  const generated: AppNotification[] = [];
  const now = new Date();

  // 1. Check Tracked Opportunity Deadlines
  if (prefs.deadlineReminders) {
    const trackedDeadlines = getTrackedDeadlines(user?.id);

    trackedDeadlines.forEach((tracked) => {
      const opp = allOpportunities.find((o) => o.id === tracked.opportunityId);
      const deadlineToUse = opp?.deadline || tracked.deadline;
      const status = calculateDeadlineStatus(deadlineToUse);

      if (!status.hasDeadline || status.isPast) return;

      // Check if daysRemaining matches any of user's active reminder triggers
      tracked.reminderDays.forEach((daysOffset) => {
        if (status.daysRemaining <= daysOffset && status.daysRemaining >= 0) {
          const notifId = `deadline-${tracked.opportunityId}-${daysOffset}d`;
          
          let urgencyLevel: 'urgent' | 'high' | 'normal' = 'normal';
          let timeMessage = `${status.daysRemaining} days remaining`;

          if (status.isToday) {
            urgencyLevel = 'urgent';
            timeMessage = 'closes TODAY';
          } else if (status.daysRemaining === 1) {
            urgencyLevel = 'urgent';
            timeMessage = 'closes TOMORROW';
          } else if (status.daysRemaining <= 3) {
            urgencyLevel = 'high';
            timeMessage = `closes in ${status.daysRemaining} days`;
          }

          const notif: AppNotification = {
            id: notifId,
            type: 'deadline_approaching',
            title: status.isToday 
              ? `Final Day: ${tracked.opportunityTitle}` 
              : `Deadline Alert: ${tracked.opportunityTitle}`,
            message: `This opportunity ${timeMessage} (${status.formattedDeadline}). Ensure all required materials and budget tables are ready.`,
            timestamp: now.toISOString(),
            isRead: existingMap.has(notifId) ? existingMap.get(notifId)!.isRead : false,
            opportunityId: tracked.opportunityId,
            opportunityTitle: tracked.opportunityTitle,
            targetPage: 'opportunity-detail',
            urgency: urgencyLevel,
            isDemoLocal: true,
            actionLabel: 'View Opportunity',
            daysRemaining: status.daysRemaining,
          };

          generated.push(notif);
        }
      });
    });
  }

  // 2. Check Unfinished Application Drafts
  if (prefs.applicationDraftReminders) {
    const drafts: ApplicationDraft[] = getAllStoredApplications(user?.id);

    drafts.forEach((draft) => {
      if (draft.completionStatus !== 'completed') {
        const notifId = `draft-reminder-${draft.id}`;
        const opp = allOpportunities.find((o) => o.id === draft.opportunityId);

        const notif: AppNotification = {
          id: notifId,
          type: 'application_draft_reminder',
          title: `Unfinished Application: ${draft.opportunityTitle}`,
          message: `You have an active proposal draft in progress for ${draft.opportunityOrganization}. Resume your writing and budget planning in the AI Workspace.`,
          timestamp: draft.lastUpdated || now.toISOString(),
          isRead: existingMap.has(notifId) ? existingMap.get(notifId)!.isRead : false,
          opportunityId: draft.opportunityId,
          opportunityTitle: draft.opportunityTitle,
          targetPage: 'application-workspace',
          targetWorkspaceDraftId: draft.id,
          urgency: 'normal',
          isDemoLocal: true,
          actionLabel: 'Continue Draft',
        };

        generated.push(notif);
      }
    });
  }

  // 3. Recommended Opportunities Notification (if enabled and user is present)
  if (prefs.recommendedOpportunities && user) {
    const notifId = `recom-${user.id}-${now.toISOString().split('T')[0]}`;
    if (!existingMap.has(notifId)) {
      const notif: AppNotification = {
        id: notifId,
        type: 'new_recommendation',
        title: `Curated Grants for ${user.country || 'Global'} Seekers`,
        message: `New verified funding programs matching your preferences in ${user.interests?.join(', ') || 'grants'} were recently added.`,
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), // 4 hrs ago
        isRead: false,
        targetPage: 'recommended',
        urgency: 'low',
        isDemoLocal: true,
        actionLabel: 'Explore Recommendations',
      };
      generated.push(notif);
    }
  }

  // 4. Default Seed/Demo Notifications on First Load (if no notifications exist)
  if (existingNotifications.length === 0 && generated.length === 0) {
    const defaultSeedNotifications: AppNotification[] = [
      {
        id: 'seed-notif-1',
        type: 'deadline_approaching',
        title: 'Deadline Approaching: Mozilla Tech & Society Fellowship',
        message: 'The Mozilla Tech & Society Fellowship closes in 29 days (Sep 30, 2026). Ensure your references and residency proposal are finalized.',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
        isRead: false,
        opportunityId: 'opp-2',
        opportunityTitle: 'Mozilla Technology & Society Fellowship',
        targetPage: 'opportunity-detail',
        urgency: 'high',
        isDemoLocal: true,
        actionLabel: 'Review Details',
        daysRemaining: 29,
      },
      {
        id: 'seed-notif-2',
        type: 'opportunity_update',
        title: 'Verified Funder Update: Gates Foundation Grant',
        message: 'Updated guidelines for technical proposals and open-access licensing frameworks are now live.',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(),
        isRead: false,
        opportunityId: 'opp-1',
        opportunityTitle: 'Global Health & Equitable Tech Innovation Grant',
        targetPage: 'opportunity-detail',
        urgency: 'normal',
        isDemoLocal: true,
        actionLabel: 'View Update',
      },
      {
        id: 'seed-notif-3',
        type: 'new_recommendation',
        title: 'Welcome to FundEcho Deadline & Notification Hub',
        message: 'Track deadlines, configure reminders (7d, 3d, 1d), and receive timely alerts for open grant opportunities.',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 36).toISOString(),
        isRead: true,
        targetPage: 'opportunities',
        urgency: 'low',
        isDemoLocal: true,
        actionLabel: 'Explore Opportunities',
      },
    ];

    saveStoredNotifications(defaultSeedNotifications);
    return defaultSeedNotifications;
  }

  // Merge generated with any custom existing ones preserving read states
  const combinedMap = new Map<string, AppNotification>();

  // Add existing first
  existingNotifications.forEach((n) => combinedMap.set(n.id, n));

  // Update or insert newly generated
  generated.forEach((n) => {
    if (combinedMap.has(n.id)) {
      const existing = combinedMap.get(n.id)!;
      combinedMap.set(n.id, {
        ...n,
        isRead: existing.isRead,
      });
    } else {
      combinedMap.set(n.id, n);
    }
  });

  const merged = Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  saveStoredNotifications(merged);
  return merged;
}

/**
 * Marks a single notification as read.
 */
export function markNotificationAsRead(notificationId: string): AppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
  saveStoredNotifications(updated);
  return updated;
}

/**
 * Marks all notifications as read.
 */
export function markAllNotificationsAsRead(): AppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, isRead: true }));
  saveStoredNotifications(updated);
  return updated;
}

/**
 * Deletes a notification by ID.
 */
export function deleteNotification(notificationId: string): AppNotification[] {
  const current = getStoredNotifications();
  const updated = current.filter((n) => n.id !== notificationId);
  saveStoredNotifications(updated);
  return updated;
}

/**
 * Clears all notifications.
 */
export function clearAllNotifications(): AppNotification[] {
  saveStoredNotifications([]);
  return [];
}

/**
 * Counts unread notifications.
 */
export function getUnreadNotificationCount(): number {
  const current = getStoredNotifications();
  return current.filter((n) => !n.isRead).length;
}
