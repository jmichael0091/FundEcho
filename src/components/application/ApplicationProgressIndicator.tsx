import React, { useState } from 'react';
import { 
  Check, 
  ChevronRight, 
  ListChecks, 
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { ApplicationStepId, ApplicationStepConfig } from '../../types/application';
import { APPLICATION_STEPS_CONFIG } from '../../utils/applicationStorage';

interface ApplicationProgressIndicatorProps {
  currentStep: ApplicationStepId;
  completedStepIds: Set<ApplicationStepId>;
  incompleteStepIds: Set<ApplicationStepId>;
  completionScore: number;
  onSelectStep: (stepId: ApplicationStepId) => void;
}

export const ApplicationProgressIndicator: React.FC<ApplicationProgressIndicatorProps> = ({
  currentStep,
  completedStepIds,
  incompleteStepIds,
  completionScore,
  onSelectStep,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentStepConfig = APPLICATION_STEPS_CONFIG.find((s) => s.id === currentStep) || APPLICATION_STEPS_CONFIG[0];
  const currentStepIndex = APPLICATION_STEPS_CONFIG.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-2xs">
      {/* Mobile Compact Progress Bar (<= 768px) */}
      <div className="lg:hidden px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-indigo-600 text-white">
              {currentStepConfig.stepNumber}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Step {currentStepConfig.stepNumber} of {APPLICATION_STEPS_CONFIG.length}
              </p>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {currentStepConfig.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="mobile-steps-dropdown-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <ListChecks className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Steps ({completionScore}%)</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, completionScore)}%` }}
          />
        </div>

        {/* Mobile Expanded Steps Menu */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 max-h-72 overflow-y-auto space-y-1">
            {APPLICATION_STEPS_CONFIG.map((step) => {
              const isCurrent = step.id === currentStep;
              const isDone = completedStepIds.has(step.id);
              const isIncomplete = incompleteStepIds.has(step.id);

              return (
                <button
                  key={step.id}
                  type="button"
                  id={`mobile-step-btn-${step.id}`}
                  onClick={() => {
                    onSelectStep(step.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                    isCurrent
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : step.stepNumber}
                    </div>
                    <span className="truncate">{step.title}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {isDone && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Complete
                      </span>
                    )}
                    {isIncomplete && !isDone && (
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Incomplete
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Step Bar (>= 1024px) */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-3.5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Proposal Workspace
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Step {currentStepIndex + 1} of {APPLICATION_STEPS_CONFIG.length}: <strong className="text-indigo-600 dark:text-indigo-400">{currentStepConfig.title}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Readiness: <strong className="text-indigo-600 dark:text-indigo-400">{completionScore}%</strong>
            </span>
            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(5, completionScore)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps Grid / Slider */}
        <div className="grid grid-cols-6 xl:grid-cols-12 gap-1.5">
          {APPLICATION_STEPS_CONFIG.map((step) => {
            const isCurrent = step.id === currentStep;
            const isDone = completedStepIds.has(step.id);
            const isIncomplete = incompleteStepIds.has(step.id);

            return (
              <button
                key={step.id}
                type="button"
                id={`desktop-step-btn-${step.id}`}
                onClick={() => onSelectStep(step.id)}
                title={`${step.stepNumber}. ${step.title} (${isDone ? 'Completed' : 'Incomplete'})`}
                className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all border ${
                  isCurrent
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500/70 dark:border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                    : isDone
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : step.stepNumber}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[11px] truncate font-semibold leading-tight ${
                      isCurrent
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : isDone
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                    }`}
                  >
                    {step.shortTitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
