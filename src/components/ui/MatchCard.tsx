import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Bookmark, 
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Opportunity } from '../../types';
import { MatchResult } from '../../utils/matching';
import { Badge } from './Badge';
import { Button } from './Button';

export interface MatchCardProps {
  opportunity: Opportunity;
  match: MatchResult;
  onSelect: (opportunity: Opportunity) => void;
  isBookmarked?: boolean;
  onToggleBookmark: (opportunity: Opportunity) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  opportunity,
  match,
  onSelect,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

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

  const getScoreTheme = (score: number) => {
    if (score >= 90) return {
      badgeBg: 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-700 dark:border-indigo-400',
    };
    if (score >= 75) return {
      badgeBg: 'bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500',
    };
    if (score >= 60) return {
      badgeBg: 'bg-amber-500 dark:bg-amber-600 text-white border-amber-600 dark:border-amber-500',
    };
    return {
      badgeBg: 'bg-slate-600 text-white border-slate-700',
    };
  };

  const scoreTheme = getScoreTheme(match.matchScore);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(opportunity);
  };

  return (
    <div
      id={`match-card-${opportunity.id}`}
      className={`group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-md shadow-slate-200/50 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.36)] hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-[0_20px_35px_-5px_rgba(99,102,241,0.12)] hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-600/70 transition-all duration-200 flex flex-col justify-between relative overflow-hidden`}
    >
      {/* Top Banner: Match Score Header + Badges */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
          {/* Match Score Indicator */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-black text-sm sm:text-base ${scoreTheme.badgeBg}`}>
              <Sparkles className="w-4 h-4" />
              <span>{match.matchScore}% Match</span>
            </div>

            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{match.eligibilityStatus}</span>
          </div>

          {/* Quick Actions: Verified / Featured & Bookmark */}
          <div className="flex items-center gap-2 ml-auto">
            {opportunity.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Verified
              </span>
            )}

            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark opportunity'}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Opportunity Information */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Badge variant={getTypeBadgeVariant(opportunity.type)} size="sm">
              {opportunity.type}
            </Badge>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              {opportunity.organization}
            </span>
          </div>

          <h3 
            onClick={() => onSelect(opportunity)}
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer leading-snug"
          >
            {opportunity.title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {opportunity.summary}
          </p>
        </div>

        {/* Opportunity Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 text-xs border-y border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">Funding</span>
            <p className="font-bold text-emerald-700 dark:text-emerald-400 truncate">
              {opportunity.amount.displayText}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">Deadline</span>
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {opportunity.deadline}
            </p>
          </div>

          <div className="space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400">Region</span>
            <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
              {opportunity.location}
            </p>
          </div>
        </div>

        {/* Expandable Match Criteria Breakdown */}
        {match.reasons && match.reasons.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>{showBreakdown ? 'Hide reasons' : 'Why this score?'}</span>
              {showBreakdown ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {showBreakdown && (
              <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs animate-in fade-in duration-150">
                <ul className="space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-300">
                  {match.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  {match.warnings.map((w, i) => <li key={'w'+i} className="text-rose-600 dark:text-rose-400">{w}</li>)}
                </ul>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    Match score indicates relevance, not guaranteed eligibility.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Action Buttons */}
      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{opportunity.daysLeft} days remaining</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelect(opportunity)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Opportunity
          </Button>
        </div>
      </div>
    </div>
  );
};
