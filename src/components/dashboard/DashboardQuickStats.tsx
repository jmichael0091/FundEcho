import React from 'react';
import { 
  Bookmark, 
  Sparkles, 
  Clock, 
  FileText, 
  ChevronRight 
} from 'lucide-react';
import { DashboardTabId } from './DashboardNav';

export interface DashboardQuickStatsProps {
  savedCount: number;
  recommendedCount: number;
  urgentDeadlinesCount: number;
  applicationsInProgressCount: number;
  onSelectTab: (tab: DashboardTabId) => void;
}

export const DashboardQuickStats: React.FC<DashboardQuickStatsProps> = ({
  savedCount,
  recommendedCount,
  urgentDeadlinesCount,
  applicationsInProgressCount,
  onSelectTab,
}) => {
  const statCards = [
    {
      id: 'saved' as DashboardTabId,
      title: 'Saved Opportunities',
      count: savedCount,
      subtitle: savedCount === 1 ? '1 opportunity' : `${savedCount} saved`,
      icon: Bookmark,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
      actionText: 'View saved',
    },
    {
      id: 'recommended' as DashboardTabId,
      title: 'Recommended Opportunities',
      count: recommendedCount,
      subtitle: recommendedCount === 1 ? '1 curated match' : `${recommendedCount} matches`,
      icon: Sparkles,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
      actionText: 'View matches',
    },
    {
      id: 'deadlines' as DashboardTabId,
      title: 'Upcoming Deadlines',
      count: urgentDeadlinesCount,
      subtitle: urgentDeadlinesCount === 0 ? 'No urgent dates' : 'Closing soon',
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
      actionText: 'Check countdowns',
    },
    {
      id: 'applications' as DashboardTabId,
      title: 'Applications in Progress',
      count: applicationsInProgressCount,
      subtitle: applicationsInProgressCount === 1 ? '1 active draft' : `${applicationsInProgressCount} drafts`,
      icon: FileText,
      iconBg: 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400',
      actionText: 'Continue writing',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={`stat-card-${card.id}`}
            onClick={() => onSelectTab(card.id)}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {card.count}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {card.subtitle}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <span>{card.actionText}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
