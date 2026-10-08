import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  Check, 
  Trash2, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Info,
  CalendarCheck
} from 'lucide-react';
import { Opportunity } from '../../types';
import { ReminderOption, TrackedOpportunityDeadline } from '../../types/notification';
import { 
  getTrackedDeadlineForOpportunity, 
  saveTrackedDeadline, 
  removeTrackedDeadline 
} from '../../utils/reminderStorage';
import { 
  calculateDeadlineStatus, 
  getReminderTriggerSchedule, 
  formatDeadlineDate 
} from '../../utils/deadlineUtils';
import { Button } from '../ui/Button';
import { DeadlineBadge } from './DeadlineBadge';

export interface DeadlineReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  onReminderSaved?: (tracked: TrackedOpportunityDeadline | null) => void;
}

const AVAILABLE_OFFSETS: { value: ReminderOption; label: string; description: string }[] = [
  { value: 7, label: '7 days before', description: 'Early planning & proposal drafting reminder' },
  { value: 3, label: '3 days before', description: 'Document review & final sign-off alert' },
  { value: 1, label: '1 day before', description: 'Urgent final submission alert' },
  { value: 0, label: 'On deadline day', description: 'Final day closing alert' },
];

export const DeadlineReminderModal: React.FC<DeadlineReminderModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onReminderSaved,
}) => {
  const [selectedOffsets, setSelectedOffsets] = useState<ReminderOption[]>([7, 3, 1]);
  const [isSavedTracked, setIsSavedTracked] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  useEffect(() => {
    if (opportunity && isOpen) {
      const existing = getTrackedDeadlineForOpportunity(opportunity.id);
      if (existing) {
        setSelectedOffsets(existing.reminderDays || [7, 3, 1]);
        setCustomNotes(existing.notes || '');
        setIsSavedTracked(true);
      } else {
        setSelectedOffsets([7, 3, 1]);
        setCustomNotes('');
        setIsSavedTracked(false);
      }
      setSaveSuccessMsg(false);
    }
  }, [opportunity, isOpen]);

  if (!isOpen || !opportunity) return null;

  const deadlineStatus = calculateDeadlineStatus(opportunity.deadline);
  const schedule = getReminderTriggerSchedule(opportunity.deadline, selectedOffsets);

  const toggleOffset = (offset: ReminderOption) => {
    setSelectedOffsets((prev) => {
      if (prev.includes(offset)) {
        return prev.filter((o) => o !== offset);
      } else {
        return [...prev, offset].sort((a, b) => b - a);
      }
    });
  };

  const handleSave = () => {
    if (!opportunity) return;

    if (selectedOffsets.length === 0) {
      // If no offsets selected, treat as removal
      removeTrackedDeadline(opportunity.id);
      setIsSavedTracked(false);
      if (onReminderSaved) onReminderSaved(null);
      onClose();
      return;
    }

    const tracked: TrackedOpportunityDeadline = {
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      opportunityOrganization: opportunity.organization,
      opportunitySlug: opportunity.slug,
      opportunityAmount: {
        displayText: opportunity.amount.displayText,
        max: opportunity.amount.max,
        currency: opportunity.amount.currency,
      },
      deadline: opportunity.deadline,
      reminderDays: selectedOffsets,
      createdAt: new Date().toISOString(),
      notes: customNotes.trim() || undefined,
    };

    saveTrackedDeadline(tracked);
    setIsSavedTracked(true);
    setSaveSuccessMsg(true);

    if (onReminderSaved) {
      onReminderSaved(tracked);
    }

    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleRemove = () => {
    if (!opportunity) return;
    removeTrackedDeadline(opportunity.id);
    setIsSavedTracked(false);
    if (onReminderSaved) {
      onReminderSaved(null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/80 dark:border-amber-800/80 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isSavedTracked ? 'Edit Deadline Reminders' : 'Track Opportunity Deadline'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive in-app alerts and notifications before submission closes.
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

        {/* Opportunity Card Preview */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              {opportunity.organization}
            </span>
            <DeadlineBadge deadline={opportunity.deadline} size="xs" />
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
            {opportunity.title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Deadline: <strong className="text-slate-900 dark:text-white ml-0.5">{formatDeadlineDate(opportunity.deadline)}</strong>
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {opportunity.amount.displayText}
            </span>
          </div>
        </div>

        {/* Reminder Offsets Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Reminder Frequency & Alerts
            </label>
            <span className="text-[11px] text-slate-400">
              Select one or more triggers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AVAILABLE_OFFSETS.map((item) => {
              const isSelected = selectedOffsets.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleOffset(item.value)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold block ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                      {item.description}
                    </span>
                  </div>

                  <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculated Trigger Schedule */}
        {schedule.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Scheduled In-App Alert Dates
            </span>
            <div className="space-y-1">
              {schedule.map((sch, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-medium text-slate-600 dark:text-slate-400">{sch.label}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{sch.dateDisplay}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Personal Notes & Submission Reminders (Optional)
          </label>
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="e.g. Need to request dean's letter by Sep 10"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {isSavedTracked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Stop Tracking
            </Button>
          ) : (
            <span className="text-xs text-slate-400">
              Notification Center alerts enabled
            </span>
          )}

          <div className="flex items-center gap-2">
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
              leftIcon={saveSuccessMsg ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            >
              {saveSuccessMsg 
                ? 'Saved!' 
                : isSavedTracked 
                ? 'Update Reminders' 
                : 'Track Deadline'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
