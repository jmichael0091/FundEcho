import React from 'react';
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Opportunity } from '../../../types';
import { ApplicationDraft } from '../../../types/application';
import { formatCurrencyDisplay } from '../../../utils/budgetCalculations';

interface OpportunitySummaryStepProps {
  opportunity: Opportunity;
  draft: ApplicationDraft;
  onContinue: () => void;
}

export const OpportunitySummaryStep: React.FC<OpportunitySummaryStepProps> = ({
  opportunity,
  draft,
  onContinue,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {opportunity.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {opportunity.category}
              </span>
              {opportunity.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Provider
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {opportunity.title}
            </h1>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{opportunity.organization}</span>
            </p>
          </div>

          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {opportunity.summary || opportunity.description}
        </p>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-indigo-500" /> Award Amount
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {opportunity.amount.displayText || formatCurrencyDisplay(opportunity.amount.max, opportunity.amount.currency)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-500" /> Deadline
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {opportunity.deadline}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-500" /> Geographic Scope
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {opportunity.region} ({opportunity.location})
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3 text-indigo-500" /> Target Scope
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {opportunity.targetAudience || 'Eligible Applicants'}
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines & Key Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Eligibility & Criteria
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {opportunity.eligibility?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-500" />
            Mandatory Deliverables & Documents
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {(opportunity.requiredDocuments || opportunity.requirements || [
              'Detailed Project Proposal & Executive Summary',
              'Itemized Line-by-Line Cost Schedule',
              'Organization Registration or Applicant Resume',
              'Impact Metrics & Community Beneficiary Breakdown',
            ]).map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Workspace Purpose Notice */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
            FundEcho Application & Proposal Workspace
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This workspace organizes every proposal section required by grant evaluators. As you write, you can use the AI writing co-pilot for structured refinement, build your itemized budget, outline timeline milestones, and export a ready-to-submit proposal package.
          </p>
        </div>
      </div>
    </div>
  );
};
