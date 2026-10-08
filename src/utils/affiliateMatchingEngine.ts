import { 
  AffiliateOffer, 
  AffiliateUserContext, 
  AffiliateMatchResult 
} from '../types/affiliate';

/**
 * Deterministic, explainable affiliate recommendation matching engine.
 * Evaluates a single affiliate offer against user and opportunity context.
 */
export function evaluateAffiliateMatch(
  offer: AffiliateOffer,
  context: AffiliateUserContext,
  options: { ignoreStatus?: boolean; ignoreDates?: boolean } = {}
): AffiliateMatchResult {
  const reasons: string[] = [];
  const disqualificationReasons: string[] = [];

  // 1. STATUS CHECK
  if (!options.ignoreStatus && offer.status !== 'Active') {
    disqualificationReasons.push(`Offer is currently ${offer.status.toLowerCase()}`);
  }

  // 2. CAMPAIGN DATES CHECK
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (!options.ignoreDates) {
    if (offer.startDate && todayStr < offer.startDate) {
      disqualificationReasons.push(`Campaign scheduled to start on ${offer.startDate}`);
    }
    if (offer.endDate && todayStr > offer.endDate) {
      disqualificationReasons.push(`Campaign expired on ${offer.endDate}`);
    }
  }

  // 3. PREMIUM ELIGIBILITY CHECK
  if (offer.premiumEligibility === 'premium_only' && !context.isPremium) {
    disqualificationReasons.push('Exclusively available for FundEcho Premium members');
  } else if (offer.premiumEligibility === 'free_only' && context.isPremium) {
    disqualificationReasons.push('Reserved for Free tier accounts');
  }

  // 4. GEOGRAPHIC CHECK (Countries & Regions)
  const userCountry = (context.country || context.currentOpportunity?.location || '').toLowerCase();
  if (offer.countries && offer.countries.length > 0) {
    const matchesCountry = offer.countries.some(
      (c) => c.toLowerCase() === userCountry || userCountry.includes(c.toLowerCase())
    );
    if (!matchesCountry && userCountry) {
      disqualificationReasons.push(`Geotargeted to ${offer.countries.join(', ')}`);
    } else if (matchesCountry) {
      reasons.push(`Available in your country (${context.country || 'Current Region'})`);
    }
  }

  const userRegion = (context.region || context.currentOpportunity?.region || '').toLowerCase();
  if (offer.regions && offer.regions.length > 0) {
    const matchesRegion = offer.regions.some(
      (r) => r.toLowerCase() === userRegion || userRegion.includes(r.toLowerCase())
    );
    if (!matchesRegion && userRegion) {
      disqualificationReasons.push(`Geotargeted to ${offer.regions.join(', ')}`);
    }
  }

  // SCORING ACCUMULATION (0 to 100)
  let rawScore = 0;

  // Signal A: Opportunity Category & User Interests (Up to 30 pts)
  const oppCategory = (context.opportunityCategory || context.currentOpportunity?.category || '').toLowerCase();
  const userInterests = (context.interests || []).map((i) => i.toLowerCase());

  let categoryScore = 0;
  if (oppCategory && offer.opportunityCategories && offer.opportunityCategories.length > 0) {
    const oppCatMatch = offer.opportunityCategories.some((cat) => {
      const lower = cat.toLowerCase();
      return oppCategory.includes(lower) || lower.includes(oppCategory);
    });
    if (oppCatMatch) {
      categoryScore += 22;
      reasons.push(`Directly complements ${context.currentOpportunity?.category || oppCategory} funding`);
    }
  }

  if (userInterests.length > 0 && offer.interests && offer.interests.length > 0) {
    const matchedInterests = offer.interests.filter((oi) => 
      userInterests.some((ui) => ui.includes(oi.toLowerCase()) || oi.toLowerCase().includes(ui))
    );
    if (matchedInterests.length > 0) {
      categoryScore += 12;
      reasons.push(`Recommended because you are interested in ${matchedInterests[0]}`);
    }
  }
  rawScore += Math.min(30, categoryScore);

  // Signal B: Funding Type Alignment (Up to 25 pts)
  const oppType = (context.fundingType || context.currentOpportunity?.type || '').toLowerCase();
  const userFundingPrefs = (context.fundingPreferences || []).map((p) => p.toLowerCase());

  let fundingTypeScore = 0;
  if (oppType && offer.fundingTypes && offer.fundingTypes.length > 0) {
    const matchesOppType = offer.fundingTypes.some((ft) => ft.toLowerCase() === oppType || oppType.includes(ft.toLowerCase()));
    if (matchesOppType) {
      fundingTypeScore += 20;
      reasons.push(`Tailored for ${context.currentOpportunity?.type || oppType} applicants`);
    }
  }

  if (userFundingPrefs.length > 0 && offer.fundingTypes && offer.fundingTypes.length > 0) {
    const matchesPref = offer.fundingTypes.some((ft) => userFundingPrefs.some((uf) => uf.includes(ft.toLowerCase())));
    if (matchesPref && fundingTypeScore === 0) {
      fundingTypeScore += 15;
      reasons.push(`Relevant to your preferred funding paths (${offer.fundingTypes[0]})`);
    }
  }
  rawScore += Math.min(25, fundingTypeScore);

  // Signal C: User Type & Business Stage (Up to 25 pts)
  const userType = (context.userType || '').toLowerCase();
  const oppAudience = (context.currentOpportunity?.targetAudience || '').toLowerCase();
  let userTypeScore = 0;

  if (userType && offer.userTypes && offer.userTypes.length > 0) {
    const matchesUserType = offer.userTypes.some((ut) => ut.toLowerCase().includes(userType) || userType.includes(ut.toLowerCase()));
    if (matchesUserType) {
      userTypeScore += 15;
      reasons.push(`Tailored for your profile as a ${context.userType}`);
    }
  } else if (oppAudience && offer.userTypes && offer.userTypes.length > 0) {
    const matchesAudience = offer.userTypes.some((ut) => oppAudience.includes(ut.toLowerCase()));
    if (matchesAudience) {
      userTypeScore += 12;
      reasons.push(`Matches target applicant profile (${offer.userTypes[0]})`);
    }
  }

  const businessStage = (context.businessStage || '').toLowerCase();
  if (businessStage && offer.businessStages && offer.businessStages.length > 0) {
    const matchesStage = offer.businessStages.some((st) => st.toLowerCase().includes(businessStage) || businessStage.includes(st.toLowerCase()));
    if (matchesStage) {
      userTypeScore += 10;
      reasons.push(`Matches your organizational stage (${context.businessStage})`);
    }
  } else if (offer.businessStages && offer.businessStages.length > 0) {
    // Default baseline applicability for general stages
    userTypeScore += 5;
  }
  rawScore += Math.min(25, userTypeScore);

  // Signal D: Context Intent & Category-Specific Heuristics (Up to 15 pts)
  let intentScore = 0;
  const searchIntent = (context.currentSearchIntent || '').toLowerCase();
  const oppTitleAndDesc = `${context.currentOpportunity?.title || ''} ${context.currentOpportunity?.description || ''}`.toLowerCase();

  // Startup grant -> accounting, business mgmt, proposal tools
  const isStartupGrant = oppType.includes('grant') || oppType.includes('business') || oppCategory.includes('tech') || oppCategory.includes('startup');
  if (isStartupGrant && (offer.category.includes('Accounting') || offer.category.includes('Proposal') || offer.category.includes('Website'))) {
    intentScore += 12;
    reasons.push('Useful for managing finances & documentation for your funding application');
  }

  // Scholarship -> education & learning
  const isScholarship = oppType.includes('scholarship') || oppType.includes('fellowship') || oppCategory.includes('education');
  if (isScholarship && offer.category.includes('Education')) {
    intentScore += 15;
    reasons.push('Recommended for competitive scholarship essay & interview preparation');
  }

  // NGO / Non-profit -> nonprofit management & CRM
  const isNgo = oppType.includes('ngo') || oppType.includes('non-profit') || oppAudience.includes('nonprofit') || oppTitleAndDesc.includes('charity');
  if (isNgo && offer.category.includes('Nonprofit')) {
    intentScore += 15;
    reasons.push('Specialized for nonprofit compliance, donor tracking, and impact metrics');
  }

  if (searchIntent && offer.intentSignals && offer.intentSignals.length > 0) {
    const matchesIntent = offer.intentSignals.some((sig) => searchIntent.includes(sig) || sig.includes(searchIntent));
    if (matchesIntent) {
      intentScore += 8;
    }
  }
  rawScore += Math.min(15, intentScore);

  // Signal E: Admin Priority Weighting (Up to 5 pts)
  const priorityScore = Math.min(5, Math.round(((offer.priority || 50) / 100) * 5));
  rawScore += priorityScore;

  // Baseline calibration: ensure minimum floor for broadly relevant tools
  if (rawScore > 0 && rawScore < 40 && reasons.length > 0) {
    rawScore += 10;
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Minimum Match Score check
  const requiredMin = offer.minimumMatchScore || 40;
  if (finalScore < requiredMin) {
    disqualificationReasons.push(`Score (${finalScore}%) is below minimum required threshold (${requiredMin}%)`);
  }

  const isQualified = disqualificationReasons.length === 0 && finalScore >= requiredMin;

  // Clean deduplicated reasons
  const uniqueReasons = Array.from(new Set(reasons));
  if (uniqueReasons.length === 0 && isQualified) {
    uniqueReasons.push('General suitability based on your current exploration context');
  }

  return {
    offer,
    score: finalScore,
    isQualified,
    reasons: uniqueReasons,
    disqualificationReasons: disqualificationReasons.length > 0 ? disqualificationReasons : undefined
  };
}

/**
 * Evaluates all affiliate offers against context and returns qualified, ranked offers.
 */
export function getPersonalizedAffiliateRecommendations(
  offers: AffiliateOffer[],
  context: AffiliateUserContext,
  maxResults: number = 6
): AffiliateMatchResult[] {
  const evaluated = offers
    .map((offer) => evaluateAffiliateMatch(offer, context))
    .filter((res) => res.isQualified);

  // Rank by:
  // 1. Match score (descending)
  // 2. Admin priority (descending)
  // 3. Number of matched contextual reasons (descending)
  evaluated.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.offer.priority !== a.offer.priority) return b.offer.priority - a.offer.priority;
    return b.reasons.length - a.reasons.length;
  });

  return evaluated.slice(0, maxResults);
}
