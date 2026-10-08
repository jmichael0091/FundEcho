import React, { useState, useMemo } from 'react';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  Clock, 
  ExternalLink, 
  ArrowLeft, 
  ArrowRight, 
  SlidersHorizontal,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Opportunity, PageId, OpportunityType } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { OpportunityCard } from '../components/ui/OpportunityCard';

import { UserProfile } from '../types';
import { calculateOpportunityMatch } from '../utils/matching';

export interface SavedOpportunitiesPageProps {
  userProfile?: UserProfile | null;
  allOpportunities: Opportunity[];
  bookmarkedIds: Set<string>;
  onNavigate: (page: PageId) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onToggleBookmark: (opportunity: Opportunity) => void;
}

export const SavedOpportunitiesPage: React.FC<SavedOpportunitiesPageProps> = ({
  allOpportunities,
  bookmarkedIds,
  onNavigate,
  onSelectOpportunity,
  onToggleBookmark,
  userProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'amount' | 'newest'>('deadline');

  // Filter bookmarked items from all opportunities
  const savedOpportunities = useMemo(() => {
    return allOpportunities.filter((opp) => bookmarkedIds.has(opp.id));
  }, [allOpportunities, bookmarkedIds]);

  // Apply search, type filter, and sorting
  const filteredAndSortedOpportunities = useMemo(() => {
    const scoredOpportunities = savedOpportunities.map(opp => {
      return { ...opp, matchResult: userProfile ? calculateOpportunityMatch(userProfile, opp) : null };
    });
    return scoredOpportunities.filter((opp) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = opp.title.toLowerCase().includes(q);
          const matchOrg = opp.organization.toLowerCase().includes(q);
          const matchCategory = opp.category.toLowerCase().includes(q);
          const matchTags = opp.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchOrg && !matchCategory && !matchTags) return false;
        }

        // Type filter
        if (selectedType !== 'all' && opp.type !== selectedType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return a.daysLeft - b.daysLeft;
        }
        if (sortBy === 'amount') {
          return b.amount.max - a.amount.max;
        }
        if (sortBy === 'newest') {
          return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
        }
        return 0;
      });
  }, [savedOpportunities, searchQuery, selectedType, sortBy]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(savedOpportunities.map((o) => o.type));
    return Array.from(types);
  }, [savedOpportunities]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 overflow-x-clip">
      {/* 1. BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Dashboard
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white">Saved Opportunities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Saved Opportunities
            <span className="text-base font-semibold px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {savedOpportunities.length}
            </span>
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('opportunities')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Explore All Directory
        </Button>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR (Only show if user has saved items) */}
      {savedOpportunities.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar within saved */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in your saved opportunities..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Type Filter & Sort Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {uniqueTypes.length > 1 && (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Types ({savedOpportunities.length})</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="deadline">Sort: Closing Soonest</option>
              <option value="amount">Sort: Highest Funding</option>
              <option value="newest">Sort: Recently Added</option>
            </select>
          </div>
        </div>
      )}

      {/* 3. OPPORTUNITIES GRID / EMPTY STATE */}
      {savedOpportunities.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-14 text-center space-y-5 shadow-sm max-w-2xl mx-auto">
          <div className="h-16 w-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/60 shadow-sm">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              No saved opportunities yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Explore thousands of global grants, scholarships, and fellowships. Click the bookmark icon on any opportunity to save it here for fast access.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('opportunities')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse Opportunities
            </Button>
          </div>
        </div>
      ) : filteredAndSortedOpportunities.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 text-center space-y-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No saved opportunities match your current search query "{searchQuery}".
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};
