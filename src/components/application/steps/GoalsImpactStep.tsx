import React from 'react';
import { Target, Lightbulb } from 'lucide-react';
import { Opportunity } from '../../../types';
import { AIAssistanceDropdown } from '../AIAssistanceDropdown';

interface GoalsImpactStepProps {
  value: string;
  opportunity: Opportunity;
  applicantName?: string;
  organizationName?: string;
  onChange: (value: string) => void;
}

export const GoalsImpactStep: React.FC<GoalsImpactStepProps> = ({
  value,
  opportunity,
  applicantName,
  organizationName,
  onChange,
}) => {
  const charCount = value.trim().length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Goals and Expected Impact
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Define the measurable outcomes, direct impact metrics, and long-term transformation this grant will achieve.
            </p>
          </div>

          <AIAssistanceDropdown
            fieldKey="goalsAndImpact"
            fieldLabel="Goals & Expected Impact"
            currentValue={value}
            opportunity={opportunity}
            applicantName={applicantName}
            organizationName={organizationName}
            onApplyText={(newText, mode) => {
              onChange(mode === 'replace' ? newText : `${value}\n\n${newText}`.trim());
            }}
          />
        </div>

        {/* Guidance */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Lightbulb className="w-4 h-4 text-emerald-500" />
            <span>Grant Reviewer Checklist: Formulating SMART Impact Metrics</span>
          </div>
          <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-6 list-disc">
            <li><strong>Short-term Outputs vs Long-term Outcomes:</strong> Differentiate immediate deliverables from lasting changes.</li>
            <li><strong>Measurable Targets:</strong> Include quantitative KPIs (e.g. number of individuals trained, reduction in cost, communities onboarded).</li>
            <li><strong>Monitoring Framework:</strong> State how your team will track and verify these metrics throughout the grant cycle.</li>
          </ul>
        </div>

        {/* Narrative Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Measurable Goals & Impact Narrative *
            </label>
            <span className={`text-[11px] ${charCount < 30 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
              {wordCount} words • {charCount} chars {charCount < 30 && '(minimum 30 chars required)'}
            </span>
          </div>

          <textarea
            rows={10}
            id="goals-impact-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Structure your impact goals:
1. Primary Objective: The single overarching transformation accomplished by this project.
2. Specific Measurable KPIs:
   - Metric 1: Target quantitative outcome
   - Metric 2: Quality or capacity improvement
   - Metric 3: Policy, community, or economic multiplier
3. Data Collection & Monitoring: How progress will be audited and evaluated.
4. Sustainability: How impact continues beyond the grant funding window."
            className="w-full p-4 text-xs sm:text-sm leading-relaxed rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 font-sans"
          />
        </div>
      </div>
    </div>
  );
};
