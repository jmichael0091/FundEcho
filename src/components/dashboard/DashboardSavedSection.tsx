import React from 'react';
import { 
  Bookmark, 
  ArrowRight, 
  Trash2, 
  ExternalLink,
  ChevronRight 
} from 'lucide-react';
import { Opportunity, PageId } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DeadlineBadge } from '../deadlines/DeadlineBadge';

export interface DashboardSavedSectionProps {
  savedOpportunities: Opportunity[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onToggleBookmark: (opportunity: Opportunity) => void;
  onNavigate: (page: PageId) => void;
  isCompact?: boolean;
}

export const DashboardSavedSection: React.FC<DashboardSavedSectionProps> = ({
  savedOpportunities,
  onSelectOpportunity,
  onToggleBookmark,
  onNavigate,
  isCompact = false,
}) => {
  const displayItems = isCompact ? savedOpportunities.slice(0, 4) : savedOpportunities;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Bookmark className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Saved Opportunities
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {savedOpportunities.length} Bookmarked
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep track of grants and funding programs you want to revisit and apply for.
          </p>
        </div>

        {savedOpportunities.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              id="view-all-saved-btn"
              variant="outline"
              size="sm"
              onClick={() => onNavigate('saved')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View all saved opportunities
            </Button>
          </div>
        )}
      </div>

      {/* Saved Items List */}
      {displayItems.length === 0 ? (
        <div className="text-center py-10 space-y-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 p-6">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              No saved opportunities yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save opportunities you want to revisit later.
            </p>
          </div>
          <Button
            id="empty-saved-browse-btn"
            variant="primary"
            size="sm"
            onClick={() => onNavigate('opportunities')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Explore Opportunities
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map((opp) => (
            <div
              key={opp.id}
              id={`saved-item-${opp.id}`}
              className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="indigo" size="sm">
                    {opp.type}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {opp.organization}
                  </span>
                  <DeadlineBadge deadline={opp.deadline} size="xs" />
                </div>

                <h3
                  onClick={() => onSelectOpportunity(opp)}
                  className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate"
                >
                  {opp.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {opp.amount.displayText}
                  </span>
                  <span>•</span>
                  <span>Deadline: {opp.deadline}</span>
                  <span>•</span>
                  <span>{opp.location}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  id={`saved-item-view-${opp.id}`}
                  variant="outline"
                  size="xs"
                  onClick={() => onSelectOpportunity(opp)}
                >
                  View
                </Button>
                <button
                  type="button"
                  onClick={() => onToggleBookmark(opp)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove from saved"
                  aria-label="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
