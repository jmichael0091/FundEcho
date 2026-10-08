/**
 * FUNDORA - SERVER-SIDE DEADLINE REMINDER PROCESSOR (STEP 23)
 * Designed for server execution (Express backend or Firebase Cloud Functions).
 * 
 * Logic:
 * 1. Finds active applications (status in ['Planning', 'In Progress']).
 * 2. Checks deadlines and computes daysRemaining with explicit timezone handling.
 * 3. Evaluates reminder intervals (14d, 7d, 3d, 1d, 0d).
 * 4. Verifies deduplication via unique key: userId + applicationId + reminderType + deadline.
 * 5. Creates Firestore notification only when necessary.
 * 6. Skips expired applications and past deadlines (Rules 9 & 17).
 */

export interface ApplicationRecord {
  id: string;
  userId: string;
  opportunityId: string;
  opportunityTitle: string;
  status: string;
  deadline?: string;
  provider?: string;
}

export interface ReminderCandidate {
  deterministicId: string;
  userId: string;
  applicationId: string;
  opportunityId: string;
  opportunityTitle: string;
  intervalKey: '14d' | '7d' | '3d' | '1d' | '0d';
  daysRemaining: number;
  deadline: string;
  title: string;
  message: string;
  urgency: 'urgent' | 'high' | 'normal';
}

/**
 * Calculates days remaining to deadline in UTC midnight.
 */
export function calculateDaysRemaining(deadlineStr?: string): {
  daysRemaining: number;
  isValid: boolean;
  isPast: boolean;
  formattedDate: string;
} {
  if (!deadlineStr || deadlineStr.trim() === '' || deadlineStr.toLowerCase().includes('rolling')) {
    return { daysRemaining: 999, isValid: false, isPast: false, formattedDate: 'Rolling' };
  }

  const parsed = new Date(deadlineStr);
  if (isNaN(parsed.getTime())) {
    return { daysRemaining: 0, isValid: false, isPast: false, formattedDate: deadlineStr };
  }

  const now = new Date();
  const midnightNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const midnightDeadline = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());

  const diffDays = Math.round((midnightDeadline - midnightNow) / (1000 * 60 * 60 * 24));

  const formattedDate = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return {
    daysRemaining: diffDays,
    isValid: true,
    isPast: diffDays < 0,
    formattedDate,
  };
}

/**
 * Evaluates active applications and determines which reminders must be generated.
 */
export function evaluateApplicationsForReminders(
  applications: ApplicationRecord[],
  existingReminderKeys: Set<string>
): ReminderCandidate[] {
  const candidates: ReminderCandidate[] = [];

  for (const app of applications) {
    // 1. Only active applications receive deadline alerts
    if (app.status !== 'Planning' && app.status !== 'In Progress') {
      continue;
    }

    if (!app.deadline) continue;

    const { daysRemaining, isValid, isPast, formattedDate } = calculateDaysRemaining(app.deadline);

    // 2. Reject invalid or already expired/past deadlines (Rule 9 & 17)
    if (!isValid || isPast) {
      continue;
    }

    // 3. Map interval matches
    let intervalKey: '14d' | '7d' | '3d' | '1d' | '0d' | null = null;
    let urgency: 'urgent' | 'high' | 'normal' = 'normal';
    let title = '';
    let message = '';

    if (daysRemaining === 0) {
      intervalKey = '0d';
      urgency = 'urgent';
      title = `Deadline Today: ${app.opportunityTitle}`;
      message = `Today is the final day to submit your funding application for "${app.opportunityTitle}" (${formattedDate}). Finalize and submit before the portal closes.`;
    } else if (daysRemaining === 1) {
      intervalKey = '1d';
      urgency = 'urgent';
      title = `1 Day Remaining: ${app.opportunityTitle}`;
      message = `Your application for "${app.opportunityTitle}" is due tomorrow (${formattedDate}). Complete final reviews.`;
    } else if (daysRemaining <= 3 && daysRemaining > 1) {
      intervalKey = '3d';
      urgency = 'high';
      title = `3 Days Left: ${app.opportunityTitle}`;
      message = `The deadline for "${app.opportunityTitle}" is in 3 days (${formattedDate}). Ensure required attachments and budget tables are complete.`;
    } else if (daysRemaining <= 7 && daysRemaining > 3) {
      intervalKey = '7d';
      urgency = 'normal';
      title = `1 Week Until Deadline: ${app.opportunityTitle}`;
      message = `You have 7 days remaining to submit your application for "${app.opportunityTitle}" (${formattedDate}).`;
    } else if (daysRemaining <= 14 && daysRemaining > 7) {
      intervalKey = '14d';
      urgency = 'normal';
      title = `Deadline in 2 Weeks: ${app.opportunityTitle}`;
      message = `The deadline for "${app.opportunityTitle}" is approaching in 14 days (${formattedDate}). Continue writing your proposal draft.`;
    }

    if (!intervalKey) {
      continue;
    }

    // 4. Construct unique deduplication key: userId + applicationId + reminderType + deadline
    const cleanDeadline = app.deadline.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanAppId = app.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanUserId = app.userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const deterministicId = `rem_${cleanUserId}_${cleanAppId}_${intervalKey}_${cleanDeadline}`;

    // 5. Prevent duplicate reminders if already recorded
    if (existingReminderKeys.has(deterministicId)) {
      continue;
    }

    candidates.push({
      deterministicId,
      userId: app.userId,
      applicationId: app.id,
      opportunityId: app.opportunityId,
      opportunityTitle: app.opportunityTitle,
      intervalKey,
      daysRemaining,
      deadline: app.deadline,
      title,
      message,
      urgency,
    });
  }

  return candidates;
}
