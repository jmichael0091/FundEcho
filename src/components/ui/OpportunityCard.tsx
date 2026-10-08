import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Bookmark, 
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Opportunity } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { DeadlineBadge } from '../deadlines/DeadlineBadge';

export interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect?: (opportunity: Opportunity) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (opportunity: Opportunity) => void;
  onTrackReminder?: (opportunity: Opportunity) => void;
  layout?: 'grid' | 'list';
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  isBookmarked = false,
  onToggleBookmark,
  onTrackReminder,
  layout = 'grid',
}) => {
  const getTypeBadgeVariant = (type: Opportunity['type']) => {
    switch (type) {
      case 'Grant': return 'indigo';
      case 'Scholarship': return 'sky';
      case 'Fellowship': return 'purple';
      case 'Competition': return 'amber';
      case 'NGO & Non-Profit': return 'emerald';
      case 'Business Funding': return 'indigo';
      case 'Research Grant': return 'teal';
      default: return 'slate';
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(opportunity);
    }
  };

  const isList = layout === 'list';

  return (
    <div
      id={`opp-card-${opportunity.id}`}
      onClick={() => onSelect && onSelect(opportunity)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 transition-all duration-200 cursor-pointer shadow-md shadow-slate-200/70 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.36)] hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-[0_20px_35px_-5px_rgba(99,102,241,0.12)] hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/60 flex flex-col justify-between ${
        isList ? 'md:flex-row md:items-center p-5 sm:p-6 gap-5' : 'p-5 sm:p-6'
      }`}
    >
      <div className={isList ? 'flex-1 space-y-3' : 'space-y-3'}>
        {/* Card Header: Type Badge, Verified & Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getTypeBadgeVariant(opportunity.type)} size="sm">
              {opportunity.type}
            </Badge>

            {opportunity.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/70 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Verified
              </span>
            )}

            {opportunity.featured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/70 dark:border-indigo-800/60">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Featured
              </span>
            )}
            {opportunity.matchResult && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                opportunity.matchResult.eligibilityStatus === 'Eligible' 
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/60'
                  : opportunity.matchResult.eligibilityStatus === 'Likely Eligible'
                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800/60'
                  : opportunity.matchResult.eligibilityStatus === 'Not Eligible'
                  ? 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800/60'
                  : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800/60'
              }`}>
                {opportunity.matchResult.matchScore}% Match
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark opportunity'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`} />
          </button>
        </div>

        {/* Opportunity Title & Organization */}
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-2xs ${opportunity.orgLogoBg || 'bg-slate-800'}`}>
              {opportunity.orgInitials || opportunity.organization.substring(0, 2).toUpperCase()}
            </span>
            <span className="truncate">{opportunity.organization}</span>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {opportunity.title}
          </h3>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {opportunity.summary}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {opportunity.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-slate-700/60"
            >
              {tag}
            </span>
          ))}
          {opportunity.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              +{opportunity.tags.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer / Financials & Action */}
      <div className={`mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 ${isList ? 'md:mt-0 md:pt-0 md:border-t-0 md:border-l md:pl-5 md:min-w-[220px] shrink-0' : ''}`}>
        <div className="flex items-baseline justify-between gap-2 mb-2.5">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 block">
              Award Value
            </span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {opportunity.amount.displayText}
            </span>
          </div>

          <DeadlineBadge deadline={opportunity.deadline} size="xs" />
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{opportunity.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(opportunity);
            }}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Opportunity
          </Button>
        </div>
      </div>
    </div>
  );
};
