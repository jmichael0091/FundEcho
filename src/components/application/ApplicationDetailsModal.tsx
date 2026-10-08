import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Trash2,
  ChevronRight,
  Shield,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  Send,
  RotateCcw,
  Check,
  AlertTriangle
} from 'lucide-react';
import { FirestoreApplication, ApplicationTrackerStatus } from '../../types/firebase';
import { getApplicationDeadlineAwareness } from '../../utils/deadlineUtils';

export interface ApplicationDetailsModalProps {
  isOpen: boolean;
  application: FirestoreApplication | null;
  onClose: () => void;
  onNavigateToOpportunity: (opportunityId: string) => void;
  onStatusChange: (applicationId: string, newStatus: ApplicationTrackerStatus) => Promise<void>;
  onNotesChange: (applicationId: string, notes: string) => Promise<void>;
  onOpenWorkspace?: (applicationId: string, opportunityId: string) => void;
  onDeleteApplication?: (applicationId: string) => Promise<void>;
}

const ALL_STATUSES: {
  status: ApplicationTrackerStatus;
  label: string;
  description: string;
  badgeClass: string;
  borderClass: string;
}[] = [
  {
    status: 'Planning',
    label: 'Planning',
    description: 'Initial review, researching eligibility, gathering initial guidelines.',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    borderClass: 'border-slate-300 dark:border-slate-700',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    description: 'Drafting proposal answers, compiling budgets, preparing attachments.',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    borderClass: 'border-blue-400 dark:border-blue-600',
  },
  {
    status: 'Submitted',
    label: 'Submitted',
    description: 'Official proposal delivered to funding organization.',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    borderClass: 'border-indigo-400 dark:border-indigo-600',
  },
  {
    status: 'Under Review',
    label: 'Under Review',
    description: 'Funder committee is evaluating your application proposal.',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    borderClass: 'border-amber-400 dark:border-amber-600',
  },
  {
    status: 'Approved',
    label: 'Approved',
    description: 'Funding grant awarded or selected for award disbursement.',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    borderClass: 'border-emerald-400 dark:border-emerald-600',
  },
  {
    status: 'Rejected',
    label: 'Rejected',
    description: 'Application was not selected for funding this cycle.',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    borderClass: 'border-rose-400 dark:border-rose-600',
  },
  {
    status: 'Withdrawn',
    label: 'Withdrawn',
    description: 'Application was voluntarily cancelled by the applicant.',
    badgeClass: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    borderClass: 'border-zinc-300 dark:border-zinc-700',
  },
];

