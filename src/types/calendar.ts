export interface CalendarEvent {
  id: string;
  opportunityId: string;
  title: string;
  slug: string;
  organization: string;
  date: string; // YYYY-MM-DD
  deadlineType: 'Application Deadline' | 'LOI Due' | 'Clarification Questions' | 'Award Notification' | 'Prep Milestone';
  category: string;
  amountDisplayText: string;
  daysRemaining: number;
  urgency: 'closing_today' | 'closing_soon' | 'closing_this_week' | 'upcoming' | 'deadline_passed';
  isTracked: boolean;
  applicationUrl: string;
  location: string;
  type: string;
}

export interface PrepMilestone {
  id: string;
  opportunityId: string;
  daysBeforeDeadline: number;
  label: string;
  targetDate: string; // YYYY-MM-DD
  description: string;
  isCompleted: boolean;
  category: 'planning' | 'documentation' | 'drafting' | 'budget' | 'review' | 'submission';
}

export type CalendarViewMode = 'month' | 'timeline' | 'week';
