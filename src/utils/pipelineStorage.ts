import { Opportunity } from '../types';
import { 
  IncomingOpportunity, 
  PipelineStatus, 
  PipelineStats, 
  PipelineEvent, 
  VerificationRecord, 
  SourceQuality 
} from '../types/pipeline';
import { validateOpportunity } from './pipelineValidation';
import { findDuplicateCandidates } from './pipelineDeduplication';
import { saveOpportunity, getAllAdminOpportunities } from './adminStorage';

const PIPELINE_STORAGE_KEY = 'fundora_pipeline_incoming_v1';

/**
 * Default Seed Incoming Opportunities Data
 */
const SEED_INCOMING_OPPORTUNITIES: IncomingOpportunity[] = [
  {
    id: 'inc-101',
    title: 'Horizon Europe Clean Energy Transition Fund 2026',
    organization: 'European Commission',
    source: 'EU Funding & Tenders Portal',
    sourceUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/horizon-cl5-2026-d3-01',
    applicationUrl: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/apply',
    sourceQuality: 'Government/official institution',
    fundingType: 'Grant',
    category: 'Climate & Environment',
    country: 'European Union & Associated Countries',
    region: 'Europe',
    deadline: '2026-11-15',
    amountMin: 1500000,
    amountMax: 4000000,
    amountDisplayText: '€1.5M – €4.0M',
    currency: 'EUR',
    isFullyFunded: true,
    description: 'Direct grant funding for multi-national consortia developing high-impact renewable energy systems, grid stabilization technologies, and green hydrogen infrastructure across Europe.',
    summary: 'Consortium grant funding for high-impact clean tech and renewable energy deployment.',
    eligibility: [
      'At least 3 independent legal entities from 3 different EU Member States or Associated Countries',
      'Technology Readiness Level (TRL) 5 to 7',
      'Must demonstrate clear greenhouse gas abatement metrics',
    ],
    requirements: [
      'Standard EU Horizon Part A & Part B administrative proposal',
      'Detailed work breakdown structure (WBS) and deliverable roadmap',
      'Consortium agreement and financial audit forecast',
    ],
    targetAudience: 'Research consortia, Universities, and DeepTech Clean Energy startups',
    dateDiscovered: '2026-08-28',
    pipelineStatus: 'Discovered',
    history: [
      {
        id: 'evt-101-1',
        type: 'Created',
        timestamp: '2026-08-28T10:15:00Z',
        actor: 'Ingestion System (Feed / EU Horizon)',
        description: 'Record ingested into Discovery Queue from EU Funding Portal feed.',
      },
    ],
  },
  {
    id: 'inc-102',
    title: 'Global Fintech Seed Catalyst Accelerator',
    organization: 'Fintech Vanguard Lab',
    source: 'TechStars Aggregator Post',
    sourceUrl: 'https://fintechvanguard.io/accelerator-2026',
    applicationUrl: '', // Intentionally missing to demonstrate validation
    sourceQuality: 'Secondary source',
    fundingType: 'Business Funding',
    category: 'Business & Entrepreneurship',
    country: 'Global',
    region: 'Global',
    deadline: '2026-10-30',
    amountMin: 50000,
    amountMax: 120000,
    amountDisplayText: '$120,000 for 6% Equity',
    currency: 'USD',
    description: 'Seed catalyst funding. lorem ipsum details to be updated by founders.', // Intentionally suspicious/incomplete
    summary: 'Accelerator program for financial technology and crypto infrastructure builders.',
    eligibility: [],
    requirements: ['Pitch deck'],
    targetAudience: 'Early-stage fintech founders',
    dateDiscovered: '2026-08-29',
    pipelineStatus: 'Validation Failed',
    history: [
      {
        id: 'evt-102-1',
        type: 'Created',
        timestamp: '2026-08-29T14:20:00Z',
        actor: 'Admin Manual Intake',
        description: 'Discovered via secondary tech funding roundup.',
      },
      {
        id: 'evt-102-2',
        type: 'Imported',
        timestamp: '2026-08-29T15:00:00Z',
        actor: 'Elena Rostova (Admin)',
        description: 'Imported into processing pipeline for validation.',
      },
      {
        id: 'evt-102-3',
        type: 'Validation Ran',
        timestamp: '2026-08-29T15:01:00Z',
        actor: 'Automated Validator',
        description: 'Validation failed: Missing Application URL, empty eligibility criteria, and suspicious placeholder text.',
      },
    ],
  },
  {
    id: 'inc-103',
    title: 'Bill & Melinda Gates Global Health Discovery Challenge 2026',
    organization: 'Bill & Melinda Gates Foundation',
    source: 'Grand Challenges Notification',
    sourceUrl: 'https://gcgh.grandchallenges.org/challenge/global-health-discovery-2026',
    applicationUrl: 'https://gcgh.grandchallenges.org/apply',
    sourceQuality: 'Established organization',
    fundingType: 'Grant',
    category: 'Healthcare & Medicine',
    country: 'Global',
    region: 'Global',
    deadline: '2026-11-20',
    amountMin: 100000,
    amountMax: 1000000,
    amountDisplayText: '$100,000 – $1,000,000',
    currency: 'USD',
    description: 'Fostering innovative, unorthodox approaches to transformative global health diagnostics, infectious disease treatments, and maternal healthcare technologies in low-resource settings.',
    summary: 'Catalytic grants for breakthrough health diagnostics and therapies.',
    eligibility: [
      'Open to non-profit entities, academic institutions, and for-profit companies worldwide',
      'Solutions must have primary application in low- and middle-income countries',
    ],
    requirements: [
      'Two-page blind concept proposal',
      'High-level budget allocation',
    ],
    targetAudience: 'Global health researchers, biotech innovators, and clinical laboratories',
    dateDiscovered: '2026-08-30',
    pipelineStatus: 'Duplicate Suspected',
    history: [
      {
        id: 'evt-103-1',
        type: 'Created',
        timestamp: '2026-08-30T09:00:00Z',
        actor: 'Feed Reader (Global Health)',
        description: 'Ingested from Grand Challenges feed.',
      },
      {
        id: 'evt-103-2',
        type: 'Imported',
        timestamp: '2026-08-30T09:30:00Z',
        actor: 'Elena Rostova (Admin)',
        description: 'Imported to pipeline and submitted to deduplication analysis.',
      },
    ],
  },
  {
    id: 'inc-104',
    title: 'African AgriTech Innovation Fellowship 2026',
    organization: 'African Agricultural Technology Foundation (AATF)',
    source: 'AATF Official Press Release',
    sourceUrl: 'https://www.aatf-africa.org/agritech-fellowship-2026',
    applicationUrl: 'https://www.aatf-africa.org/apply/agritech-2026',
    sourceQuality: 'Official provider',
    fundingType: 'Fellowship',
    category: 'Agriculture & Food Tech',
    country: 'Sub-Saharan Africa',
    region: 'Africa',
    deadline: '2026-12-01',
    amountMin: 35000,
    amountMax: 75000,
    amountDisplayText: '$35,000 – $75,000',
    currency: 'USD',
    isFullyFunded: true,
    description: 'A 9-month fellowship providing non-dilutive stipend, technical mentorship, field trials, and lab access for African innovators building climate-smart smallholder farming tools.',
    summary: 'Stipend and lab mentorship for African agritech builders.',
    eligibility: [
      'Citizens or permanent residents of an African country',
      'Founder or lead engineer working on soil health, irrigation, or post-harvest storage',
    ],
    requirements: [
      'Online application form',
      'Prototype demonstration video (3 minutes)',
      'Letter of reference from institution or community partner',
    ],
    targetAudience: 'African agricultural engineers and smallholder tech builders',
    dateDiscovered: '2026-08-25',
    pipelineStatus: 'Under Verification',
    verificationRecord: {
      officialProvider: 'African Agricultural Technology Foundation (AATF)',
      sourceUrl: 'https://www.aatf-africa.org/agritech-fellowship-2026',
      applicationUrl: 'https://www.aatf-africa.org/apply/agritech-2026',
      fundingAmount: '$35,000 – $75,000',
      deadline: '2026-12-01',
      eligibility: 'Citizens of African nations developing agricultural innovation',
      lastCheckedDate: '2026-08-31',
      status: 'Under Review',
      notes: 'Confirmed domain ownership on AATF official DNS. Checking whether application portal accepts multi-national teams.',
    },
    history: [
      {
        id: 'evt-104-1',
        type: 'Created',
        timestamp: '2026-08-25T11:00:00Z',
        actor: 'Feed Reader (Agritech Africa)',
        description: 'Ingested into discovery queue.',
      },
      {
        id: 'evt-104-2',
        type: 'Imported',
        timestamp: '2026-08-26T08:00:00Z',
        actor: 'Elena Rostova (Admin)',
        description: 'Imported to pipeline and passed automated validation.',
      },
      {
        id: 'evt-104-3',
        type: 'Verification status changed',
        timestamp: '2026-08-31T14:30:00Z',
        actor: 'Elena Rostova (Admin)',
        description: 'Moved into Under Verification workspace for source verification.',
      },
    ],
  },
  {
    id: 'inc-105',
    title: 'MIT Clean Energy Innovation Prize 2026',
    organization: 'MIT Energy Initiative',
    source: 'MIT Official Portal',
    sourceUrl: 'https://energy.mit.edu/clean-energy-prize-2026',
    applicationUrl: 'https://energy.mit.edu/clean-energy-prize-2026/submit',
    sourceQuality: 'Established organization',
    fundingType: 'Competition',
    category: 'Clean Energy & Power',
    country: 'United States & International Student Teams',
    region: 'North America',
    deadline: '2026-12-15',
    amountMin: 50000,
    amountMax: 150000,
    amountDisplayText: '$150,000 Grand Prize',
    currency: 'USD',
    description: 'Premier collegiate and researcher competition awarding non-dilutive cash prizes to teams developing breakthrough clean energy and carbon removal solutions.',
    summary: 'Collegiate and startup competition for clean energy innovations.',
    eligibility: [
      'University student or recent graduate (within 2 years) on the founding team',
      'Novel hardware or software solution in clean energy',
    ],
    requirements: [
      'Executive summary (3 pages)',
      'Live pitch presentation at MIT Energy Night',
    ],
    targetAudience: 'Student founders and early-stage energy tech innovators',
    dateDiscovered: '2026-08-20',
    pipelineStatus: 'Verified',
    verificationRecord: {
      officialProvider: 'MIT Energy Initiative',
      sourceUrl: 'https://energy.mit.edu/clean-energy-prize-2026',
      applicationUrl: 'https://energy.mit.edu/clean-energy-prize-2026/submit',
      fundingAmount: '$150,000 Grand Prize',
      deadline: '2026-12-15',
      eligibility: 'Student & researcher led ventures globally',
      lastCheckedDate: '2026-09-01',
      status: 'Verified',
      verifiedBy: 'Elena Rostova (Admin)',
      notes: 'Cross-checked against MIT Official calendar. Direct application submission portal verified active.',
    },
    history: [
      {
        id: 'evt-105-1',
        type: 'Created',
        timestamp: '2026-08-20T08:00:00Z',
        actor: 'Manual Discovery',
        description: 'Discovered from MIT Energy press release.',
      },
      {
        id: 'evt-105-2',
        type: 'Imported',
        timestamp: '2026-08-20T09:00:00Z',
        actor: 'Elena Rostova (Admin)',
        description: 'Imported to pipeline and passed automated validation (9/9 passed).',
      },
      {
        id: 'evt-105-3',
        type: 'Verified',
        timestamp: '2026-09-01T10:00:00Z',
        actor: 'Elena Rostova (Admin)',
        description: 'Deliberately verified official MIT portal and deadline calendar.',
      },
    ],
  },
  {
    id: 'inc-106',
    title: 'Indie Innovator Micro-Grant Program (Batch 4)',
    organization: 'Open Creators Fund',
    source: 'Substack Newsletter Directory',
    sourceUrl: 'https://opencreatorsfund.substack.com/p/batch-4-grants',
    applicationUrl: 'https://airtable.com/app123/shrXYZ',
    sourceQuality: 'Secondary source',
    fundingType: 'Grant',
    category: 'Creative & Digital Arts',
    country: 'Global',
    region: 'Global',
    deadline: '2026-10-15',
    amountMin: 1000,
    amountMax: 5000,
    amountDisplayText: '$1,000 – $5,000',
    currency: 'USD',
    description: 'No-strings-attached micro-grants for indie software engineers, digital artists, and open-source documentation writers working on public goods.',
    summary: 'Micro-grants for open source and digital indie creators.',
    eligibility: [
      'Individuals working on public goods, open source, or independent artistic projects',
      'No legal entity required',
    ],
    requirements: ['Link to public portfolio or GitHub repo', '100-word statement of intent'],
    targetAudience: 'Independent open source maintainers and digital artists',
    dateDiscovered: '2026-08-27',
    pipelineStatus: 'Ready for Review',
    history: [
      {
        id: 'evt-106-1',
        type: 'Created',
        timestamp: '2026-08-27T16:00:00Z',
        actor: 'Feed (Substack Newsletters)',
        description: 'Discovered in creator ecosystem news.',
      },
      {
        id: 'evt-106-2',
        type: 'Imported',
        timestamp: '2026-08-28T09:00:00Z',
        actor: 'Elena Rostova (Admin)',
        description: 'Imported for human review. Validation passed with 1 advisory check.',
      },
    ],
  }
];

