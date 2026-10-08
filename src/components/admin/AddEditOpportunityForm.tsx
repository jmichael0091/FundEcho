import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Globe, 
  DollarSign, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Layers,
  HelpCircle,
  Plus,
  X
} from 'lucide-react';
import { Opportunity, Category, OpportunityType, OpportunityRegion } from '../../types';
import { OpportunityFormData, PublicationStatus, AdminVerificationStatus } from '../../types/admin';
import { Button } from '../ui/Button';

export interface AddEditOpportunityFormProps {
  initialOpportunity?: Opportunity | null;
  categories: Category[];
  onSave: (formData: OpportunityFormData) => void;
  onCancel: () => void;
}

const OPPORTUNITY_TYPES: OpportunityType[] = [
  'Grant',
  'Scholarship',
  'Fellowship',
  'Competition',
  'Business Funding',
  'Research Grant',
];

const OPPORTUNITY_REGIONS: OpportunityRegion[] = [
  'Global',
  'North America',
  'Europe',
  'Asia-Pacific',
  'Africa',
  'Latin America',
  'Middle East',
];

const COMMON_APPLICANT_TYPES = [
  'Early-Stage Startup / Founder',
  'Non-Profit / NGO / Community Group',
  'Academic / Researcher / Faculty',
  'Undergraduate / Graduate Student',
  'Individual Innovator / Professional',
  'Small / Medium Business (SMB)',
  'Creative / Artist / Journalist',
];

