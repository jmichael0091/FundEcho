import { TrackedOpportunityDeadline, ReminderOption } from '../types/notification';
import { Opportunity } from '../types';

const STORAGE_KEY = 'fundora_tracked_deadlines';

/**
 * Retrieves all tracked deadlines from localStorage.
 */
export function getTrackedDeadlines(_userId?: string): TrackedOpportunityDeadline[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: TrackedOpportunityDeadline[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Error loading tracked deadlines:', err);
    return [];
  }
}

/**
 * Checks if a specific opportunity is currently tracked.
 */
export function isOpportunityTracked(opportunityId: string, userId?: string): boolean {
  const all = getTrackedDeadlines(userId);
  return all.some((t) => t.opportunityId === opportunityId);
}

/**
 * Gets the tracked deadline details for an opportunity.
 */
export function getTrackedDeadlineForOpportunity(
  opportunityId: string,
  userId?: string
): TrackedOpportunityDeadline | null {
  const all = getTrackedDeadlines(userId);
  return all.find((t) => t.opportunityId === opportunityId) || null;
}

/**
 * Saves or updates a tracked deadline in localStorage.
 */
export function saveTrackedDeadline(tracked: TrackedOpportunityDeadline): void {
  try {
    const all = getTrackedDeadlines();
    const existingIndex = all.findIndex((t) => t.opportunityId === tracked.opportunityId);

    if (existingIndex >= 0) {
      all[existingIndex] = {
        ...all[existingIndex],
        ...tracked,
      };
    } else {
      all.unshift(tracked);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving tracked deadline:', err);
  }
}

/**
 * Removes a tracked deadline by opportunity ID.
 */
export function removeTrackedDeadline(opportunityId: string, _userId?: string): void {
  try {
    const all = getTrackedDeadlines();
    const filtered = all.filter((t) => t.opportunityId !== opportunityId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error removing tracked deadline:', err);
  }
}

/**
 * Toggles tracking status for an opportunity. Returns the new tracking state (true if now tracked, false if removed).
 */
export function toggleTrackOpportunity(
  opportunity: Opportunity,
  defaultOffsets: ReminderOption[] = [7, 3, 1],
  userId?: string
): boolean {
  const currentlyTracked = isOpportunityTracked(opportunity.id, userId);

  if (currentlyTracked) {
    removeTrackedDeadline(opportunity.id, userId);
    return false;
  } else {
    const newTracked: TrackedOpportunityDeadline = {
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      opportunityOrganization: opportunity.organization,
      opportunitySlug: opportunity.slug,
      opportunityAmount: {
        displayText: opportunity.amount.displayText,
        max: opportunity.amount.max,
        currency: opportunity.amount.currency,
      },
      deadline: opportunity.deadline,
      reminderDays: defaultOffsets,
      createdAt: new Date().toISOString(),
    };
    saveTrackedDeadline(newTracked);
    return true;
  }
}