/**
 * In-memory / localStorage Pipeline Repository
 */
export function getIncomingOpportunities(): IncomingOpportunity[] {
  try {
    const raw = localStorage.getItem(PIPELINE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => refreshItemValidationAndDuplicates(item, parsed));
      }
    }
  } catch {}

  const seeded = SEED_INCOMING_OPPORTUNITIES.map((item) =>
    refreshItemValidationAndDuplicates(item, SEED_INCOMING_OPPORTUNITIES)
  );
  persistIncomingOpportunities(seeded);
  return seeded;
}

export function persistIncomingOpportunities(items: IncomingOpportunity[]): void {
  try {
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

/**
 * Refreshes validation and duplicate candidates on an opportunity
 */
export function refreshItemValidationAndDuplicates(
  item: IncomingOpportunity,
  allIncoming: IncomingOpportunity[] = []
): IncomingOpportunity {
  const valResult = validateOpportunity(item);
  const dupCandidates = findDuplicateCandidates(item, allIncoming);

  return {
    ...item,
    validationResult: valResult,
    duplicateCandidates: dupCandidates,
  };
}

/**
 * Adds an audit event to an opportunity history
 */
export function appendPipelineEvent(
  opp: IncomingOpportunity,
  type: PipelineEvent['type'],
  description: string,
  actor: string = 'Admin'
): IncomingOpportunity {
  const event: PipelineEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    timestamp: new Date().toISOString(),
    actor,
    description,
  };

  return {
    ...opp,
    history: [event, ...opp.history],
  };
}

/**
 * Saves or updates an incoming opportunity record
 */
export function saveIncomingOpportunity(
  data: Partial<IncomingOpportunity> & { id?: string },
  actor: string = 'Admin'
): IncomingOpportunity {
  const all = getIncomingOpportunities();
  const isEditing = Boolean(data.id && all.some((item) => item.id === data.id));
  const targetId = data.id || `inc-${Date.now()}`;
  const nowIso = new Date().toISOString().split('T')[0];

  const existing = isEditing ? all.find((item) => item.id === targetId) : undefined;

  let updated: IncomingOpportunity = {
    id: targetId,
    title: data.title?.trim() || 'Untitled Opportunity',
    organization: data.organization?.trim() || 'Unknown Provider',
    source: data.source?.trim() || 'Manual Admin Ingestion',
    sourceUrl: data.sourceUrl?.trim() || '',
    applicationUrl: data.applicationUrl?.trim() || '',
    sourceQuality: data.sourceQuality || 'Secondary source',
    fundingType: data.fundingType || 'Grant',
    category: data.category?.trim() || 'General Funding',
    country: data.country?.trim() || 'Global',
    region: data.region || 'Global',
    deadline: data.deadline || '',
    amountMin: data.amountMin,
    amountMax: data.amountMax,
    amountDisplayText: data.amountDisplayText?.trim() || (data.amountMax ? `$${data.amountMax.toLocaleString()}` : 'Funding Available'),
    currency: data.currency || 'USD',
    isFullyFunded: data.isFullyFunded ?? false,
    description: data.description?.trim() || '',
    summary: data.summary?.trim() || data.description?.slice(0, 140) || '',
    eligibility: Array.isArray(data.eligibility) ? data.eligibility : [],
    requirements: Array.isArray(data.requirements) ? data.requirements : [],
    targetAudience: data.targetAudience?.trim() || '',
    dateDiscovered: existing?.dateDiscovered || nowIso,
    pipelineStatus: data.pipelineStatus || existing?.pipelineStatus || 'Discovered',
    ignoredDuplicates: data.ignoredDuplicates || existing?.ignoredDuplicates || [],
    verificationRecord: data.verificationRecord || existing?.verificationRecord,
    history: existing?.history || [],
    linkedOpportunityId: data.linkedOpportunityId || existing?.linkedOpportunityId,
    publishedAt: data.publishedAt || existing?.publishedAt,
  };

  // Run validation
  updated = refreshItemValidationAndDuplicates(updated, all);

  // If status is not explicitly set, auto-compute appropriate status
  if (!data.pipelineStatus && !isEditing) {
    if (!updated.validationResult?.isValid) {
      updated.pipelineStatus = 'Validation Failed';
    } else if (updated.duplicateCandidates && updated.duplicateCandidates.length > 0) {
      updated.pipelineStatus = 'Duplicate Suspected';
    } else {
      updated.pipelineStatus = 'Discovered';
    }
  }

  // Audit event
  const eventType = isEditing ? 'Edited' : 'Created';
  const desc = isEditing 
    ? `Opportunity details updated by ${actor}.` 
    : `New opportunity record ingested manually into Discovery Queue.`;
  updated = appendPipelineEvent(updated, eventType, desc, actor);

  let newAll: IncomingOpportunity[];
  if (isEditing) {
    newAll = all.map((item) => (item.id === targetId ? updated : item));
  } else {
    newAll = [updated, ...all];
  }

  persistIncomingOpportunities(newAll);
  return updated;
}

/**
 * Imports an opportunity from Discovery into the Pipeline
 */
export function importOpportunityToPipeline(id: string, actor: string = 'Elena Rostova (Admin)'): IncomingOpportunity | null {
  const all = getIncomingOpportunities();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return null;

  let opp = all[index];
  opp = refreshItemValidationAndDuplicates(opp, all);

  let nextStatus: PipelineStatus = 'Imported';
  if (!opp.validationResult?.isValid) {
    nextStatus = 'Validation Failed';
  } else if (opp.duplicateCandidates && opp.duplicateCandidates.length > 0) {
    nextStatus = 'Duplicate Suspected';
  } else {
    nextStatus = 'Ready for Review';
  }

  opp = {
    ...opp,
    pipelineStatus: nextStatus,
  };

  opp = appendPipelineEvent(
    opp,
    'Imported',
    `Imported from Discovery Queue into processing pipeline. Status transitioned to "${nextStatus}".`,
    actor
  );

  all[index] = opp;
  persistIncomingOpportunities(all);
  return opp;
}

/**
 * Ignores an incoming opportunity (deletes or marks rejected from discovery)
 */
export function ignoreDiscoveryOpportunity(id: string, actor: string = 'Elena Rostova (Admin)'): boolean {
  const all = getIncomingOpportunities();
  const filtered = all.filter((item) => item.id !== id);
  if (filtered.length === all.length) return false;
  persistIncomingOpportunities(filtered);
  return true;
}

/**
 * Re-runs validation on an opportunity
 */
export function runValidationOnItem(id: string, actor: string = 'Admin'): IncomingOpportunity | null {
  const all = getIncomingOpportunities();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) return null;

  let opp = all[index];
  opp = refreshItemValidationAndDuplicates(opp, all);

  if (!opp.validationResult?.isValid) {
    opp.pipelineStatus = 'Validation Failed';
  } else if (opp.pipelineStatus === 'Validation Failed') {
    opp.pipelineStatus = opp.duplicateCandidates && opp.duplicateCandidates.length > 0 
      ? 'Duplicate Suspected' 
      : 'Ready for Review';
  }

  opp = appendPipelineEvent(
    opp,
    'Validation Ran',
    `Validation suite executed: ${opp.validationResult?.passedCount} passed, ${opp.validationResult?.issuesCount} issues found.`,
    actor
  );

  all[index] = opp;
  persistIncomingOpportunities(all);
  return opp;
}

