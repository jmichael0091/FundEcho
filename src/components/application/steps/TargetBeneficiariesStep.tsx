import React from 'react';
import { Users2, Lightbulb, HeartHandshake } from 'lucide-react';
import { Opportunity } from '../../../types';
import { AIAssistanceDropdown } from '../AIAssistanceDropdown';

interface TargetBeneficiariesStepProps {
  value: string;
  opportunity: Opportunity;
  applicantName?: string;
  organizationName?: string;
  onChange: (value: string) => void;
}

export const TargetBeneficiariesStep: React.FC<TargetBeneficiariesStepProps> = ({
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
              <Users2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Target Beneficiaries & Inclusion
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Identify the core populations, demographics, and marginalized groups directly and indirectly served.
            </p>
          </div>

          <AIAssistanceDropdown
            fieldKey="targetBeneficiaries"
            fieldLabel="Target Beneficiaries & Inclusion"
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
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            <span>Grant Reviewer Checklist: Defining Beneficiaries & Equity</span>
          </div>
          <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-6 list-disc">
            <li><strong>Direct Beneficiaries:</strong> Specific individuals, students, farmers, businesses, or patients receiving direct intervention.</li>
            <li><strong>Indirect Beneficiaries:</strong> Broader community, families, and regional ecosystem benefiting from secondary effects.</li>
            <li><strong>Inclusion & Accessibility:</strong> Strategies to reach underrepresented, rural, youth, or vulnerable demographics.</li>
          </ul>
        </div>

        {/* Narrative Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Beneficiary Breakdown & Community Engagement *
            </label>
            <span className={`text-[11px] ${charCount < 30 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
              {wordCount} words • {charCount} chars {charCount < 30 && '(minimum 30 chars required)'}
            </span>
          </div>

          <textarea
            rows={10}
            id="target-beneficiaries-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Structure your beneficiary profile:
1. Primary Population Demographics: Age, gender, economic status, or geographic cluster.
2. Direct vs. Indirect Numbers: Provide clear target scale and outreach estimates.
3. Selection & Onboarding: How will participants be identified and engaged equitably?
4. Feedback Mechanisms: How will beneficiaries provide input and steer ongoing project delivery?"
            className="w-full p-4 text-xs sm:text-sm leading-relaxed rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 font-sans"
          />
        </div>
      </div>
    </div>
  );
};
