import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Sliders, 
  SlidersHorizontal,
  Filter, 
  ArrowUpDown, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  ArrowRight,
  User,
  MapPin,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  Compass,
  X
} from 'lucide-react';
import { UserProfile, Opportunity, OpportunityType, PageId } from '../types';
import { MatchResult, calculateOpportunityMatch, getRecommendedOpportunities } from '../utils/matching';
import { MatchCard } from '../components/ui/MatchCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { calculateProfileCompletion } from '../utils/auth';
import { CATEGORIES_DATA } from '../data/categories';
import { AffiliateRecommendationSection } from '../components/affiliate/AffiliateRecommendationSection';
import { useMonetization } from '../context/MonetizationContext';

export interface RecommendedPageProps {
  user: UserProfile | null;
  allOpportunities: Opportunity[];
  bookmarkedIds: Set<string>;
  onNavigate: (page: PageId) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onToggleBookmark: (opportunity: Opportunity) => void;
}

type SortOption = 'match' | 'deadline' | 'funding' | 'recent';
type QualityFilter = 'all' | '90' | '75' | '60';

export const RecommendedPage: React.FC<RecommendedPageProps> = ({
  user,
  allOpportunities,
  bookmarkedIds,
  onNavigate,
  onSelectOpportunity,
  onToggleBookmark,
}) => {
  const { isPremium } = useMonetization();
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [showFilters, setShowFilters] = useState(false);

  const profileCompletion = user ? calculateProfileCompletion(user) : 0;
  const isProfileIncomplete = user && profileCompletion < 75;

  // Compute matched opportunities
  const matchedOpportunities = useMemo(() => {
    return allOpportunities.map((opportunity) => ({
      opportunity,
      match: calculateOpportunityMatch(user, opportunity),
    }));
  }, [user, allOpportunities]);

  // Apply filters and sorting
  const filteredRecommendations = useMemo(() => {
    return matchedOpportunities
      .filter(({ opportunity, match }) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesSearch = 
            opportunity.title.toLowerCase().includes(q) ||
            opportunity.organization.toLowerCase().includes(q) ||
            opportunity.summary.toLowerCase().includes(q) ||
            opportunity.category.toLowerCase().includes(q) ||
            opportunity.tags.some(t => t.toLowerCase().includes(q));
          
          if (!matchesSearch) return false;
        }

        // Funding Type filter
        if (selectedType !== 'all' && opportunity.type !== selectedType) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          const cat = CATEGORIES_DATA.find((c) => c.slug === selectedCategory);
          if (cat && !opportunity.category.toLowerCase().includes(cat.name.toLowerCase()) && !cat.name.toLowerCase().includes(opportunity.category.toLowerCase())) {
            return false;
          }
        }

        // Region filter
        if (selectedRegion !== 'all') {
          if (selectedRegion === 'Global' && opportunity.region !== 'Global' && !opportunity.location.toLowerCase().includes('global')) {
            return false;
          }
          if (selectedRegion !== 'Global' && opportunity.region !== selectedRegion && !opportunity.location.includes(selectedRegion)) {
            return false;
          }
        }

        // Match Quality filter
        if (qualityFilter === '90' && match.matchScore < 90) return false;
        if (qualityFilter === '75' && match.matchScore < 75) return false;
        if (qualityFilter === '60' && match.matchScore < 60) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          if (b.match.matchScore !== a.match.matchScore) {
            return b.match.matchScore - a.match.matchScore;
          }
          return a.opportunity.daysLeft - b.opportunity.daysLeft;
        }
        if (sortBy === 'deadline') {
          return a.opportunity.daysLeft - b.opportunity.daysLeft;
        }
        if (sortBy === 'funding') {
          return (b.opportunity.amount.max || 0) - (a.opportunity.amount.max || 0);
        }
        if (sortBy === 'recent') {
          return new Date(b.opportunity.datePosted).getTime() - new Date(a.opportunity.datePosted).getTime();
        }
        return 0;
      });
  }, [matchedOpportunities, searchQuery, selectedType, selectedCategory, selectedRegion, qualityFilter, sortBy]);

  const activeFilterCount = [
    selectedType !== 'all',
    selectedCategory !== 'all',
    selectedRegion !== 'all',
    qualityFilter !== 'all',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setQualityFilter('all');
    setSortBy('match');
  };

  // If user is not logged in, render visitor prompt view
  if (!user) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-12 shadow-xl text-center max-w-3xl mx-auto space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800 shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign in to get personalized opportunities
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
              FundEcho’s Smart Opportunity Matching algorithm compares your location, sector interests, and preferred funding types against thousands of active global programs.
            </p>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Regional Eligibility
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Filters for grants open to your specific country and regional zone.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Interest Matching
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Prioritizes opportunities directly aligning with your sector and focus areas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" /> Instrument Preference
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ranks grants, scholarships, fellowships, or business funding according to your goals.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('login')}
            >
              Sign In to Your Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('signup')}
            >
              Create Free Account
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Or{' '}
              <button
                type="button"
                onClick={() => onNavigate('opportunities')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                browse all open opportunities without an account &rarr;
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 overflow-x-clip">
      {/* 1. PAGE HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.4)] space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Opportunity Matching</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recommended for You
            </h1>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('profile')}
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
            >
              Edit Preferences
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              leftIcon={<User className="w-3.5 h-3.5" />}
            >
              Dashboard
            </Button>
          </div>
        </div>

        {/* Profile Completion Warning Prompt */}
        {isProfileIncomplete && (
          <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                  Complete your profile to improve your recommendations
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Your profile is {profileCompletion}% complete. Adding specific categories and your home country unlocks higher matching precision.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => onNavigate('profile')}
              className="bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 shrink-0 self-end sm:self-center"
            >
              Complete Profile ({profileCompletion}%)
            </Button>
          </div>
        )}

        {/* Clarification Notice / Match Score Disclaimer */}
        <div className="flex items-start sm:items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-amber-50/80 dark:bg-amber-950/40 px-4 py-3 rounded-2xl border border-amber-200/90 dark:border-amber-800/70 shadow-2xs">
          <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <p className="leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">Important Note:</span>{' '}
            Match score indicates relevance based on your declared profile preferences, not official eligibility or guaranteed approval.
          </p>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex-1 max-w-lg">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search recommendations by title, keyword, or org..."
            />
          </div>

          {/* Quick Filter Bar & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
            <Button
              variant={showFilters || activeFilterCount > 0 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-3.5 h-3.5" />}
            >
              <span>Refine Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-indigo-700 text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort recommendations"
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="match">Best Match</option>
                <option value="deadline">Deadline Soonest</option>
                <option value="funding">Highest Funding</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expanded Filters Drawer / Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Refine Recommendations
              </h3>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Match Quality Filter */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Minimum Match Score
                </label>
                <select
                  value={qualityFilter}
                  onChange={(e) => setQualityFilter(e.target.value as QualityFilter)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium text-slate-900 dark:text-white"
                >
                  <option value="all">All Match Levels</option>
                  <option value="90">90%+ (Excellent Match)</option>
                  <option value="75">75%+ (Strong & Excellent)</option>
                  <option value="60">60%+ (Good & Above)</option>
                </select>
              </div>

              {/* Funding Type Filter */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Funding Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium text-slate-900 dark:text-white"
                >
                  <option value="all">All Funding Types</option>
                  <option value="Grant">Grants</option>
                  <option value="Scholarship">Scholarships</option>
                  <option value="Fellowship">Fellowships</option>
                  <option value="Competition">Competitions</option>
                  <option value="NGO & Non-Profit">NGO & Non-Profit</option>
                  <option value="Business Funding">Business & Startups</option>
                  <option value="Research Grant">Research Grants</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium text-slate-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES_DATA.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country / Region Filter */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Region / Location
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium text-slate-900 dark:text-white"
                >
                  <option value="all">All Regions</option>
                  <option value="Global">Global (Any Country)</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia-Pacific">Asia-Pacific</option>
                  <option value="Africa">Africa</option>
                  <option value="Latin America">Latin America</option>
                  <option value="Middle East">Middle East</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Header Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>
            Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredRecommendations.length}</strong> matched opportunities for your profile
          </p>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* 3. RECOMMENDATIONS GRID */}
      {filteredRecommendations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-10 sm:p-16 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No opportunities match your current filters
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Try adjusting your search criteria, widening your minimum match threshold, or updating your profile preferences.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
            >
              Clear Filters
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('profile')}
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
            >
              Edit Profile Preferences
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map(({ opportunity, match }) => (
            <MatchCard
              key={opportunity.id}
              opportunity={opportunity}
              match={match}
              isBookmarked={bookmarkedIds.has(opportunity.id)}
              onSelect={onSelectOpportunity}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* 4. HIGH-MATCH PARTNER TOOLS & RESOURCES (STEP 16) */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <AffiliateRecommendationSection
          context={{
            userId: user?.id,
            country: user?.country,
            userType: user?.applicantType,
            interests: user?.interests,
            fundingPreferences: user?.preferredFundingTypes,
            isPremium: isPremium
          }}
          placement="recommended_opportunities"
          title="Recommended Tools & Verified Partner Platforms"
          subtitle="Specialized software and verified consulting partners matched to your profile and preferred categories."
          initialLimit={3}
          maxResults={6}
        />
      </div>
    </div>
  );
};