export const AddEditOpportunityForm: React.FC<AddEditOpportunityFormProps> = ({
  initialOpportunity,
  categories,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(initialOpportunity);

  // Form State
  const [formData, setFormData] = useState<OpportunityFormData>({
    id: initialOpportunity?.id,
    title: initialOpportunity?.title || '',
    organization: initialOpportunity?.organization || '',
    type: initialOpportunity?.type || 'Grant',
    category: initialOpportunity?.category || (categories[0]?.name || 'Business'),
    description: initialOpportunity?.description || '',
    summary: initialOpportunity?.summary || '',
    
    // Funding
    minAmount: initialOpportunity?.amount.min || undefined,
    maxAmount: initialOpportunity?.amount.max || 50000,
    currency: initialOpportunity?.amount.currency || 'USD',
    amountDisplayText: initialOpportunity?.amount.displayText || '',
    fundingDescription: initialOpportunity?.fundingDescription || '',
    isFullyFunded: initialOpportunity?.amount.isFullyFunded || false,

    // Eligibility
    eligibleCountries: initialOpportunity?.location ? [initialOpportunity.location] : ['Global'],
    applicantTypes: initialOpportunity?.eligibilityCriteria?.applicantTypes || ['Early-Stage Startup / Founder'],
    minimumAge: initialOpportunity?.eligibilityCriteria?.minimumAge,
    maximumAge: initialOpportunity?.eligibilityCriteria?.maximumAge,
    ageRequirementsText: initialOpportunity?.ageRequirementsText || '',
    categoryRequirements: initialOpportunity?.targetAudience || '',
    educationRequirementsText: initialOpportunity?.educationRequirementsText || '',
    experienceRequirementsText: initialOpportunity?.experienceRequirementsText || '',
    additionalRequirementsText: initialOpportunity?.requirements?.join('\n') || '',
    targetAudience: initialOpportunity?.targetAudience || '',
    awardDetails: initialOpportunity?.awardDetails || '',

    // Dates
    applicationOpeningDate: initialOpportunity?.applicationOpeningDate || '',
    deadline: initialOpportunity?.deadline || '',
    timezone: initialOpportunity?.timezone || 'UTC',

    // Application
    applicationUrl: initialOpportunity?.applicationUrl || '',
    applicationInstructions: initialOpportunity?.applicationInstructions || '',

    // Metadata
    publicationStatus: initialOpportunity?.publicationStatus || 'Published',
    adminVerificationStatus: initialOpportunity?.adminVerificationStatus || (initialOpportunity?.verified ? 'Verified' : 'Under Review'),
    status: (initialOpportunity?.status === 'Closed' ? 'Expired' : initialOpportunity?.status === 'Reviewing' ? 'Verifying' : (initialOpportunity as any)?.status || 'Open'),
    verified: typeof initialOpportunity?.verified === 'boolean' ? initialOpportunity.verified : true,
    country: initialOpportunity?.country || initialOpportunity?.location || 'Global',
    imageUrl: (initialOpportunity as any)?.imageUrl || '',
    source: initialOpportunity?.source || initialOpportunity?.officialSourceUrl || '',
    lastVerifiedDate: initialOpportunity?.lastVerifiedDate || '',
    internalNotes: initialOpportunity?.internalNotes || '',
    reviewNotes: initialOpportunity?.reviewNotes || '',
    featured: initialOpportunity?.featured || false,
    tags: initialOpportunity?.tags || ['Grant', 'Funding'],
    location: initialOpportunity?.location || 'Global',
    region: initialOpportunity?.region || 'Global',
  });

  const [tagInput, setTagInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<'basic' | 'funding' | 'eligibility' | 'dates' | 'application' | 'metadata'>('basic');

  // Validate form
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      errs.title = 'Opportunity title is required.';
    }
    if (!formData.organization.trim()) {
      errs.organization = 'Provider / Organization name is required.';
    }
    if (!formData.description.trim()) {
      errs.description = 'Opportunity description is required.';
    }
    if (!formData.deadline.trim()) {
      errs.deadline = 'Application deadline is required.';
    }
    if (!formData.applicationUrl.trim()) {
      errs.applicationUrl = 'Official application URL is required.';
    } else if (!formData.applicationUrl.startsWith('http://') && !formData.applicationUrl.startsWith('https://')) {
      errs.applicationUrl = 'Application URL must start with http:// or https://';
    }
    if (formData.imageUrl && formData.imageUrl.trim() && !formData.imageUrl.startsWith('http://') && !formData.imageUrl.startsWith('https://')) {
      errs.imageUrl = 'Image URL, if provided, must start with http:// or https://';
    }
    if (formData.maxAmount <= 0 && !formData.isFullyFunded) {
      errs.maxAmount = 'Funding amount must be greater than 0 or marked as fully funded.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (statusToSet?: PublicationStatus) => {
    if (!validateForm()) {
      return;
    }

    const payload: OpportunityFormData = {
      ...formData,
      publicationStatus: statusToSet || formData.publicationStatus,
    };

    onSave(payload);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tagToRemove) });
  };

  const handleAddCountry = () => {
    if (countryInput.trim() && !formData.eligibleCountries.includes(countryInput.trim())) {
      setFormData({ ...formData, eligibleCountries: [...formData.eligibleCountries, countryInput.trim()] });
      setCountryInput('');
    }
  };

  const handleRemoveCountry = (countryToRemove: string) => {
    setFormData({
      ...formData,
      eligibleCountries: formData.eligibleCountries.filter((c) => c !== countryToRemove),
    });
  };

  const toggleApplicantType = (type: string) => {
    if (formData.applicantTypes.includes(type)) {
      setFormData({
        ...formData,
        applicantTypes: formData.applicantTypes.filter((t) => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        applicantTypes: [...formData.applicantTypes, type],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEditing ? 'Edit Opportunity' : 'Add New Opportunity'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditing 
                ? `Updating program ID: ${initialOpportunity?.id}`
                : 'Publish or draft a verified funding opportunity for seeker discovery.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('Draft')}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('Pending Review')}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Submit for Review
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSubmit('Published')}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            {isEditing ? 'Save & Publish' : 'Publish Immediately'}
          </Button>
        </div>
      </div>

      {/* Validation Error Banner if any */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Please correct the following errors before submitting:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2 text-[11px]">
            {Object.values(errors).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Section Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        {[
          { id: 'basic', label: '1. Basic Info' },
          { id: 'funding', label: '2. Funding & Amount' },
          { id: 'eligibility', label: '3. Eligibility Criteria' },
          { id: 'dates', label: '4. Dates & Deadlines' },
          { id: 'application', label: '5. Application & Links' },
          { id: 'metadata', label: '6. Status & Metadata' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 rounded-t-xl transition-colors whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t border-x border-slate-200 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Structured Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-8">
        {/* 1. BASIC INFORMATION */}
        <div className={`space-y-6 ${activeSection !== 'basic' ? 'hidden' : ''}`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Basic Information
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Primary program identifying details, organization, and category taxonomy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Opportunity Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="opp-form-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Global Climate Tech Innovation Challenge 2026"
                className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.title ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.title && <p className="text-[11px] text-rose-500 font-semibold">{errors.title}</p>}
            </div>

            {/* Provider / Organization */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Provider / Organization <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="opp-form-org"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g., European Innovation Council"
                className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.organization ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Opportunity Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="opp-form-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as OpportunityType })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {OPPORTUNITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="opp-form-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Geographic Region
              </label>
              <select
                id="opp-form-region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value as OpportunityRegion })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {OPPORTUNITY_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Short Summary (1-2 sentences for preview cards)
              </label>
              <input
                type="text"
                id="opp-form-summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Non-dilutive grant funding for groundbreaking climate technology innovations..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Full Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="opp-form-description"
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide complete details about the funding initiative, project goals, scope, and key deliverables..."
                className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.description ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Tags & Keywords
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type a tag and press Add..."
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                  Add Tag
                </Button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. FUNDING & AMOUNT */}
        <div className={`space-y-6 ${activeSection !== 'funding' ? 'hidden' : ''}`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Funding & Award Details
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grant limits, currency, display text, and financial coverage terms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Min Amount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Minimum Amount (Optional)
              </label>
              <input
                type="number"
                id="opp-form-min-amount"
                value={formData.minAmount || ''}
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="10000"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Max Amount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Maximum / Award Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                id="opp-form-max-amount"
                value={formData.maxAmount || ''}
                onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                placeholder="50000"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Currency
              </label>
              <select
                id="opp-form-currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            {/* Display Text Override */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom Display Text (Leave empty to auto-format)
              </label>
              <input
                type="text"
                id="opp-form-display-text"
                value={formData.amountDisplayText}
                onChange={(e) => setFormData({ ...formData, amountDisplayText: e.target.value })}
                placeholder="e.g., Up to $100,000 USD (Non-dilutive)"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Fully Funded Toggle */}
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isFullyFunded}
                  onChange={(e) => setFormData({ ...formData, isFullyFunded: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Fully Funded Program</span>
              </label>
            </div>

            {/* Funding Description */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Funding Description / Disbursement Terms
              </label>
              <textarea
                rows={2}
                value={formData.fundingDescription}
                onChange={(e) => setFormData({ ...formData, fundingDescription: e.target.value })}
                placeholder="Direct milestone-based equity-free disbursements paid in 3 quarterly tranches..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 3. ELIGIBILITY CRITERIA */}
        <div className={`space-y-6 ${activeSection !== 'eligibility' ? 'hidden' : ''}`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Eligibility & Applicant Requirements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define eligible countries, applicant roles, age brackets, and submission criteria.
            </p>
          </div>

          <div className="space-y-5">
            {/* Applicant Types Multi-select Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Eligible Applicant Roles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_APPLICANT_TYPES.map((type) => {
                  const isSelected = formData.applicantTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleApplicantType(type)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                          : 'bg-slate-50/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{type}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Country / Primary Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Primary Country / Region
              </label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value, location: e.target.value })}
                placeholder="e.g., Global / Multi-regional, United States, Germany..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Eligible Countries */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Eligible Countries / Geographical Focus
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCountry();
                    }
                  }}
                  placeholder="e.g., Global, United States, Germany, Kenya..."
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCountry}>
                  Add Country
                </Button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {formData.eligibleCountries.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCountry(c)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Age, Education & Experience text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Age Requirements (Text or Range)
                </label>
                <input
                  type="text"
                  value={formData.ageRequirementsText}
                  onChange={(e) => setFormData({ ...formData, ageRequirementsText: e.target.value })}
                  placeholder="e.g., 18 years or older at time of submission"
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Education Requirements
                </label>
                <input
                  type="text"
                  value={formData.educationRequirementsText}
                  onChange={(e) => setFormData({ ...formData, educationRequirementsText: e.target.value })}
                  placeholder="e.g., Bachelor degree or equivalent experience"
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Additional Eligibility & Document Requirements (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.additionalRequirementsText}
                  onChange={(e) => setFormData({ ...formData, additionalRequirementsText: e.target.value })}
                  placeholder="Completed online application form&#10;Executive summary or 10-slide pitch deck&#10;Verified proof of incorporation or institutional affiliation"
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. DATES & DEADLINES */}
        <div className={`space-y-6 ${activeSection !== 'dates' ? 'hidden' : ''}`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Dates & Deadlines
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set application timeline and expiration triggers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Opening date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Application Opening Date
              </label>
              <input
                type="date"
                value={formData.applicationOpeningDate}
                onChange={(e) => setFormData({ ...formData, applicationOpeningDate: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Application Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                id="opp-form-deadline"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.deadline ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.deadline && <p className="text-[11px] text-rose-500 font-semibold">{errors.deadline}</p>}
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Deadline Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UTC">UTC (Universal)</option>
                <option value="EST">EST (Eastern Standard)</option>
                <option value="PST">PST (Pacific Standard)</option>
                <option value="CET">CET (Central European)</option>
                <option value="GMT">GMT (Greenwich Mean)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. APPLICATION & OFFICIAL LINKS */}
        <div className={`space-y-6 ${activeSection !== 'application' ? 'hidden' : ''}`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Application & Official Submission Links
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct seekers to the verified provider portal or external application system.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Application URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                id="opp-form-app-url"
                value={formData.applicationUrl}
                onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                placeholder="https://example.org/apply"
                className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.applicationUrl ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.applicationUrl && <p className="text-[11px] text-rose-500 font-semibold">{errors.applicationUrl}</p>}
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Image / Banner URL (Optional)
              </label>
              <input
                type="url"
                id="opp-form-image-url"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.imageUrl ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                } bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.imageUrl && <p className="text-[11px] text-rose-500 font-semibold">{errors.imageUrl}</p>}
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct image link to displayed banner, provider logo, or visual artwork.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Application Instructions / Submission Notes
              </label>
              <textarea
                rows={3}
                value={formData.applicationInstructions}
                onChange={(e) => setFormData({ ...formData, applicationInstructions: e.target.value })}
                placeholder="Submit through the provider's electronic portal before 17:00 CET. Late submissions are not evaluated."
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 6. STATUS & METADATA */}
        <div className={`space-y-6 ${activeSection !== 'metadata' ? 'hidden' : ''}`}>
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Opportunity Status, Verification & Editorial Metadata
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage FundEcho's operational status, verification audit flag, and featured promotional state.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Step 20 Funding Opportunity Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Funding Opportunity Status <span className="text-rose-500">*</span>
              </label>
              <select
                id="opp-form-program-status"
                value={formData.status || 'Open'}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  status: e.target.value as any,
                  publicationStatus: e.target.value === 'Expired' ? 'Expired' : e.target.value === 'Verifying' ? 'Pending Review' : 'Published'
                })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="Open">Open (Accepting Applications)</option>
                <option value="Verifying">Verifying (Awaiting Audit / Verification)</option>
                <option value="Expired">Expired (Application Deadline Passed)</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Standard FundEcho statuses: Open, Verifying, or Expired.
              </p>
            </div>

            {/* Publication Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Directory Indexing Status
              </label>
              <select
                id="opp-form-pub-status"
                value={formData.publicationStatus}
                onChange={(e) => setFormData({ ...formData, publicationStatus: e.target.value as PublicationStatus })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Published">Published (Indexed publicly)</option>
                <option value="Pending Review">Pending Review (In Moderation Queue)</option>
                <option value="Draft">Draft (Internal Only)</option>
                <option value="Expired">Expired (Deadline Passed)</option>
                <option value="Archived">Archived (Hidden from catalog)</option>
              </select>
            </div>

            {/* Verification - Separate Boolean */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  id="opp-form-verified-checkbox"
                  checked={Boolean(formData.verified)}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    verified: e.target.checked,
                    adminVerificationStatus: e.target.checked ? 'Verified' : 'Unverified'
                  })}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
                  Verified Opportunity (Official audit complete)
                </span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6.5">
                Distinguishes between an opportunity being open vs. verified.
              </p>
            </div>

            {/* Featured - Separate Boolean */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  id="opp-form-featured-checkbox"
                  checked={Boolean(formData.featured)}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                  Featured Opportunity (Promoted on homepage)
                </span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6.5">
                Displays opportunity in featured spotlight on public FundEcho interfaces.
              </p>
            </div>

            {/* Server Timestamps Info Card */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-200">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>System Audit Timestamps:</strong> Upon saving, <code>createdAt</code> (if new) and <code>updatedAt</code> are automatically recorded with synchronized server timestamps. Existing creation dates are strictly preserved.
              </span>
            </div>

            {/* Source Reference */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Source Reference / Press Release
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Horizon Europe Work Programme 2026-2027"
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Internal Notes */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Internal Administrative Notes (Staff Only)
              </label>
              <textarea
                rows={2}
                value={formData.internalNotes}
                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                placeholder="Verified via official gazette on Aug 2026. Editor contact: Dr. Sarah..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Review Notes */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Moderation / Review Feedback Notes
              </label>
              <textarea
                rows={2}
                value={formData.reviewNotes}
                onChange={(e) => setFormData({ ...formData, reviewNotes: e.target.value })}
                placeholder="Feedback left by reviewers or reason for approval / changes requested..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Form Bottom Action Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing ? 'Changes will take effect immediately upon saving.' : 'Only Published opportunities appear publicly on FundEcho.'}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleSubmit()}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {isEditing ? 'Save Changes' : 'Save Opportunity'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
