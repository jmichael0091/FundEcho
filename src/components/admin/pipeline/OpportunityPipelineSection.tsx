import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  RotateCw, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Compass, 
  DownloadCloud, 
  CheckSquare, 
  Copy, 
  Eye, 
  ShieldCheck, 
  Globe, 
  AlertTriangle, 
  Sparkles, 
  FileEdit,
  ExternalLink,
  Layers,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';
import { 
  IncomingOpportunity, 
  PipelineStage, 
  PipelineStatus, 
  SourceQuality,
  VerificationRecord,
  DuplicateCandidate
} from '../../../types/pipeline';
import { UserProfile } from '../../../types';
import { 
  getIncomingOpportunities, 
  saveIncomingOpportunity, 
  importOpportunityToPipeline, 
  ignoreDiscoveryOpportunity, 
  runValidationOnItem, 
  ignoreDuplicateCandidate, 
  mergeDuplicateCandidate, 
  updateOpportunityVerification, 
  rejectPipelineOpportunity, 
  publishOpportunityFromPipeline, 
  getPipelineStats, 
  resetPipelineDemoData 
} from '../../../utils/pipelineStorage';
import { PipelineStageStepper, StageCountMap } from './PipelineStageStepper';
import { DiscoveryQueue } from './DiscoveryQueue';
import { PipelineStatusBadge } from './PipelineStatusBadge';
import { SourceQualityBadge } from './SourceQualityBadge';
import { PipelineItemModal } from './PipelineItemModal';
import { IncomingOpportunityEditModal } from './IncomingOpportunityEditModal';

export interface OpportunityPipelineSectionProps {
  currentUser?: UserProfile | null;
  onOpportunityPublishedToCatalog?: () => void;
}

