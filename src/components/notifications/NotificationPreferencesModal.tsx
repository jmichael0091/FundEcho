import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Clock, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { NotificationPreferences, ReminderOption, DEFAULT_NOTIFICATION_PREFERENCES } from '../../types/notification';
import {
  getUserNotificationPreferences,
  saveUserNotificationPreferences,
} from '../../services/firebase/notificationService';
import { Button } from '../ui/Button';

export interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onPreferencesUpdated?: (preferences: NotificationPreferences) => void;
}

const AVAILABLE_REMINDER_OFFSETS: { value: ReminderOption; label: string }[] = [
  { value: 14, label: '14 days before' },
  { value: 7, label: '7 days before' },
  { value: 3, label: '3 days before' },
  { value: 1, label: '1 day before' },
  { value: 0, label: 'On deadline day' },
];

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  userId,
  onPreferencesUpdated,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getUserNotificationPreferences(userId).then((prefs) => {
        setPreferences(prefs);
      });
      setSavedSuccess(false);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const toggleOffset = (offset: ReminderOption) => {
    setPreferences((prev) => {
      const current = prev.defaultReminderOffsets || [14, 7, 3, 1, 0];
      const next = current.includes(offset)
        ? current.filter((o) => o !== offset)
        : [...current, offset].sort((a, b) => b - a);

      return {
        ...prev,
        defaultReminderOffsets: next,
      };
    });
  };

  const handleSave = async () => {
    await saveUserNotificationPreferences(userId, preferences);
    setSavedSuccess(true);
    if (onPreferencesUpdated) {
      onPreferencesUpdated(preferences);
    }
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/80 dark:border-indigo-800/80 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Notification Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control in-app alerts, deadline triggers, and proposal reminders.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Toggles List */}
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
                    Receive alert badges and notifications before tracked grant deadlines close.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={preferences.deadlineReminders}
                onChange={(e) => setPreferences((p) => ({ ...p, deadlineReminders: e.target.checked }))}
                className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
              />
            </div>

            {/* Default offsets sub-panel */}
            {preferences.deadlineReminders && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  Default reminder intervals for newly saved opportunities:
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
                  Application Draft Reminders
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Notify when you have unfinished proposals saved in the AI Workspace.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={preferences.applicationDraftReminders}
              onChange={(e) => setPreferences((p) => ({ ...p, applicationDraftReminders: e.target.checked }))}
              className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
            />
          </div>

          {/* 3. Recommended Opportunities */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                  New Recommended Opportunities
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Alerts when newly indexed grants or fellowships match your profile.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={preferences.recommendedOpportunities}
              onChange={(e) => setPreferences((p) => ({ ...p, recommendedOpportunities: e.target.checked }))}
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
                  Funder & Deadline Updates
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Notify if guidelines or deadlines change for opportunities you follow.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={preferences.opportunityUpdates}
              onChange={(e) => setPreferences((p) => ({ ...p, opportunityUpdates: e.target.checked }))}
              className="h-5 w-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
            />
          </div>
        </div>

        {/* Disclaimer on Local State */}
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
          <strong>Note:</strong> Alerts are delivered in-app in real-time via the FundEcho Notification Center. Real email/SMS relay services are not active in this preview.
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={savedSuccess ? <Check className="w-3.5 h-3.5" /> : undefined}
          >
            {savedSuccess ? 'Preferences Saved!' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
};
