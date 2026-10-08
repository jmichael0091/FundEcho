import React from 'react';
import { HelpCircle, Shield, Award, Activity } from 'lucide-react';
import { AdditionalQuestions } from '../../../types/application';
import { Opportunity } from '../../../types';
import { AIAssistanceDropdown } from '../AIAssistanceDropdown';

interface AdditionalQuestionsStepProps {
  questions: AdditionalQuestions;
  opportunity: Opportunity;
  applicantName?: string;
  organizationName?: string;
  onChange: (updated: AdditionalQuestions) => void;
}

export const AdditionalQuestionsStep: React.FC<AdditionalQuestionsStepProps> = ({
  questions,
  opportunity,
  applicantName,
  organizationName,
  onChange,
}) => {
  const handleChange = (field: keyof AdditionalQuestions, value: string) => {
    onChange({
      ...questions,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Additional Evaluator Questions & Risk Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Grant committees evaluate organizational resilience, sustainability after funding concludes, and team readiness.
          </p>
        </div>

        {/* 1. Sustainability Plan */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sustainability & Exit Strategy *</span>
            </label>
            <AIAssistanceDropdown
              fieldKey="sustainability_plan"
              fieldLabel="Sustainability & Exit Strategy"
              currentValue={questions.sustainabilityPlan}
              opportunity={opportunity}
              applicantName={applicantName}
              organizationName={organizationName}
              onApplyText={(newText, mode) => {
                handleChange(
                  'sustainabilityPlan',
                  mode === 'replace' ? newText : `${questions.sustainabilityPlan}\n\n${newText}`.trim()
                );
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            How will project activities, maintenance, and community benefits continue after the grant period ends?
          </p>
          <textarea
            rows={4}
            id="sustainability-plan-textarea"
            value={questions.sustainabilityPlan}
            onChange={(e) => handleChange('sustainabilityPlan', e.target.value)}
            placeholder="Outline revenue models, institutional adoption, ongoing volunteer engagement, or commercialization pathways..."
            className="w-full p-3.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
          />
        </div>

        {/* 2. Risk Mitigation */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Risk Management & Mitigation Strategy *</span>
            </label>
            <AIAssistanceDropdown
              fieldKey="risk_mitigation"
              fieldLabel="Risk Assessment & Mitigation"
              currentValue={questions.riskMitigation}
              opportunity={opportunity}
              applicantName={applicantName}
              organizationName={organizationName}
              onApplyText={(newText, mode) => {
                handleChange(
                  'riskMitigation',
                  mode === 'replace' ? newText : `${questions.riskMitigation}\n\n${newText}`.trim()
                );
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Identify potential operational, financial, or environmental risks and the proactive measures taken to mitigate them.
          </p>
          <textarea
            rows={4}
            id="risk-mitigation-textarea"
            value={questions.riskMitigation}
            onChange={(e) => handleChange('riskMitigation', e.target.value)}
            placeholder="1. Operational Risk (e.g. supply delays) -> Mitigation: Local vendor backups
2. Regulatory Risk -> Mitigation: Early compliance engagement..."
            className="w-full p-3.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
          />
        </div>

        {/* 3. Team Expertise */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>Team Competencies & Key Personnel *</span>
            </label>
            <AIAssistanceDropdown
              fieldKey="team_expertise"
              fieldLabel="Team Competencies & Key Personnel"
              currentValue={questions.teamExpertise}
              opportunity={opportunity}
              applicantName={applicantName}
              organizationName={organizationName}
              onApplyText={(newText, mode) => {
                handleChange(
                  'teamExpertise',
                  mode === 'replace' ? newText : `${questions.teamExpertise}\n\n${newText}`.trim()
                );
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Detail why your specific team has the technical, administrative, and domain leadership to execute successfully.
          </p>
          <textarea
            rows={4}
            id="team-expertise-textarea"
            value={questions.teamExpertise}
            onChange={(e) => handleChange('teamExpertise', e.target.value)}
            placeholder="Highlight relevant credentials, past project leadership, and technical qualifications of key contributors..."
            className="w-full p-3.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
          />
        </div>

        {/* 4. Previous Grants / History (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Previous Grants & Awards Managed (Optional):
            </label>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            List any past funding awards, donor programs, or fellowship experiences.
          </p>
          <textarea
            rows={3}
            id="previous-grants-textarea"
            value={questions.previousGrantExperience}
            onChange={(e) => handleChange('previousGrantExperience', e.target.value)}
            placeholder="e.g. 2024 Innovate Now Grant ($10,000) - Successfully completed and audited on schedule..."
            className="w-full p-3.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
