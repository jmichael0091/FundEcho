/**
 * FUNDECHO - ADD/EDIT SOURCE MODAL (STEP 3)
 * Admin modal for adding or editing monitored websites and organizations in the Source Registry.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Building2,
  ShieldCheck,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { CrawlerSourceDoc, SourceType, SourceTrustLevel } from '../../types/crawlerPipelineSchema';
import { Category } from '../../types';
import { Button } from '../ui/Button';

export interface AddEditSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sourceData: Partial<CrawlerSourceDoc>) => Promise<void>;
  editingSource?: CrawlerSourceDoc | null;
  categories: Category[];
}

const SOURCE_TYPES: SourceType[] = [
  'Government',
  'Foundation',
  'NGO',
  'University',
  'Corporation',
  'Accelerator',
  'international_org',
  'aggregator',
];

const TRUST_LEVELS: SourceTrustLevel[] = ['Verified', 'High', 'Medium', 'Low'];

const CRAWL_FREQUENCIES = [
  { label: 'Every 6 Hours', value: 'Every 6 Hours', hours: 6 },
  { label: 'Every 12 Hours', value: 'Every 12 Hours', hours: 12 },
  { label: 'Daily (24h)', value: 'Daily (24h)', hours: 24 },
  { label: 'Every 3 Days', value: 'Every 3 Days', hours: 72 },
  { label: 'Weekly', value: 'Weekly', hours: 168 },
];

const COMMON_REGIONS = [
  'Global',
  'North America',
  'United States',
  'Europe',
  'United Kingdom',
  'Asia-Pacific',
  'Africa',
  'Latin America',
  'Middle East',
];

export const AddEditSourceModal: React.FC<AddEditSourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSource,
  categories,
}) => {
  const [sourceName, setSourceName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [countryRegion, setCountryRegion] = useState('Global');
  const [sourceType, setSourceType] = useState<SourceType>('Foundation');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'entrepreneurship-business',
  ]);
  const [trustLevel, setTrustLevel] = useState<SourceTrustLevel>('High');
  const [status, setStatus] = useState<'Active' | 'Paused'>('Active');
  const [crawlFrequency, setCrawlFrequency] = useState('Daily (24h)');
  const [lastCrawled, setLastCrawled] = useState('');
  const [nextScheduledCrawl, setNextScheduledCrawl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingSource) {
      setSourceName(editingSource.sourceName || editingSource.name || '');
      setWebsiteUrl(editingSource.websiteUrl || editingSource.baseUrl || '');
      setCountryRegion(editingSource.countryRegion || editingSource.region || 'Global');
      setSourceType(editingSource.sourceType || 'Foundation');
      setSelectedCategories(
        editingSource.opportunityCategories && editingSource.opportunityCategories.length > 0
          ? editingSource.opportunityCategories
          : editingSource.categories || ['entrepreneurship-business']
      );
      setTrustLevel(editingSource.trustLevel || 'High');
      setStatus(
        editingSource.status === 'Paused' || editingSource.status === 'paused'
          ? 'Paused'
          : 'Active'
      );
      setCrawlFrequency(editingSource.crawlFrequency || 'Daily (24h)');
      setLastCrawled(
        editingSource.lastCrawled
          ? typeof editingSource.lastCrawled === 'string'
            ? editingSource.lastCrawled.split('T')[0]
            : ''
          : ''
      );
      setNextScheduledCrawl(
        editingSource.nextScheduledCrawl
          ? typeof editingSource.nextScheduledCrawl === 'string'
            ? editingSource.nextScheduledCrawl.split('T')[0]
            : ''
          : ''
      );
      setNotes(editingSource.notes || '');
    } else {
      setSourceName('');
      setWebsiteUrl('');
      setCountryRegion('Global');
      setSourceType('Foundation');
      setSelectedCategories(['entrepreneurship-business']);
      setTrustLevel('High');
      setStatus('Active');
      setCrawlFrequency('Daily (24h)');
      setLastCrawled('');
      setNextScheduledCrawl('');
      setNotes('');
    }
    setErrorMessage('');
  }, [editingSource, isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (catSlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catSlug) ? prev.filter((s) => s !== catSlug) : [...prev, catSlug]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!sourceName.trim()) {
      setErrorMessage('Source name is required.');
      return;
    }

    if (!websiteUrl.trim()) {
      setErrorMessage('Website URL is required.');
      return;
    }

    let normalizedUrl = websiteUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setErrorMessage('Please enter a valid HTTP or HTTPS website URL.');
      return;
    }

    if (selectedCategories.length === 0) {
      setErrorMessage('Select at least one opportunity category for this source.');
      return;
    }

    const freqObj = CRAWL_FREQUENCIES.find((f) => f.value === crawlFrequency);
    const crawlFrequencyHours = freqObj ? freqObj.hours : 24;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(editingSource ? { id: editingSource.id } : {}),
        sourceName: sourceName.trim(),
        name: sourceName.trim(),
        organization: sourceName.trim(),
        websiteUrl: normalizedUrl,
        baseUrl: normalizedUrl,
        countryRegion: countryRegion.trim() || 'Global',
        region: countryRegion.trim() || 'Global',
        countries: [countryRegion.trim() || 'Global'],
        sourceType,
        opportunityCategories: selectedCategories,
        categories: selectedCategories,
        trustLevel,
        status,
        crawlFrequency,
        crawlFrequencyHours,
        lastCrawled: lastCrawled.trim() ? lastCrawled.trim() : null,
        nextScheduledCrawl: nextScheduledCrawl.trim() ? nextScheduledCrawl.trim() : null,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save source. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8 text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingSource ? 'Edit Monitored Source' : 'Register New Crawler Source'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure websites and organizations monitored by FundEcho's global crawler.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Source Name & Organization */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Source Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Bill & Melinda Gates Foundation, European Research Council"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Website URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="https://www.example.org/grants"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              The root homepage or direct opportunities listing portal.
            </p>
          </div>

          {/* Grid: Source Type & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Source Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Country / Region <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="common-regions"
                value={countryRegion}
                onChange={(e) => setCountryRegion(e.target.value)}
                placeholder="e.g. Global, Europe, United States"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="common-regions">
                {COMMON_REGIONS.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Grid: Trust Level, Status & Crawl Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Trust Level
              </label>
              <select
                value={trustLevel}
                onChange={(e) => setTrustLevel(e.target.value as SourceTrustLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TRUST_LEVELS.map((tl) => (
                  <option key={tl} value={tl}>
                    {tl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Monitoring Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Paused')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Active">Active (Monitoring)</option>
                <option value="Paused">Paused (Standby)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Crawl Frequency
              </label>
              <select
                value={crawlFrequency}
                onChange={(e) => setCrawlFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CRAWL_FREQUENCIES.map((cf) => (
                  <option key={cf.value} value={cf.value}>
                    {cf.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Last Crawled & Next Scheduled Crawl */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Last Crawled
              </label>
              <input
                type="date"
                value={lastCrawled}
                onChange={(e) => setLastCrawled(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Optional previous crawl timestamp or leave empty for new sources.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Next Scheduled Crawl
              </label>
              <input
                type="date"
                value={nextScheduledCrawl}
                onChange={(e) => setNextScheduledCrawl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Custom target date or auto-calculated from frequency.
              </p>
            </div>
          </div>

          {/* Opportunity Categories Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Categories <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedCategories.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 max-h-36 overflow-y-auto">
              {categories.map((c) => {
                const isSelected = selectedCategories.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggleCategory(c.slug)}
                    className={`text-xs px-2.5 py-1 rounded-xl font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editorial Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Admin & Crawler Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on climate and health grants. Annual application window opens every Q1."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {editingSource ? 'Save Changes' : 'Register Source'}
          </Button>
        </div>
      </div>
    </div>
  );
};
