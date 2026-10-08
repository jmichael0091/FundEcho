import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Send,
  Building2,
  DollarSign,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { FirestoreApplication, ApplicationTrackerStatus } from '../../types/firebase';
import { ApplicationReadinessResult } from '../../services/firebase/applicationService';
import { calculateOpportunityMatch } from '../../services/matching/matchingEngine';
import { useAuth } from '../../context/AuthContext';

interface WorkspaceOverviewTabProps {
  application: FirestoreApplication;
  opportunity: any;
  readiness: ApplicationReadinessResult;
  onNavigateTab: (tabId: 'overview' | 'requirements' | 'documents' | 'responses' | 'notes') => void;
  onUpdateStatus: (newStatus: ApplicationTrackerStatus) => void;
  onOpenDeadlineReminder: () => void;
  onOpenWizard: () => void;
}

export const WorkspaceOverviewTab: React.FC<WorkspaceOverviewTabProps> = ({
  application,
  opportunity,
  readiness,
  onNavigateTab,
  onUpdateStatus,
  onOpenDeadlineReminder,
  onOpenWizard,
}) => {
  const { user } = useAuth();

  // Match score calculation from Step 24 engine
  const matchResult = opportunity ? calculateOpportunityMatch(user, opportunity) : null;

  // Deadline calculation
  const deadlineStr = application.deadline || opportunity?.deadline;
  let daysRemaining: number | null = null;
  let isUrgent = false;

  if (deadlineStr && deadlineStr !== 'Rolling / Ongoing' && deadlineStr !== 'Ongoing') {
    const deadlineDate = new Date(deadlineStr);
    if (!isNaN(deadlineDate.getTime())) {
      const diffMs = deadlineDate.getTime() - Date.now();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isUrgent = daysRemaining <= 14 && daysRemaining >= 0;
    }
  }

  const getFundingDisplay = (opp: any): string => {
    if (!opp) return 'Funding Available';
    if (typeof opp.amount === 'string') return opp.amount;
    if (typeof opp.amount === 'number') return `${opp.currency || '$'}${opp.amount.toLocaleString()}`;
    if (opp.amount && typeof opp.amount === 'object') {
      if (opp.amount.displayText) return opp.amount.displayText;
      if (typeof opp.amount.max === 'number') {
        return `${opp.amount.currency || opp.currency || '$'}${opp.amount.max.toLocaleString()}`;
      }
      if (typeof opp.amount.min === 'number') {
        return `${opp.amount.currency || opp.currency || '$'}${opp.amount.min.toLocaleString()}`;
      }
    }
    return opp.amountDisplayText || 'Funding Available';
  };

  const statuses: ApplicationTrackerStatus[] = [
    'Planning',
    'In Progress',
    'Submitted',
    'Under Review',
    'Approved',
    'Rejected',
    'Withdrawn',
  ];

  return (
    <div className="space-y-6">
      {/* Deadline Urgency Banner */}
      {deadlineStr && (
        <div
          id="workspace-deadline-banner"
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isUrgent
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
              : daysRemaining !== null && daysRemaining < 0
              ? 'bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-200'
              : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40 text-indigo-950 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                isUrgent
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : daysRemaining !== null && daysRemaining < 0
                  ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                  : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
              }`}
            >
              {isUrgent ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span>Application Deadline: {deadlineStr}</span>
                {daysRemaining !== null && daysRemaining >= 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isUrgent
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200'
                    }`}
                  >
                    {daysRemaining === 0 ? 'Due Today' : `${daysRemaining} days remaining`}
                  </span>
                )}
                {daysRemaining !== null && daysRemaining < 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
                    Deadline Passed
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {isUrgent
                  ? 'High priority: Submit your documents and review checklist before the submission portal closes.'
                  : 'Maintain steady preparation to allow sufficient time for final internal review.'}
              </p>
            </div>
          </div>

          <button
            id="workspace-set-reminder-btn"
            onClick={onOpenDeadlineReminder}
            className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Set Calendar Reminder
          </button>
        </div>
      )}

      {/* Grid: Readiness & Opportunity Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Readiness Command Center (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Readiness Gauge Card */}
          <div
            id="workspace-readiness-card"
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Application Readiness
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${readiness.badgeBg} ${readiness.badgeText}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {readiness.label}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Overall Preparation Progress
                </h3>
              </div>
              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  {readiness.score}%
                </span>
                <p className="text-[11px] text-slate-500">Readiness Score</p>
              </div>
            </div>

            {/* Progress Bar with 3 segments */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-5">
              <div
                className={`h-full bg-gradient-to-r ${readiness.color} transition-all duration-500 ease-out`}
                style={{ width: `${Math.max(readiness.score, 4)}%` }}
              />
            </div>

            {/* 3 Pillar Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {/* Checklist */}
              <button
                id="workspace-nav-requirements-card"
                onClick={() => onNavigateTab('requirements')}
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-left hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Checklist
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-base">
                  {readiness.checklistCompleted} / {readiness.checklistTotal}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {readiness.checklistTotal > 0
                    ? `${Math.round((readiness.checklistCompleted / readiness.checklistTotal) * 100)}% requirements met`
                    : 'No items yet'}
                </div>
              </button>

              {/* Documents */}
              <button
                id="workspace-nav-documents-card"
                onClick={() => onNavigateTab('documents')}
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-left hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                    Documents
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-base">
                  {readiness.documentsReadyOrUploaded} / {readiness.documentsTotal}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {readiness.documentsTotal > 0
                    ? `${Math.round((readiness.documentsReadyOrUploaded / readiness.documentsTotal) * 100)}% ready / uploaded`
                    : 'No documents needed'}
                </div>
              </button>

              {/* Responses */}
              <button
                id="workspace-nav-responses-card"
                onClick={() => onNavigateTab('responses')}
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-left hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                    Responses
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-base">
                  {readiness.responsesAnswered} / {readiness.responsesTotal}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {readiness.responsesTotal > 0
                    ? `${Math.round((readiness.responsesAnswered / readiness.responsesTotal) * 100)}% questions drafted`
                    : 'No questions'}
                </div>
              </button>
            </div>

            {/* Next Recommended Step */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-indigo-950 dark:text-indigo-200">
                    Recommended Next Action:{' '}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{readiness.nextAction}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (readiness.checklistCompleted < readiness.checklistTotal) {
                    onNavigateTab('requirements');
                  } else if (readiness.documentsReadyOrUploaded < readiness.documentsTotal) {
                    onNavigateTab('documents');
                  } else {
                    onNavigateTab('responses');
                  }
                }}
                className="shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Continue <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Application Status Controller */}
          <div
            id="workspace-status-card"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
          >
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500" />
              Application Lifecycle Status
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Update the current status of this funding application as you progress through submission and review.
            </p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => {
                const isActive = application.status === s;
                return (
                  <button
                    key={s}
                    id={`workspace-status-btn-${s.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onUpdateStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Opportunity Context & Matching (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Opportunity Details Card */}
          <div
            id="workspace-opportunity-card"
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              Opportunity Context
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {opportunity?.title || application.opportunityTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Offered by {opportunity?.provider || opportunity?.organization || application.provider}
            </p>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
              {opportunity?.amount && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Funding Value:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {getFundingDisplay(opportunity)}
                  </span>
                </div>
              )}
              {opportunity?.fundingType && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Grant Type:</span>
                  <span className="font-medium">{opportunity.fundingType}</span>
                </div>
              )}
              {opportunity?.category && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium">{opportunity.category}</span>
                </div>
              )}
              {opportunity?.targetAudience && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Audience:</span>
                  <span className="font-medium">{opportunity.targetAudience}</span>
                </div>
              )}
              {opportunity?.officialUrl && (
                <div className="pt-2">
                  <a
                    href={opportunity.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Official Portal Guidelines <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Step 24 Match Score Insights */}
          {matchResult && (
            <div
              id="workspace-match-insight-card"
              className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/30 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Profile Match Analysis
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white">
                  {matchResult.matchScore}% Match
                </span>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span>Match Strength:</span>
                  <span className="font-bold">
                    {matchResult.matchScore >= 80 ? 'Strong' : matchResult.matchScore >= 60 ? 'Moderate' : 'Developing'} Match
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Eligibility Status:</span>
                  <span
                    className={`font-bold ${
                      matchResult.eligibilityStatus === 'Eligible'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : matchResult.eligibilityStatus === 'Likely Eligible'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {matchResult.eligibilityStatus}
                  </span>
                </div>
              </div>

              {matchResult.reasons && matchResult.reasons.length > 0 && (
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Matching Factors:
                  </span>
                  <ul className="space-y-1">
                    {matchResult.reasons.slice(0, 3).map((factor, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Full Proposal Draft Mode Switcher */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Multi-Step Proposal Wizard
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Build a 12-section standardized grant narrative draft.
              </p>
            </div>
            <button
              id="workspace-open-wizard-btn"
              onClick={onOpenWizard}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors"
            >
              Open Wizard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
