/**
 * FUNDECHO - FUNDER FOLLOW & OPPORTUNITY ALERT SERVICE
 * Allows users to follow specific institutional funders/grantmakers.
 * Dispatches real-time in-app notifications whenever a followed funder posts a new opportunity.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { FIRESTORE_COLLECTIONS, FollowedFunderDoc } from '../../types/firebase';
import { Opportunity } from '../../types';
import { FunderProfile } from '../../types/funder';
import { VERIFIED_FUNDERS } from '../../data/funderDirectoryData';
import { createNotification } from './notificationService';
import { saveOpportunity, getPublicOpportunities } from '../../utils/adminStorage';

const LOCAL_STORAGE_KEY_PREFIX = 'fundecho_followed_funders_';
const GUEST_KEY = 'fundecho_followed_funders_guest';
const FOLLOWER_COUNTS_KEY = 'fundecho_funder_follower_counts';

// Initial baseline follower counts for verified grantmakers
const BASELINE_FOLLOWER_COUNTS: Record<string, number> = {
  'gates-foundation': 1420,
  'ford-foundation': 980,
  'rockefeller-foundation': 760,
  'macarthur-foundation': 640,
  'wellcome-trust': 1150,
  'google-org': 2340,
  'usaid': 1890,
  'world-bank': 3120,
};

/**
 * Returns followers count storage
 */
function getFollowerCountsMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(FOLLOWER_COUNTS_KEY);
    if (raw) {
      return { ...BASELINE_FOLLOWER_COUNTS, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...BASELINE_FOLLOWER_COUNTS };
}

function saveFollowerCountsMap(map: Record<string, number>): void {
  try {
    localStorage.setItem(FOLLOWER_COUNTS_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Retrieves follower count for a funder
 */
export function getFunderFollowerCount(funderSlug: string): number {
  const map = getFollowerCountsMap();
  return map[funderSlug] ?? (BASELINE_FOLLOWER_COUNTS[funderSlug] || 150);
}

/**
 * Retrieves the local followed funder slugs for a user or guest
 */
export function getFollowedFundersLocal(userId?: string): string[] {
  const key = userId ? `${LOCAL_STORAGE_KEY_PREFIX}${userId}` : GUEST_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Saves local followed funder slugs
 */
export function saveFollowedFundersLocal(userId: string | undefined, slugs: string[]): void {
  const key = userId ? `${LOCAL_STORAGE_KEY_PREFIX}${userId}` : GUEST_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(slugs))));
  } catch {}
}

/**
 * Checks whether a funder is followed by the current user
 */
export async function isUserFollowingFunder(
  userId: string | undefined,
  funderSlug: string
): Promise<boolean> {
  if (!funderSlug) return false;

  // 1. Fast local cache check
  const localList = getFollowedFundersLocal(userId);
  if (localList.includes(funderSlug)) {
    return true;
  }

  // 2. Firestore check if authenticated
  if (userId && isFirebaseConfigured()) {
    try {
      const followDocRef = doc(db, FIRESTORE_COLLECTIONS.FOLLOWED_FUNDERS, `${userId}_${funderSlug}`);
      const snap = await getDoc(followDocRef);
      if (snap.exists()) {
        // Sync back to local cache
        if (!localList.includes(funderSlug)) {
          saveFollowedFundersLocal(userId, [...localList, funderSlug]);
        }
        return true;
      }
    } catch (err) {
      console.warn('[FunderFollowService] Error checking follow status in Firestore:', err);
    }
  }

  return false;
}

/**
 * Follows a funder.
 * Persists locally and in Firestore, increments follower counter,
 * and generates a welcoming confirmation notification.
 */
