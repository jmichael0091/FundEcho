import React from 'react';
import { 
  Copy, 
  ExternalLink, 
  GitMerge, 
  EyeOff, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { DuplicateCandidate, IncomingOpportunity } from '../../../types/pipeline';

export interface DeduplicationInspectorProps {
  currentOpportunity: IncomingOpportunity;
  duplicateCandidates: DuplicateCandidate[];
  onKeepBoth: (candidateId: string) => void;
  onIgnoreDuplicate: (candidateId: string) => void;
  onOpenMergeWizard: (candidate: DuplicateCandidate) => void;
}

export const DeduplicationInspector: React.FC<DeduplicationInspectorProps> = ({
  currentOpportunity,
  duplicateCandidates,
  onKeepBoth,
  onIgnoreDuplicate,
  onOpenMergeWizard,
}) => {
  if (!duplicateCandidates || duplicateCandidates.length === 0) {
    return (
      <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
          No Duplicates Detected
        </h4>
        <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto mt-1">
          Automated cross-check found no matching records in either the public catalog or the current discovery queue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Copy className="w-4 h-4 text-amber-500" />
            Duplicate Detection ({duplicateCandidates.length} potential {duplicateCandidates.length === 1 ? 'match' : 'matches'})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review potential duplicates. Choose whether to merge enriched details, keep both as separate records, or dismiss the warning.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {duplicateCandidates.map((candidate) => {
          const isHighMatch = candidate.matchScore >= 75;
          const isModerateMatch = candidate.matchScore >= 50 && candidate.matchScore < 75;

          return (
            <div
              key={candidate.opportunityId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-amber-300 dark:hover:border-amber-700/80 transition-all"
            >
              {/* Top Bar: Similarity Score + Match Type */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
                      isHighMatch
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : isModerateMatch
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Possible duplicate — {candidate.matchScore}% similarity
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {candidate.isExistingInCatalog ? (
                      <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                        <Layers className="w-3 h-3" /> Exists in Live Catalog
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">
                        In Ingestion Queue
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {candidate.matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Comparison Snippet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {/* Incoming Opportunity Side */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Incoming Record
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {currentOpportunity.title}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentOpportunity.organization}
                  </p>
                  {currentOpportunity.deadline && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Deadline: <span className="font-semibold">{currentOpportunity.deadline}</span>
                    </p>
                  )}
                </div>

                {/* Candidate Opportunity Side */}
                <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-2 md:pt-0 md:pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                      Existing Matching Candidate
                    </span>
                    {candidate.sourceUrl && (
                      <a
                        href={candidate.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        View Link <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {candidate.title}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {candidate.organization}
                  </p>
                  {candidate.existingRecord?.deadline && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Deadline: <span className="font-semibold">{candidate.existingRecord.deadline}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons for Admin Resolution */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  id={`btn-keep-both-${candidate.opportunityId}`}
                  onClick={() => onKeepBoth(candidate.opportunityId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all"
                  title="Acknowledge both are separate independent opportunities and proceed"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Keep Both
                </button>

                <button
                  id={`btn-merge-candidate-${candidate.opportunityId}`}
                  onClick={() => onOpenMergeWizard(candidate)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition-all"
                  title="Open interactive merge wizard to combine fields"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  Merge Records
                </button>

                <button
                  id={`btn-ignore-duplicate-${candidate.opportunityId}`}
                  onClick={() => onIgnoreDuplicate(candidate.opportunityId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Dismiss duplicate alert for this candidate"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Ignore Warning
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
