import { Opportunity } from '../types';
import { CalendarEvent, PrepMilestone } from '../types/calendar';

/**
 * Formats a Date object to RFC 5545 format (YYYYMMDDTHHmmssZ) or date-only (YYYYMMDD).
 */
export function formatDateToICS(date: Date, allDay = true): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());

  if (allDay) {
    return `${year}${month}${day}`;
  }

  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes characters for standard iCalendar text fields.
 */
function escapeICSText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates an "Add to Google Calendar" web intent URL.
 */
export function generateGoogleCalendarUrl(
  opportunity: Opportunity | { title: string; deadline: string; organization: string; summary: string; applicationUrl: string; location: string }
): string {
  if (!opportunity.deadline || isNaN(new Date(opportunity.deadline).getTime())) {
    return 'https://calendar.google.com/calendar/';
  }

  const deadlineDate = new Date(opportunity.deadline);
  // Default deadline end of day
  const startDateStr = formatDateToICS(deadlineDate, true);
  
  // Next day for full-day event
  const endDate = new Date(deadlineDate);
  endDate.setDate(endDate.getDate() + 1);
  const endDateStr = formatDateToICS(endDate, true);

  const title = `[DEADLINE] ${opportunity.title} (${opportunity.organization})`;
  const details = `FundEcho Opportunity Deadline: ${opportunity.title}\n\nOrganization: ${opportunity.organization}\nLocation: ${opportunity.location || 'Global'}\nOfficial Application Portal: ${opportunity.applicationUrl || 'https://fundecho.org'}\n\nSummary:\n${opportunity.summary || ''}\n\nTracked via FundEcho (100% Verified Global Funding Network).`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDateStr}/${endDateStr}`,
    details: details,
    location: opportunity.location || 'Online / Global',
    sprop: 'website:fundecho.org',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an Outlook.com / Office 365 web calendar URL.
 */
export function generateOutlookCalendarUrl(
  opportunity: Opportunity | { title: string; deadline: string; organization: string; summary: string; applicationUrl: string; location: string }
): string {
  if (!opportunity.deadline || isNaN(new Date(opportunity.deadline).getTime())) {
    return 'https://outlook.live.com/calendar/0/deeplink/compose';
  }

  const deadlineDate = new Date(opportunity.deadline);
  const startDateStr = deadlineDate.toISOString().split('T')[0];
  const endDate = new Date(deadlineDate);
  endDate.setDate(endDate.getDate() + 1);
  const endDateStr = endDate.toISOString().split('T')[0];

  const subject = `[DEADLINE] ${opportunity.title}`;
  const body = `FundEcho Deadline Reminder for ${opportunity.title} by ${opportunity.organization}.\n\nApply at: ${opportunity.applicationUrl || ''}\n\nSummary: ${opportunity.summary || ''}`;

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    startdt: startDateStr,
    enddt: endDateStr,
    allday: 'true',
    subject: subject,
    body: body,
    location: opportunity.location || 'Online',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates an RFC 5545 compliant .ics (iCalendar) file string for one or multiple opportunities.
 */
export function generateICSContent(opportunities: Opportunity[]): string {
  const now = new Date();
  const dtStamp = formatDateToICS(now, false);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FundEcho//Funding Opportunities Network//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FundEcho Grant Deadlines',
    'X-WR-TIMEZONE:UTC',
    'X-WR-CALDESC:Verified funding application deadlines and milestones tracked on FundEcho.',
  ];

  opportunities.forEach((opp) => {
    if (!opp.deadline || isNaN(new Date(opp.deadline).getTime())) {
      return;
    }

    const deadlineDate = new Date(opp.deadline);
    const startDate = formatDateToICS(deadlineDate, true);
    const nextDay = new Date(deadlineDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = formatDateToICS(nextDay, true);

    const uid = `fundora-opp-${opp.id}-${opp.deadline.replace(/-/g, '')}@fundecho.org`;
    const summary = escapeICSText(`[GRANT DEADLINE] ${opp.title} (${opp.organization})`);
    const description = escapeICSText(
      `Funding Amount: ${opp.amount?.displayText || 'Variable'}\n` +
      `Host Organization: ${opp.organization}\n` +
      `Category: ${opp.category}\n` +
      `Official Portal: ${opp.applicationUrl}\n\n` +
      `Description: ${opp.summary}\n\n` +
      `Verified by FundEcho Global Funding Network.`
    );
    const location = escapeICSText(opp.location || 'Online / Global');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART;VALUE=DATE:${startDate}`);
    lines.push(`DTEND;VALUE=DATE:${endDate}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`LOCATION:${location}`);
    lines.push(`URL:${opp.applicationUrl || 'https://fundecho.org'}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT');
    
    // Add default alarm reminder 3 days before
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:Reminder: 3 days until Grant Deadline');
    lines.push('TRIGGER:-P3D');
    lines.push('END:VALARM');

    // Add final alarm 1 day before
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:Urgent Reminder: Tomorrow is Grant Deadline!');
    lines.push('TRIGGER:-P1D');
    lines.push('END:VALARM');

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Triggers a download in the user's browser for an .ics file.
 */
export function downloadICSFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates structured preparation milestones working backwards from the official deadline.
 */
export function generateMilestonePlan(deadlineStr: string, opportunityId: string): PrepMilestone[] {
  if (!deadlineStr || isNaN(new Date(deadlineStr).getTime())) {
    return [];
  }

  const deadline = new Date(deadlineStr);

  const calculateTargetDate = (daysBefore: number): string => {
    const d = new Date(deadline);
    d.setDate(d.getDate() - daysBefore);
    return d.toISOString().split('T')[0];
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPast = (targetDateStr: string) => {
    const d = new Date(targetDateStr);
    return d < today;
  };

  const rawMilestones: Omit<PrepMilestone, 'id' | 'targetDate' | 'isCompleted'>[] = [
    {
      opportunityId,
      daysBeforeDeadline: 30,
      label: 'Read RFP & Form Proposal Team',
      category: 'planning',
      description: 'Review official eligibility criteria, guidelines, and scoring rubric. Identify co-investigators or team members.',
    },
    {
      opportunityId,
      daysBeforeDeadline: 21,
      label: 'Request Letters of Recommendation & Official Filings',
      category: 'documentation',
      description: 'Request support letters, institutional tax exempt/incorporation certificates, and academic endorsements.',
    },
    {
      opportunityId,
      daysBeforeDeadline: 14,
      label: 'Complete First Draft & Internal Review',
      category: 'drafting',
      description: 'Draft the problem statement, proposed methodology, and key milestones in the FundEcho Application Workspace.',
    },
    {
      opportunityId,
      daysBeforeDeadline: 7,
      label: 'Audit Itemized Budget & Currency Figures',
      category: 'budget',
      description: 'Verify cost justification, indirect costs, equipment quotes, and ensure requested amount aligns with funder limits.',
    },
    {
      opportunityId,
      daysBeforeDeadline: 3,
      label: 'Final Proofreading & Upload to Portal',
      category: 'review',
      description: 'Check word counts, character limits, formatting, and create portal account if required.',
    },
    {
      opportunityId,
      daysBeforeDeadline: 0,
      label: 'Submit Official Application & Save Confirmation',
      category: 'submission',
      description: 'Submit on official portal before deadline cutoff. Archive confirmation email and reference number.',
    },
  ];

  return rawMilestones.map((m, idx) => {
    const targetDate = calculateTargetDate(m.daysBeforeDeadline);
    return {
      ...m,
      id: `${opportunityId}-ms-${idx}`,
      targetDate,
      isCompleted: isPast(targetDate),
    };
  });
}
