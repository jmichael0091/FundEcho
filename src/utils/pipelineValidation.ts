import { IncomingOpportunity, ValidationResult, ValidationCheckItem } from '../types/pipeline';

/**
 * Validates whether a given string is a syntactically valid URL
 */
function isValidUrl(urlStr?: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const url = new URL(trimmed);
    return Boolean(url.hostname && url.hostname.includes('.'));
  } catch {
    return false;
  }
}

/**
 * Validates date string formatting (YYYY-MM-DD or parseable ISO date)
 */
function isValidDate(dateStr?: string): { isValid: boolean; isPast: boolean; parsedDate?: Date } {
  if (!dateStr || typeof dateStr !== 'string') {
    return { isValid: false, isPast: false };
  }
  const trimmed = dateStr.trim();
  if (trimmed.toLowerCase() === 'rolling' || trimmed.toLowerCase() === 'ongoing' || trimmed.toLowerCase() === 'open') {
    return { isValid: true, isPast: false };
  }
  const timestamp = Date.parse(trimmed);
  if (isNaN(timestamp)) {
    return { isValid: false, isPast: false };
  }
  const date = new Date(timestamp);
  const now = new Date();
  // Normalize to start of day
  now.setHours(0, 0, 0, 0);
  const isPast = date < now;
  return { isValid: true, isPast, parsedDate: date };
}

/**
 * Checks for suspicious or placeholder text patterns
 */
function isSuspiciousContent(text?: string): { isSuspicious: boolean; reason?: string } {
  if (!text) return { isSuspicious: false };
  const lower = text.toLowerCase().trim();
  const placeholders = ['lorem ipsum', 'test title', 'asdf', 'sample opportunity', 'todo fill', 'placeholder', 'xxx'];
  
  for (const phrase of placeholders) {
    if (lower.includes(phrase)) {
      return { isSuspicious: true, reason: `Contains obvious placeholder phrase: "${phrase}"` };
    }
  }

  if (text.length < 25) {
    return { isSuspicious: true, reason: 'Description is too brief (< 25 characters) to be useful for applicants.' };
  }

  return { isSuspicious: false };
}

/**
 * Automated Pipeline Opportunity Validation Suite
 */
