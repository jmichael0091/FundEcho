import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ShieldCheck, 
  History, 
  Globe, 
  FileEdit, 
  DownloadCloud, 
  ExternalLink, 
  DollarSign, 
  Calendar, 
  Building, 
  Tag, 
  MapPin, 
  Layers,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { 
  IncomingOpportunity, 
  VerificationRecord, 
  DuplicateCandidate 
} from '../../../types/pipeline';
import { SourceQualityBadge } from './SourceQualityBadge';
import { PipelineStatusBadge } from './PipelineStatusBadge';
import { ValidationInspector } from './ValidationInspector';
import { DeduplicationInspector } from './DeduplicationInspector';
import { VerificationWorkspace } from './VerificationWorkspace';
import { PipelineHistoryTimeline } from './PipelineHistoryTimeline';
import { MergeOpportunitiesModal } from './MergeOpportunitiesModal';
import { IncomingOpportunityEditModal } from './IncomingOpportunityEditModal';

export interface PipelineItemModalProps {
  opportunity: IncomingOpportunity;
  isOpen: boolean;
  onClose: () => void;
  onImport: (id: string) => void;
  onRunValidation: (id: string) => void;
  onKeepBoth: (oppId: string, candidateId: string) => void;
  onIgnoreDuplicate: (oppId: string, candidateId: string) => void;
  onMergeDuplicate: (oppId: string, candidateId: string, merged: Partial<IncomingOpportunity>) => void;
  onUpdateVerification: (oppId: string, record: VerificationRecord) => void;
  onReject: (oppId: string, reason: string) => void;
  onPublish: (oppId: string) => void;
  onSaveEdit: (data: Partial<IncomingOpportunity>) => void;
}

type TabType = 'overview' | 'validation' | 'deduplication' | 'verification' | 'history';