export const OpportunityPipelineSection: React.FC<OpportunityPipelineSectionProps> = ({
  currentUser,
  onOpportunityPublishedToCatalog,
}) => {
  // Main local pipeline state
  const [items, setItems] = useState<IncomingOpportunity[]>(() => getIncomingOpportunities());
  const [selectedStage, setSelectedStage] = useState<PipelineStage | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<PipelineStatus | 'all'>('all');
  const [selectedQualityFilter, setSelectedQualityFilter] = useState<SourceQuality | 'all'>('all');

  // Modals state
  const [activeItemModal, setActiveItemModal] = useState<IncomingOpportunity | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const reloadData = () => {
    const fresh = getIncomingOpportunities();
    setItems(fresh);
    if (activeItemModal) {
      const found = fresh.find((i) => i.id === activeItemModal.id);
      setActiveItemModal(found || null);
    }
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  // Stage counts calculation
  const stageCounts: StageCountMap = useMemo(() => {
    return {
      discover: items.filter((i) => i.pipelineStatus === 'Discovered').length,
      import: items.filter((i) => i.pipelineStatus === 'Imported').length,
      validate: items.filter((i) => i.pipelineStatus === 'Validation Failed').length,
      deduplicate: items.filter((i) => i.pipelineStatus === 'Duplicate Suspected').length,
      review: items.filter((i) => i.pipelineStatus === 'Ready for Review').length,
      verify: items.filter((i) => i.pipelineStatus === 'Under Verification' || i.pipelineStatus === 'Verified').length,
      publish: items.filter((i) => i.pipelineStatus === 'Published').length,
      all: items.length,
    };
  }, [items]);

  // Filtered items logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesOrg = item.organization.toLowerCase().includes(q);
        const matchesSource = item.source.toLowerCase().includes(q);
        const matchesCountry = item.country.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrg && !matchesSource && !matchesCountry) {
          return false;
        }
      }

      // Stage filter
      if (selectedStage !== 'all') {
        switch (selectedStage) {
          case 'discover':
            if (item.pipelineStatus !== 'Discovered') return false;
            break;
          case 'import':
            if (item.pipelineStatus !== 'Imported') return false;
            break;
          case 'validate':
            if (item.pipelineStatus !== 'Validation Failed') return false;
            break;
          case 'deduplicate':
            if (item.pipelineStatus !== 'Duplicate Suspected') return false;
            break;
          case 'review':
            if (item.pipelineStatus !== 'Ready for Review') return false;
            break;
          case 'verify':
            if (item.pipelineStatus !== 'Under Verification' && item.pipelineStatus !== 'Verified') return false;
            break;
          case 'publish':
            if (item.pipelineStatus !== 'Published') return false;
            break;
        }
      }

      // Status dropdown filter
      if (selectedStatusFilter !== 'all' && item.pipelineStatus !== selectedStatusFilter) {
        return false;
      }

      // Source Quality filter
      if (selectedQualityFilter !== 'all' && item.sourceQuality !== selectedQualityFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedStage, selectedStatusFilter, selectedQualityFilter]);

  // Handlers
  const handleImport = (id: string) => {
    const res = importOpportunityToPipeline(id, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    if (res) {
      showToast(`"${res.title}" imported into processing pipeline (${res.pipelineStatus}).`, 'success');
      reloadData();
    }
  };

  const handleIgnoreDiscovery = (id: string) => {
    const ok = ignoreDiscoveryOpportunity(id, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    if (ok) {
      showToast('Opportunity removed from discovery queue.', 'info');
      reloadData();
    }
  };

  const handleRunValidation = (id: string) => {
    const res = runValidationOnItem(id, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    if (res) {
      const msg = res.validationResult?.isValid
        ? `Validation passed (${res.validationResult.passedCount} checks passed).`
        : `Validation found ${res.validationResult?.issuesCount} issue(s) requiring attention.`;
      showToast(msg, res.validationResult?.isValid ? 'success' : 'info');
      reloadData();
    }
  };

  const handleRunBatchValidation = () => {
    items.forEach((item) => {
      runValidationOnItem(item.id, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    });
    showToast(`Executed automated validation across ${items.length} pipeline records.`, 'success');
    reloadData();
  };

  const handleKeepBothDuplicates = (oppId: string, candidateId: string) => {
    const res = ignoreDuplicateCandidate(oppId, candidateId, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    if (res) {
      showToast('Duplicate warning resolved. Kept both opportunities.', 'success');
      reloadData();
    }
  };

  const handleIgnoreDuplicate = (oppId: string, candidateId: string) => {
    const res = ignoreDuplicateCandidate(oppId, candidateId, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    if (res) {
      showToast('Dismissed duplicate candidate warning.', 'info');
      reloadData();
    }
  };

  const handleMergeDuplicate = (oppId: string, candidateId: string, merged: Partial<IncomingOpportunity>) => {
    const res = mergeDuplicateCandidate(oppId, candidateId, merged, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    if (res) {
      showToast('Successfully merged fields and updated opportunity record.', 'success');
      reloadData();
    }
  };

  const handleUpdateVerification = (oppId: string, record: VerificationRecord) => {
    const res = updateOpportunityVerification(oppId, record, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    if (res) {
      showToast(`Verification record updated: Status is now "${record.status}".`, 'success');
      reloadData();
    }
  };

  const handleReject = (oppId: string, reason: string) => {
    const res = rejectPipelineOpportunity(oppId, reason, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    if (res) {
      showToast(`Opportunity rejected. Status set to Rejected.`, 'info');
      reloadData();
    }
  };

  const handlePublish = (oppId: string) => {
    const result = publishOpportunityFromPipeline(oppId, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    if (result) {
      showToast(`🎉 "${result.pipelineItem.title}" successfully published to public seeker catalog!`, 'success');
      reloadData();
      if (onOpportunityPublishedToCatalog) {
        onOpportunityPublishedToCatalog();
      }
    }
  };

  const handleSaveEdit = (data: Partial<IncomingOpportunity>) => {
    const saved = saveIncomingOpportunity(data, currentUser?.name ? `${currentUser.name} (Admin)` : 'Admin');
    showToast(`Saved and re-validated "${saved.title}".`, 'success');
    reloadData();
  };

  const handleResetDemo = () => {
    resetPipelineDemoData();
    showToast('Reset Opportunity Pipeline to initial demo dataset.', 'info');
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
              : notificationMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
              : 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Pipeline Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Opportunity Ingestion & Verification Pipeline
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Step 12 Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Multi-stage editorial intake: Discover incoming feeds, validate field integrity, detect duplicates, perform human source verification, and release to the public catalog.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-pipeline-batch-validate"
            onClick={handleRunBatchValidation}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            title="Execute automated validation checks on all records"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Run Batch Validation
          </button>

          <button
            id="btn-pipeline-reset-demo"
            onClick={handleResetDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Reset to demo discovery dataset"
          >
            Reset Demo Data
          </button>

          <button
            id="btn-pipeline-add-record"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Discovery Record
          </button>
        </div>
      </div>

      {/* Stage Progression Stepper */}
      <PipelineStageStepper
        activeStage={selectedStage}
        onSelectStage={setSelectedStage}
        counts={stageCounts}
      />

      {/* Search, Status & Source Quality Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-pipeline-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, provider, source feed, or country..."
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="select-pipeline-status"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as PipelineStatus | 'all')}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Pipeline Statuses</option>
              <option value="Discovered">Discovered</option>
              <option value="Imported">Imported</option>
              <option value="Validation Failed">Validation Failed</option>
              <option value="Ready for Review">Ready for Review</option>
              <option value="Duplicate Suspected">Duplicate Suspected</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Verified">Verified</option>
              <option value="Published">Published</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Source Quality Filter */}
          <div>
            <select
              id="select-pipeline-source-quality"
              value={selectedQualityFilter}
              onChange={(e) => setSelectedQualityFilter(e.target.value as SourceQuality | 'all')}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Source Qualities</option>
              <option value="Government/official institution">Government / Official</option>
              <option value="Official provider">Official Provider</option>
              <option value="Established organization">Established Org</option>
              <option value="Secondary source">Secondary Source</option>
              <option value="Unknown source">Unknown Source</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Tags */}
        {(selectedStage !== 'all' || selectedStatusFilter !== 'all' || selectedQualityFilter !== 'all' || searchQuery.trim()) && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> pipeline records
            </span>
            <button
              onClick={() => {
                setSelectedStage('all');
                setSelectedStatusFilter('all');
                setSelectedQualityFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content View: Discovery Queue or Pipeline Table */}
      {selectedStage === 'discover' ? (
        <DiscoveryQueue
          opportunities={filteredItems}
          onImport={handleImport}
          onIgnore={handleIgnoreDiscovery}
          onEdit={(opp) => setActiveItemModal(opp)}
          onInspect={(opp) => setActiveItemModal(opp)}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Unified Table */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Opportunity & Provider</th>
                  <th className="py-3.5 px-3">Pipeline Status</th>
                  <th className="py-3.5 px-3">Validation & Quality</th>
                  <th className="py-3.5 px-3">Duplicate Flags</th>
                  <th className="py-3.5 px-3">Deadline</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No opportunities match the selected stage and search filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const valResult = item.validationResult;
                    const dupCount = item.duplicateCandidates ? item.duplicateCandidates.length : 0;
                    const isVerified = item.pipelineStatus === 'Verified';
                    const isPublished = item.pipelineStatus === 'Published';

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Title & Organization */}
                        <td className="py-3.5 px-4 max-w-[280px]">
                          <div
                            onClick={() => setActiveItemModal(item)}
                            className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer"
                          >
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.organization} • <span className="italic">{item.source}</span>
                          </div>
                          {item.amountDisplayText && (
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {item.amountDisplayText}
                            </div>
                          )}
                        </td>

                        {/* Pipeline Status */}
                        <td className="py-3.5 px-3">
                          <PipelineStatusBadge status={item.pipelineStatus} size="xs" />
                        </td>

                        {/* Validation & Source Quality */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1">
                            {valResult && (
                              <span
                                className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                                  valResult.isValid
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {valResult.isValid ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    {valResult.passedCount} checks passed
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-3 h-3" />
                                    {valResult.issuesCount} issue(s) require attention
                                  </>
                                )}
                              </span>
                            )}
                            <SourceQualityBadge quality={item.sourceQuality} size="xs" />
                          </div>
                        </td>

                        {/* Duplicate Flags */}
                        <td className="py-3.5 px-3">
                          {dupCount > 0 ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                              <Copy className="w-3 h-3" />
                              {dupCount} {dupCount === 1 ? 'candidate' : 'candidates'}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Clean</span>
                          )}
                        </td>

                        {/* Deadline */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                          {item.deadline || 'Rolling'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`btn-table-inspect-${item.id}`}
                              onClick={() => setActiveItemModal(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </button>

                            {item.pipelineStatus === 'Discovered' && (
                              <button
                                id={`btn-table-import-${item.id}`}
                                onClick={() => handleImport(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs transition-all"
                              >
                                <DownloadCloud className="w-3.5 h-3.5" />
                                Import
                              </button>
                            )}

                            {!isPublished && isVerified && (
                              <button
                                id={`btn-table-publish-${item.id}`}
                                onClick={() => handlePublish(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs transition-all"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                Publish
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Stacked Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No opportunities match the selected criteria.
              </div>
            ) : (
              filteredItems.map((item) => {
                const valResult = item.validationResult;
                const isVerified = item.pipelineStatus === 'Verified';
                const isPublished = item.pipelineStatus === 'Published';

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <PipelineStatusBadge status={item.pipelineStatus} size="xs" />
                        <SourceQualityBadge quality={item.sourceQuality} size="xs" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.dateDiscovered}
                      </span>
                    </div>

                    <div>
                      <h4
                        onClick={() => setActiveItemModal(item)}
                        className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2"
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.organization} • {item.fundingType}
                      </p>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Funding</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 block truncate">
                          {item.amountDisplayText || 'Available'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Deadline</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          {item.deadline || 'Rolling'}
                        </span>
                      </div>
                    </div>

                    {/* Validation pill note */}
                    {valResult && !valResult.isValid && (
                      <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Validation: {valResult.issuesCount} issue(s) require attention</span>
                      </div>
                    )}

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setActiveItemModal(item)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Workspace
                      </button>

                      <div className="flex items-center gap-1.5">
                        {item.pipelineStatus === 'Discovered' && (
                          <button
                            onClick={() => handleImport(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                            Import
                          </button>
                        )}

                        {!isPublished && isVerified && (
                          <button
                            onClick={() => handlePublish(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            Publish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Main Single-Item Inspector Modal */}
      {activeItemModal && (
        <PipelineItemModal
          opportunity={activeItemModal}
          isOpen={Boolean(activeItemModal)}
          onClose={() => setActiveItemModal(null)}
          onImport={handleImport}
          onRunValidation={handleRunValidation}
          onKeepBoth={handleKeepBothDuplicates}
          onIgnoreDuplicate={handleIgnoreDuplicate}
          onMergeDuplicate={handleMergeDuplicate}
          onUpdateVerification={handleUpdateVerification}
          onReject={handleReject}
          onPublish={handlePublish}
          onSaveEdit={handleSaveEdit}
        />
      )}

      {/* Add New Discovery Record Modal */}
      {isAddModalOpen && (
        <IncomingOpportunityEditModal
          opportunity={{}}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};
