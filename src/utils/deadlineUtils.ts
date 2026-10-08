import { DeadlineCalculation, DeadlineUrgencyStatus, ReminderOption } from '../types/notification';

/**
 * Normalizes a date string or Date object to midnight in the local/specified timezone
 * for clean day-difference calculations.
 */
function getMidnightDate(dateInput: Date | string): Date {
  const d = new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Formats a deadline string nicely (e.g. "Oct 15, 2026", "September 18, 2026").
 * Returns "Deadline not specified" if the string is empty or invalid.
 */
export function formatDeadlineDate(
  deadlineStr?: string,
  options?: { monthFormat?: 'short' | 'long'; includeYear?: boolean }
): string {
  if (!deadlineStr || deadlineStr.trim() === '' || deadlineStr.toLowerCase().includes('not specified') || deadlineStr.toLowerCase().includes('rolling')) {
    if (deadlineStr && deadlineStr.toLowerCase().includes('rolling')) {
      return 'Rolling Deadline';
    }
    return 'Deadline not specified';
  }

  const parsed = new Date(deadlineStr);
  if (isNaN(parsed.getTime())) {
    return deadlineStr; // return original if custom text
  }

  const monthFormat = options?.monthFormat || 'short';
  const includeYear = options?.includeYear !== false;

  return parsed.toLocaleDateString('en-US', {
    month: monthFormat,
    day: 'numeric',
    year: includeYear ? 'numeric' : undefined,
  });
}

/**
 * Calculates accurate deadline metrics, status classifications, and badge properties.
 * Always handles past dates, same-day dates, missing dates, and eliminates negative days remaining.
 */
export function calculateDeadlineStatus(
  deadlineStr?: string,
  _timezone?: string,
  referenceDateInput?: Date | string
): DeadlineCalculation {
  if (!deadlineStr || deadlineStr.trim() === '' || deadlineStr.toLowerCase().includes('not specified')) {
    return {
      daysRemaining: 0,
      urgencyStatus: 'no_deadline',
      formattedDeadline: 'Deadline not specified',
      badgeText: 'Deadline not specified',
      badgeVariant: 'slate',
      isPast: false,
      isToday: false,
      isWithinWeek: false,
      hasDeadline: false,
      rawDeadline: deadlineStr,
    };
  }

  if (deadlineStr.toLowerCase().includes('rolling')) {
    return {
      daysRemaining: 999,
      urgencyStatus: 'upcoming',
      formattedDeadline: 'Rolling Admissions',
      badgeText: 'Rolling Deadline',
      badgeVariant: 'emerald',
      isPast: false,
      isToday: false,
      isWithinWeek: false,
      hasDeadline: true,
      rawDeadline: deadlineStr,
    };
  }

  const deadlineDate = new Date(deadlineStr);
  if (isNaN(deadlineDate.getTime())) {
    return {
      daysRemaining: 0,
      urgencyStatus: 'no_deadline',
      formattedDeadline: deadlineStr,
      badgeText: deadlineStr,
      badgeVariant: 'slate',
      isPast: false,
      isToday: false,
      isWithinWeek: false,
      hasDeadline: false,
      rawDeadline: deadlineStr,
    };
  }

  const referenceDate = referenceDateInput ? new Date(referenceDateInput) : new Date();
  const midnightRef = getMidnightDate(referenceDate);
  const midnightDeadline = getMidnightDate(deadlineDate);

  const diffTime = midnightDeadline.getTime() - midnightRef.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = formatDeadlineDate(deadlineStr);

  // 1. Past Deadline
  if (diffDays < 0) {
    return {
      daysRemaining: 0,
      urgencyStatus: 'deadline_passed',
      formattedDeadline: formattedDate,
      badgeText: 'Deadline passed',
      badgeVariant: 'rose',
      isPast: true,
      isToday: false,
      isWithinWeek: false,
      hasDeadline: true,
      rawDeadline: deadlineStr,
    };
  }

  // 2. Closing Today (Same day)
  if (diffDays === 0) {
    return {
      daysRemaining: 0,
      urgencyStatus: 'closing_today',
      formattedDeadline: formattedDate,
      badgeText: 'Closing today',
      badgeVariant: 'rose',
      isPast: false,
      isToday: true,
      isWithinWeek: true,
      hasDeadline: true,
      rawDeadline: deadlineStr,
    };
  }

  // 3. Closing Soon (1 to 3 days)
  if (diffDays <= 3) {
    return {
      daysRemaining: diffDays,
      urgencyStatus: 'closing_soon',
      formattedDeadline: formattedDate,
      badgeText: diffDays === 1 ? '1 day left' : `${diffDays} days left`,
      badgeVariant: 'rose',
      isPast: false,
      isToday: false,
      isWithinWeek: true,
      hasDeadline: true,
      rawDeadline: deadlineStr,
    };
  }

  // 4. Closing This Week (4 to 7 days)
  if (diffDays <= 7) {
    return {
      daysRemaining: diffDays,
      urgencyStatus: 'closing_this_week',
      formattedDeadline: formattedDate,
      badgeText: `${diffDays} days left (This week)`,
      badgeVariant: 'amber',
      isPast: false,
      isToday: false,
      isWithinWeek: true,
      hasDeadline: true,
      rawDeadline: deadlineStr,
    };
  }

  // 5. Upcoming (> 7 days)
  return {
    daysRemaining: diffDays,
    urgencyStatus: 'upcoming',
    formattedDeadline: formattedDate,
    badgeText: `${diffDays} days left`,
    badgeVariant: 'indigo',
    isPast: false,
    isToday: false,
    isWithinWeek: false,
    hasDeadline: true,
    rawDeadline: deadlineStr,
  };
}

/**
 * Generates human-readable descriptions of reminder trigger dates for given offsets.
 */
export function getReminderTriggerSchedule(
  deadlineStr: string,
  offsets: ReminderOption[]
): { offset: ReminderOption; label: string; dateDisplay: string; isPast: boolean }[] {
  if (!deadlineStr) return [];
  const parsed = new Date(deadlineStr);
  if (isNaN(parsed.getTime())) return [];

  const now = new Date();
  const midnightNow = getMidnightDate(now);

  return offsets.map((offset) => {
    const triggerDate = new Date(parsed);
    triggerDate.setDate(triggerDate.getDate() - offset);
    const midnightTrigger = getMidnightDate(triggerDate);

    const isPast = midnightTrigger.getTime() < midnightNow.getTime();

    let label = '';
    if (offset === 0) {
      label = 'On deadline day';
    } else if (offset === 1) {
      label = '1 day before';
    } else {
      label = `${offset} days before`;
    }

    const dateDisplay = triggerDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      offset,
      label,
      dateDisplay,
      isPast,
    };
  });
}

