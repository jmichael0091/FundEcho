import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Sliders,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { NotificationPreferences, ReminderOption, DEFAULT_NOTIFICATION_PREFERENCES } from '../../types/notification';
import { getNotificationPreferences, saveNotificationPreferences } from '../../utils/notificationService';
import { Button } from '../ui/Button';

export interface NotificationPreferencesSectionProps {
  onPreferencesUpdated?: (preferences: NotificationPreferences) => void;
}

const AVAILABLE_REMINDER_OFFSETS: { value: ReminderOption; label: string }[] = [
  { value: 7, label: '7 days before' },
  { value: 3, label: '3 days before' },
  { value: 1, label: '1 day before' },
  { value: 0, label: 'On deadline day' },
];

export const NotificationPreferencesSection: React.FC<NotificationPreferencesSectionProps> = ({
  onPreferencesUpdated,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setPreferences(getNotificationPreferences());
  }, []);

  const toggleOffset = (offset: ReminderOption) => {
    setPreferences((prev) => {
      const current = prev.defaultReminderOffsets || [7, 3, 1];
      const next = current.includes(offset)
        ? current.filter((o) => o !== offset)
        : [...current, offset].sort((a, b) => b - a);

      const updated = {
        ...prev,
        defaultReminderOffsets: next,
      };
      saveNotificationPreferences(updated);
      if (onPreferencesUpdated) onPreferencesUpdated(updated);
      return updated;
    });
  };

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = {
      ...preferences,
      [key]: value,
    };
    setPreferences(updated);
    saveNotificationPreferences(updated);
    if (onPreferencesUpdated) onPreferencesUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-md shadow-slate-200/40 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Notification & Deadline Alert Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize alerts for approaching deadlines, application drafts, and opportunity updates.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* 1. Deadline Reminders */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  Opportunity Deadline Reminders
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive alert badges and in-app notifications before tracked deadlines expire.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={preferences.deadlineReminders}
              onChange={(e) => handleToggle('deadlineReminders', e.target.checked)}
              className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
            />
          </div>

          {preferences.deadlineReminders && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Default notification intervals when saving new opportunities:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_REMINDER_OFFSETS.map((item) => {
                  const isSelected = preferences.defaultReminderOffsets.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleOffset(item.value)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Application Draft Reminders */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                Application & Proposal Draft Reminders
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Alerts to resume unfinished proposal drafts in the AI Application Workspace.
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={preferences.applicationDraftReminders}
            onChange={(e) => handleToggle('applicationDraftReminders', e.target.checked)}
            className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
          />
        </div>

        {/* 3. New Recommendations */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                Recommended Opportunities Alerts
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive notifications when new grants matching your profile and country are published.
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={preferences.recommendedOpportunities}
            onChange={(e) => handleToggle('recommendedOpportunities', e.target.checked)}
            className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
          />
        </div>

        {/* 4. Opportunity & Provider Updates */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                Funder & Guideline Change Alerts
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Get alerted when grant providers update eligibility rules or deadlines.
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={preferences.opportunityUpdates}
            onChange={(e) => handleToggle('opportunityUpdates', e.target.checked)}
            className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
