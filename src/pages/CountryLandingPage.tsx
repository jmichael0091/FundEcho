import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  MapPin, 
  ArrowLeft, 
  Search, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Building2, 
  Sparkles,
  Info,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Category, Opportunity, PageId } from '../types';
import { CountryInfo, SEOMetaData } from '../types/seo';
import { OpportunityCard } from '../components/ui/OpportunityCard';
import { SEOHead } from '../components/seo/SEOHead';
import { AdSenseSlot } from '../components/monetization/AdSenseSlot';
import { 
  filterOpportunitiesByCountry, 
  generateCountryJSONLD, 
  getSiteOrigin,
  COUNTRY_SEO_PROFILES,
  FUNDING_TYPE_SEO_PROFILES,
  slugify,
  getCountryBySlugOrName
} from '../utils/seoUtils';
import { SEOInspectorModal } from '../components/seo/SEOInspectorModal';

export interface CountryLandingPageProps {
  country?: CountryInfo;
  countrySlug?: string;
  allOpportunities: Opportunity[];
  allCategories: Category[];
  onNavigate: (page: PageId) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onSelectCategory: (categorySlug: string) => void;
  onSelectCountry: (countrySlug: string) => void;
  onSelectFundingType: (typeSlug: string) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (opportunity: Opportunity) => void;
}

