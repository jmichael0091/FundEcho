/**
 * FUNDORA - APPLICATION TRACKING SYSTEM SERVICE (STEP 22)
 * Robust Firestore integration for tracking funding applications.
 * Enforces user isolation, duplicate protection, status workflows,
 * private notes, and deadline awareness.
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
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  FirestoreApplication,
  ApplicationTrackerStatus,
  ApplicationRequirement,
  ApplicationDocument,
  ApplicationResponse,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';
import { toISOString } from './timestampUtils';
import { createApplicationUpdateNotification } from './notificationService';

const LOCAL_STORAGE_PREFIX = 'fundora_firestore_applications_';

export interface ApplicationReadinessResult {
  score: number; // 0-100
  label: string; // "Early Planning" | "In Preparation" | "Nearly Ready" | "Ready to Submit"
  color: string;
  badgeBg: string;
  badgeText: string;
  checklistCompleted: number;
  checklistTotal: number;
  documentsReadyOrUploaded: number;
  documentsTotal: number;
  responsesAnswered: number;
  responsesTotal: number;
  nextAction: string;
}

/**
 * Calculates composite Application Readiness indicator (Requirement 6).
 * Combines Checklist completion (40%), Document readiness (30%), and Response completeness (30%).
 */
export function calculateApplicationReadiness(
  requirements?: ApplicationRequirement[],
  documents?: ApplicationDocument[],
  responses?: ApplicationResponse[]
): ApplicationReadinessResult {
  const reqs = requirements || [];
  const docs = documents || [];
  const resps = responses || [];

  const checklistTotal = reqs.length;
  const checklistCompleted = reqs.filter((r) => r.completed).length;

  const documentsTotal = docs.length;
  const documentsReadyOrUploaded = docs.filter(
    (d) => d.status === 'Ready' || d.status === 'Uploaded'
  ).length;

  const responsesTotal = resps.length;
  const responsesAnswered = resps.filter(
    (r) => r.completed || (typeof r.answer === 'string' && r.answer.trim().length > 30)
  ).length;

  // Adaptive weighting
  let totalWeights = 0;
  let earnedScore = 0;

  if (checklistTotal > 0) {
    totalWeights += 40;
    earnedScore += (checklistCompleted / checklistTotal) * 40;
  }
  if (documentsTotal > 0) {
    totalWeights += 30;
    earnedScore += (documentsReadyOrUploaded / documentsTotal) * 30;
  }
  if (responsesTotal > 0) {
    totalWeights += 30;
    earnedScore += (responsesAnswered / responsesTotal) * 30;
  }

  const score = totalWeights > 0 ? Math.round((earnedScore / totalWeights) * 100) : 0;

  // Determine readiness stage and next action guidance
  let label = 'Early Planning';
  let color = 'from-slate-500 to-slate-600';
  let badgeBg = 'bg-slate-100 dark:bg-slate-800';
  let badgeText = 'text-slate-700 dark:text-slate-300';
  let nextAction = 'Begin by reviewing requirements and ticking off initial checks.';

  if (score >= 90) {
    label = 'Ready to Submit';
    color = 'from-emerald-500 to-emerald-600';
    badgeBg = 'bg-emerald-100 dark:bg-emerald-950/60';
    badgeText = 'text-emerald-700 dark:text-emerald-300';
    nextAction = 'All components ready. Conduct final proofreading and submit.';
  } else if (score >= 60) {
    label = 'Nearly Ready';
    color = 'from-indigo-500 to-indigo-600';
    badgeBg = 'bg-indigo-100 dark:bg-indigo-950/60';
    badgeText = 'text-indigo-700 dark:text-indigo-300';
    if (documentsReadyOrUploaded < documentsTotal) {
      nextAction = 'Upload remaining required documents and verify attachments.';
    } else if (responsesAnswered < responsesTotal) {
      nextAction = 'Complete any remaining draft responses.';
    } else {
      nextAction = 'Check off remaining pending checklist requirements.';
    }
  } else if (score >= 30) {
    label = 'In Preparation';
    color = 'from-blue-500 to-blue-600';
    badgeBg = 'bg-blue-100 dark:bg-blue-950/60';
    badgeText = 'text-blue-700 dark:text-blue-300';
    if (responsesAnswered < Math.ceil(responsesTotal / 2)) {
      nextAction = 'Draft narrative answers to core application questions.';
    } else {
      nextAction = 'Prepare and upload financial budget and proof documents.';
    }
  } else {
    label = 'Early Planning';
    color = 'from-amber-500 to-amber-600';
    badgeBg = 'bg-amber-100 dark:bg-amber-950/60';
    badgeText = 'text-amber-700 dark:text-amber-300';
    nextAction = 'Review eligibility guidelines and create your preparation checklist.';
  }

  return {
    score,
    label,
    color,
    badgeBg,
    badgeText,
    checklistCompleted,
    checklistTotal,
    documentsReadyOrUploaded,
    documentsTotal,
    responsesAnswered,
    responsesTotal,
    nextAction,
  };
}

