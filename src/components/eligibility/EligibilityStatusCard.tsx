import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Opportunity, EligibilityAssessmentResult, PageId } from '../../types';

export interface EligibilityStatusCardProps {
  opportunity: Opportunity;
  assessment: EligibilityAssessmentResult | null;
  onOpenChecker: () => void;
  onNavigate: (page: PageId) => void;
  variant?: 'inline' | 'sidebar';
}

export const EligibilityStatusCard: React.FC<EligibilityStatusCardProps> = ({
  opportunity,
  assessment,
  onOpenChecker,
  onNavigate,
  variant = 'inline',
}) => {
  if (variant === 'sidebar') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-md shadow-slate-200/40 dark:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)] space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Eligibility Status
          </span>
          {assessment && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              assessment.overallStatus === 'likely_eligible'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : assessment.overallStatus === 'possibly_eligible'
                ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}>
              {assessment.overallStatus === 'likely_eligible' ? 'Likely Eligible' : assessment.overallStatus === 'possibly_eligible' ? 'Review Needed' : 'Not Eligible'}
            </span>
          )}
        </div>

        {assessment ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {assessment.headline}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {assessment.summary}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>{assessment.metCount} of {assessment.totalCount} criteria satisfied</span>
              <button
                type="button"
                onClick={onOpenChecker}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                View Details &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Verify if you meet the specific location, applicant type, and background criteria before applying.
            </p>
            <button
              type="button"
              id="sidebar-check-eligibility-btn"
              onClick={onOpenChecker}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Check Eligibility</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Inline Variant (Inside the Eligibility Section)
  return (
    <div className="bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Instant Rules-Based Eligibility Checker
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Answer a few quick questions to assess your alignment with this program's specific rules.
          </p>
        </div>

        <button
          type="button"
          id="inline-check-eligibility-btn"
          onClick={onOpenChecker}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0 active:scale-98"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{assessment ? 'Review / Retake Check' : 'Check Eligibility'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {assessment && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
          assessment.overallStatus === 'likely_eligible'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
            : assessment.overallStatus === 'possibly_eligible'
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
        }`}>
          <span className="mt-0.5 shrink-0">
            {assessment.overallStatus === 'likely_eligible' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            {assessment.overallStatus === 'possibly_eligible' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            {assessment.overallStatus === 'likely_not_eligible' && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          </span>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <strong className="font-bold">{assessment.headline} ({assessment.metCount}/{assessment.totalCount} Criteria Met)</strong>
              <span className="text-[11px] opacity-75">Checked {new Date(assessment.assessedAt).toLocaleDateString()}</span>
            </div>
            <p className="opacity-90">{assessment.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};
