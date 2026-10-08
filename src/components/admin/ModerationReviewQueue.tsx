import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ExternalLink, 
  Building2, 
  Globe, 
  ShieldCheck, 
  FileText, 
  Eye, 
  Edit3,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Opportunity } from '../../types';
import { PublicationStatus, AdminVerificationStatus } from '../../types/admin';
import { Button } from '../ui/Button';
import { DeadlineBadge } from '../deadlines/DeadlineBadge';
import { AdminConfirmationModal } from './AdminConfirmationModal';

export interface ModerationReviewQueueProps {
  pendingOpportunities: Opportunity[];
  onApproveAndPublish: (opportunityId: string, reviewNotes?: string) => void;
  onRequestChanges: (opportunityId: string, reviewNotes: string) => void;
  onRejectArchive: (opportunityId: string, reviewNotes: string) => void;
  onInspect: (opportunity: Opportunity) => void;
  onEdit: (opportunity: Opportunity) => void;
}

export const ModerationReviewQueue: React.FC<ModerationReviewQueueProps> = ({
  pendingOpportunities,
  onApproveAndPublish,
  onRequestChanges,
  onRejectArchive,
  onInspect,
  onEdit,
}) => {
  const [selectedOppId, setSelectedOppId] = useState<string | null>(
    pendingOpportunities[0]?.id || null
  );
  const [reviewFeedback, setReviewFeedback] = useState<Record<string, string>>({});
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'request-changes' | 'reject';
    oppId: string;
    oppTitle: string;
  }>({
    isOpen: false,
    type: 'approve',
    oppId: '',
    oppTitle: '',
  });

  const selectedOpp = pendingOpportunities.find((o) => o.id === selectedOppId) || pendingOpportunities[0];

  const handleActionConfirm = () => {
    const oppId = confirmModal.oppId;
    const notes = reviewFeedback[oppId] || '';

    if (confirmModal.type === 'approve') {
      onApproveAndPublish(oppId, notes);
    } else if (confirmModal.type === 'request-changes') {
      onRequestChanges(oppId, notes || 'Changes requested by editorial review team.');
    } else if (confirmModal.type === 'reject') {
      onRejectArchive(oppId, notes || 'Rejected due to unmet eligibility criteria or unverified provider.');
    }

    setConfirmModal({ isOpen: false, type: 'approve', oppId: '', oppTitle: '' });
  };

  return (
    <div className="space-y-6">
      {/* Queue Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Moderation & Review Queue
            </h2>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {pendingOpportunities.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect opportunity submissions, verify official provider sources, leave editorial feedback, and approve for public publishing.
          </p>
        </div>
      </div>

      {pendingOpportunities.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="h-14 w-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              All caught up! No pending reviews
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Every submitted grant and funding program has been reviewed. New submissions from editors and partners will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of items pending review */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Pending Submissions ({pendingOpportunities.length})
            </h3>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {pendingOpportunities.map((opp) => {
                const isSelected = (selectedOpp?.id === opp.id);
                return (
                  <div
                    key={opp.id}
                    id={`review-queue-item-${opp.id}`}
                    onClick={() => setSelectedOppId(opp.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 text-left ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending Review
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {opp.amount.displayText}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {opp.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="truncate max-w-[140px] font-semibold">{opp.organization}</span>
                      <DeadlineBadge deadline={opp.deadline} size="xs" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Full Inspection Panel for Selected Item */}
          {selectedOpp && (
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-md space-y-6">
              {/* Inspection Header */}
              <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Reviewing: {selectedOpp.type}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {selectedOpp.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onInspect(selectedOpp)}
                      leftIcon={<Eye className="w-3 h-3" />}
                    >
                      Full Modal Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onEdit(selectedOpp)}
                      leftIcon={<Edit3 className="w-3 h-3" />}
                    >
                      Edit Content
                    </Button>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedOpp.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{selectedOpp.organization}</span>
                  <span>•</span>
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOpp.location}</span>
                </div>
              </div>

              {/* Funding & Official Source Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Funding Amount</span>
                  <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                    {selectedOpp.amount.displayText}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Application Deadline</span>
                  <div className="pt-0.5">
                    <DeadlineBadge deadline={selectedOpp.deadline} size="xs" />
                  </div>
                </div>
                <div className="sm:col-span-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Official Source & Link</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <a
                      href={selectedOpp.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>{selectedOpp.applicationUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Description preview */}
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                  Description & Scope
                </span>
                <p className="leading-relaxed bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  {selectedOpp.description || selectedOpp.summary}
                </p>
              </div>

              {/* Editorial Feedback & Review Notes Textarea */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Editorial Review Notes & Feedback</span>
                </label>
                <textarea
                  id={`review-notes-${selectedOpp.id}`}
                  rows={3}
                  value={reviewFeedback[selectedOpp.id] || selectedOpp.reviewNotes || ''}
                  onChange={(e) =>
                    setReviewFeedback({
                      ...reviewFeedback,
                      [selectedOpp.id]: e.target.value,
                    })
                  }
                  placeholder="Add notes explaining reason for approval, specific corrections needed, or verified source URL details..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Decision Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    id="admin-review-reject-btn"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        type: 'reject',
                        oppId: selectedOpp.id,
                        oppTitle: selectedOpp.title,
                      })
                    }
                    leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                    className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    Reject / Archive
                  </Button>

                  <Button
                    id="admin-review-changes-btn"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        type: 'request-changes',
                        oppId: selectedOpp.id,
                        oppTitle: selectedOpp.title,
                      })
                    }
                    leftIcon={<AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                  >
                    Request Changes
                  </Button>
                </div>

                <Button
                  id="admin-review-approve-btn"
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      type: 'approve',
                      oppId: selectedOpp.id,
                      oppTitle: selectedOpp.title,
                    })
                  }
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Approve & Publish
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Review Actions */}
      <AdminConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: 'approve', oppId: '', oppTitle: '' })}
        onConfirm={handleActionConfirm}
        title={
          confirmModal.type === 'approve'
            ? 'Approve & Publish Opportunity'
            : confirmModal.type === 'request-changes'
            ? 'Request Changes'
            : 'Reject & Archive Opportunity'
        }
        description={
          confirmModal.type === 'approve'
            ? `Are you sure you want to approve "${confirmModal.oppTitle}"? It will immediately be marked as Published & Verified and will appear on the live seeker portal.`
            : confirmModal.type === 'request-changes'
            ? `Move "${confirmModal.oppTitle}" back to Draft status so the contributor or editor can make necessary adjustments.`
            : `Archive "${confirmModal.oppTitle}" and remove it from the moderation queue.`
        }
        confirmLabel={
          confirmModal.type === 'approve'
            ? 'Approve & Publish'
            : confirmModal.type === 'request-changes'
            ? 'Send Back to Draft'
            : 'Reject Submission'
        }
        variant={confirmModal.type === 'approve' ? 'primary' : confirmModal.type === 'request-changes' ? 'warning' : 'danger'}
      />
    </div>
  );
};