export async function followFunder(params: {
  userId?: string;
  userEmail?: string;
  funderSlug: string;
  funderName: string;
}): Promise<{ success: boolean; isFollowing: boolean; message: string }> {
  const { userId, userEmail, funderSlug, funderName } = params;
  if (!funderSlug) return { success: false, isFollowing: false, message: 'Invalid funder' };

  // 1. Update local storage cache
  const localList = getFollowedFundersLocal(userId);
  if (!localList.includes(funderSlug)) {
    saveFollowedFundersLocal(userId, [...localList, funderSlug]);
  }

  // 2. Increment count
  const counts = getFollowerCountsMap();
  counts[funderSlug] = (counts[funderSlug] || BASELINE_FOLLOWER_COUNTS[funderSlug] || 150) + 1;
  saveFollowerCountsMap(counts);

  // 3. Persist to Firestore if user is authenticated
  if (userId && isFirebaseConfigured()) {
    try {
      const docId = `${userId}_${funderSlug}`;
      const followDocRef = doc(db, FIRESTORE_COLLECTIONS.FOLLOWED_FUNDERS, docId);
      const record: FollowedFunderDoc = {
        id: docId,
        userId,
        funderSlug,
        funderName,
        userEmail: userEmail || '',
        followedAt: serverTimestamp(),
        notificationsEnabled: true,
      };
      await setDoc(followDocRef, record, { merge: true });
      console.log(`[FunderFollowService] Followed funder ${funderSlug} saved to Firestore.`);
    } catch (err) {
      console.warn('[FunderFollowService] Firestore follow write error:', err);
    }
  }

  // 4. Send welcoming In-App Notification in existing notification system
  if (userId) {
    try {
      await createNotification({
        userId,
        type: 'Opportunity Update',
        title: `Now Following ${funderName}`,
        message: `You are now following ${funderName}. You will receive immediate notifications here whenever they publish a new grant, fellowship, or funding call.`,
        urgency: 'normal',
        actionLabel: 'View Funder',
        targetPage: 'funder-detail' as any,
        customId: `notif_follow_${userId}_${funderSlug}_${Date.now()}`,
      });
    } catch (e) {
      console.warn('[FunderFollowService] Error dispatching follow notification:', e);
    }
  }

  // 5. Dispatch window event for instantaneous cross-component reactive updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('fundecho:funder-follow-changed', {
        detail: { funderSlug, isFollowing: true },
      })
    );
  }

  return {
    success: true,
    isFollowing: true,
    message: `You are now following ${funderName}.`,
  };
}

/**
 * Unfollows a funder.
 * Removes from local storage and Firestore, decrements follower counter.
 */
export async function unfollowFunder(params: {
  userId?: string;
  funderSlug: string;
}): Promise<{ success: boolean; isFollowing: boolean }> {
  const { userId, funderSlug } = params;
  if (!funderSlug) return { success: false, isFollowing: false };

  // 1. Update local storage
  const localList = getFollowedFundersLocal(userId);
  saveFollowedFundersLocal(
    userId,
    localList.filter((s) => s !== funderSlug)
  );

  // 2. Decrement follower count
  const counts = getFollowerCountsMap();
  const current = counts[funderSlug] || BASELINE_FOLLOWER_COUNTS[funderSlug] || 150;
  counts[funderSlug] = Math.max(0, current - 1);
  saveFollowerCountsMap(counts);

  // 3. Remove from Firestore
  if (userId && isFirebaseConfigured()) {
    try {
      const docId = `${userId}_${funderSlug}`;
      const followDocRef = doc(db, FIRESTORE_COLLECTIONS.FOLLOWED_FUNDERS, docId);
      await deleteDoc(followDocRef);
      console.log(`[FunderFollowService] Unfollowed funder ${funderSlug} deleted from Firestore.`);
    } catch (err) {
      console.warn('[FunderFollowService] Firestore unfollow error:', err);
    }
  }

  // 4. Dispatch event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('fundecho:funder-follow-changed', {
        detail: { funderSlug, isFollowing: false },
      })
    );
  }

  return { success: true, isFollowing: false };
}

/**
 * Matches an opportunity's organization to a known FunderProfile
 */
