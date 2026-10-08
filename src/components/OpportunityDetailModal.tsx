import React from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
  Award,
  Info
} from 'lucide-react';
import { Opportunity } from '../types';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (opportunity: Opportunity) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  if (!opportunity) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Opportunity link copied to clipboard!');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top bar with tags & actions */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="indigo" size="md">
                {opportunity.type}
              </Badge>
              <Badge variant="slate" size="md">
                {opportunity.category}
              </Badge>
              {opportunity.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Verified Opportunity
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {opportunity.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 flex-wrap">
              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <span className={`h-6 w-6 rounded flex items-center justify-center text-xs font-bold text-white shadow-2xs ${opportunity.orgLogoBg || 'bg-slate-800'}`}>
                  {opportunity.orgInitials || 'OR'}
                </span>
                <span>{opportunity.organization}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>{opportunity.location} ({opportunity.region})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleBookmark && onToggleBookmark(opportunity)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isBookmarked ? 'Saved' : 'Save opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-md shadow-slate-200/50 dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
          <div className="space-y-0.5">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Award Value
            </span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {opportunity.amount.displayText}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {opportunity.amount.isFullyFunded ? 'Fully funded stipend & costs' : 'Direct non-dilutive award'}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Application Deadline
            </span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {opportunity.deadline}
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              {opportunity.daysLeft} days remaining to apply
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Date Posted
            </span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {opportunity.datePosted}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified by FundEcho editors</p>
          </div>
        </div>

        {/* Overview & Description */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Program Overview
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {opportunity.description}
          </p>
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/60 rounded-xl border border-indigo-100/90 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 shadow-2xs">
            <strong>Target Audience:</strong> {opportunity.targetAudience}
          </div>
        </div>

        {/* Award Details */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Award & Benefits Breakdown
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            {opportunity.awardDetails}
          </p>
        </div>

        {/* Eligibility Criteria */}
        <div className="space-y-2.5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Eligibility Criteria
          </h2>
          <ul className="space-y-2">
            {opportunity.eligibility.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800/80">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Application Requirements */}
        <div className="space-y-2.5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Application Requirements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {opportunity.requirements.map((req, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 shadow-2xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">0{idx + 1}.</span>
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Information & Process */}
        <div className="space-y-2.5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Application Information & Submission Details
          </h2>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-700/70">
              <span className="font-semibold text-slate-900 dark:text-white">Application Portal:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Direct Provider Submission</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-700/70">
              <span className="font-semibold text-slate-900 dark:text-white">Submission Language:</span>
              <span>English (or certified official translations)</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">Review & Decision Cycle:</span>
              <span>Typically 4–8 weeks post deadline closing</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Keywords & Classifications
          </span>
          <div className="flex flex-wrap gap-1.5">
            {opportunity.tags.map((t, idx) => (
              <Badge key={idx} variant="slate" size="sm">
                #{t}
              </Badge>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>FundEcho never charges fees to view or apply for opportunities.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>

            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center font-medium transition-all select-none rounded-xl px-5 py-2.5 text-sm bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-md shadow-indigo-600/20 border border-indigo-600 dark:border-indigo-500 gap-2"
            >
              <span>Apply on Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
