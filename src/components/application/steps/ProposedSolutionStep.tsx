import React from 'react';
import { Compass, Lightbulb } from 'lucide-react';
import { Opportunity } from '../../../types';
import { AIAssistanceDropdown } from '../AIAssistanceDropdown';

interface ProposedSolutionStepProps {
  value: string;
  opportunity: Opportunity;
  applicantName?: string;
  organizationName?: string;
  onChange: (value: string) => void;
}

export const ProposedSolutionStep: React.FC<ProposedSolutionStepProps> = ({
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
              <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Proposed Solution & Project Approach
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Describe your specific intervention, innovative methodology, and how you will execute the project.
            </p>
          </div>

          <AIAssistanceDropdown
            fieldKey="proposedSolution"
            fieldLabel="Proposed Solution & Approach"
            currentValue={value}
            opportunity={opportunity}
            applicantName={applicantName}
            organizationName={organizationName}
            onApplyText={(newText, mode) => {
              onChange(mode === 'replace' ? newText : `${value}\n\n${newText}`.trim());
            }}
          />
        </div>

        {/* Reviewer Guidance */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Lightbulb className="w-4 h-4 text-indigo-500" />
            <span>Grant Reviewer Checklist: What makes a standout Proposed Solution?</span>
          </div>
          <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-6 list-disc">
            <li><strong>Methodological Rigor:</strong> Step-by-step operational workflow detailing how activities will occur.</li>
            <li><strong>Feasibility & Innovation:</strong> Why is your approach uniquely suited, cost-effective, or technically viable?</li>
            <li><strong>Risk Awareness:</strong> Acknowledge potential logistical hurdles and explain your mitigation tactics.</li>
          </ul>
        </div>

        {/* Narrative Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Technical & Operational Description *
            </label>
            <span className={`text-[11px] ${charCount < 30 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
              {wordCount} words • {charCount} chars {charCount < 30 && '(minimum 30 chars required)'}
            </span>
          </div>

          <textarea
            rows={10}
            id="proposed-solution-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Structure your solution:
1. Executive Overview: What is the core solution or product?
2. Operational Methodology: How will your team roll out activities on the ground?
3. Innovation Factor: What distinguishes your approach from standard models?
4. Partnership & Stakeholder Engagement: Who are key local collaborators?"
            className="w-full p-4 text-xs sm:text-sm leading-relaxed rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 font-sans"
          />
        </div>
      </div>
    </div>
  );
};
