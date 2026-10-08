/**
 * FUNDECHO - CRAWLER PIPELINE FIRESTORE SERVICE (STEP 2)
 * Production-ready Firestore database service for managing the 8 core crawler collections:
 * 1. opportunities     - Published & active opportunities
 * 2. drafts            - Opportunities discovered by crawler awaiting review
 * 3. sources           - Monitored websites, portals, and organizations
 * 4. crawlJobs         - Crawler execution tasks, metrics, and statuses
 * 5. crawlResults      - Raw discovered page captures & AI extractions
 * 6. verificationQueue - Human/admin review backlog and decisions
 * 7. duplicates        - Duplicate detection and merge records
 * 8. adminLogs         - Tamper-evident admin audit action logs
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  orderBy,
  serverTimestamp,
  startAfter,
  QueryConstraint,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  PIPELINE_COLLECTIONS,
  OpportunityDraftDoc,
  CrawlerSourceDoc,
  CrawlJobDoc,
  CrawlResultDoc,
  VerificationQueueDoc,
  DuplicateRecordDoc,
  AdminLogDoc,
  AdminActionType,
  DraftStatus,
  SourceStatus,
  CrawlJobStatus,
  CrawlResultStatus,
  VerificationQueueStatus,
  DuplicateResolutionStatus,
} from '../../types/crawlerPipelineSchema';
import {
  FundEchoOpportunityDoc,
  FundEchoOpportunityStatus,
} from '../../types/opportunitySchema';
import { handleFirestoreError } from './firestoreService';
import {
  generateOpportunityDeduplicationHash,
  normalizeOpportunityToSchema,
} from '../../utils/opportunitySchemaValidator';

// =============================================================================
// 1. OPPORTUNITIES COLLECTION ("opportunities/{id}")
// =============================================================================

export interface QueryOpportunitiesOptions {
  category?: string;
  opportunityType?: string;
  status?: FundEchoOpportunityStatus;
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
}

/**
 * Queries published and approved opportunities from the "opportunities" collection.
 */
export async function getPipelinePublishedOpportunities(
  options: QueryOpportunitiesOptions = {}
): Promise<{ opportunities: FundEchoOpportunityDoc[]; lastDoc: DocumentSnapshot | null }> {
  if (!isFirebaseConfigured()) return { opportunities: [], lastDoc: null };

  try {
    const oppsRef = collection(db, PIPELINE_COLLECTIONS.OPPORTUNITIES);
    const constraints: QueryConstraint[] = [];

    const targetStatus = options.status || 'Published';
    constraints.push(where('status', '==', targetStatus));

    if (options.category && options.category !== 'all') {
      constraints.push(where('category', '==', options.category));
    }
    if (options.opportunityType && options.opportunityType !== 'all') {
      constraints.push(where('opportunityType', '==', options.opportunityType));
    }

    constraints.push(orderBy('deadline', 'asc'));
    constraints.push(limit(options.limitCount || 30));

    if (options.lastDoc) {
      constraints.push(startAfter(options.lastDoc));
    }

    const q = query(oppsRef, ...constraints);
    const snap = await getDocs(q);

    const items = snap.docs.map((d) => normalizeOpportunityToSchema({ id: d.id, ...d.data() }));
    const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { opportunities: items, lastDoc: last };
  } catch (error) {
    handleFirestoreError(error, 'list', PIPELINE_COLLECTIONS.OPPORTUNITIES);
    return { opportunities: [], lastDoc: null };
  }
}

/**
 * Fetches an approved opportunity by ID from the "opportunities" collection.
 */
export async function getOpportunityDocument(
  opportunityId: string
): Promise<FundEchoOpportunityDoc | null> {
  if (!opportunityId || !isFirebaseConfigured()) return null;
  try {
    const ref = doc(db, PIPELINE_COLLECTIONS.OPPORTUNITIES, opportunityId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return normalizeOpportunityToSchema({ id: snap.id, ...snap.data() });
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, 'read', `${PIPELINE_COLLECTIONS.OPPORTUNITIES}/${opportunityId}`);
    return null;
  }
}

// =============================================================================
// 2. DRAFTS COLLECTION ("drafts/{draftId}")
// =============================================================================

export interface QueryDraftsOptions {
  status?: DraftStatus;
  sourceId?: string;
  limitCount?: number;
}

/**
 * Creates or stages a newly discovered opportunity in the "drafts" collection.
 */