/**
 * Step 22: Application Tracking Deadline Awareness.
 * Clearly classifies a deadline into one of the 4 required categories:
 * - Upcoming
 * - Approaching
 * - Due soon
 * - Passed
 */
export type ApplicationDeadlineCategory = 'Upcoming' | 'Approaching' | 'Due soon' | 'Passed' | 'No Deadline';

export interface ApplicationDeadlineAwareness {
  category: ApplicationDeadlineCategory;
  formattedDate: string;
  daysRemaining: number;
  badgeLabel: string;
  badgeVariant: 'rose' | 'amber' | 'blue' | 'emerald' | 'slate';
  isPassed: boolean;
}

export function getApplicationDeadlineAwareness(deadlineStr?: string): ApplicationDeadlineAwareness {
  const calc = calculateDeadlineStatus(deadlineStr);

  if (!calc.hasDeadline) {
    return {
      category: 'No Deadline',
      formattedDate: calc.formattedDeadline,
      daysRemaining: 0,
      badgeLabel: 'No deadline',
      badgeVariant: 'slate',
      isPassed: false,
    };
  }

  if (calc.isPast) {
    return {
      category: 'Passed',
      formattedDate: calc.formattedDeadline,
      daysRemaining: 0,
      badgeLabel: 'Passed',
      badgeVariant: 'rose',
      isPassed: true,
    };
  }

  if (calc.daysRemaining <= 7) {
    return {
      category: 'Due soon',
      formattedDate: calc.formattedDeadline,
      daysRemaining: calc.daysRemaining,
      badgeLabel: calc.daysRemaining === 0 ? 'Due soon (Today)' : `Due soon (${calc.daysRemaining}d)`,
      badgeVariant: 'rose',
      isPassed: false,
    };
  }

  if (calc.daysRemaining <= 21) {
    return {
      category: 'Approaching',
      formattedDate: calc.formattedDeadline,
      daysRemaining: calc.daysRemaining,
      badgeLabel: `Approaching (${calc.daysRemaining}d)`,
      badgeVariant: 'amber',
      isPassed: false,
    };
  }

  return {
    category: 'Upcoming',
    formattedDate: calc.formattedDeadline,
    daysRemaining: calc.daysRemaining,
    badgeLabel: `Upcoming (${calc.daysRemaining}d)`,
    badgeVariant: 'emerald',
    isPassed: false,
  };
}
