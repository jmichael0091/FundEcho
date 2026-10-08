import fs from 'fs';
let code = fs.readFileSync('src/utils/searchEngine.ts', 'utf8');

const regex = /export function executeDiscoverySearch\([\s\S]*?return \{ results: sorted, totalCount: sorted.length \};\n\}/;

const replacement = `export function executeDiscoverySearch(
  opportunities: Opportunity[],
  categories: Category[],
  filters: FilterState,
  bookmarkedIds: Set<string>,
  userProfile?: Partial<UserProfile> | null
): { results: (Opportunity & { matchResult?: any })[]; totalCount: number } {
  const { tokens, expandedTerms } = tokenizeQuery(filters.searchQuery);

  // Apply matching engine
  const scoredOpportunities = opportunities.map(opp => {
    const matchResult = userProfile ? calculateOpportunityMatch(userProfile, opp) : null;
    return { ...opp, matchResult };
  });

  const matched = scoredOpportunities.filter((opp) => {
    // 1. Search Query Match
    if (filters.searchQuery.trim()) {
      const score = calculateRelevanceScore(opp, filters.searchQuery, tokens, expandedTerms);
      if (score <= 0) return false;
    }

    // 2. Funding Type Filter
    if (filters.selectedType !== 'all') {
      if (filters.selectedType === 'Grant') {
        if (opp.type !== 'Grant' && opp.type !== 'Research Grant') return false;
      } else if (opp.type !== filters.selectedType) {
        return false;
      }
    }

    // 3. Region Filter
    if (filters.selectedRegion !== 'all' && opp.region !== filters.selectedRegion) {
      return false;
    }

    // 4. Category Filter
    if (filters.selectedCategory !== 'all') {
      const cat = categories.find((c) => c && c.slug === filters.selectedCategory);
      if (cat && cat.name) {
        const catKeyword = cat.name.toLowerCase().split(' ')[0];
        const oppCatLower = (opp.category || '').toLowerCase();
        if (!oppCatLower.includes(catKeyword) && opp.category !== cat.name) {
          return false;
        }
      }
    }

    // 5. Deadline Filter
    if (filters.selectedDeadline !== 'all') {
      const maxDays = parseInt(filters.selectedDeadline, 10);
      if (!isNaN(maxDays) && opp.daysLeft > maxDays) {
        return false;
      }
    }

    // 6. Amount Tier Filter
    if (!matchesAmountTier(opp, filters.selectedAmountTier)) {
      return false;
    }

    // 7. Verified Only
    if (filters.verifiedOnly && !opp.verified) {
      return false;
    }

    // 8. Saved Only
    if (filters.savedOnly && !bookmarkedIds.has(opp.id)) {
      return false;
    }
    
    // 9. Eligibility Filter
    if (filters.eligibilityStatus && filters.eligibilityStatus !== 'all' && opp.matchResult) {
      if (opp.matchResult.eligibilityStatus !== filters.eligibilityStatus) {
         return false;
      }
    }

    return true;
  });

  // Sort matched opportunities
  const sorted = [...matched].sort((a, b) => {
    // If we have a search query, prioritize relevance, then match score
    if (filters.sortBy === 'relevance') {
      if (filters.searchQuery.trim()) {
        const scoreA = calculateRelevanceScore(a, filters.searchQuery, tokens, expandedTerms);
        const scoreB = calculateRelevanceScore(b, filters.searchQuery, tokens, expandedTerms);
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      // Prioritize match score if user is logged in
      if (a.matchResult && b.matchResult && a.matchResult.matchScore !== b.matchResult.matchScore) {
         return b.matchResult.matchScore - a.matchResult.matchScore;
      }
      return a.daysLeft - b.daysLeft;
    }

    if (filters.sortBy === 'ending-soon') {
      return a.daysLeft - b.daysLeft;
    }

    if (filters.sortBy === 'ending-latest') {
      return b.daysLeft - a.daysLeft;
    }

    if (filters.sortBy === 'amount-high') {
      return b.amount.max - a.amount.max;
    }

    if (filters.sortBy === 'amount-low') {
      return a.amount.max - b.amount.max;
    }

    if (filters.sortBy === 'recent') {
      return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
    }

    return 0;
  });

  return { results: sorted, totalCount: sorted.length };
}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/utils/searchEngine.ts', code);