export async function createOpportunityDraft(
  draft: Partial<OpportunityDraftDoc> & { title: string; provider: string }
): Promise<OpportunityDraftDoc> {
  const now = serverTimestamp();
  const draftId = draft.id || `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const dedupHash =
    draft.deduplicationHash ||
    generateOpportunityDeduplicationHash(draft.title, draft.provider, draft.deadline);

  const fullDraft: OpportunityDraftDoc = {
    ...normalizeOpportunityToSchema(draft),
    id: draftId,
    status: draft.status || 'pending_review',
    sourceId: draft.sourceId || 'source_manual',
    sourceName: draft.sourceName || 'Crawler Feed',
    deduplicationHash: dedupHash,
    isDuplicateSuspected: Boolean(draft.isDuplicateSuspected),
    aiConfidence: typeof draft.aiConfidence === 'number' ? draft.aiConfidence : 85,
    discoveredAt: draft.discoveredAt || now,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, PIPELINE_COLLECTIONS.DRAFTS, draftId);
      await setDoc(ref, fullDraft);
    } catch (error) {
      handleFirestoreError(error, 'create', `${PIPELINE_COLLECTIONS.DRAFTS}/${draftId}`);
      throw error;
    }
  }

  return fullDraft;
}

/**
 * Fetches drafts awaiting admin review from the "drafts" collection.
 */
export async function getOpportunityDrafts(
  options: QueryDraftsOptions = {}
): Promise<OpportunityDraftDoc[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const colRef = collection(db, PIPELINE_COLLECTIONS.DRAFTS);
    const constraints: QueryConstraint[] = [];

    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }
    if (options.sourceId) {
      constraints.push(where('sourceId', '==', options.sourceId));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(options.limitCount || 50));

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as OpportunityDraftDoc[];
  } catch (error) {
    handleFirestoreError(error, 'list', PIPELINE_COLLECTIONS.DRAFTS);
    return [];
  }
}

/**
 * Approves a draft, moves it to the "opportunities" collection with status 'Published',
 * marks the draft as approved, and logs the action in "adminLogs".
 */
export async function approveDraftAndPublish(
  draftId: string,
  adminUser: { id: string; email: string; name?: string }
): Promise<{ success: boolean; opportunityId: string }> {
  if (!draftId || !isFirebaseConfigured()) {
    throw new Error('Draft ID and database connection are required.');
  }

  const draftRef = doc(db, PIPELINE_COLLECTIONS.DRAFTS, draftId);
  const snap = await getDoc(draftRef);
  if (!snap.exists()) {
    throw new Error(`Draft ${draftId} does not exist.`);
  }

  const draftData = snap.data() as OpportunityDraftDoc;
  const now = serverTimestamp();
  const publishedOpportunityId = draftData.slug || draftId.replace('draft_', 'opp_');

  // 1. Prepare published opportunity document
  const publishedDoc: FundEchoOpportunityDoc = {
    ...normalizeOpportunityToSchema(draftData),
    id: publishedOpportunityId,
    status: 'Published',
    verified: true,
    lastVerified: new Date().toISOString().split('T')[0],
    adminVerification: {
      verifiedBy: adminUser.email,
      verifiedAt: new Date().toISOString(),
      verificationStatus: 'Verified',
      adminNotes: 'Approved and published from crawler review queue.',
    },
    createdAt: draftData.createdAt || now,
    updatedAt: now,
  };

  try {
    // 2. Write to "opportunities"
    const oppRef = doc(db, PIPELINE_COLLECTIONS.OPPORTUNITIES, publishedOpportunityId);
    await setDoc(oppRef, publishedDoc);

    // 3. Mark draft as approved
    await updateDoc(draftRef, {
      status: 'approved' as DraftStatus,
      publishedOpportunityId,
      reviewedBy: adminUser.email,
      reviewedAt: now,
      updatedAt: now,
    });

    // 4. Log admin action in "adminLogs"
    await logAdminAction({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      actionType: 'draft_approve',
      targetCollection: 'drafts',
      targetId: draftId,
      targetTitle: draftData.title,
      details: `Approved draft "${draftData.title}" and published to opportunities/${publishedOpportunityId}`,
    });

    return { success: true, opportunityId: publishedOpportunityId };
  } catch (error) {
    handleFirestoreError(error, 'update', `${PIPELINE_COLLECTIONS.DRAFTS}/${draftId}`);
    throw error;
  }
}

/**
 * Rejects a draft with an administrative reason.
 */
export async function rejectOpportunityDraft(
  draftId: string,
  rejectionReason: string,
  adminUser: { id: string; email: string; name?: string }
): Promise<void> {
  if (!draftId || !isFirebaseConfigured()) return;

  const now = serverTimestamp();
  try {
    const draftRef = doc(db, PIPELINE_COLLECTIONS.DRAFTS, draftId);
    await updateDoc(draftRef, {
      status: 'rejected' as DraftStatus,
      rejectionReason,
      reviewedBy: adminUser.email,
      reviewedAt: now,
      updatedAt: now,
    });

    await logAdminAction({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      actionType: 'draft_reject',
      targetCollection: 'drafts',
      targetId: draftId,
      details: `Rejected draft ${draftId}: ${rejectionReason}`,
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `${PIPELINE_COLLECTIONS.DRAFTS}/${draftId}`);
    throw error;
  }
}

// =============================================================================
// 3. SOURCES COLLECTION ("sources/{sourceId}") - STEP 3 SOURCE REGISTRY
// =============================================================================

/**
 * Normalizes frequency hours from human-readable labels.
 */
function parseCrawlFrequencyHours(frequency?: string): number {
  if (!frequency) return 24;
  const f = frequency.toLowerCase();
  if (f.includes('6')) return 6;
  if (f.includes('12')) return 12;
  if (f.includes('3 day') || f.includes('72')) return 72;
  if (f.includes('week') || f.includes('168')) return 168;
  return 24;
}

/**
 * Computes next scheduled crawl ISO timestamp based on frequency.
 */
function computeNextCrawlDate(hours = 24): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

/**
 * Extracts and normalizes hostname/domain from a URL string.
 */
export function extractDomainFromUrl(url: string): string {
  try {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  }
}

/**
 * Creates or updates a monitored crawler source in the "sources" collection.
 */
export async function saveCrawlerSource(
  source: Partial<CrawlerSourceDoc> & { sourceName?: string; name?: string; websiteUrl?: string; baseUrl?: string }
): Promise<CrawlerSourceDoc> {
  const now = serverTimestamp();
  const rawUrl = source.websiteUrl || source.baseUrl || 'https://fundecho.org';
  const domain = source.domain || extractDomainFromUrl(rawUrl);
  const sourceName = source.sourceName || source.name || domain;
  const sourceId = source.id || `source_${domain.replace(/[^a-z0-9]/g, '_')}`;

  const crawlFrequency = source.crawlFrequency || 'Daily (24h)';
  const crawlFrequencyHours = source.crawlFrequencyHours || parseCrawlFrequencyHours(crawlFrequency);
  const region = source.countryRegion || source.region || 'Global';
  const categories = source.opportunityCategories || source.categories || ['entrepreneurship-business'];

  // Normalize status
  const normalizedStatus =
    source.status === 'Paused' || source.status === 'paused' ? 'Paused' : 'Active';

  const nextScheduledCrawl =
    source.nextScheduledCrawl ||
    source.nextCrawlScheduledAt ||
    (normalizedStatus === 'Active' ? computeNextCrawlDate(crawlFrequencyHours) : null);

  const record: CrawlerSourceDoc = {
    id: sourceId,
    sourceName,
    name: sourceName,
    organization: source.organization || sourceName,
    websiteUrl: rawUrl,
    baseUrl: rawUrl,
    domain,
    targetUrls: source.targetUrls && source.targetUrls.length > 0 ? source.targetUrls : [rawUrl],
    countryRegion: region,
    region,
    countries: source.countries && source.countries.length > 0 ? source.countries : [region],
    sourceType: source.sourceType || 'Foundation',
    opportunityCategories: categories,
    categories,
    fundingTypes: source.fundingTypes || ['Grant'],
    trustLevel: source.trustLevel || 'High',
    status: normalizedStatus,
    crawlFrequency,
    crawlFrequencyHours,
    lastCrawled: source.lastCrawled || source.lastCrawledAt || null,
    lastCrawledAt: source.lastCrawledAt || null,
    nextScheduledCrawl: typeof nextScheduledCrawl === 'string' ? nextScheduledCrawl : null,
    nextCrawlScheduledAt: nextScheduledCrawl,
    notes: source.notes || '',
    feedType: source.feedType || 'html_scraper',
    reliabilityScore: typeof source.reliabilityScore === 'number' ? source.reliabilityScore : 95,
    rateLimitMs: source.rateLimitMs || 1000,
    totalOpportunitiesDiscovered: source.totalOpportunitiesDiscovered || 0,
    totalOpportunitiesPublished: source.totalOpportunitiesPublished || 0,
    consecutiveErrors: source.consecutiveErrors || 0,
    lastErrorMessage: source.lastErrorMessage || '',
    crawlerConfig: source.crawlerConfig || {},
    createdAt: source.createdAt || now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, PIPELINE_COLLECTIONS.SOURCES, sourceId);
      await setDoc(ref, record, { merge: true });
    } catch (error) {
      handleFirestoreError(error, 'create', `${PIPELINE_COLLECTIONS.SOURCES}/${sourceId}`);
      throw error;
    }
  }

  return record;
}

/**
 * Toggles a source between 'Active' and 'Paused'.
 */
export async function toggleSourcePauseStatus(
  sourceId: string,
  currentStatus: SourceStatus,
  adminUser?: { id: string; email: string; name?: string }
): Promise<'Active' | 'Paused'> {
  if (!sourceId || !isFirebaseConfigured()) {
    return currentStatus === 'Active' || currentStatus === 'active' ? 'Paused' : 'Active';
  }

  const newStatus: 'Active' | 'Paused' =
    currentStatus === 'Active' || currentStatus === 'active' ? 'Paused' : 'Active';
  const now = serverTimestamp();

  try {
    const ref = doc(db, PIPELINE_COLLECTIONS.SOURCES, sourceId);
    await updateDoc(ref, {
      status: newStatus,
      nextScheduledCrawl: newStatus === 'Active' ? computeNextCrawlDate(24) : null,
      updatedAt: now,
    });

    if (adminUser) {
      await logAdminAction({
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        adminName: adminUser.name,
        actionType: newStatus === 'Paused' ? 'source_pause' : 'source_update',
        targetCollection: 'sources',
        targetId: sourceId,
        details: `${newStatus === 'Paused' ? 'Paused' : 'Resumed'} crawler monitoring for source ${sourceId}`,
      });
    }

    return newStatus;
  } catch (error) {
    handleFirestoreError(error, 'update', `${PIPELINE_COLLECTIONS.SOURCES}/${sourceId}`);
    throw error;
  }
}

/**
 * Removes a source from the registry.
 */
export async function deleteCrawlerSource(
  sourceId: string,
  adminUser?: { id: string; email: string; name?: string }
): Promise<void> {
  if (!sourceId || !isFirebaseConfigured()) return;

  try {
    const ref = doc(db, PIPELINE_COLLECTIONS.SOURCES, sourceId);
    await deleteDoc(ref);

    if (adminUser) {
      await logAdminAction({
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        adminName: adminUser.name,
        actionType: 'source_delete',
        targetCollection: 'sources',
        targetId: sourceId,
        details: `Deleted crawler source record ${sourceId}`,
      });
    }
  } catch (error) {
    handleFirestoreError(error, 'delete', `${PIPELINE_COLLECTIONS.SOURCES}/${sourceId}`);
    throw error;
  }
}

/**
 * Lists all registered crawler sources.
 */
export async function getCrawlerSources(status?: SourceStatus): Promise<CrawlerSourceDoc[]> {
  if (!isFirebaseConfigured()) {
    return getLocalDefaultSources();
  }

  try {
    const colRef = collection(db, PIPELINE_COLLECTIONS.SOURCES);
    const constraints: QueryConstraint[] = [];
    if (status) {
      constraints.push(where('status', '==', status));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(100));

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);

    if (snap.empty) {
      // If collection is completely empty, seed initial baseline sources
      return await seedBaselineCrawlerSources();
    }

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        sourceName: data.sourceName || data.name || 'Unnamed Source',
        name: data.sourceName || data.name || 'Unnamed Source',
        organization: data.organization || data.sourceName || data.name || '',
        websiteUrl: data.websiteUrl || data.baseUrl || '',
        baseUrl: data.websiteUrl || data.baseUrl || '',
        domain: data.domain || '',
        targetUrls: data.targetUrls || [],
        countryRegion: data.countryRegion || data.region || 'Global',
        region: data.countryRegion || data.region || 'Global',
        countries: data.countries || ['Global'],
        sourceType: data.sourceType || 'Foundation',
        opportunityCategories: data.opportunityCategories || data.categories || [],
        categories: data.opportunityCategories || data.categories || [],
        trustLevel: data.trustLevel || 'High',
        status: data.status || 'Active',
        crawlFrequency: data.crawlFrequency || 'Daily (24h)',
        crawlFrequencyHours: data.crawlFrequencyHours || 24,
        lastCrawled: data.lastCrawled || data.lastCrawledAt || null,
        nextScheduledCrawl: data.nextScheduledCrawl || data.nextCrawlScheduledAt || null,
        notes: data.notes || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as CrawlerSourceDoc;
    });
  } catch (error) {
    handleFirestoreError(error, 'list', PIPELINE_COLLECTIONS.SOURCES);
    return getLocalDefaultSources();
  }
}

/**
 * Fallback baseline sources for local or offline resilience.
 */
function getLocalDefaultSources(): CrawlerSourceDoc[] {
  const nowIso = new Date().toISOString();
  return [
    {
      id: 'source_gatesfoundation_org',
      sourceName: 'Bill & Melinda Gates Foundation',
      name: 'Bill & Melinda Gates Foundation',
      organization: 'Bill & Melinda Gates Foundation',
      websiteUrl: 'https://www.gatesfoundation.org',
      baseUrl: 'https://www.gatesfoundation.org',
      domain: 'gatesfoundation.org',
      targetUrls: ['https://www.gatesfoundation.org/about/how-we-work/grant-opportunities'],
      countryRegion: 'Global',
      region: 'Global',
      countries: ['Global', 'United States', 'Sub-Saharan Africa'],
      sourceType: 'Foundation',
      opportunityCategories: ['global-health', 'agriculture-food-security', 'climate-sustainability'],
      categories: ['global-health', 'agriculture-food-security', 'climate-sustainability'],
      trustLevel: 'Verified',
      status: 'Active',
      crawlFrequency: 'Daily (24h)',
      crawlFrequencyHours: 24,
      lastCrawled: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      nextScheduledCrawl: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
      notes: 'Premier philanthropic global grantmaker. High extraction fidelity.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'source_erc_europa_eu',
      sourceName: 'European Research Council (ERC)',
      name: 'European Research Council (ERC)',
      organization: 'European Commission',
      websiteUrl: 'https://erc.europa.eu',
      baseUrl: 'https://erc.europa.eu',
      domain: 'erc.europa.eu',
      targetUrls: ['https://erc.europa.eu/apply-grant'],
      countryRegion: 'Europe',
      region: 'Europe',
      countries: ['European Union', 'Associated Countries'],
      sourceType: 'Government',
      opportunityCategories: ['technology-innovation', 'scientific-research', 'education-scholarships'],
      categories: ['technology-innovation', 'scientific-research', 'education-scholarships'],
      trustLevel: 'Verified',
      status: 'Active',
      crawlFrequency: 'Daily (24h)',
      crawlFrequencyHours: 24,
      lastCrawled: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
      nextScheduledCrawl: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      notes: 'Horizon Europe frontier research funding programs.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'source_grants_gov',
      sourceName: 'Grants.gov (US Federal Portal)',
      name: 'Grants.gov (US Federal Portal)',
      organization: 'US Department of Health & Human Services',
      websiteUrl: 'https://www.grants.gov',
      baseUrl: 'https://www.grants.gov',
      domain: 'grants.gov',
      targetUrls: ['https://www.grants.gov/search-grants'],
      countryRegion: 'United States',
      region: 'United States',
      countries: ['United States', 'International Eligible'],
      sourceType: 'Government',
      opportunityCategories: ['entrepreneurship-business', 'scientific-research', 'energy-environment'],
      categories: ['entrepreneurship-business', 'scientific-research', 'energy-environment'],
      trustLevel: 'Verified',
      status: 'Active',
      crawlFrequency: 'Every 12 Hours',
      crawlFrequencyHours: 12,
      lastCrawled: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      nextScheduledCrawl: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      notes: 'Centralized clearinghouse for over 1,000 US federal grant programs.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'source_wellcome_org',
      sourceName: 'Wellcome Trust',
      name: 'Wellcome Trust',
      organization: 'Wellcome Trust',
      websiteUrl: 'https://wellcome.org',
      baseUrl: 'https://wellcome.org',
      domain: 'wellcome.org',
      targetUrls: ['https://wellcome.org/grant-funding'],
      countryRegion: 'United Kingdom / Global',
      region: 'Global',
      countries: ['Global', 'United Kingdom'],
      sourceType: 'Foundation',
      opportunityCategories: ['global-health', 'scientific-research', 'mental-health'],
      categories: ['global-health', 'scientific-research', 'mental-health'],
      trustLevel: 'Verified',
      status: 'Active',
      crawlFrequency: 'Daily (24h)',
      crawlFrequencyHours: 24,
      lastCrawled: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      nextScheduledCrawl: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      notes: 'Global charitable foundation supporting discovery research and urgent health challenges.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'source_ycombinator_com',
      sourceName: 'Y Combinator',
      name: 'Y Combinator',
      organization: 'Y Combinator LLC',
      websiteUrl: 'https://www.ycombinator.com',
      baseUrl: 'https://www.ycombinator.com',
      domain: 'ycombinator.com',
      targetUrls: ['https://www.ycombinator.com/apply'],
      countryRegion: 'Global',
      region: 'Global',
      countries: ['Global'],
      sourceType: 'Accelerator',
      opportunityCategories: ['entrepreneurship-business', 'technology-innovation', 'startups'],
      categories: ['entrepreneurship-business', 'technology-innovation', 'startups'],
      trustLevel: 'High',
      status: 'Active',
      crawlFrequency: 'Weekly',
      crawlFrequencyHours: 168,
      lastCrawled: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      nextScheduledCrawl: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
      notes: 'Premier global startup accelerator with winter & summer batches.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'source_afdb_org',
      sourceName: 'African Development Bank (AfDB)',
      name: 'African Development Bank (AfDB)',
      organization: 'African Development Bank Group',
      websiteUrl: 'https://www.afdb.org',
      baseUrl: 'https://www.afdb.org',
      domain: 'afdb.org',
      targetUrls: ['https://www.afdb.org/en/about-us/careers/opportunities'],
      countryRegion: 'Africa',
      region: 'Africa',
      countries: ['All African Countries'],
      sourceType: 'NGO',
      opportunityCategories: ['entrepreneurship-business', 'agriculture-food-security', 'climate-sustainability'],
      categories: ['entrepreneurship-business', 'agriculture-food-security', 'climate-sustainability'],
      trustLevel: 'High',
      status: 'Active',
      crawlFrequency: 'Every 3 Days',
      crawlFrequencyHours: 72,
      lastCrawled: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      nextScheduledCrawl: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      notes: 'Multilateral development finance institution for African innovators.',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

/**
 * Seeds the initial baseline sources into the "sources" collection.
 */
export async function seedBaselineCrawlerSources(): Promise<CrawlerSourceDoc[]> {
  const baseline = getLocalDefaultSources();
  if (!isFirebaseConfigured()) return baseline;

  try {
    for (const src of baseline) {
      const ref = doc(db, PIPELINE_COLLECTIONS.SOURCES, src.id);
      await setDoc(ref, src, { merge: true });
    }
  } catch (error) {
    console.warn('[CrawlerPipelineService] Could not persist baseline sources to Firestore:', error);
  }

  return baseline;
}

// =============================================================================
// 4. CRAWL JOBS COLLECTION ("crawlJobs/{jobId}")
// =============================================================================

/**
 * Creates a new scheduled or manual crawler execution task in "crawlJobs".
 */
export async function createCrawlJob(
  source: { id: string; name: string; domain: string },
  triggeredBy: 'scheduler' | 'manual_admin' | 'webhook' | 'retry' = 'scheduler',
  adminUserId?: string
): Promise<CrawlJobDoc> {
  const now = serverTimestamp();
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const job: CrawlJobDoc = {
    id: jobId,
    sourceId: source.id,
    sourceName: source.name,
    sourceDomain: source.domain,
    status: 'queued',
    triggeredBy,
    triggeredByUserId: adminUserId,
    pagesScrapedCount: 0,
    opportunitiesFoundCount: 0,
    draftsCreatedCount: 0,
    duplicatesSkippedCount: 0,
    errorsCount: 0,
    errorLogs: [],
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, PIPELINE_COLLECTIONS.CRAWL_JOBS, jobId);
      await setDoc(ref, job);
    } catch (error) {
      handleFirestoreError(error, 'create', `${PIPELINE_COLLECTIONS.CRAWL_JOBS}/${jobId}`);
      throw error;
    }
  }

  return job;
}

/**
 * Updates the execution status and statistics of a crawl job.
 */
export async function updateCrawlJobStatus(
  jobId: string,
  updates: Partial<CrawlJobDoc>
): Promise<void> {
  if (!jobId || !isFirebaseConfigured()) return;
  try {
    const ref = doc(db, PIPELINE_COLLECTIONS.CRAWL_JOBS, jobId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `${PIPELINE_COLLECTIONS.CRAWL_JOBS}/${jobId}`);
    throw error;
  }
}

/**
 * Lists recent crawler jobs.
 */
export async function getRecentCrawlJobs(limitCount = 25): Promise<CrawlJobDoc[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const colRef = collection(db, PIPELINE_COLLECTIONS.CRAWL_JOBS);
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CrawlJobDoc[];
  } catch (error) {
    handleFirestoreError(error, 'list', PIPELINE_COLLECTIONS.CRAWL_JOBS);
    return [];
  }
}

// =============================================================================
// 5. CRAWL RESULTS COLLECTION ("crawlResults/{resultId}")
// =============================================================================

/**
 * Saves a raw discovery capture and AI extraction result to "crawlResults".
 */
export async function saveCrawlResult(
  result: Partial<CrawlResultDoc> & { crawlJobId: string; sourceId: string; sourceUrl: string }
): Promise<CrawlResultDoc> {
  const now = serverTimestamp();
  const rawUrl = result.sourceUrl || result.url || '';
  const resultId = result.id || `cres_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const today = new Date().toISOString().split('T')[0];

  const docData: CrawlResultDoc = {
    id: resultId,
    crawlJobId: result.crawlJobId,
    sourceId: result.sourceId,
    sourceName: result.sourceName || 'Monitored Source',
    sourceUrl: rawUrl,
    url: rawUrl,
    pageTitle: result.pageTitle || 'Discovered Opportunity Link',
    opportunityType: result.opportunityType || 'Grant',
    discoveryDate: result.discoveryDate || today,
    discoveredAt: result.discoveredAt || new Date().toISOString(),
    confidenceScore: typeof result.confidenceScore === 'number' ? result.confidenceScore : 85,
    relevanceKeywords: result.relevanceKeywords || [],
    rawContentHash: result.rawContentHash || '',
    rawHtmlSnippet: result.rawHtmlSnippet || '',
    pageLanguage: result.pageLanguage || 'en',
    httpStatusCode: result.httpStatusCode || 200,
    aiExtractionModel: result.aiExtractionModel || 'gemini-2.5-flash',
    aiConfidence: typeof result.aiConfidence === 'number' ? result.aiConfidence : 80,
    extractedPayload: result.extractedPayload || {},
    parsedOpportunityDraftId: result.parsedOpportunityDraftId,
    status: result.status || 'unprocessed',
    processingError: result.processingError,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, PIPELINE_COLLECTIONS.CRAWL_RESULTS, resultId);
      await setDoc(ref, docData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, 'create', `${PIPELINE_COLLECTIONS.CRAWL_RESULTS}/${resultId}`);
      throw error;
    }
  }

  return docData;
}

