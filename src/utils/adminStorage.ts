import { Opportunity, Category, UserProfile, ImportantDate } from '../types';
import { 
  PublicationStatus, 
  AdminVerificationStatus, 
  AccountStatus, 
  AdminUserRecord, 
  AdminStats, 
  OpportunityFormData 
} from '../types/admin';
import { SAMPLE_OPPORTUNITIES } from '../data/sampleOpportunities';
import { CATEGORIES_DATA } from '../data/categories';
import { calculateDeadlineStatus } from './deadlineUtils';

const STORAGE_KEYS = {
  OPPORTUNITIES: 'fundora_opportunities_registry_v2',
  CATEGORIES: 'fundora_categories_registry_v2',
  USERS_OVERVIEW: 'fundora_admin_users_overview_v2',
  ADMIN_MODE: 'fundora_admin_mode_active',
};

// Platform Administrator reference
export const DEMO_ADMIN_USER: UserProfile = {
  id: 'admin-fundecho-main',
  name: 'Platform Administrator',
  email: 'admin@fundecho.org',
  country: 'Global',
  interests: ['grants', 'business-funding', 'research'],
  preferredFundingTypes: ['Grant', 'Research Grant', 'Business Funding'],
  avatarBg: 'bg-indigo-700',
  initials: 'AD',
  createdAt: '2026-01-01',
  rememberSession: true,
  role: 'admin',
};

// Initial admin users list - Real users are synchronized from Firestore users collection
const INITIAL_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: 'admin-fundecho-main',
    name: 'Platform Administrator',
    email: 'admin@fundecho.org',
    country: 'Global',
    registeredAt: '2026-01-01',
    accountStatus: 'Active',
    role: 'admin',
    lastLoginAt: '2026-09-01',
    applicantType: 'Platform Administrator',
  },
  {
    id: 'admin-jmichael',
    name: 'JMichael',
    email: 'JMichael0091@gmail.com',
    country: 'Global',
    registeredAt: '2026-01-01',
    accountStatus: 'Active',
    role: 'admin',
    lastLoginAt: '2026-09-01',
    applicantType: 'Platform Administrator',
  }
];

/**
 * Normalizes an opportunity from sample data to ensure all admin properties exist
 */
function normalizeOpportunityForAdmin(opp: Opportunity, index: number): Opportunity {
  const deadlineStatus = calculateDeadlineStatus(opp.deadline);
  
  // Set default publication status if not already specified
  let pubStatus: PublicationStatus = opp.publicationStatus || 'Published';
  if (deadlineStatus.hasDeadline && deadlineStatus.isPast && pubStatus === 'Published') {
    pubStatus = 'Expired';
  }

  // Pre-seed 2 demo drafts and pending review items if loading fresh samples
  if (!opp.publicationStatus && index === 7) {
    pubStatus = 'Pending Review';
  } else if (!opp.publicationStatus && index === 9) {
    pubStatus = 'Draft';
  }

  return {
    ...opp,
    publicationStatus: pubStatus,
    adminVerificationStatus: opp.adminVerificationStatus || (opp.verified ? 'Verified' : 'Under Review'),
    source: opp.source || opp.officialSourceUrl || `${opp.organization} Official Portal`,
    lastVerifiedDate: opp.lastVerifiedDate || '2026-08-15',
    internalNotes: opp.internalNotes || 'Verified by editorial team.',
    reviewNotes: opp.reviewNotes || (pubStatus === 'Pending Review' ? 'Awaiting secondary review on eligible applicant tiers.' : undefined),
    datePosted: opp.datePosted || '2026-08-01',
    lastUpdated: opp.lastUpdated || opp.datePosted || '2026-08-20',
  };
}

/**
 * Initializes and gets all opportunities from localStorage
 */
export function getAllAdminOpportunities(): Opportunity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
    if (raw) {
      const parsed: Opportunity[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Initial seed from SAMPLE_OPPORTUNITIES
  const initial = SAMPLE_OPPORTUNITIES.map((opp, idx) => normalizeOpportunityForAdmin(opp, idx));
  try {
    localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(initial));
  } catch {}
  return initial;
}