/**
 * Generates initial requirements checklist based on opportunity guidelines.
 */
export function generateInitialRequirements(opportunity: any): ApplicationRequirement[] {
  const reqs: ApplicationRequirement[] = [];

  // 1. Check if opportunity has structured requirements array
  if (Array.isArray(opportunity?.requirements) && opportunity.requirements.length > 0) {
    opportunity.requirements.forEach((req: string, idx: number) => {
      reqs.push({
        id: `req_opp_${idx + 1}`,
        title: req,
        description: 'Mandatory grant provider requirement specified in official call.',
        required: true,
        completed: false,
        category: 'eligibility',
      });
    });
  }

  // 2. Standard baseline requirements if none were provided or to complement
  if (reqs.length === 0) {
    reqs.push(
      {
        id: 'req_1',
        title: 'Confirm Applicant & Regional Eligibility',
        description: 'Ensure legal residency, target demographic, and non-dilutive eligibility guidelines.',
        required: true,
        completed: false,
        category: 'eligibility',
      },
      {
        id: 'req_2',
        title: 'Complete Project Narrative & Objectives',
        description: 'Formulate detailed problem statement, goals, and measurable outcomes.',
        required: true,
        completed: false,
        category: 'form',
      },
      {
        id: 'req_3',
        title: 'Prepare Itemized Budget Breakdown',
        description: 'Assemble comprehensive cost justifications aligned with allowed grant expenditure categories.',
        required: true,
        completed: false,
        category: 'document',
      },
      {
        id: 'req_4',
        title: 'Upload Official Organizational / Identification Documents',
        description: 'Valid government ID, company registration certificate, or tax exemption proof.',
        required: true,
        completed: false,
        category: 'document',
      },
      {
        id: 'req_5',
        title: 'Gather Key Team Resumes & CVs',
        description: 'Assemble professional qualifications demonstrating capacity to execute proposed scope.',
        required: false,
        completed: false,
        category: 'document',
      },
      {
        id: 'req_6',
        title: 'Final Quality Review & Submission Verification',
        description: 'Proofread answers, verify link access, and perform compliance pre-check.',
        required: true,
        completed: false,
        category: 'action',
      }
    );
  }

  return reqs;
}

/**
 * Generates initial document slots required for funding applications.
 */
export function generateInitialDocuments(opportunity: any): ApplicationDocument[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'doc_init_1',
      userId: '',
      applicationId: '',
      name: 'Project Narrative & Proposal Document',
      type: 'application/pdf',
      uploadedAt: now,
      status: 'Needed',
      required: true,
      notes: 'Main written proposal detailing background, methodology, and expected deliverables.',
    },
    {
      id: 'doc_init_2',
      userId: '',
      applicationId: '',
      name: 'Detailed Project Budget (Spreadsheet / PDF)',
      type: 'application/pdf',
      uploadedAt: now,
      status: 'Needed',
      required: true,
      notes: 'Line-by-line breakdown of personnel, equipment, operations, and indirect costs.',
    },
    {
      id: 'doc_init_3',
      userId: '',
      applicationId: '',
      name: 'Registration or Tax Exemption Certificate',
      type: 'application/pdf',
      uploadedAt: now,
      status: 'Needed',
      required: true,
      notes: 'Proof of non-profit 501(c)(3), company incorporation, or institutional affiliation.',
    },
    {
      id: 'doc_init_4',
      userId: '',
      applicationId: '',
      name: 'Curriculum Vitae (CV) of Lead Applicant',
      type: 'application/pdf',
      uploadedAt: now,
      status: 'Needed',
      required: false,
      notes: '1-3 page resume summarizing relevant leadership and domain expertise.',
    },
  ];
}