/**
 * Ignores a duplicate warning for a specific candidate ID
 */
export function ignoreDuplicateCandidate(
  oppId: string, 
  candidateId: string, 
  actor: string = 'Admin'
): IncomingOpportunity | null {
  const all = getIncomingOpportunities();
  const index = all.findIndex((item) => item.id === oppId);
  if (index === -1) return null;

  let opp = all[index];
  const ignored = new Set(opp.ignoredDuplicates || []);
  ignored.add(candidateId);
  opp.ignoredDuplicates = Array.from(ignored);

  opp = refreshItemValidationAndDuplicates(opp, all);

  // If no more candidates, transition from Duplicate Suspected to Ready for Review
  if ((!opp.duplicateCandidates || opp.duplicateCandidates.length === 0) && opp.pipelineStatus === 'Duplicate Suspected') {
    opp.pipelineStatus = 'Ready for Review';
  }

  opp = appendPipelineEvent(
    opp,
    'Duplicate Ignored',
    `Ignored duplicate candidate warning for item "${candidateId}".`,
    actor
  );

  all[index] = opp;
  persistIncomingOpportunities(all);
  return opp;
}

/**
 * Merges fields from a candidate into the incoming opportunity
 */
export function mergeDuplicateCandidate(
  oppId: string,
  candidateId: string,
  mergedFields: Partial<IncomingOpportunity>,
  actor: string = 'Admin'
): IncomingOpportunity | null {
  const all = getIncomingOpportunities();
  const index = all.findIndex((item) => item.id === oppId);
  if (index === -1) return null;

  let opp = all[index];
  const ignored = new Set(opp.ignoredDuplicates || []);
  ignored.add(candidateId);

  opp = {
    ...opp,
    ...mergedFields,
    ignoredDuplicates: Array.from(ignored),
  };

  opp = refreshItemValidationAndDuplicates(opp, all);
  opp.pipelineStatus = 'Ready for Review';

  opp = appendPipelineEvent(
    opp,
    'Merged',
    `Merged selected fields with candidate "${candidateId}". Status updated to Ready for Review.`,
    actor
  );

  all[index] = opp;
  persistIncomingOpportunities(all);
  return opp;
}