/**
 * Strict Public Opportunities Getter: ONLY returns Published opportunities!
 * Draft, Pending Review, Expired, and Archived are excluded from public search and views.
 */
export function getPublicOpportunities(): Opportunity[] {
  const all = getAllAdminOpportunities();
  return all.filter((opp) => {
    const status = opp.publicationStatus || 'Published';
    return status === 'Published';
  });
}

/**
 * Gets a single opportunity by ID (public or admin)
 */
export function getOpportunityById(id: string): Opportunity | undefined {
  const all = getAllAdminOpportunities();
  return all.find((o) => o.id === id);
}

/**
 * Saves all opportunities array to localStorage
 */
export function persistOpportunities(opportunities: Opportunity[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(opportunities));
  } catch {}
}

/**
 * Creates or updates an opportunity (preserves ID on edits, updates lastUpdated)
 */
export function saveOpportunity(formData: OpportunityFormData): Opportunity {
  const all = getAllAdminOpportunities();
  const nowIso = new Date().toISOString().split('T')[0];

  const orgInitials = formData.organization
    ? formData.organization
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('') || 'OR'
    : 'OR';

  const logoColors = ['bg-indigo-600', 'bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-sky-600', 'bg-rose-600'];
  const orgLogoBg = logoColors[Math.floor(Math.random() * logoColors.length)];

  const slug = formData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `opp-${Date.now()}`;

  const deadlineStatus = calculateDeadlineStatus(formData.deadline);
  const daysLeft = deadlineStatus.hasDeadline ? Math.max(0, deadlineStatus.daysRemaining) : 30;

  // Build amount displayText
  const displayText = formData.amountDisplayText?.trim() || (
    formData.minAmount && formData.minAmount > 0
      ? `$${formData.minAmount.toLocaleString()} – $${formData.maxAmount.toLocaleString()}`
      : formData.isFullyFunded
      ? 'Fully Funded'
      : `$${formData.maxAmount.toLocaleString()}`
  );

  const isEditing = Boolean(formData.id);
  const targetId = formData.id || `opp-${Date.now()}`;

  const existing = isEditing ? all.find((o) => o.id === targetId) : undefined;

  const updatedRecord: Opportunity = {
    ...(existing || {}),
    id: targetId,
    title: formData.title.trim(),
    slug: existing?.slug || slug,
    organization: formData.organization.trim(),
    orgInitials: existing?.orgInitials || orgInitials,
    orgLogoBg: existing?.orgLogoBg || orgLogoBg,
    type: formData.type,
    category: formData.category,
    amount: {
      min: formData.minAmount,
      max: formData.maxAmount,
      currency: formData.currency || 'USD',
      displayText: displayText,
      isFullyFunded: formData.isFullyFunded,
    },
    deadline: formData.deadline,
    daysLeft: daysLeft,
    location: formData.location || (formData.eligibleCountries.includes('Global') ? 'Global' : formData.eligibleCountries.join(', ')),
    region: formData.region || 'Global',
    verified: formData.adminVerificationStatus === 'Verified',
    featured: formData.featured ?? existing?.featured ?? false,
    tags: formData.tags.length > 0 ? formData.tags : ['Grant', 'Funding', formData.type],
    summary: formData.summary?.trim() || formData.description?.slice(0, 160) || '',
    description: formData.description?.trim() || '',
    eligibility: formData.applicantTypes.length > 0 
      ? [
          `Open to: ${formData.applicantTypes.join(', ')}`,
          `Eligible countries: ${formData.eligibleCountries.join(', ')}`,
          ...(formData.ageRequirementsText ? [`Age criteria: ${formData.ageRequirementsText}`] : []),
          ...(formData.educationRequirementsText ? [`Education: ${formData.educationRequirementsText}`] : []),
          ...(formData.experienceRequirementsText ? [`Experience: ${formData.experienceRequirementsText}`] : []),
        ]
      : existing?.eligibility || ['Open to qualified applicants.'],
    requirements: formData.additionalRequirementsText
      ? formData.additionalRequirementsText.split('\n').map((r) => r.trim()).filter(Boolean)
      : existing?.requirements || ['Completed official online application form', 'Budget plan and proposal summary'],
    targetAudience: formData.targetAudience?.trim() || formData.applicantTypes.join(', ') || 'Eligible applicants worldwide.',
    awardDetails: formData.awardDetails?.trim() || displayText,
    applicationUrl: formData.applicationUrl.trim(),
    officialSourceUrl: formData.source || formData.applicationUrl,
    datePosted: existing?.datePosted || nowIso,
    lastUpdated: nowIso,
    
    // Admin specific metadata
    publicationStatus: formData.publicationStatus,
    adminVerificationStatus: formData.adminVerificationStatus,
    source: formData.source,
    lastVerifiedDate: formData.lastVerifiedDate || (formData.adminVerificationStatus === 'Verified' ? nowIso : undefined),
    internalNotes: formData.internalNotes,
    reviewNotes: formData.reviewNotes,
    applicationOpeningDate: formData.applicationOpeningDate,
    timezone: formData.timezone,
    applicationInstructions: formData.applicationInstructions,
    fundingDescription: formData.fundingDescription,
    ageRequirementsText: formData.ageRequirementsText,
    educationRequirementsText: formData.educationRequirementsText,
    experienceRequirementsText: formData.experienceRequirementsText,
    additionalRequirementsText: formData.additionalRequirementsText,
  };

  let newOpportunities: Opportunity[];
  if (isEditing) {
    newOpportunities = all.map((o) => (o.id === targetId ? updatedRecord : o));
  } else {
    newOpportunities = [updatedRecord, ...all];
  }

  persistOpportunities(newOpportunities);
  return updatedRecord;
}

