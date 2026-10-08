import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  Sparkles, 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  Award, 
  HeartHandshake, 
  Trophy, 
  FlaskConical, 
  Layers,
  HelpCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Category, Opportunity, PageId } from '../types';
import { FundingTypeInfo, SEOMetaData } from '../types/seo';
import { OpportunityCard } from '../components/ui/OpportunityCard';
import { SEOHead } from '../components/seo/SEOHead';
import { 
  filterOpportunitiesByFundingType, 
  generateFundingTypeJSONLD, 
  getSiteOrigin,
  FUNDING_TYPE_SEO_PROFILES,
  COUNTRY_SEO_PROFILES,
  getFundingTypeBySlug
} from '../utils/seoUtils';
import { SEOInspectorModal } from '../components/seo/SEOInspectorModal';

export interface FundingTypeLandingPageProps {
  fundingType?: FundingTypeInfo;
  fundingTypeSlug?: string;
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

export const FundingTypeLandingPage: React.FC<FundingTypeLandingPageProps> = ({
  fundingType: fundingTypeProp,
  fundingTypeSlug,
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
  const [selectedSort, setSelectedSort] = useState<'deadline' | 'amount' | 'newest'>('deadline');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const fundingType: FundingTypeInfo = useMemo(() => {
    if (fundingTypeProp && fundingTypeProp.slug) return fundingTypeProp;
    if (fundingTypeSlug) {
      const match = getFundingTypeBySlug(fundingTypeSlug);
      if (match) return match;
    }
    return (
      FUNDING_TYPE_SEO_PROFILES[0] || {
        type: 'Grant',
        slug: 'grants',
        name: 'Grants',
        heading: 'Grants & Non-Dilutive Capital',
        description: 'Non-repayable financial awards for individuals, businesses, and non-profits.',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        heroTagline: 'Verified, scam-free non-repayable capital.',
        eligibleEntities: ['Early-Stage Startups', 'Non-Profit Organizations', 'Researchers', 'Social Impact Innovators'],
        faqs: []
      }
    );
  }, [fundingTypeProp, fundingTypeSlug]);

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/types/${fundingType.slug}`;

  // Filter opportunities for this funding type
  const matchingOpps = filterOpportunitiesByFundingType(fundingType, allOpportunities);

  // Apply search filter
  const displayedOpps = matchingOpps
    .filter((opp) => {
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.summary.toLowerCase().includes(q) ||
        opp.category.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (selectedSort === 'deadline') return a.daysLeft - b.daysLeft;
      if (selectedSort === 'amount') return b.amount.max - a.amount.max;
      return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
    });

  // Calculate statistics
  const verifiedCount = matchingOpps.filter((o) => o.verified).length;
  const maxFundingVal = Math.max(...matchingOpps.map((o) => o.amount.max), 0);
  const formattedMax = maxFundingVal > 0 ? `$${maxFundingVal.toLocaleString()}` : '$150,000+';

  // Other funding types
  const otherTypes = FUNDING_TYPE_SEO_PROFILES
    .filter((t) => t.slug !== fundingType.slug);

  // Dynamic SEO Metadata
  const seoTitle = `${fundingType.heading} (2026 Directory) | FundEcho`;
  const seoDescription = `${fundingType.description} Discover ${matchingOpps.length}+ verified ${fundingType.name.toLowerCase()} programs with verified deadlines and eligibility criteria.`;

  const seoMetadata: SEOMetaData = {
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: canonicalUrl,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogType: 'website',
    robots: 'index, follow',
    keywords: [
      fundingType.name,
      `${fundingType.name} 2026`,
      'non-dilutive capital',
      'verified grant directory',
      'funding applications'
    ],
    breadcrumbs: [
      { name: 'Home', url: `${origin}/` },
      { name: 'Funding Types', url: `${origin}/directory` },
      { name: fundingType.name, url: canonicalUrl }
    ],
    jsonLdSchema: generateFundingTypeJSONLD(fundingType, matchingOpps, origin)
  };

  const getTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6" />;
      case 'Award': return <Award className="w-6 h-6" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6" />;
      case 'Trophy': return <Trophy className="w-6 h-6" />;
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'FlaskConical': return <FlaskConical className="w-6 h-6" />;
      default: return <Layers className="w-6 h-6" />;
    }
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
            Funding Types
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold">
            {fundingType.name}
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

      {/* 2. HERO HEADER */}
      <header className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-indigo-800/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-indigo-200">
            <span className="p-1 rounded-full bg-indigo-500 text-white">
              {getTypeIcon(fundingType.icon)}
            </span>
            <span>Funding Type Index</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {fundingType.heading}
          </h1>

          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            {fundingType.tagline} {fundingType.description}
          </p>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-indigo-800/80">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                Active Listings
              </span>
              <span className="text-lg sm:text-2xl font-black text-white">
                {matchingOpps.length} Opportunities
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                Typical Award Range
              </span>
              <span className="text-lg sm:text-2xl font-black text-emerald-300">
                {fundingType.avgAwardRange}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                Application Cost
              </span>
              <span className="text-lg sm:text-2xl font-black text-white flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                100% Free
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. STRUCTURED EDITORIAL GUIDE (Intent fulfillment) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Guide to {fundingType.name}: Structure, Eligibility & Strategy
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Target Audience: <strong className="text-slate-900 dark:text-white">{fundingType.whoIsThisFor}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Benefits */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Core Advantages & Benefits</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {fundingType.keyBenefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Typical Requirements */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Typical Application Requirements</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {fundingType.typicalRequirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. CROSS-LINKING BAR */}
      <section className="space-y-3">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
          Explore {fundingType.name} by Top Country
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {COUNTRY_SEO_PROFILES.slice(0, 6).map((country) => (
            <button
              key={country.slug}
              type="button"
              onClick={() => onSelectCountry(country.slug)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span>{country.flag}</span>
              <span>{fundingType.name} in {country.name}</span>
            </button>
          ))}

          {allCategories.slice(0, 4).map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. OPPORTUNITY CATALOG */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Open {fundingType.name} Opportunities ({displayedOpps.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified programs with active submission windows.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Search ${fundingType.name}...`}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

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
              No matching {fundingType.name} opportunities found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try modifying your search or exploring other funding types.
            </p>
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Clear Search Filter
            </button>
          </div>
        )}
      </section>

      {/* 6. OTHER FUNDING TYPES */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
            Explore All Types
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Other Funding Formats
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherTypes.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => onSelectFundingType(t.slug)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left shadow-2xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getTypeIcon(t.icon)}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {t.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {t.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>View {t.name}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
