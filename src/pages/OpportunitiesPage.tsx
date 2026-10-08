import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  RotateCcw, 
  CheckCircle2, 
  Globe, 
  Bookmark, 
  Calendar,
  Layers,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Tag,
  Filter
} from 'lucide-react';
import { Opportunity, Category } from '../types';
import { OpportunityCard } from '../components/ui/OpportunityCard';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MobileFilterDrawer } from '../components/ui/MobileFilterDrawer';
import { AdSenseSlot } from '../components/monetization/AdSenseSlot';
import { SponsoredSpotlightBanner } from '../components/monetization/SponsoredSpotlightBanner';
import { PartnerResourcesSection } from '../components/monetization/PartnerResourcesSection';
import { FEATURED_OPPORTUNITY_CONFIGS } from '../data/monetizationData';
import { 
  FilterState, 
  AmountFilterTier, 
  executeDiscoverySearch, 
  getSearchSuggestions, 
  SearchSuggestionItem 
} from '../utils/searchEngine';

import { UserProfile } from '../types';

export interface OpportunitiesPageProps {
  userProfile?: UserProfile | null;
  opportunities: Opportunity[];
  categories: Category[];
  initialSearch?: string;
  initialCategory?: string;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (opportunity: Opportunity) => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  opportunities,
  categories,
  initialSearch = '',
  initialCategory = '',
  onSelectOpportunity,
  bookmarkedIds,
  onToggleBookmark,
  userProfile,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: initialSearch,
    selectedType: 'all',
    selectedRegion: 'all',
    selectedCategory: initialCategory || 'all',
    selectedDeadline: 'all',
    selectedAmountTier: 'all',
    verifiedOnly: false,
    savedOnly: false,
    eligibilityStatus: 'all',
    sortBy: initialSearch.trim() ? 'relevance' : 'ending-soon',
  });

  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);

  // Pagination / Load More state
  const ITEMS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Sync external search/category changes
  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== filters.searchQuery) {
      setFilters((prev) => ({ 
        ...prev, 
        searchQuery: initialSearch,
        sortBy: initialSearch.trim() ? 'relevance' : prev.sortBy
      }));
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory !== undefined && initialCategory !== '' && initialCategory !== filters.selectedCategory) {
      setFilters((prev) => ({ ...prev, selectedCategory: initialCategory }));
    }
  }, [initialCategory]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filters]);

  const updateFilters = (updates: Partial<FilterState>) => {
    setIsSearching(true);
    startTransition(() => {
      setFilters((prev) => {
        const next = { ...prev, ...updates };
        // Auto-switch to relevance sort if user types a search query and hasn't explicitly chosen another sort
        if (updates.searchQuery !== undefined && updates.searchQuery.trim() && prev.sortBy === 'ending-soon') {
          next.sortBy = 'relevance';
        }
        return next;
      });
    });
    // Brief simulated indexing transition
    setTimeout(() => {
      setIsSearching(false);
    }, 80);
  };

  const handleSearchChange = (query: string) => {
    updateFilters({ searchQuery: query });
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestionItem) => {
    if (suggestion.filterChange) {
      updateFilters({ ...suggestion.filterChange, searchQuery: suggestion.queryToApply });
    } else {
      updateFilters({ searchQuery: suggestion.queryToApply });
    }
  };

  const handleResetFilters = () => {
    updateFilters({
      searchQuery: '',
      selectedType: 'all',
      selectedRegion: 'all',
      selectedCategory: 'all',
      selectedDeadline: 'all',
      selectedAmountTier: 'all',
      verifiedOnly: false,
      savedOnly: false,
    eligibilityStatus: 'all',
    sortBy: 'ending-soon',
    });
  };

  // Filter configuration lists
  const typesList: { label: string; value: string }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Business Grants & Funding', value: 'Business Funding' },
    { label: 'NGO & Non-Profit Grants', value: 'NGO & Non-Profit' },
    { label: 'Scholarships', value: 'Scholarship' },
    { label: 'Fellowships', value: 'Fellowship' },
    { label: 'Competitions & Prizes', value: 'Competition' },
    { label: 'General Grants', value: 'Grant' },
    { label: 'Research Grants', value: 'Research Grant' },
  ];

  const regionsList: { label: string; value: string }[] = [
    { label: 'All Regions', value: 'all' },
    { label: 'Global', value: 'Global' },
    { label: 'North America', value: 'North America' },
    { label: 'Europe', value: 'Europe' },
    { label: 'Asia-Pacific', value: 'Asia-Pacific' },
    { label: 'Africa', value: 'Africa' },
    { label: 'Latin America', value: 'Latin America' },
    { label: 'Middle East', value: 'Middle East' },
  ];

  const deadlinesList: { label: string; value: string }[] = [
    { label: 'All Deadlines', value: 'all' },
    { label: 'Closing in ≤ 15 Days', value: '15' },
    { label: 'Closing in ≤ 30 Days', value: '30' },
    { label: 'Closing in ≤ 60 Days', value: '60' },
    { label: 'Closing in ≤ 90 Days', value: '90' },
  ];

  const amountTiersList: { label: string; value: AmountFilterTier }[] = [
    { label: 'All Amounts', value: 'all' },
    { label: 'Under $25,000', value: 'under-25k' },
    { label: '$25k – $100,000', value: '25k-100k' },
    { label: '$100k – $500,000', value: '100k-500k' },
    { label: '$500,000+ Major Capital', value: '500k-plus' },
    { label: 'Fully Funded / Full Coverage', value: 'fully-funded' },
  ];

  // Suggestions computation
  const suggestions = useMemo(() => {
    return getSearchSuggestions(filters.searchQuery, opportunities, categories);
  }, [filters.searchQuery, opportunities, categories]);

  // Core Search & Filtering Execution via Search Engine
  const { results: filteredOpportunities, totalCount } = useMemo(() => {
    return executeDiscoverySearch(opportunities, categories, filters, bookmarkedIds, userProfile);
  }, [opportunities, categories, filters, bookmarkedIds, userProfile]);

  // Paginated slice
  const visibleOpportunities = useMemo(() => {
    return filteredOpportunities.slice(0, visibleCount);
  }, [filteredOpportunities, visibleCount]);

  const hasMore = visibleCount < filteredOpportunities.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredOpportunities.length));
  };

  const activeFiltersCount =
    (filters.searchQuery.trim() !== '' ? 1 : 0) +
    (filters.selectedType !== 'all' ? 1 : 0) +
    (filters.selectedRegion !== 'all' ? 1 : 0) +
    (filters.selectedCategory !== 'all' ? 1 : 0) +
    (filters.selectedDeadline !== 'all' ? 1 : 0) +
    (filters.selectedAmountTier !== 'all' ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.savedOnly ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const featuredOpp = useMemo(() => {
    const config = FEATURED_OPPORTUNITY_CONFIGS['opp-6'] || FEATURED_OPPORTUNITY_CONFIGS['google-for-startups-2026'];
    if (!config || (!config.isSponsored && config.badgeText !== 'Featured')) return null;
    const match = opportunities.find((o) => o.id === config.opportunityId);
    return match ? { opportunity: match, config } : null;
  }, [opportunities]);

  // Alternative suggestions when 0 results found
  const alternativeSearchSuggestions = [
    { label: 'Business grants for African entrepreneurs', query: 'business grants for African entrepreneurs' },
    { label: 'Full scholarships in Europe', query: 'scholarships in Europe' },
    { label: 'Climate & biodiversity funds', query: 'climate biodiversity' },
    { label: 'Tech & AI fellowships', query: 'AI fellowships' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 overflow-x-clip">
      {/* 1. Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          <Globe className="w-4 h-4" />
          <span>Global Funding Discovery</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Opportunities Directory
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1.5 max-w-2xl">
              Discover, filter, and track verified business grants, non-profit funds, academic scholarships, fellowships, and prize competitions worldwide.
            </p>
          </div>

          {/* Quick Popular Keywords Pill Bar */}
          <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1">Popular:</span>
            <button
              type="button"
              onClick={() => handleSearchChange('African entrepreneurs')}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              African Startups
            </button>
            <button
              type="button"
              onClick={() => handleSearchChange('fully funded')}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Fully Funded
            </button>
            <button
              type="button"
              onClick={() => handleSearchChange('women NGO')}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Women & NGO
            </button>
          </div>
        </div>
      </div>

      {/* 2. Prominent Global Search Bar with Autocomplete & Suggestions */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Input */}
          <div className="flex-1">
            <SearchInput
              id="opportunities-global-search-input"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              onSelectSuggestion={handleSuggestionSelect}
              suggestions={suggestions}
              placeholder="Search by keywords, organization, location, or natural phrases (e.g. business grants for African entrepreneurs)..."
              size="md"
              isLoading={isSearching}
            />
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <div className="relative inline-block w-full sm:w-auto">
              <select
                id="opportunities-sort-select"
                aria-label="Sort opportunities by"
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                className="w-full sm:w-auto appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md shadow-slate-200/50 dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] cursor-pointer"
              >
                {filters.searchQuery.trim() && (
                  <option value="relevance">Most Relevant Match</option>
                )}
                <option value="ending-soon">Deadline (Ending Soonest)</option>
                <option value="ending-latest">Deadline (Ending Latest)</option>
                <option value="amount-high">Award Value (Highest)</option>
                <option value="amount-low">Award Value (Lowest)</option>
                <option value="recent">Recently Added</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Mobile Filters Button */}
            <Button
              id="mobile-filters-drawer-trigger-btn"
              variant="outline"
              size="md"
              className="md:hidden shrink-0"
              onClick={() => setMobileDrawerOpen(true)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* View Mode Toggle (Grid / List) */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                id="view-layout-grid-btn"
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewLayout === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="view-layout-list-btn"
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewLayout === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Desktop Filter Controls Bar */}
        <div className="hidden md:block p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/60 dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.42)] space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Funding Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">
                Funding Type
              </label>
              <div className="relative">
                <select
                  id="filter-funding-type"
                  aria-label="Filter by funding type"
                  value={filters.selectedType}
                  onChange={(e) => updateFilters({ selectedType: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none truncate"
                >
                  {typesList.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Country / Region Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">
                Eligible Region
              </label>
              <div className="relative">
                <select
                  id="filter-eligible-region"
                  aria-label="Filter by eligible region"
                  value={filters.selectedRegion}
                  onChange={(e) => updateFilters({ selectedRegion: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none truncate"
                >
                  {regionsList.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
              </div>
            </div>

            
            {/* Eligibility Filter */}
            {userProfile && (
            <div className="space-y-2">
              <label htmlFor="filter-eligibility" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Eligibility Status
              </label>
              <div className="relative">
                <select
                  id="filter-eligibility"
                  value={filters.eligibilityStatus || 'all'}
                  onChange={(e) => updateFilters({ eligibilityStatus: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none truncate"
                >
                  <option value="all">All Opportunities</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Likely Eligible">Likely Eligible</option>
                  <option value="Needs Verification">Needs Verification</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
              </div>
            </div>
            )}
            
            {/* Category Domain Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">
                Category Domain
              </label>
              <div className="relative">
                <select
                  id="filter-category-domain"
                  aria-label="Filter by category domain"
                  value={filters.selectedCategory}
                  onChange={(e) => updateFilters({ selectedCategory: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none truncate"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Funding Amount Tier Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">
                Funding Amount
              </label>
              <div className="relative">
                <select
                  id="filter-amount-tier"
                  aria-label="Filter by funding amount tier"
                  value={filters.selectedAmountTier}
                  onChange={(e) => updateFilters({ selectedAmountTier: e.target.value as AmountFilterTier })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none truncate"
                >
                  {amountTiersList.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Application Deadline Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">
                Deadline Timeframe
              </label>
              <div className="relative">
                <select
                  id="filter-deadline"
                  aria-label="Filter by application deadline"
                  value={filters.selectedDeadline}
                  onChange={(e) => updateFilters({ selectedDeadline: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none truncate"
                >
                  {deadlinesList.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">
                Quick Criteria
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="toggle-verified-btn"
                  onClick={() => updateFilters({ verifiedOnly: !filters.verifiedOnly })}
                  className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${
                    filters.verifiedOnly
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                  title="Show only verified opportunities"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Verified</span>
                </button>

                <button
                  type="button"
                  id="toggle-saved-btn"
                  onClick={() => updateFilters({ savedOnly: !filters.savedOnly })}
                  className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${
                    filters.savedOnly
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                  title="Show only bookmarked opportunities"
                >
                  <Bookmark className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Saved ({bookmarkedIds.size})</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Active Filter Chips & Clear All Control */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">Active filters:</span>
                
                {filters.searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                    Search: "{filters.searchQuery}"
                    <button
                      type="button"
                      onClick={() => updateFilters({ searchQuery: '' })}
                      className="hover:text-indigo-900 dark:hover:text-white p-0.5 rounded-sm"
                      aria-label="Clear search filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.selectedType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                    Type: {typesList.find((t) => t.value === filters.selectedType)?.label || filters.selectedType}
                    <button
                      type="button"
                      onClick={() => updateFilters({ selectedType: 'all' })}
                      className="hover:text-indigo-900 dark:hover:text-white p-0.5 rounded-sm"
                      aria-label="Clear type filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.selectedRegion !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium">
                    Region: {filters.selectedRegion}
                    <button
                      type="button"
                      onClick={() => updateFilters({ selectedRegion: 'all' })}
                      className="hover:text-sky-900 dark:hover:text-white p-0.5 rounded-sm"
                      aria-label="Clear region filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium">
                    Category: {categories.find((c) => c.slug === filters.selectedCategory)?.name || filters.selectedCategory}
                    <button
                      type="button"
                      onClick={() => updateFilters({ selectedCategory: 'all' })}
                      className="hover:text-purple-900 dark:hover:text-white p-0.5 rounded-sm"
                      aria-label="Clear category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                
                {filters.eligibilityStatus && filters.eligibilityStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                    Eligibility: {filters.eligibilityStatus}
                    <button
                      type="button"
                      onClick={() => updateFilters({ eligibilityStatus: 'all' })}
                      className="hover:text-emerald-900 dark:hover:text-white p-0.5 rounded-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.selectedAmountTier !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                    Amount: {amountTiersList.find((a) => a.value === filters.selectedAmountTier)?.label || filters.selectedAmountTier}
                    <button
                      type="button"
                      onClick={() => updateFilters({ selectedAmountTier: 'all' })}
                      className="hover:text-emerald-900 dark:hover:text-white p-0.5 rounded-sm"
                      aria-label="Clear amount filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.selectedDeadline !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
                    Deadline: ≤ {filters.selectedDeadline} Days
                    <button
                      type="button"
                      onClick={() => updateFilters({ selectedDeadline: 'all' })}
                      className="hover:text-amber-950 dark:hover:text-white p-0.5 rounded-sm"
                      aria-label="Clear deadline filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.verifiedOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                    Verified Only
                    <button
                      type="button"
                      onClick={() => updateFilters({ verifiedOnly: false })}
                      className="hover:text-emerald-900 dark:hover:text-white p-0.5 rounded-sm"
                      aria-label="Clear verified filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.savedOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                    Saved Items
                    <button
                      type="button"
                      onClick={() => updateFilters({ savedOnly: false })}
                      className="hover:text-indigo-900 dark:hover:text-white p-0.5 rounded-sm"
                      aria-label="Clear saved filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                id="reset-all-filters-btn"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear all filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Results Counter & Summary */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Showing <span className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.min(visibleOpportunities.length, totalCount)}</span> of{' '}
            <span className="text-slate-900 dark:text-white font-bold">{totalCount}</span> matching opportunities
          </p>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Multi-attribute search & relevance scoring active</span>
          </div>
        )}
      </div>

      {/* 6. Mobile Filter Sheet / Drawer */}
      <MobileFilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        filters={filters}
        onUpdateFilters={updateFilters}
        onResetFilters={handleResetFilters}
        categories={categories}
        totalResultsCount={totalCount}
        bookmarkedCount={bookmarkedIds.size}
      />

      {/* Featured / Sponsored Spotlight Opportunity (if present) */}
      {featuredOpp && !hasActiveFilters && (
        <div className="pt-1">
          <SponsoredSpotlightBanner
            opportunity={featuredOpp.opportunity}
            config={featuredOpp.config}
            onSelectOpportunity={onSelectOpportunity}
          />
        </div>
      )}

      {/* 7. Opportunity Results Grid / List */}
      {filteredOpportunities.length > 0 ? (
        <div className="space-y-8">
          <div
            className={
              viewLayout === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'space-y-4'
            }
          >
            {visibleOpportunities.map((opp, idx) => (
              <React.Fragment key={opp.id}>
                <OpportunityCard
                  opportunity={opp}
                  onSelect={onSelectOpportunity}
                  isBookmarked={bookmarkedIds.has(opp.id)}
                  onToggleBookmark={onToggleBookmark}
                  layout={viewLayout}
                />

                {/* Non-intrusive AdSense Slot between opportunities in feed */}
                {idx === 2 && (
                  <div className={viewLayout === 'grid' ? 'md:col-span-2 lg:col-span-3' : ''}>
                    <AdSenseSlot
                      slotId="ad-slot-opps-feed"
                      format="in_feed"
                      className="my-3"
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* 8. Load More Pagination */}
          {hasMore ? (
            <div className="text-center pt-4 pb-2 space-y-3">
              <Button
                id="load-more-opportunities-btn"
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                className="px-8 font-semibold shadow-sm hover:shadow-md"
              >
                Load More Opportunities ({totalCount - visibleOpportunities.length} remaining)
              </Button>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Displaying {visibleOpportunities.length} of {totalCount} total results
              </p>
            </div>
          ) : (
            filteredOpportunities.length > ITEMS_PER_PAGE && (
              <div className="text-center py-6 border-t border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-400 dark:text-slate-500">
                ✓ You have reached the end of the matching opportunities catalog
              </div>
            )
          )}

          {/* Vetted Partner Accelerators Section */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800">
            <PartnerResourcesSection limit={2} showCategoryFilter={false} />
          </div>
        </div>
      ) : (
        /* 9. Empty Results State with Helpful Suggestions */
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.42)] max-w-xl mx-auto space-y-5">
          <div className="h-14 w-14 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-800">
            <Search className="w-6 h-6" />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              No matching opportunities found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We couldn't find any opportunities matching <span className="font-semibold text-slate-800 dark:text-slate-200">"{filters.searchQuery || 'your criteria'}"</span> with the currently selected filters.
            </p>
          </div>

          {/* Alternative Suggestion Prompts */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Suggested alternatives to explore:
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {alternativeSearchSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    handleSearchChange(item.query);
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              id="empty-state-reset-btn"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Clear all filters & start fresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