/**
 * Updates publication status of an opportunity
 */
export function updateOpportunityPublicationStatus(
  id: string,
  newStatus: PublicationStatus,
  reviewNotes?: string
): boolean {
  const all = getAllAdminOpportunities();
  const index = all.findIndex((o) => o.id === id);
  if (index === -1) return false;

  const nowIso = new Date().toISOString().split('T')[0];
  all[index] = {
    ...all[index],
    publicationStatus: newStatus,
    reviewNotes: reviewNotes !== undefined ? reviewNotes : all[index].reviewNotes,
    lastUpdated: nowIso,
  };

  persistOpportunities(all);
  return true;
}

/**
 * Updates verification status of an opportunity
 */
export function updateOpportunityVerificationStatus(
  id: string,
  newVerification: AdminVerificationStatus,
  internalNotes?: string
): boolean {
  const all = getAllAdminOpportunities();
  const index = all.findIndex((o) => o.id === id);
  if (index === -1) return false;

  const nowIso = new Date().toISOString().split('T')[0];
  all[index] = {
    ...all[index],
    adminVerificationStatus: newVerification,
    verified: newVerification === 'Verified',
    lastVerifiedDate: newVerification === 'Verified' ? nowIso : all[index].lastVerifiedDate,
    internalNotes: internalNotes !== undefined ? internalNotes : all[index].internalNotes,
    lastUpdated: nowIso,
  };

  persistOpportunities(all);
  return true;
}

/**
 * Deletes an opportunity permanently
 */
export function deleteAdminOpportunity(id: string): boolean {
  const all = getAllAdminOpportunities();
  const filtered = all.filter((o) => o.id !== id);
  if (filtered.length === all.length) return false;
  persistOpportunities(filtered);
  return true;
}

/**
 * Calculates platform overview metrics
 */
