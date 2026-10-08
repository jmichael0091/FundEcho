import { Opportunity, UserProfile } from '../types';
import { calculateOpportunityMatch, MatchResult } from './matching';

export interface DiscoverySections {
  recommended: Array<{ opportunity: Opportunity; match: MatchResult }>;
  featured: Opportunity[];
  newOpportunities: Opportunity[];
  closingSoon: Opportunity[];
  verified: Opportunity[];
}

export function generateDiscoverySections(
  userProfile: Partial<UserProfile> | null | undefined,
  allOpportunities: Opportunity[]
): DiscoverySections {
  // 1. Filter out expired
  const activeOpportunities = allOpportunities.filter(
    opp => opp.status !== 'Closed' && opp.daysLeft >= 0
  );

  const usedIds = new Set<string>();

  // Helper to deduplicate
  const popUnique = (source: Opportunity[], limit: number): Opportunity[] => {
    const result: Opportunity[] = [];
    for (const opp of source) {
      if (!usedIds.has(opp.id)) {
        result.push(opp);
        usedIds.add(opp.id);
        if (result.length >= limit) break;
      }
    }
    return result;
  };

  // 1. Featured (Prioritize these first so they show up at the top)
  let featuredSource = activeOpportunities.filter(opp => opp.featured);
  
  if (userProfile && (userProfile.interests?.length || userProfile.country || userProfile.industry)) {
      featuredSource.sort((a, b) => {
          const scoreA = calculateOpportunityMatch(userProfile, a).matchScore;
          const scoreB = calculateOpportunityMatch(userProfile, b).matchScore;
          return scoreB - scoreA;
      });
  }
  const featured = popUnique(featuredSource, 6);

  // 2. Recommended (Only for logged in users with sufficient profile)
  let recommended: Array<{ opportunity: Opportunity; match: MatchResult }> = [];
  if (userProfile && (userProfile.interests?.length || userProfile.country || userProfile.industry || userProfile.educationLevel)) {
    const scored = activeOpportunities
      .filter(opp => !usedIds.has(opp.id))
      .map(opp => ({
        opportunity: opp,
        match: calculateOpportunityMatch(userProfile, opp)
      }));
    
    // Sort logic
    const sorted = scored
      .filter(item => item.match.matchScore >= 40 && item.match.eligibilityStatus !== 'Not Eligible')
      .sort((a, b) => {
        const rankMap: Record<string, number> = { 'Eligible': 3, 'Likely Eligible': 2, 'Needs Verification': 1, 'Not Eligible': 0 };
        const aRank = rankMap[a.match.eligibilityStatus] || 0;
        const bRank = rankMap[b.match.eligibilityStatus] || 0;
        
        if (aRank !== bRank) return bRank - aRank;
        if (b.match.matchScore !== a.match.matchScore) return b.match.matchScore - a.match.matchScore;
        return a.opportunity.daysLeft - b.opportunity.daysLeft;
      });
    
    // Pick top 6
    for (const item of sorted) {
      if (recommended.length >= 6) break;
      recommended.push(item);
      usedIds.add(item.opportunity.id);
    }
  }

  // 3. Closing Soon
  const closingSoonSource = [...activeOpportunities]
    .filter(opp => opp.daysLeft > 0 && opp.daysLeft <= 21) // Within 3 weeks
    .sort((a, b) => a.daysLeft - b.daysLeft);
  
  const closingSoon = popUnique(closingSoonSource, 6);

  // 4. New Opportunities
  const newOpportunitiesSource = [...activeOpportunities].sort((a, b) => {
    const dateA = a.datePosted ? new Date(a.datePosted).getTime() : 0;
    const dateB = b.datePosted ? new Date(b.datePosted).getTime() : 0;
    // fallback to createdAt or id if datePosted is equal
    if (dateA !== dateB) return dateB - dateA;
    return b.id.localeCompare(a.id);
  });
  
  const newOpportunities = popUnique(newOpportunitiesSource, 6);

  // 5. Verified
  const verifiedSource = [...activeOpportunities].filter(opp => opp.verified);
  const verified = popUnique(verifiedSource, 6);

  return {
    recommended,
    featured,
    newOpportunities,
    closingSoon,
    verified
  };
}
