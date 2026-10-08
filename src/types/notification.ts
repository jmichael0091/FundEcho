import { PageId } from './index';

export type DeadlineUrgencyStatus = 
  | 'closing_today'
  | 'closing_soon'
  | 'closing_this_week'
  | 'upcoming'
  | 'deadline_passed'
  | 'no_deadline';

export type ReminderOption = 14 | 7 | 3 | 1 | 0; // Days before deadline (0 = on deadline day)

export interface DeadlineCalculation {
  daysRemaining: number;
  hoursRemaining?: number;
  urgencyStatus: DeadlineUrgencyStatus;
  formattedDeadline: string;
  badgeText: string;
  badgeVariant: 'rose' | 'amber' | 'indigo' | 'slate' | 'emerald';
  isPast: boolean;
  isToday: boolean;
  isWithinWeek: boolean;
  hasDeadline: boolean;
  rawDeadline?: string;
}

export interface TrackedOpportunityDeadline {
  opportunityId: string;
  opportunityTitle: string;
  opportunityOrganization: string;
  opportunitySlug?: string;
  opportunityAmount?: {
    displayText: string;
    max: number;
    currency: string;
  };
  deadline: string; // ISO date string or YYYY-MM-DD
  timezone?: string;
  reminderDays: ReminderOption[]; // e.g. [14, 7, 3, 1, 0]
  createdAt: string;
  lastNotified?: string;
  notes?: string;
  hasDraft?: boolean;
  draftId?: string;
}

export type NotificationType = 
  | 'Deadline Reminder'
  | 'Application Update'
  | 'Opportunity Update'
  | 'System Notification'
  | 'deadline_approaching'
  | 'deadline_update'
  | 'application_draft_reminder'
  | 'new_recommendation'
  | 'opportunity_update'
  | 'system';

export interface AppNotification {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  read?: boolean;
  opportunityId?: string | null;
  applicationId?: string | null;
  createdAt?: any;
  scheduledFor?: any;
  deliveredAt?: any;
  opportunitySlug?: string;
  opportunityTitle?: string;
  targetPage?: PageId;
  targetWorkspaceDraftId?: string;
  urgency?: 'urgent' | 'high' | 'normal' | 'low';
  isDemoLocal?: boolean;
  actionLabel?: string;
  daysRemaining?: number;
}

export interface NotificationPreferences {
  deadlineReminders: boolean;
  applicationUpdates: boolean;
  opportunityUpdates: boolean;
  systemNotifications: boolean;
  defaultReminderOffsets: ReminderOption[];
  recommendedOpportunities: boolean;
  applicationDraftReminders: boolean;
  emailDigestPreview: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  deadlineReminders: true,
  applicationUpdates: true,
  opportunityUpdates: true,
  systemNotifications: true,
  defaultReminderOffsets: [14, 7, 3, 1, 0],
  recommendedOpportunities: true,
  applicationDraftReminders: true,
  emailDigestPreview: false,
};