/**
 * Generates initial structured proposal questions and answers.
 */
export function generateInitialResponses(opportunity: any): ApplicationResponse[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'resp_1',
      question: 'Project Title & Executive Summary',
      answer: '',
      required: true,
      completed: false,
      updatedAt: now,
      guidelines: 'Provide a concise overview of what your project aims to accomplish, target location, and main outcome.',
      wordLimit: 250,
    },
    {
      id: 'resp_2',
      question: 'Problem Statement & Urgency of Need',
      answer: '',
      required: true,
      completed: false,
      updatedAt: now,
      guidelines: 'Describe the specific challenge, gap, or community problem this funding will address, supported by relevant data.',
      wordLimit: 500,
    },
    {
      id: 'resp_3',
      question: 'Proposed Solution, Methodology & Innovation',
      answer: '',
      required: true,
      completed: false,
      updatedAt: now,
      guidelines: 'Explain the core activities, implementation steps, and why your approach is effective and innovative.',
      wordLimit: 750,
    },
    {
      id: 'resp_4',
      question: 'Target Beneficiaries & Quantifiable Impact',
      answer: '',
      required: true,
      completed: false,
      updatedAt: now,
      guidelines: 'Identify who directly benefits (e.g. number of individuals, organizations) and key success metrics.',
      wordLimit: 400,
    },
    {
      id: 'resp_5',
      question: 'Budget Allocation & Financial Feasibility',
      answer: '',
      required: true,
      completed: false,
      updatedAt: now,
      guidelines: 'Justify the funding amount requested and explain how funds will be managed responsibly.',
      wordLimit: 350,
    },
    {
      id: 'resp_6',
      question: 'Implementation Timeline & Milestones',
      answer: '',
      required: false,
      completed: false,
      updatedAt: now,
      guidelines: 'List major phases from kickoff to completion with estimated delivery months.',
      wordLimit: 300,
    },
  ];
}

/**
 * Helper to get millisecond epoch from any FirestoreDateTime or Date-like value.
 */
function getMillis(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.getTime();
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  if (typeof val === 'string') {
    const t = new Date(val).getTime();
    return isNaN(t) ? 0 : t;
  }
  return 0;
}

/**
 * Normalizes a raw Firestore document snapshot or data object into a typed FirestoreApplication.
 */