const NOTE_TEMPLATES = [
  '📋 Documents still needed: ',
  '👤 Contact person: ',
  '❓ Questions to ask: ',
  '📝 Submission instructions: ',
  '⏰ Personal reminders: ',
];

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  application,
  onClose,
  onNavigateToOpportunity,
  onStatusChange,
  onNotesChange,
  onOpenWorkspace,
  onDeleteApplication,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // Sync state when application opens
  useEffect(() => {
    if (application) {
      setNotes(application.notes || '');
      setSaveSuccess(false);
      setConfirmDelete(false);
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const deadlineAwareness = getApplicationDeadlineAwareness(application.deadline);
  const currentStatusConfig = ALL_STATUSES.find((s) => s.status === application.status) || ALL_STATUSES[0];

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onNotesChange(application.id, notes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleInsertTemplate = (templateText: string) => {
    setNotes((prev) => {
      const separator = prev.trim() ? '\n' : '';
      return `${prev}${separator}${templateText}`;
    });
  };

  const handleStatusSelect = async (newStatus: ApplicationTrackerStatus) => {
    if (newStatus === application.status) return;
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(application.id, newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDateString = (dateStr?: string | null) => {
    if (!dateStr) return 'Not recorded';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="application-details-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="application-details-modal-container"
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Application Tracker
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentStatusConfig.badgeClass}`}>
                  {currentStatusConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected to Firestore &bull; Private to your account
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-application-details-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Opportunity Banner Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Target Opportunity
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {application.opportunityTitle}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{application.provider}</span>
                </div>
              </div>

              {/* Opportunity Link: navigates to the original opportunity */}
              <button
                type="button"
                id="view-original-opportunity-btn"
                onClick={() => {
                  onClose();
                  onNavigateToOpportunity(application.opportunityId);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-500 shadow-xs transition-all shrink-0 active:scale-98"
              >
                <span>View Opportunity Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Deadline Awareness Highlight */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">
                  Deadline: <strong>{deadlineAwareness.formattedDate}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">Deadline Status:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    deadlineAwareness.category === 'Passed'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      : deadlineAwareness.category === 'Due soon'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 animate-pulse'
                      : deadlineAwareness.category === 'Approaching'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  }`}
                >
                  {deadlineAwareness.category} ({deadlineAwareness.badgeLabel})
                </span>
              </div>
            </div>
          </div>

          {/* Section: Lifecycle Status Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Application Status
              </label>
              <span className="text-xs text-slate-400">
                Select to update status
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_STATUSES.map((item) => {
                const isSelected = application.status === item.status;
                return (
                  <button
                    key={item.status}
                    type="button"
                    id={`status-pill-${item.status.toLowerCase().replace(/\s+/g, '-')}`}
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusSelect(item.status)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs font-bold`
                        : `bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 opacity-80 hover:opacity-100`
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Status explanation notice */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              Note: Changing to <strong>Submitted</strong> records your official submission timestamp. Status is independent from opportunity status.
            </div>
          </div>

          {/* Section: Status-Appropriate Quick Actions */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Quick Actions
            </span>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {application.status === 'Planning' && (
                <button
                  type="button"
                  id="action-move-in-progress"
                  onClick={() => handleStatusSelect('In Progress')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Mark as In Progress
                </button>
              )}

              {(application.status === 'Planning' || application.status === 'In Progress') && (
                <button
                  type="button"
                  id="action-mark-submitted"
                  onClick={() => handleStatusSelect('Submitted')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Mark as Submitted
                </button>
              )}

              {application.status === 'Submitted' && (
                <button
                  type="button"
                  id="action-mark-under-review"
                  onClick={() => handleStatusSelect('Under Review')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs"
                >
                  Mark Under Review
                </button>
              )}

              {application.status === 'Under Review' && (
                <>
                  <button
                    type="button"
                    id="action-mark-approved"
                    onClick={() => handleStatusSelect('Approved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    Mark as Approved
                  </button>
                  <button
                    type="button"
                    id="action-mark-rejected"
                    onClick={() => handleStatusSelect('Rejected')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs"
                  >
                    Mark as Rejected
                  </button>
                </>
              )}

              {application.status !== 'Withdrawn' && application.status !== 'Approved' && (
                <button
                  type="button"
                  id="action-withdraw"
                  onClick={() => handleStatusSelect('Withdrawn')}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Withdraw Application
                </button>
              )}

              {application.status === 'Withdrawn' && (
                <button
                  type="button"
                  id="action-reopen"
                  onClick={() => handleStatusSelect('Planning')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Reopen Application
                </button>
              )}

              {onOpenWorkspace && (
                <button
                  type="button"
                  id="action-open-proposal-workspace"
                  onClick={() => {
                    onClose();
                    onOpenWorkspace(application.id, application.opportunityId);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition-colors"
                >
                  Open Proposal Workspace &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Section: Private Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Private Application Notes</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visible only to you. Store checklist items, contact persons, and submission reminders.
                </p>
              </div>

              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </div>

            {/* Quick insert helper chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1">Insert template:</span>
              {NOTE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`note-template-btn-${idx}`}
                  onClick={() => handleInsertTemplate(tmpl)}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {tmpl.split(':')[0]}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                id="application-private-notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Add private notes, required documents, key contacts, or personal checklist here..."
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {notes.length} characters &bull; Encrypted in Firestore under your UID
              </span>

              <button
                type="button"
                id="save-application-notes-btn"
                disabled={isSavingNotes}
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 active:scale-98"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>

          {/* Section: Tracking Lifecycle Timestamps */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
              Application Timeline & Audit
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 dark:text-slate-500">Started Date:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDateString(application.startedAt)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 dark:text-slate-500">Submitted Date:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {application.submittedAt ? formatDateString(application.submittedAt) : 'Not submitted yet'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 dark:text-slate-500">Last Updated:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDateString(application.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Delete Application (Optional Safeguard) */}
          {onDeleteApplication && (
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                    Are you sure? This removes tracking for this opportunity.
                  </span>
                  <button
                    type="button"
                    id="confirm-delete-application-btn"
                    onClick={async () => {
                      await onDeleteApplication(application.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="request-delete-application-btn"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove tracking for this application</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            id="modal-return-opportunity-btn"
            onClick={() => {
              onClose();
              onNavigateToOpportunity(application.opportunityId);
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Return to Opportunity</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            type="button"
            id="close-application-details-footer-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