export function validateOpportunity(opp: Partial<IncomingOpportunity>): ValidationResult {
  const checks: ValidationCheckItem[] = [];

  // Check 1: Title
  const hasTitle = Boolean(opp.title && opp.title.trim().length > 3);
  checks.push({
    id: 'check-title',
    name: 'Opportunity Title',
    description: 'Must have a descriptive title (at least 4 characters)',
    passed: hasTitle,
    severity: 'error',
    field: 'title',
    message: hasTitle ? undefined : 'Missing or incomplete opportunity title.',
  });

  // Check 2: Provider / Organization
  const hasOrg = Boolean(opp.organization && opp.organization.trim().length > 1);
  checks.push({
    id: 'check-org',
    name: 'Provider Organization',
    description: 'Must specify the funding institution, donor, or organization',
    passed: hasOrg,
    severity: 'error',
    field: 'organization',
    message: hasOrg ? undefined : 'Provider / sponsoring organization is missing.',
  });

  // Check 3: Source URL Presence
  const hasSourceUrl = Boolean(opp.sourceUrl && opp.sourceUrl.trim().length > 0);
  checks.push({
    id: 'check-source-url-presence',
    name: 'Source URL Presence',
    description: 'Must have a recorded origin or announcement source URL',
    passed: hasSourceUrl,
    severity: 'error',
    field: 'sourceUrl',
    message: hasSourceUrl ? undefined : 'Missing origin source URL.',
  });

  // Check 4: Source URL & Application URL Validity
  const isSourceUrlValid = !hasSourceUrl || isValidUrl(opp.sourceUrl);
  const isAppUrlValid = !opp.applicationUrl || isValidUrl(opp.applicationUrl);
  const urlsValid = isSourceUrlValid && isAppUrlValid && hasSourceUrl;
  checks.push({
    id: 'check-url-validity',
    name: 'URL Protocol & Format',
    description: 'Source & Application links must be valid http(s) URLs with accessible hostnames',
    passed: urlsValid,
    severity: 'error',
    field: 'sourceUrl',
    message: !urlsValid
      ? !isSourceUrlValid
        ? 'Source URL format is invalid (must start with https://).'
        : 'Application URL format is invalid.'
      : undefined,
  });

  // Check 5: Funding Type
  const hasFundingType = Boolean(opp.fundingType && opp.fundingType.trim().length > 0);
  checks.push({
    id: 'check-funding-type',
    name: 'Funding Classification Type',
    description: 'Must classify into Grant, Fellowship, Accelerator, Prize, etc.',
    passed: hasFundingType,
    severity: 'error',
    field: 'fundingType',
    message: hasFundingType ? undefined : 'Missing funding type classification.',
  });

  // Check 6: Deadline Presence
  const hasDeadline = Boolean(opp.deadline && opp.deadline.trim().length > 0);
  checks.push({
    id: 'check-deadline-presence',
    name: 'Application Deadline',
    description: 'Requires a deadline date or "Rolling / Ongoing" notice',
    passed: hasDeadline,
    severity: 'warning',
    field: 'deadline',
    message: hasDeadline ? undefined : 'Deadline date is missing. Set a specific date or "Rolling".',
  });

  // Check 7: Date Validity & Past Deadline Check
  const dateCheck = isValidDate(opp.deadline);
  let datePassed = true;
  let dateMessage: string | undefined;

  if (hasDeadline) {
    if (!dateCheck.isValid) {
      datePassed = false;
      dateMessage = 'Invalid date format. Expected YYYY-MM-DD or standard ISO date.';
    } else if (dateCheck.isPast) {
      datePassed = false;
      dateMessage = 'Deadline is in the past. Verify if a new cycle is active.';
    }
  }

  checks.push({
    id: 'check-date-validity',
    name: 'Date Validity & Status',
    description: 'Deadline date must be a valid upcoming date or rolling period',
    passed: datePassed,
    severity: 'warning',
    field: 'deadline',
    message: dateMessage,
  });

  // Check 8: Eligibility Information
  const hasEligibility = Boolean(
    (opp.eligibility && opp.eligibility.length > 0 && opp.eligibility.some((e) => e.trim().length > 5)) ||
    (opp.country && opp.country.trim().length > 0)
  );
  checks.push({
    id: 'check-eligibility',
    name: 'Eligibility Guidelines',
    description: 'Must specify target applicant profile or eligible geographic regions',
    passed: hasEligibility,
    severity: 'warning',
    field: 'eligibility',
    message: hasEligibility ? undefined : 'Missing applicant eligibility and regional criteria.',
  });

  // Check 9: Suspicious / Incomplete Record Inspection
  const suspTitle = isSuspiciousContent(opp.title);
  const suspDesc = isSuspiciousContent(opp.description);
  const isSuspicious = suspTitle.isSuspicious || suspDesc.isSuspicious;
  checks.push({
    id: 'check-suspicious-content',
    name: 'Content Quality & Integrity',
    description: 'Scans for placeholder text, truncated content, or broken imports',
    passed: !isSuspicious,
    severity: 'warning',
    field: 'description',
    message: isSuspicious ? (suspTitle.reason || suspDesc.reason) : undefined,
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const issuesCount = checks.filter((c) => !c.passed).length;
  // Valid if all 'error' severity checks pass
  const hasErrorSeverityFailure = checks.some((c) => !c.passed && c.severity === 'error');
  const isValid = !hasErrorSeverityFailure;

  return {
    isValid,
    passedCount,
    issuesCount,
    checks,
    validatedAt: new Date().toISOString(),
  };
}
