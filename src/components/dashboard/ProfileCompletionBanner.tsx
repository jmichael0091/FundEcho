import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageId } from '../../types';
import { Button } from '../ui/Button';

export interface ProfileCompletionBannerProps {
  completionPercentage: number;
  onNavigate: (page: PageId) => void;
}

export const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({
  completionPercentage,
  onNavigate,
}) => {
  // Only display if profile is not 100% complete
  if (completionPercentage >= 100) return null;

  return (
    <div 
      id="profile-completion-prompt-banner"
      className="bg-gradient-to-r from-indigo-50/90 via-slate-50 to-indigo-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Complete your profile to improve your recommendations.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-48 max-w-[60vw] bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
            {completionPercentage}% Complete
          </span>
        </div>
      </div>

      <Button
        id="dashboard-complete-profile-btn"
        variant="primary"
        size="sm"
        onClick={() => onNavigate('profile')}
        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        className="shrink-0 self-end sm:self-center"
      >
        Complete Profile
      </Button>
    </div>
  );
};