/**
 * Retrieves discovered opportunity records from "crawlResults".
 */
export async function getCrawlResults(options?: {
  sourceId?: string;
  status?: CrawlResultStatus;
  limitCount?: number;
}): Promise<CrawlResultDoc[]> {
  if (!isFirebaseConfigured()) return getLocalMockCrawlResults();

  try {
    const colRef = collection(db, PIPELINE_COLLECTIONS.CRAWL_RESULTS);
    const constraints: QueryConstraint[] = [];

    if (options?.sourceId) {
      constraints.push(where('sourceId', '==', options.sourceId));
    }
    if (options?.status) {
      constraints.push(where('status', '==', options.status));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(options?.limitCount || 60));

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);

    if (snap.empty) {
      return getLocalMockCrawlResults();
    }

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        crawlJobId: data.crawlJobId || '',
        sourceId: data.sourceId || '',
        sourceName: data.sourceName || 'Monitored Source',
        sourceUrl: data.sourceUrl || data.url || '',
        url: data.url || data.sourceUrl || '',
        pageTitle: data.pageTitle || 'Discovered Opportunity',
        opportunityType: data.opportunityType || 'Grant',
        discoveryDate: data.discoveryDate || (typeof data.createdAt === 'string' ? data.createdAt.split('T')[0] : 'Recent'),
        discoveredAt: data.discoveredAt || data.createdAt,
        confidenceScore: data.confidenceScore || 85,
        relevanceKeywords: data.relevanceKeywords || [],
        rawContentHash: data.rawContentHash || '',
        rawHtmlSnippet: data.rawHtmlSnippet || '',
        status: data.status || 'unprocessed',
        processingError: data.processingError,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as CrawlResultDoc;
    });
  } catch (error) {
    handleFirestoreError(error, 'list', PIPELINE_COLLECTIONS.CRAWL_RESULTS);
    return getLocalMockCrawlResults();
  }
}

