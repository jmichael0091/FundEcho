import { Opportunity, Category, OpportunityType, OpportunityRegion, UserProfile } from '../types';
import { calculateOpportunityMatch } from './matching';

export type AmountFilterTier = 
  | 'all'
  | 'under-25k'
  | '25k-100k'
  | '100k-500k'
  | '500k-plus'
  | 'fully-funded';

export interface FilterState {
  eligibilityStatus?: string;
  searchQuery: string;
  selectedType: string;
  selectedRegion: string;
  selectedCategory: string;
  selectedDeadline: string;
  selectedAmountTier: AmountFilterTier;
  verifiedOnly: boolean;
  savedOnly: boolean;
  sortBy: 'relevance' | 'ending-soon' | 'ending-latest' | 'amount-high' | 'amount-low' | 'recent';
}

export interface SearchSuggestionItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'opportunity' | 'category' | 'popular' | 'location' | 'provider';
  queryToApply: string;
  filterChange?: Partial<FilterState>;
}

// Common stopwords to exclude from strict token scoring
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
  'the', 'to', 'was', 'were', 'will', 'with', 'into', 'about', 'over', 'across'
]);

// Semantic keyword expansion map for natural phrases
const SYNONYM_MAP: Record<string, string[]> = {
  african: ['africa', 'african', 'sub-saharan', 'continental'],
  africa: ['africa', 'african', 'nigeria', 'kenya', 'ghana', 'south africa', 'rwanda'],
  entrepreneur: ['entrepreneurs', 'entrepreneurship', 'business', 'startup', 'founders', 'sme', 'enterprise'],
  entrepreneurs: ['entrepreneur', 'entrepreneurship', 'business', 'startup', 'founders', 'sme', 'enterprise'],
  startup: ['startups', 'entrepreneur', 'founders', 'business', 'tech'],
  startups: ['startup', 'entrepreneur', 'founders', 'business', 'tech'],
  business: ['startup', 'startups', 'sme', 'commercial', 'enterprise', 'funding', 'seed'],
  grant: ['grants', 'funding', 'capital', 'award', 'non-dilutive'],
  grants: ['grant', 'funding', 'capital', 'award', 'non-dilutive'],
  scholarship: ['scholarships', 'tuition', 'study', 'masters', 'phd', 'postgraduate', 'undergraduate', 'student'],
  scholarships: ['scholarship', 'tuition', 'study', 'masters', 'phd', 'postgraduate', 'undergraduate', 'student'],
  fellowship: ['fellowships', 'residency', 'stipend', 'postdoctoral', 'fellow'],
  fellowships: ['fellowship', 'residency', 'stipend', 'postdoctoral', 'fellow'],
  competition: ['competitions', 'prize', 'prizes', 'challenge', 'contest', 'award'],
  competitions: ['competition', 'prize', 'prizes', 'challenge', 'contest', 'award'],
  ngo: ['non-profit', 'nonprofit', 'civil society', 'grassroots', 'human rights', 'charity'],
  nonprofit: ['ngo', 'non-profit', 'civil society', 'grassroots', 'charity'],
  women: ['female', 'gender', 'girls', 'feminist', 'women-led'],
  climate: ['environment', 'sustainability', 'biodiversity', 'conservation', 'clean energy', 'green'],
  health: ['healthcare', 'medical', 'biomedical', 'clinical', 'public health', 'diagnostic'],
  tech: ['technology', 'software', 'ai', 'hardware', 'digital', 'engineering'],
  europe: ['european', 'uk', 'germany', 'france', 'eu', 'oxford'],
  asia: ['asian', 'japan', 'indo-pacific', 'tokyo', 'singapore'],
  latin: ['latam', 'south america', 'central america', 'amazonian', 'mesoamerican'],
  funded: ['fully funded', 'stipend', 'tuition', 'allowance'],
};

/**
 * Tokenize and normalize query strings into core terms and expanded synonyms
 */
export function tokenizeQuery(rawQuery: string): { tokens: string[]; expandedTerms: string[] } {
  if (!rawQuery) return { tokens: [], expandedTerms: [] };

  const cleaned = rawQuery.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const rawTokens = cleaned.split(/\s+/).filter((t) => t.length > 1);
  const meaningfulTokens = rawTokens.filter((t) => !STOP_WORDS.has(t));

  const expanded = new Set<string>();
  meaningfulTokens.forEach((token) => {
    expanded.add(token);
    if (SYNONYM_MAP[token]) {
      SYNONYM_MAP[token].forEach((syn) => expanded.add(syn));
    }
  });

  return {
    tokens: meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens,
    expandedTerms: Array.from(expanded),
  };
}

/**
 * Calculate multi-attribute relevance score for an opportunity
 */