/**
 * Updates Verification Record and status (deliberate admin action)
 */
export function updateOpportunityVerification(
  oppId: string,
  record: VerificationRecord,
  actor: string = 'Elena Rostova (Admin)'
): IncomingOpportunity | null {
  const all = getIncomingOpportunities();
  const index = all.findIndex((item) => item.id === oppId);
  if (index === -1) return null;

  let opp = all[index];
  opp.verificationRecord = {
    ...record,
    lastCheckedDate: new Date().toISOString().split('T')[0],
    verifiedBy: actor,
  };

  if (record.status === 'Verified') {
    opp.pipelineStatus = 'Verified';
  } else if (record.status === 'Under Review') {
    opp.pipelineStatus = 'Under Verification';
  } else if (record.status === 'Needs Review') {
    opp.pipelineStatus = 'Ready for Review';
  } else if (record.status === 'Rejected') {
    opp.pipelineStatus = 'Rejected';
  }

  opp = appendPipelineEvent(
    opp,
    'Verification status changed',
    `Verification status set to "${record.status}". Notes: ${record.notes || 'None provided.'}`,
    actor
  );

  all[index] = opp;
  persistIncomingOpportunities(all);
  return opp;
}

/**
 * Rejects an incoming opportunity
 */
export function rejectPipelineOpportunity(
  oppId: string,
  reason: string,
  actor: string = 'Admin'
): IncomingOpportunity | null {
  const all = getIncomingOpportunities();
  const index = all.findIndex((item) => item.id === oppId);
  if (index === -1) return null;

  let opp = all[index];
  opp.pipelineStatus = 'Rejected';

  if (opp.verificationRecord) {
    opp.verificationRecord.status = 'Rejected';
    opp.verificationRecord.notes = reason;
  }

  opp = appendPipelineEvent(
    opp,
    'Rejected',
    `Opportunity rejected from ingestion pipeline. Reason: ${reason}`,
    actor
  );

  all[index] = opp;
  persistIncomingOpportunities(all);
  return opp;
}

