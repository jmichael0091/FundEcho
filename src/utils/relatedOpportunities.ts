import { Opportunity } from '../types';

/**
 * Returns related opportunities scored by:
 * 1. Category match (+3 points)
 * 2. Type match (+2 points)
 * 3. Region match (+2 points)
 * 4. Shared tags (+1 point per tag)
 */
export function getRelatedOpportunities(
  currentOpportunity: Opportunity,
  allOpportunities: Opportunity[],
  limit = 3
): Opportunity[] {
  return allOpportunities
    .filter((opp) => opp.id !== currentOpportunity.id)
    .map((opp) => {
      let score = 0;
      if (opp.category === currentOpportunity.category) score += 3;
      if (opp.type === currentOpportunity.type) score += 2;
      if (opp.region === currentOpportunity.region || opp.region === 'Global' || currentOpportunity.region === 'Global') score += 2;
      
      const currentTags = new Set(currentOpportunity.tags.map((t) => t.toLowerCase()));
      opp.tags.forEach((tag) => {
        if (currentTags.has(tag.toLowerCase())) score += 1;
      });

      return { opportunity: opp, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.opportunity);
}