export function calculateRelevanceScore(
  opp: Opportunity,
  rawQuery: string,
  tokens: string[],
  expandedTerms: string[]
): number {
  if (!rawQuery.trim() || tokens.length === 0) return 1;

  let score = 0;
  const qLower = rawQuery.toLowerCase().trim();

  const titleLower = opp.title.toLowerCase();
  const orgLower = opp.organization.toLowerCase();
  const summaryLower = opp.summary.toLowerCase();
  const descLower = opp.description.toLowerCase();
  const locLower = opp.location.toLowerCase();
  const regLower = opp.region.toLowerCase();
  const catLower = opp.category.toLowerCase();
  const typeLower = opp.type.toLowerCase();
  const tagsLower = opp.tags.map((t) => t.toLowerCase());
  const targetLower = opp.targetAudience.toLowerCase();
  const eligLower = opp.eligibility.join(' ').toLowerCase();

  // 1. Exact full-phrase match bonus
  if (titleLower.includes(qLower)) score += 60;
  if (orgLower.includes(qLower)) score += 40;
  if (summaryLower.includes(qLower)) score += 25;
  if (descLower.includes(qLower)) score += 15;

  // 2. Token matches across distinct fields with weights
  tokens.forEach((token) => {
    if (titleLower.includes(token)) score += 20;
    if (orgLower.includes(token)) score += 15;
    if (tagsLower.some((t) => t.includes(token))) score += 12;
    if (catLower.includes(token) || typeLower.includes(token)) score += 12;
    if (locLower.includes(token) || regLower.includes(token)) score += 10;
    if (targetLower.includes(token)) score += 8;
    if (summaryLower.includes(token)) score += 6;
    if (eligLower.includes(token)) score += 5;
    if (descLower.includes(token)) score += 4;
  });

  // 3. Synonym / Expanded semantic matches
  expandedTerms.forEach((term) => {
    if (!tokens.includes(term)) {
      if (titleLower.includes(term)) score += 8;
      if (tagsLower.some((t) => t.includes(term))) score += 6;
      if (locLower.includes(term) || regLower.includes(term)) score += 6;
      if (catLower.includes(term) || typeLower.includes(term)) score += 6;
      if (summaryLower.includes(term) || targetLower.includes(term)) score += 4;
    }
  });

  return score;
}

/**
 * Filter opportunities by funding amount tier
 */
export function matchesAmountTier(opp: Opportunity, tier: AmountFilterTier): boolean {
  if (tier === 'all') return true;

  if (tier === 'fully-funded') {
    return (
      opp.amount.isFullyFunded === true ||
      opp.amount.displayText.toLowerCase().includes('full') ||
      opp.tags.some((t) => t.toLowerCase().includes('fully funded'))
    );
  }

  const maxVal = opp.amount.max;
  switch (tier) {
    case 'under-25k':
      return maxVal <= 25000;
    case '25k-100k':
      return maxVal > 25000 && maxVal <= 100000;
    case '100k-500k':
      return maxVal > 100000 && maxVal <= 500000;
    case '500k-plus':
      return maxVal > 500000;
    default:
      return true;
  }
}

/**
 * Main query & filter execution engine
 */
export function executeDiscoverySearch(
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
}

/**
 * Curated and dynamic search autocomplete suggestions
 */
export const POPULAR_SEARCH_PROMPTS = [
  'Business grants for African entrepreneurs',
  'Fully funded master\'s scholarships in Europe',
  'Women-led grassroots and NGO grants',
  'Climate resilience & biodiversity funds',
  'AI and social impact tech accelerators',
  'Research grants in biotechnology & healthcare',
];

export function getSearchSuggestions(
  query: string,
  opportunities: Opportunity[],
  categories: Category[],
  maxResults: number = 6
): SearchSuggestionItem[] {
  const q = query.trim().toLowerCase();

  // If query is empty, return popular prompt presets
  if (!q) {
    return POPULAR_SEARCH_PROMPTS.map((prompt, idx) => ({
      id: `popular-${idx}`,
      title: prompt,
      subtitle: 'Popular Search',
      type: 'popular',
      queryToApply: prompt,
    }));
  }

  const suggestions: SearchSuggestionItem[] = [];
  const seenTitles = new Set<string>();

  // 1. Matching Categories
  categories.forEach((cat) => {
    if (!cat) return;
    const catName = cat.name || '';
    const catSlug = cat.slug || '';
    if (catName.toLowerCase().includes(q) || catSlug.includes(q)) {
      suggestions.push({
        id: `cat-${cat.id || catSlug}`,
        title: catName,
        subtitle: 'Explore Domain Category',
        type: 'category',
        queryToApply: '',
        filterChange: { selectedCategory: catSlug },
      });
    }
  });

  // 2. Matching Opportunities by title or org
  opportunities.forEach((opp) => {
    if (suggestions.length >= maxResults) return;

    if (opp.title.toLowerCase().includes(q) && !seenTitles.has(opp.title)) {
      seenTitles.add(opp.title);
      suggestions.push({
        id: `opp-title-${opp.id}`,
        title: opp.title,
        subtitle: `${opp.organization} • ${opp.type}`,
        type: 'opportunity',
        queryToApply: opp.title,
      });
    } else if (opp.organization.toLowerCase().includes(q) && !seenTitles.has(opp.organization)) {
      seenTitles.add(opp.organization);
      suggestions.push({
        id: `opp-org-${opp.id}`,
        title: opp.organization,
        subtitle: `Grantmaker / Provider (${opp.region})`,
        type: 'provider',
        queryToApply: opp.organization,
      });
    }
  });

  // 3. Matching Tags
  opportunities.forEach((opp) => {
    if (suggestions.length >= maxResults) return;
    opp.tags.forEach((tag) => {
      if (suggestions.length >= maxResults) return;
      if (tag.toLowerCase().includes(q) && !seenTitles.has(tag)) {
        seenTitles.add(tag);
        suggestions.push({
          id: `opp-tag-${tag}`,
          title: tag,
          subtitle: 'Tag / Specialization',
          type: 'popular',
          queryToApply: tag,
        });
      }
    });
  });

  return suggestions.slice(0, maxResults);
}

/**
 * Intelligent alternative suggestions when 0 results match
 */
export function getAlternativeRecommendations(
  filters: FilterState,
  allOpportunities: Opportunity[]
): { label: string; action: () => void }[] {
  const recommendations: { label: string; action: () => void }[] = [];

  return recommendations;
}
