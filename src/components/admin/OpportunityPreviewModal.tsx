import React from 'react';
import { 
  X, 
  Building2, 
  Globe, 
  Clock, 
  Calendar, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Opportunity } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DeadlineBadge } from '../deadlines/DeadlineBadge';

export interface OpportunityPreviewModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (opportunity: Opportunity) => void;
}

export const OpportunityPreviewModal: React.FC<OpportunityPreviewModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Admin Inspection Preview
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              ID: {opportunity.id}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-white">
          {/* Header metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="indigo" size="sm">
                {opportunity.type}
              </Badge>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {opportunity.category}
              </span>
              <span 
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                  opportunity.publicationStatus === 'Published'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : opportunity.publicationStatus === 'Pending Review'
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Status: {opportunity.publicationStatus || 'Published'}
              </span>
              <span 
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  opportunity.adminVerificationStatus === 'Verified'
                    ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                    : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                Verification: {opportunity.adminVerificationStatus || (opportunity.verified ? 'Verified' : 'Under Review')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {opportunity.title}
            </h2>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-semibold">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{opportunity.organization}</span>
              <span>•</span>
              <Globe className="w-4 h-4 text-slate-400" />
              <span>{opportunity.location}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Funding Amount</span>
              <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                {opportunity.amount.displayText}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Deadline</span>
              <div className="pt-0.5">
                <DeadlineBadge deadline={opportunity.deadline} size="sm" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Last Updated</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-0.5">
                {opportunity.lastUpdated || opportunity.datePosted}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Description</h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {opportunity.description || opportunity.summary}
            </p>
          </div>

          {/* Eligibility & Requirements */}
          {opportunity.eligibility && opportunity.eligibility.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Eligibility Criteria</h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {opportunity.eligibility.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata & Admin Notes */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Internal Administrative Metadata</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
              <div><strong className="text-slate-800 dark:text-slate-200">Source:</strong> {opportunity.source || opportunity.officialSourceUrl || 'Official Provider'}</div>
              <div><strong className="text-slate-800 dark:text-slate-200">Last Verified:</strong> {opportunity.lastVerifiedDate || 'N/A'}</div>
              {opportunity.internalNotes && (
                <div className="sm:col-span-2"><strong className="text-slate-800 dark:text-slate-200">Internal Notes:</strong> {opportunity.internalNotes}</div>
              )}
              {opportunity.reviewNotes && (
                <div className="sm:col-span-2 text-amber-700 dark:text-amber-300"><strong className="text-amber-800 dark:text-amber-200">Review Notes:</strong> {opportunity.reviewNotes}</div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3">
          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Visit Application URL</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(opportunity);
                }}
              >
                Edit Opportunity
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
