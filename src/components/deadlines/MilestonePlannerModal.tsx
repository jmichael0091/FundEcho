import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Download, 
  Sparkles, 
  Clock, 
  CalendarPlus, 
  Building2, 
  Check, 
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { Opportunity } from '../../types';
import { PrepMilestone } from '../../types/calendar';
import { 
  generateMilestonePlan, 
  generateGoogleCalendarUrl, 
  generateICSContent, 
  downloadICSFile 
} from '../../utils/calendarExportUtils';
import { calculateDeadlineStatus } from '../../utils/deadlineUtils';

interface MilestonePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  onNavigateToWorkspace?: () => void;
}

export const MilestonePlannerModal: React.FC<MilestonePlannerModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onNavigateToWorkspace,
}) => {
  const [milestones, setMilestones] = useState<PrepMilestone[]>(() => 
    generateMilestonePlan(opportunity.deadline, opportunity.id)
  );
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomDays, setNewCustomDays] = useState('10');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const deadlineStatus = calculateDeadlineStatus(opportunity.deadline);

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isCompleted: !m.isCompleted } : m))
    );
  };

  const deleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomLabel.trim()) return;

    const days = parseInt(newCustomDays, 10) || 5;
    const deadlineDate = new Date(opportunity.deadline);
    const target = new Date(deadlineDate);
    target.setDate(target.getDate() - days);

    const newM: PrepMilestone = {
      id: `${opportunity.id}-custom-${Date.now()}`,
      opportunityId: opportunity.id,
      daysBeforeDeadline: days,
      label: newCustomLabel.trim(),
      targetDate: target.toISOString().split('T')[0],
      description: 'Custom applicant-defined preparation task.',
      isCompleted: false,
      category: 'planning',
    };

    setMilestones((prev) => [...prev, newM].sort((a, b) => b.daysBeforeDeadline - a.daysBeforeDeadline));
    setNewCustomLabel('');
  };

  const handleDownloadICS = () => {
    const icsString = generateICSContent([opportunity]);
    downloadICSFile(`FundEcho_Deadlines_${opportunity.slug || opportunity.id}.ics`, icsString);
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(opportunity);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-modal-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Milestone Planner & Countdown
              </span>
              <h2 id="milestone-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-md">
                {opportunity.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Summary Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-slate-900 dark:text-white">{opportunity.organization}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-300">Award: {opportunity.amount?.displayText}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Official Submission Deadline: <strong className="text-slate-900 dark:text-white">{opportunity.deadline}</strong> ({deadlineStatus.badgeText})
              </p>
            </div>

            {/* Quick Export Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={handleGoogleCalendar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold hover:bg-indigo-50 dark:hover:bg-slate-750 transition-colors shadow-2xs text-[11px]"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Google Cal</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadICS}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>iCal (.ics)</span>
              </button>
            </div>
          </div>

          {/* Readiness Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400">
                Milestone Preparation Progress
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {completedCount} of {milestones.length} Done ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Milestones Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recommended Timeline Milestones (Working Backwards)
            </h3>

            <div className="space-y-2.5">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    m.isCompleted
                      ? 'bg-slate-50/70 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-80'
                      : 'bg-white dark:bg-slate-850 border-slate-200/90 dark:border-slate-750 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-label="Toggle completed"
                      className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0"
                    >
                      {m.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs sm:text-sm font-bold ${
                          m.isCompleted 
                            ? 'line-through text-slate-400 dark:text-slate-500' 
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {m.label}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {m.daysBeforeDeadline === 0 ? 'Deadline Day' : `T - ${m.daysBeforeDeadline} days`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {m.targetDate}
                    </span>
                    {m.id.includes('custom') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMilestone(m.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Custom Milestone Form */}
          <form onSubmit={handleAddCustom} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Add Custom Preparation Milestone
            </span>
            <div className="flex items-center gap-2 flex-col sm:flex-row">
              <input
                type="text"
                value={newCustomLabel}
                onChange={(e) => setNewCustomLabel(e.target.value)}
                placeholder="e.g., Board of Directors Sign-Off Meeting"
                className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <select
                  value={newCustomDays}
                  onChange={(e) => setNewCustomDays(e.target.value)}
                  className="text-xs px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300"
                >
                  <option value="45">T - 45 days</option>
                  <option value="30">T - 30 days</option>
                  <option value="20">T - 20 days</option>
                  <option value="14">T - 14 days</option>
                  <option value="7">T - 7 days</option>
                  <option value="3">T - 3 days</option>
                  <option value="1">T - 1 day</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Milestones adjust automatically based on the official closing cutoff.
          </span>

          <div className="flex items-center gap-2">
            {onNavigateToWorkspace && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToWorkspace();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Open Application Workspace</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