/**
 * Publishes an opportunity from the Pipeline into the live seeker Catalog
 * ONLY verified / deliberate admin action should invoke this.
 */
export function publishOpportunityFromPipeline(
  oppId: string,
  actor: string = 'Elena Rostova (Admin)'
): { pipelineItem: IncomingOpportunity; catalogItem: Opportunity } | null {
  const all = getIncomingOpportunities();
  const index = all.findIndex((item) => item.id === oppId);
  if (index === -1) return null;

  let opp = all[index];
  const nowIso = new Date().toISOString().split('T')[0];

  // Map to main catalog OpportunityFormData format
  const catalogOpportunity = saveOpportunity({
    id: opp.linkedOpportunityId, // preserve if re-publishing
    title: opp.title,
    organization: opp.organization,
    type: opp.fundingType,
    category: opp.category,
    description: opp.description,
    summary: opp.summary || opp.description.slice(0, 160),
    minAmount: opp.amountMin,
    maxAmount: opp.amountMax || 0,
    currency: opp.currency || 'USD',
    amountDisplayText: opp.amountDisplayText,
    isFullyFunded: opp.isFullyFunded,
    eligibleCountries: [opp.country],
    applicantTypes: opp.eligibility.length > 0 ? opp.eligibility : ['General Applicants'],
    deadline: opp.deadline || '',
    applicationUrl: opp.applicationUrl || opp.sourceUrl,
    publicationStatus: 'Published',
    adminVerificationStatus: 'Verified',
    source: opp.sourceUrl || opp.source,
    lastVerifiedDate: nowIso,
    internalNotes: `Ingested & verified via FundEcho Pipeline. Original Source: ${opp.source} (${opp.sourceQuality}).`,
    featured: false,
    tags: [opp.fundingType, opp.category, 'Verified Provider'],
    location: opp.country,
    region: opp.region,
  });

  // Update pipeline state
  opp.pipelineStatus = 'Published';
  opp.linkedOpportunityId = catalogOpportunity.id;
  opp.publishedAt = nowIso;

  opp = appendPipelineEvent(
    opp,
    'Published',
    `Deliberately published into public seeker catalog (Catalog ID: ${catalogOpportunity.id}). Marked verified.`,
    actor
  );

  all[index] = opp;
  persistIncomingOpportunities(all);

  return {
    pipelineItem: opp,
    catalogItem: catalogOpportunity,
  };
}

