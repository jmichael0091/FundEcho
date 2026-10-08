import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  FileText,
  Building,
  Globe
} from 'lucide-react';
import { IncomingOpportunity, VerificationRecord } from '../../../types/pipeline';
import { SourceQualityBadge } from './SourceQualityBadge';

export interface VerificationWorkspaceProps {
  opportunity: IncomingOpportunity;
  onUpdateVerification: (record: VerificationRecord) => void;
  onRejectOpportunity: (reason: string) => void;
  currentUserEmail?: string;
}

export const VerificationWorkspace: React.FC<VerificationWorkspaceProps> = ({
  opportunity,
  onUpdateVerification,
  onRejectOpportunity,
  currentUserEmail = 'admin@fundecho.org',
}) => {
  const currentRecord = opportunity.verificationRecord;
  const [officialProvider, setOfficialProvider] = useState(
    currentRecord?.officialProvider || opportunity.organization
  );
  const [sourceUrl, setSourceUrl] = useState(currentRecord?.sourceUrl || opportunity.sourceUrl);
  const [applicationUrl, setApplicationUrl] = useState(
    currentRecord?.applicationUrl || opportunity.applicationUrl || ''
  );
  const [fundingAmount, setFundingAmount] = useState(
    currentRecord?.fundingAmount || opportunity.amountDisplayText
  );
  const [deadline, setDeadline] = useState(currentRecord?.deadline || opportunity.deadline || '');
  const [eligibility, setEligibility] = useState(
    currentRecord?.eligibility || opportunity.eligibility.join('; ') || opportunity.country
  );
  const [notes, setNotes] = useState(currentRecord?.notes || '');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const currentStatus = currentRecord?.status || (opportunity.pipelineStatus === 'Verified' ? 'Verified' : 'Under Review');

  const handleSaveAction = (status: VerificationRecord['status']) => {
    const record: VerificationRecord = {
      officialProvider: officialProvider.trim(),
      sourceUrl: sourceUrl.trim(),
      applicationUrl: applicationUrl.trim(),
      fundingAmount: fundingAmount.trim(),
      deadline: deadline.trim(),
      eligibility: eligibility.trim(),
      lastCheckedDate: new Date().toISOString().split('T')[0],
      verifiedBy: currentUserEmail,
      notes: notes.trim(),
      status,
    };

    onUpdateVerification(record);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    onRejectOpportunity(rejectReason.trim());
    setShowRejectForm(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                Human Verification Workspace
              </h3>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  currentStatus === 'Verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : currentStatus === 'Rejected'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Verification must always be a deliberate administrative action. Never automatically trust or auto-verify records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SourceQualityBadge quality={opportunity.sourceQuality} size="sm" />
        </div>
      </div>

      {/* Info Notice regarding source quality */}
      <div className="px-4 py-2.5 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Source Quality Notice:</strong> Classified as "{opportunity.sourceQuality}". Source indicators are informational only and never bypass manual primary source verification.
        </span>
      </div>

      {/* Workspace Form / Fields */}
      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Official Provider */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              Official Provider / Organization
            </label>
            <input
              id="input-verify-provider"
              type="text"
              value={officialProvider}
              onChange={(e) => setOfficialProvider(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              placeholder="e.g., European Commission"
            />
          </div>

          {/* Funding Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              Verified Funding Amount
            </label>
            <input
              id="input-verify-amount"
              type="text"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              placeholder="e.g., $100,000 – $500,000"
            />
          </div>

          {/* Source URL with quick launcher */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Origin / Source Announcement URL
              </label>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  Open in Tab <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              id="input-verify-source-url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              placeholder="https://..."
            />
          </div>

          {/* Application URL with quick launcher */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Direct Application Portal URL
              </label>
              {applicationUrl && (
                <a
                  href={applicationUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  Test Portal <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              id="input-verify-app-url"
              type="url"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              placeholder="https://..."
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Verified Application Deadline
            </label>
            <input
              id="input-verify-deadline"
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              placeholder="YYYY-MM-DD or Rolling"
            />
          </div>

          {/* Eligibility Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Verified Eligibility & Geography
            </label>
            <input
              id="input-verify-eligibility"
              type="text"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              placeholder="e.g., Startups, Universities, Citizens of..."
            />
          </div>
        </div>

        {/* Verification Audit Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Verification Assessment Notes
          </label>
          <textarea
            id="textarea-verify-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            placeholder="Record audit trail: Checked official portal, confirmed active application portal, validated funding guidelines..."
          />
        </div>

        {/* Last Checked Date & Verifier pill */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Checked Date: <strong>{currentRecord?.lastCheckedDate || 'Not yet verified'}</strong></span>
          </div>
          {currentRecord?.verifiedBy && (
            <div>
              Audited by: <strong>{currentRecord.verifiedBy}</strong>
            </div>
          )}
        </div>

        {/* Decision Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            {!showRejectForm ? (
              <button
                id="btn-verify-show-reject"
                onClick={() => setShowRejectForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject Opportunity
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  id="input-reject-reason"
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (e.g. Discontinued, Ineligible source)..."
                  className="text-xs px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-900 dark:text-rose-200 focus:outline-hidden"
                />
                <button
                  id="btn-confirm-reject"
                  onClick={handleConfirmReject}
                  disabled={!rejectReason.trim()}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-all"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-verify-needs-review"
              onClick={() => handleSaveAction('Needs Review')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Needs Review
            </button>

            <button
              id="btn-verify-mark-verified"
              onClick={() => handleSaveAction('Verified')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Mark as Verified
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