export function getAdminPlatformStats(): AdminStats {
  const all = getAllAdminOpportunities();
  const users = getAdminUsersList();

  const total = all.length;
  const open = all.filter((o) => (o as any).status === 'Open' || (o.publicationStatus || 'Published') === 'Published').length;
  const verifying = all.filter((o) => (o as any).status === 'Verifying' || o.publicationStatus === 'Pending Review').length;
  const expired = all.filter((o) => (o as any).status === 'Expired' || o.publicationStatus === 'Expired' || o.status === 'Closed').length;
  const featured = all.filter((o) => Boolean(o.featured)).length;
  const active = all.filter((o) => (o.publicationStatus || 'Published') === 'Published').length;
  const pending = all.filter((o) => o.publicationStatus === 'Pending Review').length;
  const archived = all.filter((o) => o.publicationStatus === 'Archived').length;
  const draft = all.filter((o) => o.publicationStatus === 'Draft').length;
  const verified = all.filter((o) => Boolean(o.verified) || o.adminVerificationStatus === 'Verified').length;

  return {
    totalOpportunities: total,
    openOpportunities: open,
    verifyingOpportunities: verifying,
    expiredOpportunities: expired,
    featuredOpportunities: featured,
    activeOpportunities: active,
    pendingReviewOpportunities: pending,
    archivedOpportunities: archived,
    draftOpportunities: draft,
    totalRegisteredUsers: users.length,
    verifiedOpportunities: verified,
  };
}

// --------------------------------------------------------------------------
// CATEGORY MANAGEMENT
// --------------------------------------------------------------------------

export function getAdminCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) {
      const parsed: Category[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Fallback to CATEGORIES_DATA
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(CATEGORIES_DATA));
  } catch {}
  return CATEGORIES_DATA;
}

export function persistAdminCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch {}
}

export function saveAdminCategory(category: Category): Category[] {
  const all = getAdminCategories();
  const exists = all.some((c) => c.id === category.id);
  let updated: Category[];
  if (exists) {
    updated = all.map((c) => (c.id === category.id ? category : c));
  } else {
    updated = [...all, category];
  }
  persistAdminCategories(updated);
  return updated;
}

export function deleteAdminCategory(categoryId: string): Category[] {
  const all = getAdminCategories();
  const updated = all.filter((c) => c.id !== categoryId);
  persistAdminCategories(updated);
  return updated;
}

// --------------------------------------------------------------------------
// USER MANAGEMENT
// --------------------------------------------------------------------------

export function getAdminUsersList(): AdminUserRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS_OVERVIEW);
    if (raw) {
      const parsed: AdminUserRecord[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  try {
    localStorage.setItem(STORAGE_KEYS.USERS_OVERVIEW, JSON.stringify(INITIAL_ADMIN_USERS));
  } catch {}
  return INITIAL_ADMIN_USERS;
}

export function persistAdminUsersList(users: AdminUserRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS_OVERVIEW, JSON.stringify(users));
  } catch {}
}

export function updateAdminUserStatus(userId: string, status: AccountStatus): AdminUserRecord[] {
  const all = getAdminUsersList();
  const updated = all.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u));
  persistAdminUsersList(updated);
  return updated;
}

export function updateAdminUserRole(userId: string, role: 'user' | 'admin'): AdminUserRecord[] {
  const all = getAdminUsersList();
  const updated = all.map((u) => (u.id === userId ? { ...u, role } : u));
  persistAdminUsersList(updated);
  return updated;
}

// --------------------------------------------------------------------------
// ADMIN ACCESS & DEMO MODE TOGGLE
// --------------------------------------------------------------------------

export function isUserAdmin(user: UserProfile | null): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  if (
    email === 'jmichael0091@gmail.com' ||
    email === 'jmichrepublic@gmail.com' ||
    email === 'admin@fundecho.org' ||
    email === 'admin@fundora.org' ||
    user.id === 'admin-fundecho-main'
  ) {
    return true;
  }
  const users = getAdminUsersList();
  const found = users.find((u) => u.email.toLowerCase() === email);
  return found?.role === 'admin' || user.role === 'admin' || user.role === 'superAdmin';
}