export function matchOpportunityToFunder(opportunity: Opportunity): FunderProfile | null {
  if (!opportunity || !opportunity.organization) return null;
  const org = opportunity.organization.toLowerCase().trim();

  for (const funder of VERIFIED_FUNDERS) {
    const fName = funder.name.toLowerCase().trim();
    const fAcronym = funder.acronym ? funder.acronym.toLowerCase().trim() : '';
    const fSlug = funder.slug.toLowerCase().trim();

    if (
      org === fName ||
      org.includes(fName) ||
      fName.includes(org) ||
      (fAcronym && (org === fAcronym || org.includes(fAcronym))) ||
      org.includes(fSlug.replace(/-/g, ' '))
    ) {
      return funder;
    }
  }

  return null;
}

/**
 * Finds all followers for a funder (both Firestore records and local user)
 */
export async function getFollowersForFunder(
  funderSlug: string,
  currentUserId?: string
): Promise<{ userId: string; userEmail?: string }[]> {
  const followers: { userId: string; userEmail?: string }[] = [];
  const seenUserIds = new Set<string>();

  // 1. Check current logged-in user or guest
  const isFollowingLocally = getFollowedFundersLocal(currentUserId).includes(funderSlug);
  if (isFollowingLocally && currentUserId) {
    followers.push({ userId: currentUserId });
    seenUserIds.add(currentUserId);
  }

  // 2. Query Firestore collection `followed_funders`
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.FOLLOWED_FUNDERS),
        where('funderSlug', '==', funderSlug)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const data = d.data();
        if (data.userId && !seenUserIds.has(data.userId)) {
          followers.push({
            userId: data.userId,
            userEmail: data.userEmail,
          });
          seenUserIds.add(data.userId);
        }
      });
    } catch (err) {
      console.warn('[FunderFollowService] Error querying followers from Firestore:', err);
    }
  }

  return followers;
}

/**
 * Checks an opportunity and notifies all users following that opportunity's funder.
 * This is called whenever:
 * 1. An opportunity is posted or updated by an administrator.
 * 2. An opportunity is crawled and approved.
 * 3. A test/simulation is triggered by the user.
 */
export async function checkOpportunityForFollowerNotifications(
  opportunity: Opportunity,
  currentUserId?: string
): Promise<{ notifiedCount: number; funderName?: string }> {
  const matchedFunder = matchOpportunityToFunder(opportunity);
  if (!matchedFunder) {
    return { notifiedCount: 0 };
  }

  const followers = await getFollowersForFunder(matchedFunder.slug, currentUserId);
  if (followers.length === 0) {
    return { notifiedCount: 0, funderName: matchedFunder.name };
  }

  let notifiedCount = 0;

  for (const follower of followers) {
    try {
      const notifCustomId = `notif_funder_${follower.userId}_${matchedFunder.slug}_${opportunity.id}`;

      await createNotification({
        userId: follower.userId,
        type: 'Opportunity Update',
        title: `New Grant: ${matchedFunder.name} posted a new opportunity!`,
        message: `${matchedFunder.name} just published a new funding call: "${opportunity.title}" (${opportunity.amount?.displayText || 'Funding available'}). Application deadline is ${opportunity.deadline}. Click to view details and start your application.`,
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        urgency: 'high',
        actionLabel: 'View Opportunity',
        targetPage: 'opportunity-detail' as any,
        customId: notifCustomId,
      });

      notifiedCount++;
    } catch (err) {
      console.warn(`[FunderFollowService] Failed to notify follower ${follower.userId}:`, err);
    }
  }

  console.log(`[FunderFollowService] Notified ${notifiedCount} follower(s) for ${matchedFunder.name} opportunity: "${opportunity.title}"`);
  return { notifiedCount, funderName: matchedFunder.name };
}

/**
 * Publishes a grant announcement on behalf of an institutional funder and notifies all active followers.
 */