export function normalizeApplication(docId: string, data: any): FirestoreApplication {
  const startedAt = toISOString(data.startedAt || data.createdAt || new Date());
  const updatedAt = toISOString(data.updatedAt || new Date());
  const submittedAt = data.submittedAt ? toISOString(data.submittedAt) : null;

  // Map legacy statuses if present
  let status: ApplicationTrackerStatus = 'Planning';
  const rawStatus = data.status;
  if (rawStatus === 'Planning' || rawStatus === 'In Progress' || rawStatus === 'Submitted' ||
      rawStatus === 'Under Review' || rawStatus === 'Approved' || rawStatus === 'Rejected' || rawStatus === 'Withdrawn') {
    status = rawStatus;
  } else if (rawStatus === 'inProgress') {
    status = 'In Progress';
  } else if (rawStatus === 'submitted') {
    status = 'Submitted';
  } else if (rawStatus === 'draft' || rawStatus === 'not_started') {
    status = 'Planning';
  } else if (rawStatus === 'readyForReview' || rawStatus === 'ready_for_review') {
    status = 'In Progress';
  }

  // Workspace sub-collections/arrays with safe initializers
  const requirements: ApplicationRequirement[] = Array.isArray(data.requirements) && data.requirements.length > 0
    ? data.requirements
    : generateInitialRequirements({
        requirements: data.opportunityRequirements || [],
      });

  const documents: ApplicationDocument[] = Array.isArray(data.documents) && data.documents.length > 0
    ? data.documents
    : generateInitialDocuments({}).map((d) => ({
        ...d,
        userId: data.userId || '',
        applicationId: docId,
      }));

  const responses: ApplicationResponse[] = Array.isArray(data.responses) && data.responses.length > 0
    ? data.responses
    : generateInitialResponses({});

  const readiness = calculateApplicationReadiness(requirements, documents, responses);
  const progress = typeof data.progress === 'number' ? data.progress : readiness.score;

  return {
    id: docId,
    userId: data.userId || '',
    opportunityId: data.opportunityId || '',
    opportunityTitle: data.opportunityTitle || 'Funding Opportunity',
    provider: data.provider || data.opportunityOrganization || 'Verified Provider',
    status,
    notes: typeof data.notes === 'string' ? data.notes : '',
    deadline: data.deadline || data.opportunityDeadline || '',
    startedAt,
    submittedAt,
    updatedAt,
    progress,
    requirements,
    documents,
    responses,
    currentStep: typeof data.currentStep === 'number' ? data.currentStep : 1,
    applicantInformation: data.applicantInformation,
    organizationInformation: data.organizationInformation,
    fundingRequest: data.fundingRequest,
  };
}

/**
 * Helper to cache applications in localStorage for instant optimistic rendering and offline resilience.
 */
function getLocalCache(userId: string): FirestoreApplication[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setLocalCache(userId: string, apps: FirestoreApplication[]): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, JSON.stringify(apps));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Checks if an application already exists for the given userId and opportunityId (Duplicate Protection).
 */
export async function getUserApplicationForOpportunity(
  userId: string,
  opportunityId: string
): Promise<FirestoreApplication | null> {
  if (!userId || !opportunityId) return null;

  // 1. Direct deterministic doc ID check
  const deterministicId = `app_${userId}_${opportunityId}`;
  if (isFirebaseConfigured()) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, deterministicId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return normalizeApplication(snap.id, snap.data());
      }
    } catch (err) {
      console.warn('[ApplicationService] Direct doc lookup failed, trying query:', err);
    }

    // 2. Query fallback (in case doc ID was formatted differently)
    try {
      const appsRef = collection(db, FIRESTORE_COLLECTIONS.APPLICATIONS);
      const q = query(
        appsRef,
        where('userId', '==', userId),
        where('opportunityId', '==', opportunityId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firstDoc = snap.docs[0];
        return normalizeApplication(firstDoc.id, firstDoc.data());
      }
    } catch (err) {
      console.warn('[ApplicationService] Query lookup failed:', err);
    }
  }

  // 3. Check local cache fallback
  const localApps = getLocalCache(userId);
  const foundLocal = localApps.find(
    (a) => a.userId === userId && a.opportunityId === opportunityId
  );
  return foundLocal || null;
}

/**
 * Starts a new application or retrieves an existing one (Duplicate Protection).
 * Sets initial status to "Planning", stores deadline, records startedAt and updatedAt.
 */
