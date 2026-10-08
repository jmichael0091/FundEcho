import React, { useState } from 'react';
import { 
  Sparkles, 
  Handshake, 
  ShieldCheck, 
  Layers, 
  Info 
} from 'lucide-react';
import { PARTNER_PLACEMENTS } from '../../data/monetizationData';
import { PartnerCategory } from '../../types/monetization';
import { PartnerCard } from './PartnerCard';

export interface PartnerResourcesSectionProps {
  className?: string;
  limit?: number;
  initialCategory?: PartnerCategory | 'all';
  showCategoryFilter?: boolean;
}

export const PartnerResourcesSection: React.FC<PartnerResourcesSectionProps> = ({
  className = '',
  limit,
  initialCategory = 'all',
  showCategoryFilter = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PartnerCategory | 'all'>(initialCategory);

  const categories: { id: PartnerCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Resources' },
    { id: 'productivity_tools', label: 'Proposal Tools' },
    { id: 'professional_services', label: 'Legal & Fiscal' },
    { id: 'education_platforms', label: 'Fellowship Prep' },
    { id: 'business_tools', label: 'Grant Accounting' }
  ];

  const filtered = selectedCategory === 'all'
    ? PARTNER_PLACEMENTS
    : PARTNER_PLACEMENTS.filter(p => p.category === selectedCategory);

  const displayPartners = limit ? filtered.slice(0, limit) : filtered;

  return (
    <section 
      id="partner-resources-section" 
      className={`rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-linear-to-b from-slate-50/80 to-white dark:from-slate-900/60 dark:to-slate-900 p-6 sm:p-8 space-y-6 ${className}`}
      aria-labelledby="partner-resources-heading"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/70 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Handshake className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Partner Ecosystem
            </span>
          </div>
          <h2 id="partner-resources-heading" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Vetted Tools & Application Accelerators
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Independent resources curated to strengthen your grant proposals, institutional compliance, and fellowship candidacy.
          </p>
        </div>

        {/* Affiliate master transparency badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 self-start md:self-auto">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Transparent Affiliate Disclosure</span>
        </div>
      </div>

      {/* Category filter pills */}
      {showCategoryFilter && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayPartners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>

      {/* Bottom Master Disclosure Notice */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-700 dark:text-slate-300">Ethical Standards Notice:</strong> FundEcho maintains strict editorial independence. We only partner with verified services that provide genuine value to grant applicants. Partner compensation never influences opportunity ranking, eligibility verifications, or application deadlines.
        </p>
      </div>
    </section>
  );
};