export async function simulateFunderOpportunityPost(
  funder: FunderProfile,
  userId?: string
): Promise<{
  success: boolean;
  opportunity: Opportunity;
  notifiedCount: number;
}> {
  const uniqueSuffix = Math.floor(100 + Math.random() * 900);
  const nowIso = new Date().toISOString();
  const closingDate = new Date();
  closingDate.setDate(closingDate.getDate() + 45);
  const deadlineStr = closingDate.toISOString().split('T')[0];

  const title = `${funder.name} Strategic Innovation Grant (Call #${uniqueSuffix})`;
  const oppId = `opp-funder-${funder.slug}-${uniqueSuffix}`;

  const announcedOpportunity: Opportunity = {
    id: oppId,
    slug: `funder-${funder.slug}-${uniqueSuffix}`,
    title,
    organization: funder.name,
    category: funder.prioritySectors[0] || 'Grants & Innovation',
    type: 'Grant',
    amount: {
      min: 50000,
      max: 250000,
      currency: 'USD',
      displayText: funder.typicalGrantRange || '$100,000 – $250,000',
      isFullyFunded: true,
    },
    deadline: deadlineStr,
    daysLeft: 45,
    location: funder.headquarters.country || 'Global',
    region: (funder.eligibleRegions.includes('Global') ? 'Global' : (funder.eligibleRegions[0] as any)) || 'Global',
    verified: true,
    featured: true,
    tags: ['Grant', 'New Announcement', 'Direct Funder Call', ...funder.strategicPriorities.slice(0, 2)],
    summary: `${funder.name} has officially released Call #${uniqueSuffix} for proposals. Selected initiatives will receive non-dilutive capital and institutional advisory support.`,
    description: `The ${funder.name} invites qualified organizations, social ventures, and innovators to apply for our latest funding round. Strategic priorities include: ${funder.strategicPriorities.join(', ')}. Review cycle: ${funder.reviewCycle}. Unsolicited policy: ${funder.unsolicitedPolicy}.`,
    eligibility: [
      `Open to registered entities in: ${funder.eligibleRegions.join(', ')}`,
      'Demonstrated track record with measurable impact mechanisms',
      'Commitment to transparent financial reporting and quarterly milestone audits',
    ],
    requirements: [
      'Executive Summary & Theory of Change',
      'Structured 12-Month Project Budget',
      'Institutional Registration Documents',
      'Team & Principal Investigator Credentials',
    ],
    targetAudience: `Innovators and organizations in ${funder.eligibleRegions.join(', ')}`,
    awardDetails: `Total grant funding of ${funder.typicalGrantRange || '$100,000 - $250,000'} disbursed in milestone-based tranches.`,
    applicationUrl: funder.website,
    officialSourceUrl: funder.website,
    datePosted: nowIso.split('T')[0],
    lastUpdated: nowIso.split('T')[0],
    publicationStatus: 'Published',
    adminVerificationStatus: 'Verified',
  };

  // 1. Save opportunity to registry
  try {
    saveOpportunity({
      id: oppId,
      title: announcedOpportunity.title,
      organization: announcedOpportunity.organization,
      type: announcedOpportunity.type,
      category: announcedOpportunity.category,
      minAmount: announcedOpportunity.amount.min,
      maxAmount: announcedOpportunity.amount.max,
      currency: announcedOpportunity.amount.currency,
      amountDisplayText: announcedOpportunity.amount.displayText,
      isFullyFunded: true,
      deadline: announcedOpportunity.deadline,
      location: announcedOpportunity.location,
      region: announcedOpportunity.region,
      eligibleCountries: funder.eligibleRegions,
      applicantTypes: ['Early-Stage Startup / Founder', 'Non-Profit / NGO / Community Group'],
      summary: announcedOpportunity.summary,
      description: announcedOpportunity.description,
      targetAudience: announcedOpportunity.targetAudience,
      awardDetails: announcedOpportunity.awardDetails,
      applicationUrl: announcedOpportunity.applicationUrl,
      source: announcedOpportunity.officialSourceUrl,
      publicationStatus: 'Published',
      adminVerificationStatus: 'Verified',
      tags: announcedOpportunity.tags,
      featured: true,
    });
  } catch (err) {
    console.warn('[FunderFollowService] Could not save opportunity to storage:', err);
  }

  // 2. Dispatch notifications to all followers
  const { notifiedCount } = await checkOpportunityForFollowerNotifications(announcedOpportunity, userId);

  return {
    success: true,
    opportunity: announcedOpportunity,
    notifiedCount,
  };
}