export async function startApplication(
  userId: string,
  opportunity: {
    id: string;
    title: string;
    provider?: string;
    organization?: string;
    deadline?: string;
  }
): Promise<{ application: FirestoreApplication; isExisting: boolean }> {
  if (!userId) {
    throw new Error('User must be authenticated to start an application.');
  }
  if (!opportunity || !opportunity.id) {
    throw new Error('Valid opportunity ID is required to start an application.');
  }

  // Check duplicate protection first
  const existingApp = await getUserApplicationForOpportunity(userId, opportunity.id);
  if (existingApp) {
    console.log(`[ApplicationService] Existing application found for opportunity ${opportunity.id}:`, existingApp.id);
    return { application: existingApp, isExisting: true };
  }

  const applicationId = `app_${userId}_${opportunity.id}`;
  const now = new Date().toISOString();
  const provider = opportunity.provider || opportunity.organization || 'Funding Organization';

  const requirements = generateInitialRequirements(opportunity);
  const documents = generateInitialDocuments(opportunity).map((d) => ({
    ...d,
    userId,
    applicationId,
  }));
  const responses = generateInitialResponses(opportunity);
  const readiness = calculateApplicationReadiness(requirements, documents, responses);

  const newApp: FirestoreApplication = {
    id: applicationId,
    userId,
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    provider,
    status: 'Planning',
    notes: '',
    deadline: opportunity.deadline || '',
    startedAt: now,
    submittedAt: null,
    updatedAt: now,
    currentStep: 1,
    progress: readiness.score,
    requirements,
    documents,
    responses,
  };

  // Optimistically write to local cache
  const cached = getLocalCache(userId);
  const updatedCache = [newApp, ...cached.filter((a) => a.id !== applicationId)];
  setLocalCache(userId, updatedCache);

  // Persist to Cloud Firestore
  if (isFirebaseConfigured()) {
    try {
      const appRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, applicationId);
      await setDoc(appRef, {
        id: applicationId,
        userId,
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        provider,
        status: 'Planning',
        notes: '',
        deadline: opportunity.deadline || '',
        startedAt: serverTimestamp(),
        submittedAt: null,
        updatedAt: serverTimestamp(),
        currentStep: 1,
        progress: readiness.score,
        requirements,
        documents,
        responses,
      });
      console.log(`[ApplicationService] Successfully created application ${applicationId} in Firestore.`);
    } catch (error) {
      console.error('[ApplicationService] Error saving application to Firestore:', error);
      // Even if Firestore write threw, local cache retains optimistic record
    }
  }

  return { application: newApp, isExisting: false };
}

/**
 * Retrieves all applications belonging to a specific user.
 */
