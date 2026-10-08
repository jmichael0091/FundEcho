import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RotateCw, 
  FileEdit, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { ValidationResult, ValidationCheckItem } from '../../../types/pipeline';

export interface ValidationInspectorProps {
  validationResult?: ValidationResult;
  onRunValidation: () => void;
  onOpenEditor?: () => void;
  isLoading?: boolean;
}

export const ValidationInspector: React.FC<ValidationInspectorProps> = ({
  validationResult,
  onRunValidation,
  onOpenEditor,
  isLoading = false,
}) => {
  if (!validationResult) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
        <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Validation Suite Not Executed
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
          Execute automated frontend validation to verify title integrity, valid HTTPS URLs, eligibility rules, and content quality.
        </p>
        <button
          id="btn-run-validation-initial"
          onClick={onRunValidation}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Run Automated Validation
        </button>
      </div>
    );
  }

  const { isValid, passedCount, issuesCount, checks, validatedAt } = validationResult;
  const formattedTime = new Date(validatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Banner */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isValid
            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isValid
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {isValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {passedCount} checks passed
              </h4>
              {issuesCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300">
                  {issuesCount} {issuesCount === 1 ? 'issue requires attention' : 'issues require attention'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isValid
                ? 'All mandatory requirements and integrity checks satisfied.'
                : 'Mandatory fields or formatting issues must be resolved prior to verification.'}
              {' '}• Validated at {formattedTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenEditor && issuesCount > 0 && (
            <button
              id="btn-validation-fix-editor"
              onClick={onOpenEditor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition-all"
            >
              <FileEdit className="w-3.5 h-3.5" />
              Fix Issues in Editor
            </button>
          )}
          <button
            id="btn-validation-retest"
            onClick={onRunValidation}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Re-run Checks
          </button>
        </div>
      </div>

      {/* Checklist items list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {checks.map((check) => {
          return (
            <div
              key={check.id}
              className={`p-3 sm:p-4 flex items-start justify-between gap-3 transition-colors ${
                !check.passed
                  ? check.severity === 'error'
                    ? 'bg-rose-50/30 dark:bg-rose-950/20'
                    : 'bg-amber-50/30 dark:bg-amber-950/20'
                  : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : check.severity === 'error' ? (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {check.name}
                    </span>
                    {!check.passed && (
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          check.severity === 'error'
                            ? 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {check.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {check.description}
                  </p>
                  {check.message && (
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <span>• {check.message}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    check.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {check.passed ? 'Passed' : 'Action Needed'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
