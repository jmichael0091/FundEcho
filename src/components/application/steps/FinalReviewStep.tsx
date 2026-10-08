import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Download, 
  Copy, 
  ExternalLink, 
  Printer, 
  Building2, 
  Calendar, 
  DollarSign, 
  Check, 
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Opportunity } from '../../../types';
import { ApplicationDraft, ApplicationStepId } from '../../../types/application';
import { formatCurrencyDisplay, calculateTotalBudget } from '../../../utils/budgetCalculations';
import { validateFullApplication, generateApplicationSummaryText } from '../../../utils/applicationStorage';

interface FinalReviewStepProps {
  draft: ApplicationDraft;
  opportunity: Opportunity;
  onNavigateToStep: (stepId: ApplicationStepId) => void;
}

export const FinalReviewStep: React.FC<FinalReviewStepProps> = ({
  draft,
  opportunity,
  onNavigateToStep,
}) => {
  const [copied, setCopied] = useState(false);
  const validation = validateFullApplication(draft, opportunity);
  const totalBudget = calculateTotalBudget(draft.budgetItems);

  const handleCopyProposal = () => {
    const text = generateApplicationSummaryText(draft, opportunity);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(draft, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FundEcho_Proposal_${opportunity.id}_${draft.applicantInfo.fullName.replace(/\s+/g, '_') || 'Draft'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Application Readiness & Actions */}
      <div className={`p-6 rounded-2xl border shadow-xs ${
        validation.overallComplete
          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
          : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl shrink-0 ${
              validation.overallComplete
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
            }`}>
              {validation.overallComplete ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {validation.overallComplete
                  ? 'Proposal Completed & Ready for Submission'
                  : 'Proposal In Progress — Review Missing Requirements'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Overall Completion Score: <strong className="text-indigo-600 dark:text-indigo-400">{validation.completionPercentage}%</strong> ({validation.completedSteps.length} of 12 sections finished)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="copy-proposal-text-btn"
              onClick={handleCopyProposal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Full Proposal!' : 'Copy Proposal Text'}</span>
            </button>

            <button
              type="button"
              id="download-proposal-json-btn"
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              id="print-proposal-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <span>Submit on Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Missing fields alert */}
        {!validation.overallComplete && validation.missingFields.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-200/80 dark:border-amber-900/60">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">
              Action Needed: Complete the following sections before submitting:
            </p>
            <div className="flex flex-wrap gap-2">
              {validation.missingFields.map((field, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`jump-missing-${field.stepId}`}
                  onClick={() => onNavigateToStep(field.stepId)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-slate-700 shadow-2xs transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{field.stepTitle}: {field.label}</span>
                  <ArrowRight className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Sections Breakdown */}
      <div className="space-y-4">
        {/* Section 1: Opportunity Target */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Target Opportunity
            </h3>
            <button
              type="button"
              id="review-edit-step-opportunity_summary"
              onClick={() => onNavigateToStep('opportunity_summary')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Opportunity Title:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{opportunity.title}</p>
            </div>
            <div>
              <span className="text-slate-400">Provider:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{opportunity.organization}</p>
            </div>
            <div>
              <span className="text-slate-400">Deadline:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{opportunity.deadline}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Applicant & Organization */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Applicant & Entity Profile
            </h3>
            <button
              type="button"
              id="review-edit-step-applicant_info"
              onClick={() => onNavigateToStep('applicant_info')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Lead Applicant:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {draft.applicantInfo.fullName || <span className="text-rose-500">Not provided</span>}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Email:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {draft.applicantInfo.email || <span className="text-rose-500">Not provided</span>}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Country & City:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {draft.applicantInfo.country ? `${draft.applicantInfo.city ? `${draft.applicantInfo.city}, ` : ''}${draft.applicantInfo.country}` : <span className="text-rose-500">Not provided</span>}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Applying Entity:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {draft.organizationInfo.hasOrganization
                  ? `${draft.organizationInfo.orgName || 'Unnamed Org'} (${draft.organizationInfo.orgType})`
                  : 'Individual / Non-corporate initiative'}
              </p>
            </div>
            {draft.organizationInfo.hasOrganization && (
              <div>
                <span className="text-slate-400">Registration / Tax ID:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {draft.organizationInfo.registrationNumber || 'Not specified'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Funding Request */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              Funding Request Summary
            </h3>
            <button
              type="button"
              id="review-edit-step-funding_request"
              onClick={() => onNavigateToStep('funding_request')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Requested Amount:</span>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrencyDisplay(draft.fundingRequest.requestedAmount, draft.fundingRequest.currency)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Project Duration:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {draft.fundingRequest.fundingDurationMonths} Months
              </p>
            </div>
            <div>
              <span className="text-slate-400">Primary Expenditure:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {draft.fundingRequest.primaryExpenseCategory}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Narrative Statements */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Proposal Narratives
            </h3>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {/* Problem */}
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Problem / Need Statement</span>
                <button
                  type="button"
                  id="review-edit-step-problem_statement"
                  onClick={() => onNavigateToStep('problem_statement')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-3">
                {draft.problemStatement || <span className="text-rose-500 italic">No statement entered.</span>}
              </p>
            </div>

            {/* Solution */}
            <div className="pt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Proposed Solution & Approach</span>
                <button
                  type="button"
                  id="review-edit-step-proposed_solution"
                  onClick={() => onNavigateToStep('proposed_solution')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-3">
                {draft.proposedSolution || <span className="text-rose-500 italic">No solution entered.</span>}
              </p>
            </div>

            {/* Goals & Impact */}
            <div className="pt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Goals & Expected Impact</span>
                <button
                  type="button"
                  id="review-edit-step-goals_impact"
                  onClick={() => onNavigateToStep('goals_impact')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-3">
                {draft.goalsAndImpact || <span className="text-rose-500 italic">No goals entered.</span>}
              </p>
            </div>

            {/* Target Beneficiaries */}
            <div className="pt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Target Beneficiaries & Inclusion</span>
                <button
                  type="button"
                  id="review-edit-step-target_beneficiaries"
                  onClick={() => onNavigateToStep('target_beneficiaries')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-3">
                {draft.targetBeneficiaries || <span className="text-rose-500 italic">No beneficiaries entered.</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Budget & Timeline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Budget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                Budget Schedule ({draft.budgetItems.length} items)
              </h3>
              <button
                type="button"
                id="review-edit-step-budget"
                onClick={() => onNavigateToStep('budget')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="text-xs space-y-1">
              <p className="text-slate-500">Itemized Total:</p>
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {formatCurrencyDisplay(totalBudget, draft.fundingRequest.currency)}
              </p>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800 pt-2 max-h-36 overflow-y-auto">
                {draft.budgetItems.map((item) => (
                  <li key={item.id} className="py-1.5 flex items-center justify-between">
                    <span className="truncate max-w-[180px] text-slate-700 dark:text-slate-300 font-medium">
                      {item.description}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrencyDisplay(item.total, draft.fundingRequest.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Timeline & Phases ({draft.timelineMilestones.length} phases)
              </h3>
              <button
                type="button"
                id="review-edit-step-timeline"
                onClick={() => onNavigateToStep('timeline')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="text-xs space-y-2 max-h-48 overflow-y-auto">
              {draft.timelineMilestones.map((m) => (
                <div key={m.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Phase {m.phaseNumber}: {m.title}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {m.timeframe}
                    </span>
                  </div>
                  {m.expectedDeliverables && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      Deliverable: {m.expectedDeliverables}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 6: Additional Questions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Sustainability, Risk & Team Summary
            </h3>
            <button
              type="button"
              id="review-edit-step-additional_questions"
              onClick={() => onNavigateToStep('additional_questions')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Sustainability Plan:</span>
              <p className="text-slate-700 dark:text-slate-300 line-clamp-2 mt-0.5">
                {draft.additionalQuestions.sustainabilityPlan || <span className="text-rose-500">Missing</span>}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Risk Mitigation:</span>
              <p className="text-slate-700 dark:text-slate-300 line-clamp-2 mt-0.5">
                {draft.additionalQuestions.riskMitigation || <span className="text-rose-500">Missing</span>}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Team Competencies:</span>
              <p className="text-slate-700 dark:text-slate-300 line-clamp-2 mt-0.5">
                {draft.additionalQuestions.teamExpertise || <span className="text-rose-500">Missing</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official Provider Submission Callout */}
      <div className="p-6 rounded-2xl bg-indigo-900 text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-300" />
          <h3 className="text-base font-bold">Ready to Submit to {opportunity.organization}?</h3>
        </div>
        <p className="text-xs text-indigo-100 leading-relaxed max-w-2xl">
          FundEcho has formatted your application materials to match the official opportunity guidelines. Copy your structured proposal text or export your data, then submit your application directly on the official {opportunity.organization} grant portal.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 shadow-md transition-all"
          >
            <span>Proceed to Official Submission Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={handleCopyProposal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-700/60 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Proposal Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