export async function getUserApplications(userId: string): Promise<FirestoreApplication[]> {
  if (!userId) return [];

  const localApps = getLocalCache(userId);

  if (!isFirebaseConfigured()) {
    return localApps;
  }

  try {
    const appsRef = collection(db, FIRESTORE_COLLECTIONS.APPLICATIONS);
    const q = query(appsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const remoteApps: FirestoreApplication[] = snapshot.docs.map((docSnap) =>
      normalizeApplication(docSnap.id, docSnap.data())
    );

    // Sort descending by updatedAt
    remoteApps.sort((a, b) => getMillis(b.updatedAt) - getMillis(a.updatedAt));

    // Update local cache
    setLocalCache(userId, remoteApps);
    return remoteApps;
  } catch (error) {
    console.error(`[ApplicationService] Error fetching user applications for ${userId}:`, error);
    return localApps;
  }
}

/**
 * Subscribes to real-time updates of the user's applications in Firestore.
 */
export function subscribeToUserApplications(
  userId: string,
  onUpdate: (apps: FirestoreApplication[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  // Initial call with cached data
  onUpdate(getLocalCache(userId));

  if (!isFirebaseConfigured()) {
    return () => {};
  }

  try {
    const appsRef = collection(db, FIRESTORE_COLLECTIONS.APPLICATIONS);
    const q = query(appsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps = snapshot.docs.map((docSnap) =>
          normalizeApplication(docSnap.id, docSnap.data())
        );
        apps.sort((a, b) => getMillis(b.updatedAt) - getMillis(a.updatedAt));
        setLocalCache(userId, apps);
        onUpdate(apps);
      },
      (error) => {
        console.error(`[ApplicationService] Snapshot subscription error for ${userId}:`, error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('[ApplicationService] Error setting up snapshot listener:', err);
    return () => {};
  }
}

/**
 * Updates application status.
 * If status becomes "Submitted", records submittedAt.
 * Strictly prevents changing userId, opportunityId, or provider information.
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationTrackerStatus,
  userId: string
): Promise<void> {
  if (!applicationId || !newStatus) return;

  const now = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === 'Submitted') {
    updatePayload.submittedAt = now;
  }

  // Update local cache optimistically
  if (userId) {
    const cached = getLocalCache(userId);
    const updated = cached.map((app) => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: newStatus,
          updatedAt: now,
          submittedAt: newStatus === 'Submitted' ? now : app.submittedAt,
        };
      }
      return app;
    });
    setLocalCache(userId, updated);

    // Trigger Application Update notification (Requirement 10)
    const updatedApp = updated.find((a) => a.id === applicationId);
    if (updatedApp) {
      createApplicationUpdateNotification({
        userId,
        applicationId,
        opportunityId: updatedApp.opportunityId,
        opportunityTitle: updatedApp.opportunityTitle,
        status: newStatus,
      }).catch((err) => {
        console.warn('[ApplicationService] Failed to dispatch status notification:', err);
      });
    }
  }

  if (isFirebaseConfigured()) {
    try {
      const appRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, applicationId);
      await updateDoc(appRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === 'Submitted' ? { submittedAt: serverTimestamp() } : {}),
      });
      console.log(`[ApplicationService] Status updated to "${newStatus}" for ${applicationId}`);
    } catch (error) {
      console.error(`[ApplicationService] Error updating status for ${applicationId}:`, error);
      throw error;
    }
  }
}

/**
 * Adds or updates private notes on an application.
 * Only the owner can view and update notes.
 */
export async function updateApplicationNotes(
  applicationId: string,
  notes: string,
  userId: string
): Promise<void> {
  if (!applicationId) return;

  const now = new Date().toISOString();

  // Optimistic local cache update
  if (userId) {
    const cached = getLocalCache(userId);
    const updated = cached.map((app) => {
      if (app.id === applicationId) {
        return { ...app, notes, updatedAt: now };
      }
      return app;
    });
    setLocalCache(userId, updated);
  }

  if (isFirebaseConfigured()) {
    try {
      const appRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, applicationId);
      await updateDoc(appRef, {
        notes,
        updatedAt: serverTimestamp(),
      });
      console.log(`[ApplicationService] Notes updated for ${applicationId}`);
    } catch (error) {
      console.error(`[ApplicationService] Error updating notes for ${applicationId}:`, error);
      throw error;
    }
  }
}

/**
 * Deletes an application tracking record.
 */
export async function deleteApplication(applicationId: string, userId: string): Promise<void> {
  if (!applicationId) return;

  if (userId) {
    const cached = getLocalCache(userId);
    setLocalCache(userId, cached.filter((a) => a.id !== applicationId));
  }

  if (isFirebaseConfigured()) {
    try {
      const appRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, applicationId);
      await deleteDoc(appRef);
      console.log(`[ApplicationService] Deleted application ${applicationId}`);
    } catch (error) {
      console.error(`[ApplicationService] Error deleting application ${applicationId}:`, error);
      throw error;
    }
  }
}

/**
 * Retrieves a single application by its ID.
 */
export async function getApplicationById(
  applicationId: string
): Promise<FirestoreApplication | null> {
  if (!applicationId) return null;

  if (isFirebaseConfigured()) {
    try {
      const appRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, applicationId);
      const snap = await getDoc(appRef);
      if (snap.exists()) {
        return normalizeApplication(snap.id, snap.data());
      }
    } catch (error) {
      console.error(`[ApplicationService] Error fetching application ${applicationId}:`, error);
    }
  }

  return null;
}

/**
 * Updates application requirements checklist and recomputes readiness score.
 */
export async function updateApplicationRequirements(
  applicationId: string,
  requirements: ApplicationRequirement[],
  userId: string,
  currentDocs?: ApplicationDocument[],
  currentResponses?: ApplicationResponse[]
): Promise<number> {
  if (!applicationId) return 0;
  const now = new Date().toISOString();
  const readiness = calculateApplicationReadiness(requirements, currentDocs, currentResponses);

  // Optimistic local cache update
  if (userId) {
    const cached = getLocalCache(userId);
    const updated = cached.map((app) => {
      if (app.id === applicationId) {
        return {
          ...app,
          requirements,
          progress: readiness.score,
          updatedAt: now,
        };
      }
      return app;
    });
    setLocalCache(userId, updated);
  }

  if (isFirebaseConfigured()) {
    try {
      const appRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, applicationId);
      await updateDoc(appRef, {
        requirements,
        progress: readiness.score,
        updatedAt: serverTimestamp(),
      });
      console.log(`[ApplicationService] Requirements updated for ${applicationId}. New progress: ${readiness.score}%`);
    } catch (error) {
      console.error(`[ApplicationService] Error updating requirements for ${applicationId}:`, error);
      throw error;
    }
  }

  return readiness.score;
}

/**
 * Updates application documents list and recomputes readiness score.
 */
export async function updateApplicationDocuments(
  applicationId: string,
  documents: ApplicationDocument[],
  userId: string,
  currentReqs?: ApplicationRequirement[],
  currentResponses?: ApplicationResponse[]
): Promise<number> {
  if (!applicationId) return 0;
  const now = new Date().toISOString();
  const readiness = calculateApplicationReadiness(currentReqs, documents, currentResponses);

  // Optimistic local cache update
  if (userId) {
    const cached = getLocalCache(userId);
    const updated = cached.map((app) => {
      if (app.id === applicationId) {
        return {
          ...app,
          documents,
          progress: readiness.score,
          updatedAt: now,
        };
      }
      return app;
    });
    setLocalCache(userId, updated);
  }

  if (isFirebaseConfigured()) {
    try {
      const appRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, applicationId);
      await updateDoc(appRef, {
        documents,
        progress: readiness.score,
        updatedAt: serverTimestamp(),
      });
      console.log(`[ApplicationService] Documents updated for ${applicationId}. New progress: ${readiness.score}%`);
    } catch (error) {
      console.error(`[ApplicationService] Error updating documents for ${applicationId}:`, error);
      throw error;
    }
  }

  return readiness.score;
}

