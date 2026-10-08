import React from 'react';
import { X, RotateCcw, CheckCircle2, Bookmark, SlidersHorizontal, Check } from 'lucide-react';
import { Category } from '../../types';
import { FilterState, AmountFilterTier } from '../../utils/searchEngine';
import { Button } from './Button';

export interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categories: Category[];
  totalResultsCount: number;
  bookmarkedCount: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  categories,
  totalResultsCount,
  bookmarkedCount,
}) => {
  if (!isOpen) return null;

  const typesList: { label: string; value: string }[] = [
    { label: 'All Funding Types', value: 'all' },
    { label: 'Business Grants & Funding', value: 'Business Funding' },
    { label: 'NGO & Non-Profit Grants', value: 'NGO & Non-Profit' },
    { label: 'Scholarships', value: 'Scholarship' },
    { label: 'Fellowships', value: 'Fellowship' },
    { label: 'Competitions & Prizes', value: 'Competition' },
    { label: 'General Grants', value: 'Grant' },
    { label: 'Research Grants', value: 'Research Grant' },
  ];

  const regionsList: { label: string; value: string }[] = [
    { label: 'All Regions / Global', value: 'all' },
    { label: 'Global', value: 'Global' },
    { label: 'North America', value: 'North America' },
    { label: 'Europe', value: 'Europe' },
    { label: 'Asia-Pacific', value: 'Asia-Pacific' },
    { label: 'Africa', value: 'Africa' },
    { label: 'Latin America', value: 'Latin America' },
    { label: 'Middle East', value: 'Middle East' },
  ];

  const deadlinesList: { label: string; value: string }[] = [
    { label: 'All Deadlines', value: 'all' },
    { label: 'Closing in ≤ 15 Days', value: '15' },
    { label: 'Closing in ≤ 30 Days', value: '30' },
    { label: 'Closing in ≤ 60 Days', value: '60' },
    { label: 'Closing in ≤ 90 Days', value: '90' },
  ];

  const amountTiersList: { label: string; value: AmountFilterTier }[] = [
    { label: 'All Funding Amounts', value: 'all' },
    { label: 'Under $25,000', value: 'under-25k' },
    { label: '$25,000 – $100,000', value: '25k-100k' },
    { label: '$100,000 – $500,000', value: '100k-500k' },
    { label: '$500,000+ Major Funding', value: '500k-plus' },
    { label: 'Fully Funded / Full Coverage', value: 'fully-funded' },
  ];

  const activeFiltersCount =
    (filters.selectedType !== 'all' ? 1 : 0) +
    (filters.selectedRegion !== 'all' ? 1 : 0) +
    (filters.selectedCategory !== 'all' ? 1 : 0) +
    (filters.selectedDeadline !== 'all' ? 1 : 0) +
    (filters.selectedAmountTier !== 'all' ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.savedOnly ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        id="mobile-filter-drawer-panel"
        className="relative w-full max-h-[88vh] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-200"
      >
        {/* Drawer Handle & Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Filter Opportunities
            </h2>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 mr-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filters Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Quick Toggles */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Quick Criteria
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="mobile-toggle-verified"
                onClick={() => onUpdateFilters({ verifiedOnly: !filters.verifiedOnly })}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-colors ${
                  filters.verifiedOnly
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Verified Only
                </span>
                {filters.verifiedOnly && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              </button>

              <button
                type="button"
                id="mobile-toggle-saved"
                onClick={() => onUpdateFilters({ savedOnly: !filters.savedOnly })}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-colors ${
                  filters.savedOnly
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Saved ({bookmarkedCount})
                </span>
                {filters.savedOnly && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Funding Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Funding Type
            </label>
            <select
              value={filters.selectedType}
              onChange={(e) => onUpdateFilters({ selectedType: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
            >
              {typesList.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Eligible Region */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Eligible Region / Country
            </label>
            <select
              value={filters.selectedRegion}
              onChange={(e) => onUpdateFilters({ selectedRegion: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
            >
              {regionsList.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Domain */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category Domain
            </label>
            <select
              value={filters.selectedCategory}
              onChange={(e) => onUpdateFilters({ selectedCategory: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Funding Amount Tier */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Funding Amount Range
            </label>
            <select
              value={filters.selectedAmountTier}
              onChange={(e) => onUpdateFilters({ selectedAmountTier: e.target.value as AmountFilterTier })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
            >
              {amountTiersList.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* Application Deadline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Application Deadline
            </label>
            <select
              value={filters.selectedDeadline}
              onChange={(e) => onUpdateFilters({ selectedDeadline: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
            >
              {deadlinesList.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sticky Apply Button Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center font-bold"
            onClick={onClose}
          >
            Show {totalResultsCount} {totalResultsCount === 1 ? 'Opportunity' : 'Opportunities'}
          </Button>
        </div>
      </div>
    </div>
  );
};
