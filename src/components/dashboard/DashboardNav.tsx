import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Bookmark, 
  Clock, 
  FileText, 
  User, 
  Settings,
  ChevronRight,
  Coins
} from 'lucide-react';
import { PageId } from '../../types';

export type DashboardTabId = 
  | 'overview' 
  | 'recommended' 
  | 'saved' 
  | 'deadlines' 
  | 'applications'
  | 'billing';

export interface DashboardNavProps {
  activeTab: DashboardTabId;
  onSelectTab: (tab: DashboardTabId) => void;
  onNavigate: (page: PageId) => void;
  counts: {
    recommended: number;
    saved: number;
    deadlines: number;
    applications: number;
  };
}

export const DashboardNav: React.FC<DashboardNavProps> = ({
  activeTab,
  onSelectTab,
  onNavigate,
  counts,
}) => {
  const navItems = [
    {
      id: 'overview' as DashboardTabId,
      label: 'Overview',
      icon: LayoutDashboard,
      count: null,
      type: 'tab',
    },
    {
      id: 'recommended' as DashboardTabId,
      label: 'Recommended',
      icon: Sparkles,
      count: counts.recommended,
      type: 'tab',
    },
    {
      id: 'saved' as DashboardTabId,
      label: 'Saved',
      icon: Bookmark,
      count: counts.saved,
      type: 'tab',
    },
    {
      id: 'deadlines' as DashboardTabId,
      label: 'Deadlines',
      icon: Clock,
      count: counts.deadlines,
      type: 'tab',
    },
    {
      id: 'applications' as DashboardTabId,
      label: 'Applications',
      icon: FileText,
      count: counts.applications,
      type: 'tab',
    },
    {
      id: 'billing' as DashboardTabId,
      label: 'Billing & Credits',
      icon: Coins,
      count: null,
      type: 'tab',
    },
  ];

  return (
    <div>
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-6 sticky top-24">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Dashboard Hub
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`dashboard-nav-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== null && item.count > 0 && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-700/80 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ACCOUNT LINKS */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Account & Preferences
          </p>
          <button
            type="button"
            id="dashboard-nav-profile"
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
              <span>Profile</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            id="dashboard-nav-settings"
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
              <span>Settings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET HORIZONTAL NAVIGATION TABS */}
      <div className="lg:hidden w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-1.5 shadow-sm overflow-x-auto no-scrollbar mb-6">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`mobile-dashboard-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

          <button
            type="button"
            id="mobile-dashboard-nav-profile"
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            id="mobile-dashboard-nav-settings"
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