/**
 * Updates application responses and recomputes readiness score.
 */
export async function updateApplicationResponses(
  applicationId: string,
  responses: ApplicationResponse[],
  userId: string,
  currentReqs?: ApplicationRequirement[],
  currentDocs?: ApplicationDocument[]
): Promise<number> {
  if (!applicationId) return 0;
  const now = new Date().toISOString();
  const readiness = calculateApplicationReadiness(currentReqs, currentDocs, responses);

  // Optimistic local cache update
  if (userId) {
    const cached = getLocalCache(userId);
    const updated = cached.map((app) => {
      if (app.id === applicationId) {
        return {
          ...app,
          responses,
          progress: readiness.score,
          updatedAt: now,
        };
      }
      return app;
    });
    setLocalCache(userId, updated);
  }

  if (isFirebaseConfigured()) {
    try {
      const appRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, applicationId);
      await updateDoc(appRef, {
        responses,
        progress: readiness.score,
        updatedAt: serverTimestamp(),
      });
      console.log(`[ApplicationService] Responses updated for ${applicationId}. New progress: ${readiness.score}%`);
    } catch (error) {
      console.error(`[ApplicationService] Error updating responses for ${applicationId}:`, error);
      throw error;
    }
  }

  return readiness.score;
}

/**
 * Updates full application workspace fields in a single atomic operation.
 */
export async function updateApplicationWorkspace(
  applicationId: string,
  updates: Partial<FirestoreApplication>,
  userId: string
): Promise<void> {
  if (!applicationId) return;
  const now = new Date().toISOString();

  // Optimistic local cache update
  if (userId) {
    const cached = getLocalCache(userId);
    const updated = cached.map((app) => {
      if (app.id === applicationId) {
        return {
          ...app,
          ...updates,
          updatedAt: now,
        };
      }
      return app;
    });
    setLocalCache(userId, updated);
  }

  if (isFirebaseConfigured()) {
    try {
      const appRef = doc(db, FIRESTORE_COLLECTIONS.APPLICATIONS, applicationId);
      const sanitizedUpdates: Record<string, any> = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      // Protect immutable primary keys
      delete sanitizedUpdates.id;
      delete sanitizedUpdates.userId;
      delete sanitizedUpdates.opportunityId;

      await updateDoc(appRef, sanitizedUpdates);
      console.log(`[ApplicationService] Full workspace updated for ${applicationId}`);
    } catch (error) {
      console.error(`[ApplicationService] Error updating full workspace for ${applicationId}:`, error);
      throw error;
    }
  }
}