export const PipelineItemModal: React.FC<PipelineItemModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onImport,
  onRunValidation,
  onKeepBoth,
  onIgnoreDuplicate,
  onMergeDuplicate,
  onUpdateVerification,
  onReject,
  onPublish,
  onSaveEdit,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMergeCandidate, setSelectedMergeCandidate] = useState<DuplicateCandidate | null>(null);

  if (!isOpen) return null;

  const validationResult = opportunity.validationResult;
  const duplicateCandidates = opportunity.duplicateCandidates || [];
  const isVerified = opportunity.pipelineStatus === 'Verified';
  const isPublished = opportunity.pipelineStatus === 'Published';
  const isDiscovered = opportunity.pipelineStatus === 'Discovered';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <PipelineStatusBadge status={opportunity.pipelineStatus} size="sm" />
                <SourceQualityBadge quality={opportunity.sourceQuality} size="sm" />
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {opportunity.id}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {opportunity.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {opportunity.organization}
                </span>
                <span>•</span>
                <span>Source: {opportunity.source}</span>
                <span>•</span>
                <span>Discovered: {opportunity.dateDiscovered}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 overflow-x-auto">
            <button
              id="tab-pipeline-overview"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Overview & Details
            </button>

            <button
              id="tab-pipeline-validation"
              onClick={() => setActiveTab('validation')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'validation'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span>Validation Suite</span>
              {validationResult && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    validationResult.isValid
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {validationResult.passedCount}/{validationResult.checks.length}
                </span>
              )}
            </button>

            <button
              id="tab-pipeline-deduplication"
              onClick={() => setActiveTab('deduplication')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'deduplication'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span>Deduplication</span>
              {duplicateCandidates.length > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                  {duplicateCandidates.length}
                </span>
              )}
            </button>

            <button
              id="tab-pipeline-verification"
              onClick={() => setActiveTab('verification')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'verification'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span>Human Verification</span>
              {isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </button>

            <button
              id="tab-pipeline-history"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span>History & Audit</span>
              <span className="text-[10px] text-slate-400">({opportunity.history.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Current Action Stage:
                  </span>
                  <PipelineStatusBadge status={opportunity.pipelineStatus} size="sm" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="btn-modal-edit-record"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Edit Fields
                  </button>

                  {isDiscovered && (
                    <button
                      id="btn-modal-import-pipeline"
                      onClick={() => onImport(opportunity.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      Import to Pipeline
                    </button>
                  )}

                  {!isPublished && (
                    <button
                      id="btn-modal-publish-live"
                      onClick={() => onPublish(opportunity.id)}
                      disabled={!isVerified}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs ${
                        isVerified
                          ? 'bg-teal-600 hover:bg-teal-700 text-white ring-2 ring-teal-500/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      }`}
                      title={isVerified ? 'Publish verified opportunity to live seeker search' : 'Must mark as Verified in Human Verification first'}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Publish to Live Catalog
                    </button>
                  )}
                </div>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-slate-400" /> Funding Tier
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {opportunity.amountDisplayText}
                  </div>
                  {opportunity.isFullyFunded && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Fully Funded Program
                    </span>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Application Deadline
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {opportunity.deadline || 'Rolling / Open'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> Geography & Region
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {opportunity.country} ({opportunity.region})
                  </div>
                </div>
              </div>

              {/* Source & Application Links */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  URLs & Web References
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block">Source Announcement</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 truncate block">
                        {opportunity.sourceUrl || 'No source URL provided'}
                      </span>
                    </div>
                    {opportunity.sourceUrl && (
                      <a
                        href={opportunity.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block">Application Portal</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 truncate block">
                        {opportunity.applicationUrl || 'No direct application URL provided'}
                      </span>
                    </div>
                    {opportunity.applicationUrl && (
                      <a
                        href={opportunity.applicationUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Program Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed whitespace-pre-line">
                  {opportunity.description || 'No description provided.'}
                </p>
              </div>

              {/* Eligibility Criteria */}
              {opportunity.eligibility && opportunity.eligibility.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Eligibility Criteria
                  </h4>
                  <ul className="space-y-1.5">
                    {opportunity.eligibility.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <ValidationInspector
              validationResult={opportunity.validationResult}
              onRunValidation={() => onRunValidation(opportunity.id)}
              onOpenEditor={() => setIsEditModalOpen(true)}
            />
          )}

          {activeTab === 'deduplication' && (
            <DeduplicationInspector
              currentOpportunity={opportunity}
              duplicateCandidates={duplicateCandidates}
              onKeepBoth={(candId) => onKeepBoth(opportunity.id, candId)}
              onIgnoreDuplicate={(candId) => onIgnoreDuplicate(opportunity.id, candId)}
              onOpenMergeWizard={(cand) => setSelectedMergeCandidate(cand)}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationWorkspace
              opportunity={opportunity}
              onUpdateVerification={(rec) => onUpdateVerification(opportunity.id, rec)}
              onRejectOpportunity={(reason) => onReject(opportunity.id, reason)}
            />
          )}

          {activeTab === 'history' && (
            <PipelineHistoryTimeline events={opportunity.history} />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Close Inspector
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunValidation(opportunity.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Re-validate
            </button>

            {!isPublished && isVerified && (
              <button
                onClick={() => onPublish(opportunity.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
              >
                <Globe className="w-4 h-4" />
                Publish to Catalog
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Sub-Modals */}
      {isEditModalOpen && (
        <IncomingOpportunityEditModal
          opportunity={opportunity}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={onSaveEdit}
        />
      )}

      {selectedMergeCandidate && (
        <MergeOpportunitiesModal
          incomingOpportunity={opportunity}
          candidate={selectedMergeCandidate}
          onClose={() => setSelectedMergeCandidate(null)}
          onConfirmMerge={(merged) => {
            onMergeDuplicate(opportunity.id, selectedMergeCandidate.opportunityId, merged);
            setSelectedMergeCandidate(null);
          }}
        />
      )}
    </div>
  );
};