export const CountryLandingPage: React.FC<CountryLandingPageProps> = ({
  country: countryProp,
  countrySlug,
  allOpportunities,
  allCategories,
  onNavigate,
  onSelectOpportunity,
  onSelectCategory,
  onSelectCountry,
  onSelectFundingType,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<'deadline' | 'amount' | 'newest'>('deadline');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const country: CountryInfo = useMemo(() => {
    if (countryProp && countryProp.slug) return countryProp;
    if (countrySlug) {
      return getCountryBySlugOrName(countrySlug);
    }
    return (
      COUNTRY_SEO_PROFILES[0] || {
        name: 'Nigeria',
        slug: 'nigeria',
        code: 'NG',
        flag: '🇳🇬',
        region: 'Africa',
        summary: 'Explore verified grants, business development funding, and scholarships in Nigeria.',
      }
    );
  }, [countryProp, countrySlug]);

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/countries/${country.slug}`;

  // Filter opportunities eligible for this country
  const eligibleOpps = filterOpportunitiesByCountry(country, allOpportunities);

  // Apply search & type filter
  const displayedOpps = eligibleOpps
    .filter((opp) => {
      if (selectedTypeFilter !== 'all' && opp.type !== selectedTypeFilter) {
        return false;
      }
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.summary.toLowerCase().includes(q) ||
        opp.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (selectedSort === 'deadline') return a.daysLeft - b.daysLeft;
      if (selectedSort === 'amount') return b.amount.max - a.amount.max;
      return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
    });

  // Calculate statistics
  const verifiedCount = eligibleOpps.filter((o) => o.verified).length;
  const maxFundingVal = Math.max(...eligibleOpps.map((o) => o.amount.max), 0);
  const formattedMax = maxFundingVal > 0 ? `$${maxFundingVal.toLocaleString()}` : '$150,000+';

  // Neighboring / other countries in same region or global
  const otherCountries = COUNTRY_SEO_PROFILES
    .filter((c) => c.slug !== country.slug)
    .slice(0, 5);

  // Dynamic SEO Metadata
  const seoTitle = `Funding Opportunities in ${country.name} (2026 Grants & Scholarships) | FundEcho`;
  const seoDescription = `Discover ${eligibleOpps.length}+ verified grants, startup funds, scholarships, and fellowships accepting applicants in ${country.name}. Check deadlines and direct application guidelines.`;

  const seoMetadata: SEOMetaData = {
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: canonicalUrl,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogType: 'website',
    robots: 'index, follow',
    keywords: [
      `grants in ${country.name}`,
      `funding in ${country.name}`,
      `scholarships for ${country.name}`,
      `startup funding ${country.name}`,
      `${country.name} fellowships 2026`
    ],
    breadcrumbs: [
      { name: 'Home', url: `${origin}/` },
      { name: 'Locations', url: `${origin}/directory` },
      { name: country.name, url: canonicalUrl }
    ],
    jsonLdSchema: generateCountryJSONLD(country, eligibleOpps, origin)
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 overflow-x-clip">
      {/* Dynamic SEO Head Tags */}
      <SEOHead metadata={seoMetadata} />

      {/* 1. BREADCRUMBS & TOP NAVIGATION */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => onNavigate('directory')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            Locations
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold">
            {country.name}
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsInspectorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>SEO & Schema Inspector</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('opportunities')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Opportunities</span>
          </button>
        </div>
      </div>

      {/* 2. HERO REGION HEADER */}
      <header className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-indigo-900/60">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-indigo-200">
            <span className="text-base">{country.flag}</span>
            <span>{country.region} Region • Verified Country Directory</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Funding Opportunities in {country.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {country.summary} All listed programs are open to eligible candidates, businesses, or non-profit organizations operating within {country.name}.
          </p>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Eligible Programs
              </span>
              <span className="text-lg sm:text-2xl font-black text-white">
                {eligibleOpps.length} Active Grants
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Top Award Pool
              </span>
              <span className="text-lg sm:text-2xl font-black text-emerald-400">
                Up to {formattedMax}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Official Currency
              </span>
              <span className="text-lg sm:text-2xl font-black text-indigo-300">
                {country.currency}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. COUNTRY FUNDING LANDSCAPE & APPLICANT TIPS (Informative, High-Value Content) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Funding Landscape & Key Opportunities in {country.name}
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Applicants from {country.name} have access to a blend of national government support programs, regional economic union funds, international development bank initiatives, and global corporate challenge prizes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Highlights */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Key Sector Opportunities</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {country.keyHighlights.map((hl, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Applicant Readiness Checklist */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Applicant Readiness for {country.name}</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {country.applicantTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. CROSS-LINKING BAR (Connecting Country -> Categories & Funding Types) */}
      <section className="space-y-3">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
          Popular Funding Types in {country.name}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {FUNDING_TYPE_SEO_PROFILES.map((ft) => (
            <button
              key={ft.slug}
              type="button"
              onClick={() => onSelectFundingType(ft.slug)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span>{ft.name}</span>
            </button>
          ))}

          {allCategories.slice(0, 4).map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span>{cat.name} in {country.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. OPPORTUNITY LISTINGS & FILTERS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Eligible Opportunities for {country.name} ({displayedOpps.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Includes national calls, regional windows, and open global awards.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Search ${country.name} grants...`}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="all">All Funding Types</option>
              <option value="Grant">Grants</option>
              <option value="Scholarship">Scholarships</option>
              <option value="Fellowship">Fellowships</option>
              <option value="Business Funding">Business Funding</option>
              <option value="NGO & Non-Profit">NGO Funding</option>
              <option value="Competition">Competitions</option>
              <option value="Research Grant">Research Grants</option>
            </select>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="deadline">Closing Soonest</option>
              <option value="amount">Highest Award</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {displayedOpps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedOpps.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onSelect={onSelectOpportunity}
                isBookmarked={bookmarkedIds.has(opp.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching opportunities found for {country.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try removing filters or browse global open-call opportunities.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchFilter('');
                setSelectedTypeFilter('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Non-intrusive Ad Placement between content sections */}
      <AdSenseSlot 
        slotId="ad-slot-country-banner" 
        format="leaderboard" 
        className="my-6"
      />

      {/* 6. OTHER REGIONAL HUBS EXPLORER */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
            Explore Other Locations
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Country & Regional Funding Hubs
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {otherCountries.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelectCountry(c.slug)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left shadow-2xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="text-2xl">{c.flag}</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {c.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {c.region} Region
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>View Grants</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SEO Inspector Modal */}
      <SEOInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        metadata={seoMetadata}
        allOpportunities={allOpportunities}
        allCategories={allCategories}
      />
    </div>
  );
};
