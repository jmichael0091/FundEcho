/**
 * FUNDORA - MIGRATION BRIDGE (STEP 17)
 * Provides bidirectional compatibility between existing Step 1-16 local/demo
 * storage architectures and the newly established Firebase/Firestore backend.
 *
 * CRITICAL DIRECTIVE:
 * Preserves all existing localStorage and demo functionality while providing
 * seamless migration bridges for the upcoming authentication and data phases.
 */

import { Opportunity, UserProfile } from '../../types';
import {
  FirestoreOpportunity,
  FirestoreUserProfile,
  FirestoreAffiliateOffer,
  FirestoreSubscriptionPlan,
  FIRESTORE_COLLECTIONS,
} from '../../types/firebase';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { SAMPLE_OPPORTUNITIES } from '../../data/sampleOpportunities';
import { DEMO_AFFILIATE_OFFERS } from '../../data/affiliateData';

/**
 * Maps a legacy frontend Opportunity object into a standardized FirestoreOpportunity model.
 */
export function mapLocalOpportunityToFirestore(opp: Opportunity): FirestoreOpportunity {
  const amountVal = typeof opp.amount === 'object' 
    ? (opp.amount.max || opp.amount.displayText || '0')
    : opp.amount;
  const currencyVal = typeof opp.amount === 'object' ? (opp.amount.currency || 'USD') : 'USD';

  return {
    id: opp.id,
    title: opp.title,
    providerName: opp.organization,
    description: opp.description || opp.summary || '',
    fundingType: opp.type,
    category: opp.category,
    amount: amountVal,
    currency: currencyVal,
    deadline: opp.deadline || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    country: opp.location || 'Global',
    eligibleCountries: opp.eligibilityCriteria?.eligibleCountries || opp.eligibility || ['Global'],
    regions: (opp.eligibilityCriteria?.eligibleRegions as string[]) || [opp.region || 'Global'],
    eligibilitySummary: opp.summary || opp.description?.slice(0, 200) || 'Open to eligible candidates.',
    requirements: opp.requirements || [],
    applicationUrl: opp.applicationUrl || `https://fundora.org/apply/${opp.id}`,
    sourceUrl: opp.officialSourceUrl || opp.source || `https://fundora.org/source/${opp.id}`,
    sourceName: opp.organization,
    status: 'published',
    verificationStatus: opp.verified ? 'verified' : 'unverified',
    publishedAt: opp.datePosted || new Date().toISOString(),
    createdAt: opp.datePosted || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Maps a FirestoreOpportunity document into the frontend Opportunity interface.
 */
export function mapFirestoreToLocalOpportunity(fOpp: FirestoreOpportunity): Opportunity {
  const numericAmount = typeof fOpp.amount === 'number' 
    ? fOpp.amount 
    : parseInt(String(fOpp.amount).replace(/[^0-9]/g, ''), 10) || 0;

  return {
    id: fOpp.id,
    title: fOpp.title,
    slug: fOpp.id,
    organization: fOpp.providerName,
    type: (fOpp.fundingType as any) || 'Grant',
    category: fOpp.category,
    amount: {
      max: numericAmount,
      currency: fOpp.currency || 'USD',
      displayText: typeof fOpp.amount === 'number' ? `$${fOpp.amount.toLocaleString()}` : String(fOpp.amount),
    },
    deadline: fOpp.deadline,
    daysLeft: Math.max(0, Math.ceil((new Date(fOpp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
    location: fOpp.country || 'Global',
    region: (fOpp.regions?.[0] as any) || 'Global',
    verified: fOpp.verificationStatus === 'verified',
    featured: false,
    status: 'Open',
    tags: [fOpp.category, fOpp.fundingType],
    summary: fOpp.eligibilitySummary || fOpp.description.slice(0, 180),
    description: fOpp.description,
    eligibility: fOpp.eligibleCountries?.length ? fOpp.eligibleCountries : ['Eligible candidates'],
    requirements: fOpp.requirements || [],
    targetAudience: 'Eligible Applicants & Organizations',
    awardDetails: typeof fOpp.amount === 'number' ? `$${fOpp.amount.toLocaleString()} funding award` : String(fOpp.amount),
    applicationUrl: fOpp.applicationUrl,
    officialSourceUrl: fOpp.sourceUrl,
    datePosted: typeof fOpp.createdAt === 'string' ? fOpp.createdAt : new Date().toISOString(),
  };
}

/**
 * Maps a local UserProfile to FirestoreUserProfile.
 */
export function mapLocalProfileToFirestore(
  localProfile: UserProfile
): Partial<FirestoreUserProfile> {
  return {
    userId: localProfile.id,
    country: localProfile.country || '',
    region: 'Global',
    interests: localProfile.interests || [],
    fundingTypes: (localProfile.preferredFundingTypes as string[]) || [],
    userType: localProfile.applicantType || 'Individual',
    businessStage: 'Early Stage',
    industry: 'General',
    organizationName: '',
  };
}

/**
 * Safe utility to seed baseline sample opportunities, subscription plans, and affiliate
 * offers into Firestore when Firebase is connected, without overwriting custom data.
 */
export async function seedBaselineCatalogToFirestore(): Promise<{
  opportunitiesSeeded: number;
  affiliatesSeeded: number;
  plansSeeded: number;
}> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please set the required environment variables first.');
  }

  const batch = writeBatch(db);
  let oppCount = 0;
  let affiliateCount = 0;
  let planCount = 0;

  // 1. Seed Sample Opportunities
  SAMPLE_OPPORTUNITIES.slice(0, 15).forEach((opp) => {
    const fOpp = mapLocalOpportunityToFirestore(opp);
    const ref = doc(db, FIRESTORE_COLLECTIONS.OPPORTUNITIES, fOpp.id);
    batch.set(ref, {
      ...fOpp,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    oppCount++;
  });

  // 2. Seed Baseline Subscription Plans
  const plans: FirestoreSubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Explorer (Free)',
      description: 'Standard discovery and community funding tracking.',
      monthlyPrice: 0,
      annualPrice: 0,
      currency: 'USD',
      includedCredits: 50,
      features: ['Search published opportunities', 'Save up to 10 opportunities', 'Basic eligibility assessment'],
      usageLimits: { applicationsPerMonth: 3, savedLimit: 10 },
      status: 'active',
      recommended: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'Comprehensive grant pipeline, AI proposals, and deadline tracking.',
      monthlyPrice: 29,
      annualPrice: 290,
      currency: 'USD',
      includedCredits: 500,
      features: ['Unlimited saved opportunities', 'Full AI proposal co-pilot', 'Priority verification alerts', 'Direct calendar sync'],
      usageLimits: { applicationsPerMonth: 50, savedLimit: 500 },
      status: 'active',
      recommended: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      id: 'institutional',
      name: 'Enterprise / Institution',
      description: 'Multi-seat research teams and institutional grant tracking.',
      monthlyPrice: 99,
      annualPrice: 990,
      currency: 'USD',
      includedCredits: 2500,
      features: ['Multi-seat collaboration', 'Exportable compliance audits', 'Custom verification logs', 'Dedicated support'],
      usageLimits: { applicationsPerMonth: 9999, savedLimit: 9999 },
      status: 'active',
      recommended: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  plans.forEach((plan) => {
    const planRef = doc(db, FIRESTORE_COLLECTIONS.SUBSCRIPTION_PLANS, plan.id);
    batch.set(planRef, plan, { merge: true });
    planCount++;
  });

  // 3. Seed Sample Affiliate Partners
  DEMO_AFFILIATE_OFFERS.slice(0, 10).forEach((aff) => {
    const offerRecord: FirestoreAffiliateOffer = {
      id: aff.id,
      partnerName: aff.partnerName,
      title: aff.title,
      description: aff.description,
      category: aff.category,
      offerType: aff.offerType,
      logo: typeof aff.logo === 'string' ? aff.logo : 'Tag',
      affiliateUrl: aff.affiliateUrl,
      disclosure: aff.disclosure,
      countries: aff.countries || ['Global'],
      regions: (aff.regions as string[]) || ['Global'],
      userTypes: aff.userTypes || [],
      interests: aff.interests || [],
      fundingTypes: (aff.fundingTypes as string[]) || [],
      opportunityCategories: aff.opportunityCategories || [],
      businessStages: aff.businessStages || [],
      industries: aff.industries || [],
      intentSignals: aff.intentSignals || [],
      premiumEligibility: aff.premiumEligibility !== 'free_only',
      minimumMatchScore: aff.minimumMatchScore ?? 50,
      priority: aff.priority ?? 5,
      startDate: aff.startDate || '2025-01-01',
      endDate: aff.endDate || '2028-12-31',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const affRef = doc(db, FIRESTORE_COLLECTIONS.AFFILIATE_OFFERS, offerRecord.id);
    batch.set(affRef, offerRecord, { merge: true });
    affiliateCount++;
  });

  await batch.commit();

  return {
    opportunitiesSeeded: oppCount,
    affiliatesSeeded: affiliateCount,
    plansSeeded: planCount,
  };
}
