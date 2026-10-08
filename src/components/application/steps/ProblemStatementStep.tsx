import React from 'react';
import { AlertCircle, HelpCircle, Lightbulb } from 'lucide-react';
import { Opportunity } from '../../../types';
import { AIAssistanceDropdown } from '../AIAssistanceDropdown';

interface ProblemStatementStepProps {
  value: string;
  opportunity: Opportunity;
  applicantName?: string;
  organizationName?: string;
  onChange: (value: string) => void;
}

export const ProblemStatementStep: React.FC<ProblemStatementStepProps> = ({
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
              <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Problem / Need Statement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Clearly articulate the critical issue, community deficit, or systemic barrier your project aims to address.
            </p>
          </div>

          <AIAssistanceDropdown
            fieldKey="problemStatement"
            fieldLabel="Problem / Need Statement"
            currentValue={value}
            opportunity={opportunity}
            applicantName={applicantName}
            organizationName={organizationName}
            onApplyText={(newText, mode) => {
              onChange(mode === 'replace' ? newText : `${value}\n\n${newText}`.trim());
            }}
          />
        </div>

        {/* Evaluator Guidance Box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Grant Reviewer Checklist: What makes a compelling Problem Statement?</span>
          </div>
          <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-6 list-disc">
            <li><strong>Urgency & Scope:</strong> Who is affected, where, and why is existing support insufficient?</li>
            <li><strong>Authentic Evidence:</strong> Reference local challenges, observed barriers, or community context without inventing unverified numbers.</li>
            <li><strong>Opportunity Alignment:</strong> Connect your challenge directly to {opportunity.organization}'s funding focus.</li>
          </ul>
        </div>

        {/* Narrative Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Detailed Statement of Problem & Context *
            </label>
            <span className={`text-[11px] ${charCount < 30 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
              {wordCount} words • {charCount} chars {charCount < 30 && '(minimum 30 chars required)'}
            </span>
          </div>

          <textarea
            rows={10}
            id="problem-statement-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Structure your statement:
1. The Core Challenge: Describe the unmet need or obstacle.
2. Root Causes: Explain why this issue persists in the target community.
3. Consequences of Inaction: What happens if funding is not deployed now?
4. Readiness: Why this specific opportunity is the catalyst to solve it."
            className="w-full p-4 text-xs sm:text-sm leading-relaxed rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 font-sans"
          />
        </div>
      </div>
    </div>
  );
};
