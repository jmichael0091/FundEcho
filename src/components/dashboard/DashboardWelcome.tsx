import React from 'react';
import { 
  ArrowRight, 
  Sliders, 
  Sparkles,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, PageId } from '../../types';
import { Button } from '../ui/Button';

export interface DashboardWelcomeProps {
  user: UserProfile;
  completionPercentage: number;
  onNavigate: (page: PageId) => void;
}

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({
  user,
  completionPercentage,
  onNavigate,
}) => {
  // Determine time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user.name ? user.name.split(' ')[0] : 'Seeker';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md shadow-slate-200/40 dark:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-4 sm:gap-5">
        <div 
          className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl ${user.avatarBg || 'bg-indigo-600'} text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 select-none`}
        >
          {user.initials || 'UN'}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, {firstName}.
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3" />
              <span>Active Seeker</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here are your funding opportunities, active applications, and upcoming deadlines.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5 flex-wrap">
            <span className="font-medium">{user.email}</span>
            <span>•</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{user.country || 'Global'}</span>
            {user.applicantType && (
              <>
                <span>•</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{user.applicantType}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action CTAs */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('profile')}
          leftIcon={<Sliders className="w-3.5 h-3.5" />}
          id="welcome-edit-preferences-btn"
        >
          Edit Preferences
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onNavigate('opportunities')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          id="welcome-find-grants-btn"
        >
          Find Grants
        </Button>
      </div>
    </div>
  );
};
