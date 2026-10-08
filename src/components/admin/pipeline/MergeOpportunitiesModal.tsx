import React, { useState } from 'react';
import { 
  GitMerge, 
  X, 
  Check, 
  ArrowRight, 
  ExternalLink, 
  Sparkles 
} from 'lucide-react';
import { DuplicateCandidate, IncomingOpportunity } from '../../../types/pipeline';

export interface MergeOpportunitiesModalProps {
  incomingOpportunity: IncomingOpportunity;
  candidate: DuplicateCandidate;
  onClose: () => void;
  onConfirmMerge: (mergedFields: Partial<IncomingOpportunity>) => void;
}

export const MergeOpportunitiesModal: React.FC<MergeOpportunitiesModalProps> = ({
  incomingOpportunity,
  candidate,
  onClose,
  onConfirmMerge,
}) => {
  const existing = candidate.existingRecord;

  // Selected source for each key field ('incoming' | 'candidate')
  const [selections, setSelections] = useState<{
    title: 'incoming' | 'candidate';
    organization: 'incoming' | 'candidate';
    sourceUrl: 'incoming' | 'candidate';
    applicationUrl: 'incoming' | 'candidate';
    deadline: 'incoming' | 'candidate';
    amount: 'incoming' | 'candidate';
    description: 'incoming' | 'candidate';
  }>({
    title: 'incoming',
    organization: 'candidate', // often catalog org is standardized
    sourceUrl: 'incoming',
    applicationUrl: 'incoming',
    deadline: 'incoming',
    amount: 'incoming',
    description: 'incoming',
  });

  const handleToggle = (field: keyof typeof selections, choice: 'incoming' | 'candidate') => {
    setSelections((prev) => ({ ...prev, [field]: choice }));
  };

  const handleExecuteMerge = () => {
    const merged: Partial<IncomingOpportunity> = {
      title: selections.title === 'incoming' ? incomingOpportunity.title : (existing?.title || incomingOpportunity.title),
      organization: selections.organization === 'incoming' ? incomingOpportunity.organization : (existing?.organization || incomingOpportunity.organization),
      sourceUrl: selections.sourceUrl === 'incoming' ? incomingOpportunity.sourceUrl : (existing?.sourceUrl || incomingOpportunity.sourceUrl),
      applicationUrl: selections.applicationUrl === 'incoming' ? (incomingOpportunity.applicationUrl || '') : (existing?.applicationUrl || incomingOpportunity.applicationUrl || ''),
      deadline: selections.deadline === 'incoming' ? (incomingOpportunity.deadline || '') : (existing?.deadline || incomingOpportunity.deadline || ''),
      amountDisplayText: selections.amount === 'incoming' ? incomingOpportunity.amountDisplayText : (existing?.amountDisplayText || incomingOpportunity.amountDisplayText),
      description: selections.description === 'incoming' ? incomingOpportunity.description : (existing?.description || incomingOpportunity.description),
    };

    onConfirmMerge(merged);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Interactive Record Merge Wizard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select which field values to retain from each record before consolidating.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Side-by-Side Field Selection */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Field: Title */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Opportunity Title
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggle('title', 'incoming')}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  selections.title === 'incoming'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>[Incoming]</span>
                  {selections.title === 'incoming' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                {incomingOpportunity.title}
              </button>

              <button
                type="button"
                onClick={() => handleToggle('title', 'candidate')}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  selections.title === 'candidate'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>[Candidate Match]</span>
                  {selections.title === 'candidate' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                {existing?.title || candidate.title}
              </button>
            </div>
          </div>

          {/* Field: Organization */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Provider / Organization
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggle('organization', 'incoming')}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  selections.organization === 'incoming'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>[Incoming]</span>
                  {selections.organization === 'incoming' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                {incomingOpportunity.organization}
              </button>

              <button
                type="button"
                onClick={() => handleToggle('organization', 'candidate')}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  selections.organization === 'candidate'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>[Candidate Match]</span>
                  {selections.organization === 'candidate' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                {existing?.organization || candidate.organization}
              </button>
            </div>
          </div>

          {/* Field: Application URL & Source */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Application Link
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggle('applicationUrl', 'incoming')}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all truncate ${
                  selections.applicationUrl === 'incoming'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>[Incoming]</span>
                  {selections.applicationUrl === 'incoming' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <span className="truncate block">{incomingOpportunity.applicationUrl || incomingOpportunity.sourceUrl}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggle('applicationUrl', 'candidate')}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all truncate ${
                  selections.applicationUrl === 'candidate'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>[Candidate Match]</span>
                  {selections.applicationUrl === 'candidate' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <span className="truncate block">{existing?.applicationUrl || existing?.sourceUrl || 'None specified'}</span>
              </button>
            </div>
          </div>

          {/* Field: Deadline */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Application Deadline
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggle('deadline', 'incoming')}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  selections.deadline === 'incoming'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>[Incoming]</span>
                  {selections.deadline === 'incoming' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                {incomingOpportunity.deadline || 'None'}
              </button>

              <button
                type="button"
                onClick={() => handleToggle('deadline', 'candidate')}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  selections.deadline === 'candidate'
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold ring-1 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>[Candidate Match]</span>
                  {selections.deadline === 'candidate' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                {existing?.deadline || 'None'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-merge-execute"
            type="button"
            onClick={handleExecuteMerge}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <GitMerge className="w-4 h-4" />
            Apply Merged Record
          </button>
        </div>
      </div>
    </div>
  );
};
