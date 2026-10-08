import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Globe, 
  Calendar, 
  DollarSign, 
  Building, 
  FileText, 
  Users, 
  ShieldCheck, 
  Tag 
} from 'lucide-react';
import { OpportunityType, OpportunityRegion } from '../../../types';
import { IncomingOpportunity, SourceQuality, PipelineStatus } from '../../../types/pipeline';
import { SourceQualityBadge } from './SourceQualityBadge';

export interface IncomingOpportunityEditModalProps {
  opportunity: Partial<IncomingOpportunity>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<IncomingOpportunity>) => void;
}

const FUNDING_TYPES: OpportunityType[] = [
  'Grant',
  'Scholarship',
  'Fellowship',
  'Competition',
  'NGO & Non-Profit',
  'Business Funding',
  'Research Grant',
];

const SOURCE_QUALITIES: SourceQuality[] = [
  'Government/official institution',
  'Official provider',
  'Established organization',
  'Secondary source',
  'Unknown source',
];

const REGIONS: OpportunityRegion[] = [
  'Global',
  'North America',
  'Europe',
  'Asia-Pacific',
  'Africa',
  'Latin America',
  'Middle East',
];

export const IncomingOpportunityEditModal: React.FC<IncomingOpportunityEditModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(opportunity.title || '');
  const [organization, setOrganization] = useState(opportunity.organization || '');
  const [source, setSource] = useState(opportunity.source || '');
  const [sourceUrl, setSourceUrl] = useState(opportunity.sourceUrl || '');
  const [applicationUrl, setApplicationUrl] = useState(opportunity.applicationUrl || '');
  const [sourceQuality, setSourceQuality] = useState<SourceQuality>(
    opportunity.sourceQuality || 'Secondary source'
  );
  const [fundingType, setFundingType] = useState<OpportunityType>(
    opportunity.fundingType || 'Grant'
  );
  const [category, setCategory] = useState(opportunity.category || 'General Funding');
  const [country, setCountry] = useState(opportunity.country || 'Global');
  const [region, setRegion] = useState<OpportunityRegion>(opportunity.region || 'Global');
  const [deadline, setDeadline] = useState(opportunity.deadline || '');
  const [amountMin, setAmountMin] = useState<string>(
    opportunity.amountMin !== undefined ? String(opportunity.amountMin) : ''
  );
  const [amountMax, setAmountMax] = useState<string>(
    opportunity.amountMax !== undefined ? String(opportunity.amountMax) : ''
  );
  const [amountDisplayText, setAmountDisplayText] = useState(
    opportunity.amountDisplayText || ''
  );
  const [description, setDescription] = useState(opportunity.description || '');
  const [eligibilityText, setEligibilityText] = useState(
    opportunity.eligibility ? opportunity.eligibility.join('\n') : ''
  );
  const [requirementsText, setRequirementsText] = useState(
    opportunity.requirements ? opportunity.requirements.join('\n') : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const minNum = amountMin ? parseFloat(amountMin) : undefined;
    const maxNum = amountMax ? parseFloat(amountMax) : undefined;

    const computedDisplayText = amountDisplayText.trim() || (
      minNum && maxNum ? `$${minNum.toLocaleString()} – $${maxNum.toLocaleString()}`
      : maxNum ? `$${maxNum.toLocaleString()}`
      : 'Funding Available'
    );

    const eligibilityArray = eligibilityText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    const requirementsArray = requirementsText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    onSave({
      ...opportunity,
      title: title.trim(),
      organization: organization.trim(),
      source: source.trim() || 'Manual Admin Intake',
      sourceUrl: sourceUrl.trim(),
      applicationUrl: applicationUrl.trim(),
      sourceQuality,
      fundingType,
      category: category.trim(),
      country: country.trim(),
      region,
      deadline: deadline.trim(),
      amountMin: minNum,
      amountMax: maxNum,
      amountDisplayText: computedDisplayText,
      description: description.trim(),
      eligibility: eligibilityArray,
      requirements: requirementsArray,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {opportunity.id ? 'Edit Pipeline Opportunity Record' : 'Add Opportunity to Discovery Queue'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update record details. Automated validation & deduplication will execute upon saving.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Opportunity Title *
              </label>
              <input
                id="input-edit-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="e.g., European Clean Energy Innovation Grant 2026"
              />
            </div>

            {/* Provider */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Provider Organization *
              </label>
              <input
                id="input-edit-organization"
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="e.g., European Commission"
              />
            </div>

            {/* Source Quality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Source Quality Classification
              </label>
              <select
                id="select-edit-source-quality"
                value={sourceQuality}
                onChange={(e) => setSourceQuality(e.target.value as SourceQuality)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                {SOURCE_QUALITIES.map((sq) => (
                  <option key={sq} value={sq}>
                    {sq}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Origin Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Discovery Source / Feed Name
              </label>
              <input
                id="input-edit-source-name"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="e.g., EU Funding Portal Feed"
              />
            </div>

            {/* Funding Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Funding Type *
              </label>
              <select
                id="select-edit-funding-type"
                value={fundingType}
                onChange={(e) => setFundingType(e.target.value as OpportunityType)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                {FUNDING_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>

            {/* Source URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Source Announcement URL *
              </label>
              <input
                id="input-edit-source-url"
                type="url"
                required
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="https://..."
              />
            </div>

            {/* Application URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Direct Application Portal URL
              </label>
              <input
                id="input-edit-app-url"
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="https://..."
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Application Deadline (YYYY-MM-DD or Rolling)
              </label>
              <input
                id="input-edit-deadline"
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="2026-12-01"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category / Sector
              </label>
              <input
                id="input-edit-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="e.g., Climate & Environment"
              />
            </div>

            {/* Amount Min / Max */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Min Amount (USD/EUR)
              </label>
              <input
                id="input-edit-amount-min"
                type="number"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Max Amount (USD/EUR)
              </label>
              <input
                id="input-edit-amount-max"
                type="number"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="250000"
              />
            </div>

            {/* Region / Country */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Region
              </label>
              <select
                id="select-edit-region"
                value={region}
                onChange={(e) => setRegion(e.target.value as OpportunityRegion)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Country / Geographic Scope
              </label>
              <input
                id="input-edit-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="Global, United States, Europe..."
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Program Description *
            </label>
            <textarea
              id="textarea-edit-description"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              placeholder="Full grant description..."
            />
          </div>

          {/* Eligibility Items */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Eligibility Criteria (one per line)
            </label>
            <textarea
              id="textarea-edit-eligibility"
              rows={2}
              value={eligibilityText}
              onChange={(e) => setEligibilityText(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-mono"
              placeholder="Early-stage startups with TRL 4+&#10;Registered in EU Member States"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              id="btn-save-incoming-record"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              Save & Revalidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