/**
 * Fetches all known URLs currently in crawlResults to avoid repeatedly processing the same URL.
 */
export async function getExistingDiscoveredUrls(): Promise<Set<string>> {
  const urlSet = new Set<string>();
  if (!isFirebaseConfigured()) return urlSet;

  try {
    const colRef = collection(db, PIPELINE_COLLECTIONS.CRAWL_RESULTS);
    const q = query(colRef, limit(300));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      const data = d.data();
      if (data.sourceUrl) urlSet.add(data.sourceUrl);
      if (data.url) urlSet.add(data.url);
    });
  } catch (err) {
    console.warn('[CrawlerPipelineService] Could not pre-fetch existing URLs:', err);
  }

  return urlSet;
}

/**
 * Executes the backend Opportunity Discovery Engine (Step 4) on active sources.
 * Records discovered URLs in "crawlResults", logs jobs in "crawlJobs", and avoids duplicate URLs.
 */
export async function triggerDiscoveryEngineRun(
  sourceId?: string,
  adminUser?: { id: string; email: string; name?: string }
): Promise<{
  success: boolean;
  totalSourcesProcessed: number;
  totalOpportunitiesDiscovered: number;
  totalDuplicatesSkipped: number;
  totalErrors: number;
  summaryMessage: string;
}> {
  // 1. Fetch active sources
  const activeSources = await getCrawlerSources('Active');
  const targetSources = sourceId
    ? activeSources.filter((s) => s.id === sourceId)
    : activeSources;

  if (targetSources.length === 0) {
    return {
      success: true,
      totalSourcesProcessed: 0,
      totalOpportunitiesDiscovered: 0,
      totalDuplicatesSkipped: 0,
      totalErrors: 0,
      summaryMessage: 'No active sources available to crawl.',
    };
  }

  // 2. Fetch known URLs to avoid duplicate processing
  const existingUrls = await getExistingDiscoveredUrls();

  // 3. Request discovery execution from the server-side discovery engine
  const response = await fetch('/api/crawler/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceId,
      sources: targetSources,
      existingUrls: Array.from(existingUrls),
      adminUserId: adminUser?.id,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Discovery engine failed with HTTP ${response.status}`);
  }

  const runData = await response.json();

  // 4. Record discovered URLs to "crawlResults" and update "crawlJobs"
  if (runData.results && Array.isArray(runData.results)) {
    for (const res of runData.results) {
      // 4a. Persist Crawl Job in "crawlJobs"
      try {
        const jobRef = doc(db, PIPELINE_COLLECTIONS.CRAWL_JOBS, res.jobId);
        await setDoc(jobRef, {
          id: res.jobId,
          sourceId: res.sourceId,
          sourceName: res.sourceName,
          sourceDomain: res.sourceDomain,
          status: res.status,
          triggeredBy: 'manual_admin',
          triggeredByUserId: adminUser?.id,
          pagesScrapedCount: res.pagesScraped,
          opportunitiesFoundCount: res.opportunitiesDiscovered,
          duplicatesSkippedCount: res.duplicatesSkipped,
          errorsCount: res.errorsCount,
          errorLogs: res.errorLogs || [],
          summaryMessage: res.summaryMessage,
          startedAt: res.startedAt,
          completedAt: res.completedAt,
          durationSeconds: res.durationSeconds,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.warn(`[DiscoveryEngine] Could not save crawlJob ${res.jobId}:`, err);
      }

      // 4b. Record each discovered opportunity URL in "crawlResults" with status "unprocessed"
      if (res.discoveredItems && Array.isArray(res.discoveredItems)) {
        for (const item of res.discoveredItems) {
          try {
            await saveCrawlResult({
              id: `cres_${item.urlHash.slice(0, 16)}`,
              crawlJobId: res.jobId,
              sourceId: res.sourceId,
              sourceName: res.sourceName,
              sourceUrl: item.normalizedUrl,
              url: item.normalizedUrl,
              pageTitle: item.pageTitle,
              opportunityType: item.opportunityType,
              discoveryDate: item.discoveryDate,
              discoveredAt: item.discoveredAt,
              confidenceScore: item.confidenceScore,
              relevanceKeywords: item.matchedKeywords,
              rawContentHash: item.urlHash,
              rawHtmlSnippet: item.snippet,
              status: 'unprocessed',
            });
          } catch (err) {
            console.warn(`[DiscoveryEngine] Could not save crawlResult for ${item.normalizedUrl}:`, err);
          }
        }
      }

      // 4c. Update monitored source lastCrawled and nextScheduledCrawl
      try {
        const sourceRef = doc(db, PIPELINE_COLLECTIONS.SOURCES, res.sourceId);
        await updateDoc(sourceRef, {
          lastCrawled: res.completedAt,
          lastCrawledAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn(`[DiscoveryEngine] Could not update source timestamp ${res.sourceId}:`, err);
      }
    }
  }

  // 5. Log admin action
  if (adminUser) {
    await logAdminAction({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      actionType: 'source_update',
      targetCollection: 'crawlJobs',
      targetId: sourceId || 'batch_discovery',
      details: `Executed Discovery Engine across ${targetSources.length} sources. Discovered ${runData.totalOpportunitiesDiscovered} opportunity URLs.`,
    });
  }

  return {
    success: true,
    totalSourcesProcessed: runData.totalSourcesProcessed || targetSources.length,
    totalOpportunitiesDiscovered: runData.totalOpportunitiesDiscovered || 0,
    totalDuplicatesSkipped: runData.totalDuplicatesSkipped || 0,
    totalErrors: runData.totalErrors || 0,
    summaryMessage: `Discovery Engine finished: ${runData.totalOpportunitiesDiscovered} opportunity URL(s) discovered and recorded in "crawlResults", ${runData.totalDuplicatesSkipped} duplicate(s) avoided.`,
  };
}

/**
 * Fallback initial discovery captures for demonstration resilience.
 */
function getLocalMockCrawlResults(): CrawlResultDoc[] {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  return [
    {
      id: 'cres_gates_health_2026',
      crawlJobId: 'job_init_baseline_01',
      sourceId: 'source_gatesfoundation_org',
      sourceName: 'Bill & Melinda Gates Foundation',
      sourceUrl: 'https://www.gatesfoundation.org/about/how-we-work/grant-opportunities',
      url: 'https://www.gatesfoundation.org/about/how-we-work/grant-opportunities',
      pageTitle: 'Global Grand Challenges: Catalyzing Equitable Innovation',
      opportunityType: 'Grant',
      discoveryDate: today,
      discoveredAt: now,
      confidenceScore: 95,
      relevanceKeywords: ['grant', 'call-for-proposals', 'global-health'],
      rawContentHash: 'hash_gates_001',
      rawHtmlSnippet: 'Round 34: Global Grand Challenges grant awards up to $100,000 for preliminary concept development and testing.',
      status: 'unprocessed',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cres_erc_starting_2026',
      crawlJobId: 'job_init_baseline_02',
      sourceId: 'source_erc_europa_eu',
      sourceName: 'European Research Council (ERC)',
      sourceUrl: 'https://erc.europa.eu/apply-grant',
      url: 'https://erc.europa.eu/apply-grant',
      pageTitle: 'ERC Starting Grants for Early-Career Researchers 2026',
      opportunityType: 'Fellowship',
      discoveryDate: today,
      discoveredAt: now,
      confidenceScore: 92,
      relevanceKeywords: ['fellowship', 'research-grant', 'scientific-research'],
      rawContentHash: 'hash_erc_002',
      rawHtmlSnippet: 'ERC Starting Grants support early career researchers of any nationality with 2-7 years of experience since completion of PhD.',
      status: 'unprocessed',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cres_wellcome_climate_2026',
      crawlJobId: 'job_init_baseline_03',
      sourceId: 'source_wellcome_org',
      sourceName: 'Wellcome Trust',
      sourceUrl: 'https://wellcome.org/grant-funding',
      url: 'https://wellcome.org/grant-funding',
      pageTitle: 'Climate & Health Priority Area Discovery Awards',
      opportunityType: 'Grant',
      discoveryDate: today,
      discoveredAt: now,
      confidenceScore: 89,
      relevanceKeywords: ['grant', 'climate-sustainability', 'health'],
      rawContentHash: 'hash_wellcome_003',
      rawHtmlSnippet: 'Funding bold, innovative research projects addressing the urgent health risks posed by a changing global climate.',
      status: 'unprocessed',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cres_yc_batch_2026',
      crawlJobId: 'job_init_baseline_04',
      sourceId: 'source_ycombinator_com',
      sourceName: 'Y Combinator',
      sourceUrl: 'https://www.ycombinator.com/apply',
      url: 'https://www.ycombinator.com/apply',
      pageTitle: 'Y Combinator Winter 2026 Batch Applications',
      opportunityType: 'Accelerator',
      discoveryDate: today,
      discoveredAt: now,
      confidenceScore: 94,
      relevanceKeywords: ['accelerator', 'seed-funding', 'startups'],
      rawContentHash: 'hash_yc_004',
      rawHtmlSnippet: 'Apply for the upcoming Y Combinator accelerator batch. Standard deal is $500,000 for early stage venture-backed founders.',
      status: 'unprocessed',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// =============================================================================
// 6. VERIFICATION QUEUE COLLECTION ("verificationQueue/{queueId}")
// =============================================================================

/**
 * Enqueues an item into "verificationQueue" for admin editorial evaluation.
 */
export async function enqueueVerificationItem(
  item: Partial<VerificationQueueDoc> & { targetId: string; targetTitle: string; targetProvider: string }
): Promise<VerificationQueueDoc> {
  const now = serverTimestamp();
  const queueId = item.id || `vq_${item.targetId}`;

  const queueDoc: VerificationQueueDoc = {
    id: queueId,
    itemType: item.itemType || 'opportunity_draft',
    targetId: item.targetId,
    targetTitle: item.targetTitle,
    targetProvider: item.targetProvider,
    sourceId: item.sourceId,
    sourceName: item.sourceName,
    priority: item.priority || 'medium',
    status: item.status || 'pending',
    aiConfidence: typeof item.aiConfidence === 'number' ? item.aiConfidence : 85,
    assignedAdminId: item.assignedAdminId,
    assignedAdminName: item.assignedAdminName,
    assignedAt: item.assignedAdminId ? now : null,
    checklist: item.checklist || [
      { id: 'chk_1', label: 'Verify official URL & provider authenticity', checked: false },
      { id: 'chk_2', label: 'Confirm eligibility & country restrictions', checked: false },
      { id: 'chk_3', label: 'Validate deadline & submission procedure', checked: false },
      { id: 'chk_4', label: 'Ensure funding amount clarity', checked: false },
    ],
    tags: item.tags || [],
    deadline: item.deadline,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, PIPELINE_COLLECTIONS.VERIFICATION_QUEUE, queueId);
      await setDoc(ref, queueDoc, { merge: true });
    } catch (error) {
      handleFirestoreError(error, 'create', `${PIPELINE_COLLECTIONS.VERIFICATION_QUEUE}/${queueId}`);
      throw error;
    }
  }

  return queueDoc;
}

/**
 * Retrieves pending verification queue items for the admin console.
 */
export async function getVerificationQueueItems(
  status: VerificationQueueStatus = 'pending',
  limitCount = 50
): Promise<VerificationQueueDoc[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const colRef = collection(db, PIPELINE_COLLECTIONS.VERIFICATION_QUEUE);
    const q = query(
      colRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as VerificationQueueDoc[];
  } catch (error) {
    handleFirestoreError(error, 'list', PIPELINE_COLLECTIONS.VERIFICATION_QUEUE);
    return [];
  }
}

// =============================================================================
// 7. DUPLICATES COLLECTION ("duplicates/{duplicateId}")
// =============================================================================

/**
 * Records a detected duplicate in "duplicates".
 */
export async function recordDetectedDuplicate(
  dup: Partial<DuplicateRecordDoc> & {
    canonicalOpportunityId: string;
    duplicateCandidateId: string;
    canonicalTitle: string;
    duplicateTitle: string;
  }
): Promise<DuplicateRecordDoc> {
  const now = serverTimestamp();
  const dupId =
    dup.id ||
    `dup_${dup.canonicalOpportunityId}_${dup.duplicateCandidateId}`.slice(0, 100);

  const docData: DuplicateRecordDoc = {
    id: dupId,
    deduplicationHash:
      dup.deduplicationHash ||
      generateOpportunityDeduplicationHash(dup.canonicalTitle, dup.canonicalProvider || ''),
    detectionStrategy: dup.detectionStrategy || 'deterministic_hash',
    similarityScore: typeof dup.similarityScore === 'number' ? dup.similarityScore : 98,
    canonicalOpportunityId: dup.canonicalOpportunityId,
    duplicateCandidateId: dup.duplicateCandidateId,
    canonicalTitle: dup.canonicalTitle,
    duplicateTitle: dup.duplicateTitle,
    canonicalProvider: dup.canonicalProvider || '',
    duplicateProvider: dup.duplicateProvider || '',
    canonicalDeadline: dup.canonicalDeadline,
    duplicateDeadline: dup.duplicateDeadline,
    status: dup.status || 'detected',
    detectedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, PIPELINE_COLLECTIONS.DUPLICATES, dupId);
      await setDoc(ref, docData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, 'create', `${PIPELINE_COLLECTIONS.DUPLICATES}/${dupId}`);
      throw error;
    }
  }

  return docData;
}

/**
 * Resolves a duplicate record (e.g. 'merged', 'dismissed').
 */
export async function resolveDuplicateRecord(
  duplicateId: string,
  resolution: DuplicateResolutionStatus,
  adminUser: { id: string; email: string },
  decisionNotes?: string
): Promise<void> {
  if (!duplicateId || !isFirebaseConfigured()) return;
  const now = serverTimestamp();

  try {
    const ref = doc(db, PIPELINE_COLLECTIONS.DUPLICATES, duplicateId);
    await updateDoc(ref, {
      status: resolution,
      resolvedByAdminId: adminUser.email,
      resolvedAt: now,
      decisionNotes: decisionNotes || '',
      updatedAt: now,
    });

    await logAdminAction({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      actionType: resolution === 'merged' ? 'duplicate_merge' : 'duplicate_dismiss',
      targetCollection: 'duplicates',
      targetId: duplicateId,
      details: `Duplicate ${duplicateId} marked as ${resolution}`,
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `${PIPELINE_COLLECTIONS.DUPLICATES}/${duplicateId}`);
    throw error;
  }
}

// =============================================================================
// 8. ADMIN LOGS COLLECTION ("adminLogs/{logId}")
// =============================================================================

export interface LogAdminActionParams {
  adminId: string;
  adminEmail: string;
  adminName?: string;
  actionType: AdminActionType;
  targetCollection: string;
  targetId: string;
  targetTitle?: string;
  details: string;
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  ipAddress?: string;
}

/**
 * Creates an immutable audit entry in "adminLogs".
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<AdminLogDoc> {
  const now = serverTimestamp();
  const logId = `alog_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const logDoc: AdminLogDoc = {
    id: logId,
    adminId: params.adminId,
    adminEmail: params.adminEmail,
    adminName: params.adminName,
    actionType: params.actionType,
    targetCollection: params.targetCollection,
    targetId: params.targetId,
    targetTitle: params.targetTitle,
    details: params.details,
    previousState: params.previousState || null,
    newState: params.newState || null,
    ipAddress: params.ipAddress,
    timestamp: now,
    createdAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      const ref = doc(db, PIPELINE_COLLECTIONS.ADMIN_LOGS, logId);
      await setDoc(ref, logDoc);
    } catch (error) {
      console.warn('[CrawlerPipelineService] Non-critical error saving admin log:', error);
    }
  }

  return logDoc;
}

/**
 * Fetches recent admin audit logs.
 */
export async function getRecentAdminLogs(limitCount = 50): Promise<AdminLogDoc[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const colRef = collection(db, PIPELINE_COLLECTIONS.ADMIN_LOGS);
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminLogDoc[];
  } catch (error) {
    handleFirestoreError(error, 'list', PIPELINE_COLLECTIONS.ADMIN_LOGS);
    return [];
  }
}
