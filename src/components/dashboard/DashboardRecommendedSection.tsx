import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Bookmark, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { Opportunity, PageId } from '../../types';
import { MatchResult } from '../../utils/matching';
import { Button } from '../ui/Button';
import { DeadlineBadge } from '../deadlines/DeadlineBadge';

export interface DashboardRecommendedSectionProps {
  recommendedItems: { opportunity: Opportunity; match: MatchResult }[];
  bookmarkedIds: Set<string>;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onToggleBookmark: (opportunity: Opportunity) => void;
  onNavigate: (page: PageId) => void;
  isCompact?: boolean;
}

export const DashboardRecommendedSection: React.FC<DashboardRecommendedSectionProps> = ({
  recommendedItems,
  bookmarkedIds,
  onSelectOpportunity,
  onToggleBookmark,
  onNavigate,
  isCompact = false,
}) => {
  const displayItems = isCompact ? recommendedItems.slice(0, 3) : recommendedItems;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recommended Opportunities
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {recommendedItems.length} Matches
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tailored specifically to your declared profile interests, country, and eligibility criteria.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            id="view-all-recommendations-btn"
            variant="outline"
            size="sm"
            onClick={() => onNavigate('recommended')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View all recommendations
          </Button>
        </div>
      </div>

      {/* Recommended Items Grid */}
      {displayItems.length === 0 ? (
        <div className="text-center py-10 space-y-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 p-6">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              No tailored matches yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add your country, category interests, and organization details to generate tailored match scores.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('profile')}
            rightIcon={<Sliders className="w-3.5 h-3.5" />}
          >
            Set Preferences
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {displayItems.map(({ opportunity, match }) => {
            const isBookmarked = bookmarkedIds.has(opportunity.id);
            return (
              <div
                key={opportunity.id}
                id={`recommended-card-${opportunity.id}`}
                className="bg-slate-50/70 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 p-4 sm:p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Provider + Match % + Bookmark */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                        {opportunity.organization}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Match Percentage Badge */}
                      <span 
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
                          match.score >= 80
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : match.score >= 60
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {match.score}% Match
                      </span>

                      {/* Bookmark Save Button */}
                      <button
                        type="button"
                        id={`bookmark-btn-${opportunity.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(opportunity);
                        }}
                        className={`p-1.5 rounded-xl border transition-all ${
                          isBookmarked
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Save opportunity'}
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Save opportunity'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onSelectOpportunity(opportunity)}
                    className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-2 leading-snug"
                  >
                    {opportunity.title}
                  </h3>

                  {/* Key Metadata: Amount + Deadline */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        {opportunity.amount.displayText}
                      </span>
                      <DeadlineBadge deadline={opportunity.deadline} size="xs" />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: View and Quick Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 truncate">
                    {opportunity.type}
                  </span>

                  <Button
                    id={`view-opportunity-btn-${opportunity.id}`}
                    variant="outline"
                    size="xs"
                    onClick={() => onSelectOpportunity(opportunity)}
                    rightIcon={<ChevronRight className="w-3 h-3" />}
                  >
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