/**
 * Calculates Pipeline metrics
 */
export function getPipelineStats(): PipelineStats {
  const all = getIncomingOpportunities();

  return {
    totalIncoming: all.length,
    discovered: all.filter((i) => i.pipelineStatus === 'Discovered').length,
    imported: all.filter((i) => i.pipelineStatus === 'Imported').length,
    validationFailed: all.filter((i) => i.pipelineStatus === 'Validation Failed').length,
    readyForReview: all.filter((i) => i.pipelineStatus === 'Ready for Review').length,
    duplicateSuspected: all.filter((i) => i.pipelineStatus === 'Duplicate Suspected').length,
    underVerification: all.filter((i) => i.pipelineStatus === 'Under Verification').length,
    verified: all.filter((i) => i.pipelineStatus === 'Verified').length,
    published: all.filter((i) => i.pipelineStatus === 'Published').length,
    rejected: all.filter((i) => i.pipelineStatus === 'Rejected').length,
  };
}

/**
 * Resets Pipeline back to initial seed dataset for testing
 */
export function resetPipelineDemoData(): IncomingOpportunity[] {
  const seeded = SEED_INCOMING_OPPORTUNITIES.map((item) =>
    refreshItemValidationAndDuplicates(item, SEED_INCOMING_OPPORTUNITIES)
  );
  persistIncomingOpportunities(seeded);
  return seeded;
}
