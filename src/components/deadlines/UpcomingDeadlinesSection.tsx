import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Bell, 
  ArrowRight, 
  Bookmark, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { Opportunity, PageId } from '../../types';
import { TrackedOpportunityDeadline, ReminderOption } from '../../types/notification';
import { calculateDeadlineStatus, formatDeadlineDate } from '../../utils/deadlineUtils';
import { Button } from '../ui/Button';
import { DeadlineBadge } from './DeadlineBadge';
import { DeadlineReminderModal } from './DeadlineReminderModal';

export interface UpcomingDeadlinesSectionProps {
  allOpportunities: Opportunity[];
  trackedDeadlines: TrackedOpportunityDeadline[];
  savedOpportunityIds: Set<string>;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onNavigate: (page: PageId) => void;
  onStartApplication?: (opportunity: Opportunity) => void;
  onTrackedDeadlinesChanged?: () => void;
}

export const UpcomingDeadlinesSection: React.FC<UpcomingDeadlinesSectionProps> = ({
  allOpportunities,
  trackedDeadlines,
  savedOpportunityIds,
  onSelectOpportunity,
  onNavigate,
  onStartApplication,
  onTrackedDeadlinesChanged,
}) => {
  const [selectedOpportunityForReminder, setSelectedOpportunityForReminder] = useState<Opportunity | null>(null);
  const [filterView, setFilterView] = useState<'all' | 'urgent' | 'this_month'>('all');

  // Combine tracked deadlines with saved items (if not already tracked)
  // Ensure we sort strictly by NEAREST DEADLINE FIRST
  const trackedMap = new Map<string, TrackedOpportunityDeadline>(
    trackedDeadlines.map((t) => [t.opportunityId, t])
  );

  // Items to display: either tracked or bookmarked
  const itemsToDisplay = allOpportunities
    .filter((opp) => trackedMap.has(opp.id) || savedOpportunityIds.has(opp.id))
    .map((opp) => {
      const tracked = trackedMap.get(opp.id);
      const deadlineStatus = calculateDeadlineStatus(opp.deadline);
      return {
        opportunity: opp,
        tracked,
        deadlineStatus,
        isExplicitlyTracked: Boolean(tracked),
      };
    })
    // Sort strictly by nearest deadline first:
    // (active deadlines with smallest daysRemaining first, then expired at bottom)
    .sort((a, b) => {
      // If one is past and one is not, non-past comes first
      if (a.deadlineStatus.isPast && !b.deadlineStatus.isPast) return 1;
      if (!a.deadlineStatus.isPast && b.deadlineStatus.isPast) return -1;
      return a.deadlineStatus.daysRemaining - b.deadlineStatus.daysRemaining;
    });

  // Filter based on selected view tab
  const filteredItems = itemsToDisplay.filter((item) => {
    if (filterView === 'urgent') {
      return item.deadlineStatus.daysRemaining <= 7 && !item.deadlineStatus.isPast;
    }
    if (filterView === 'this_month') {
      return item.deadlineStatus.daysRemaining <= 30 && !item.deadlineStatus.isPast;
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.36)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Upcoming Deadlines & Milestones
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {filteredItems.length} Tracked
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoring submission countdowns and active reminder schedules, sorted by nearest closing date.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterView('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterView === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Tracked
          </button>
          <button
            type="button"
            onClick={() => setFilterView('urgent')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterView === 'urgent'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ≤ 7 Days
          </button>
          <button
            type="button"
            onClick={() => setFilterView('this_month')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterView === 'this_month'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ≤ 30 Days
          </button>
        </div>
      </div>

      {/* Deadlines Content */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-10 space-y-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800 p-6">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              No upcoming deadlines in this view
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save or track opportunities to monitor submission dates and receive custom 7d, 3d, and 1d notifications.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('opportunities')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Browse Opportunities
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredItems.map(({ opportunity, tracked, deadlineStatus, isExplicitlyTracked }) => (
            <div
              key={opportunity.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                deadlineStatus.isToday
                  ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-xs'
                  : deadlineStatus.urgencyStatus === 'closing_soon'
                  ? 'bg-amber-50/40 dark:bg-amber-950/30 border-amber-200/90 dark:border-amber-900/60'
                  : 'bg-slate-50/60 dark:bg-slate-850/60 border-slate-200/90 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {/* Left Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DeadlineBadge deadline={opportunity.deadline} size="xs" />

                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {opportunity.organization}
                  </span>

                  {isExplicitlyTracked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Bell className="w-2.5 h-2.5" />
                      Alerts Active ({tracked?.reminderDays?.join(', ')}d)
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => onSelectOpportunity(opportunity)}
                  className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1"
                >
                  {opportunity.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {opportunity.amount.displayText}
                  </span>
                  <span>•</span>
                  <span>
                    Deadline: <strong className="text-slate-800 dark:text-slate-200">{formatDeadlineDate(opportunity.deadline)}</strong>
                  </span>
                  {tracked?.notes && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 italic">"{tracked.notes}"</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
                {/* Reminder Settings Trigger Button */}
                <button
                  type="button"
                  onClick={() => setSelectedOpportunityForReminder(opportunity)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    isExplicitlyTracked
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isExplicitlyTracked ? 'Edit reminder offsets' : 'Set custom reminder'}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isExplicitlyTracked ? 'Edit Reminder' : 'Set Reminder'}</span>
                </button>

                {/* Quick View Button */}
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onSelectOpportunity(opportunity)}
                >
                  Quick View
                </Button>

                {/* Application Workspace Button */}
                {onStartApplication && (
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => onStartApplication(opportunity)}
                    rightIcon={<ArrowRight className="w-3 h-3" />}
                  >
                    Draft Proposal
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminder Config Modal */}
      {selectedOpportunityForReminder && (
        <DeadlineReminderModal
          isOpen={Boolean(selectedOpportunityForReminder)}
          onClose={() => setSelectedOpportunityForReminder(null)}
          opportunity={selectedOpportunityForReminder}
          onReminderSaved={() => {
            if (onTrackedDeadlinesChanged) onTrackedDeadlinesChanged();
          }}
        />
      )}
    </div>
  );
};
