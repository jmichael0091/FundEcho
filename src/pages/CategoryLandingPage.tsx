import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  Sparkles, 
  ArrowLeft, 
  Search, 
  Filter, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle,
  Building2,
  GraduationCap,
  Award,
  HeartHandshake,
  Trophy,
  FlaskConical,
  Leaf,
  Layers,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Category, Opportunity, PageId } from '../types';
import { OpportunityCard } from '../components/ui/OpportunityCard';
import { SEOHead } from '../components/seo/SEOHead';
import { AdSenseSlot } from '../components/monetization/AdSenseSlot';
import { 
  filterOpportunitiesByCategory, 
  generateCategoryJSONLD, 
  getSiteOrigin, 
  slugify,
  COUNTRY_SEO_PROFILES,
  FUNDING_TYPE_SEO_PROFILES,
  getCountryUrl,
  getFundingTypeSlug
} from '../utils/seoUtils';
import { SEOMetaData } from '../types/seo';
import { SEOInspectorModal } from '../components/seo/SEOInspectorModal';

export interface CategoryLandingPageProps {
  category?: Category;
  categorySlug?: string;
  allCategories: Category[];
  allOpportunities: Opportunity[];
  onNavigate: (page: PageId) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onSelectCategory: (categorySlug: string) => void;
  onSelectCountry: (countrySlug: string) => void;
  onSelectFundingType: (typeSlug: string) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (opportunity: Opportunity) => void;
}

export const CategoryLandingPage: React.FC<CategoryLandingPageProps> = ({
  category: categoryProp,
  categorySlug,
  allCategories,
  allOpportunities,
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

  const category: Category = useMemo(() => {
    if (categoryProp && categoryProp.slug) return categoryProp;
    if (categorySlug) {
      const match = allCategories.find(
        (c) => c && (c.slug === categorySlug || slugify(c.name) === categorySlug || c.id === categorySlug)
      );
      if (match) return match;
    }
    return (
      allCategories[0] || {
        id: 'cat-business',
        name: 'Business & Startups',
        slug: 'business-startups',
        icon: 'Building2',
        description: 'Funding for entrepreneurs, startups, and commercial innovations.',
        opportunityCount: 0,
      }
    );
  }, [categoryProp, categorySlug, allCategories]);

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/categories/${category.slug}`;

  // Filter opportunities for this category
  const matchingOpps = filterOpportunitiesByCategory(category, allOpportunities);

  // Apply search filter
  const displayedOpps = matchingOpps
    .filter((opp) => {
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.summary.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (selectedSort === 'deadline') return a.daysLeft - b.daysLeft;
      if (selectedSort === 'amount') return b.amount.max - a.amount.max;
      return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
    });

  // Calculate statistics
  const totalVerifiedCount = matchingOpps.filter((o) => o.verified).length;
  const maxFundingVal = Math.max(...matchingOpps.map((o) => o.amount.max), 0);
  const formattedMaxFunding = maxFundingVal > 0 ? `$${maxFundingVal.toLocaleString()}` : '$150,000+';

  // Related categories
  const relatedCategories = allCategories
    .filter((c) => c.slug !== category.slug)
    .slice(0, 4);

  // Dynamic SEO Metadata
  const seoTitle = `${category.name} Funding, Grants & Awards (2026) | FundEcho`;
  const seoDescription = `Explore ${matchingOpps.length}+ verified ${category.name.toLowerCase()} opportunities. Find non-dilutive capital, application deadlines, eligibility criteria, and direct submission links.`;

  const seoMetadata: SEOMetaData = {
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: canonicalUrl,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogType: 'website',
    robots: 'index, follow',
    keywords: [
      category.name,
      `${category.name} grants`,
      'funding opportunities',
      'non-dilutive capital',
      'scholarships',
      'global grants 2026'
    ],
    breadcrumbs: [
      { name: 'Home', url: `${origin}/` },
      { name: 'Categories', url: `${origin}/directory` },
      { name: category.name, url: canonicalUrl }
    ],
    jsonLdSchema: generateCategoryJSONLD(category, matchingOpps, origin)
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6" />;
      case 'Award': return <Award className="w-6 h-6" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6" />;
      case 'Trophy': return <Trophy className="w-6 h-6" />;
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'FlaskConical': return <FlaskConical className="w-6 h-6" />;
      case 'Leaf': return <Leaf className="w-6 h-6" />;
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
            Categories
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold">
            {category.name}
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

      {/* 2. HERO CATEGORY LANDING HEADER */}
      <header className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-indigo-700/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-indigo-200">
            <span className="p-1 rounded-full bg-indigo-500 text-white">
              {getCategoryIcon(category.icon)}
            </span>
            <span>Verified Opportunity Category</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {category.name} Grants & Funding Opportunities
          </h1>

          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            {category.description} Explore actively open funding windows, institutional prizes, research stipends, and non-dilutive awards with zero application fees on FundEcho.
          </p>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-indigo-700/60">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                Active Programs
              </span>
              <span className="text-lg sm:text-2xl font-black text-white">
                {matchingOpps.length} Opportunities
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                Top Award Size
              </span>
              <span className="text-lg sm:text-2xl font-black text-emerald-300">
                Up to {formattedMaxFunding}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                Vetting Standard
              </span>
              <span className="text-lg sm:text-2xl font-black text-white flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                100% Verified
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. SEARCH INTENT INTRODUCTORY GUIDE (Valuable, non-spam editorial content) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            About {category.name} Capital & Selection Criteria
          </h2>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {category.name} capital is allocated by multilateral institutions, philanthropic endowments, governmental agencies, and corporate innovation funds. Programs listed in this directory feature non-repayable or founder-aligned terms designed to de-risk ambitious initiatives without creating predatory liabilities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Who is Eligible?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Open to early-stage founders, research teams, university students, registered non-profits, and independent innovators meeting specific regional or topical criteria.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Application Best Practices
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Review official eligibility guidelines, align milestone budgets with funder priorities, and prepare narrative proposals well in advance of closing deadlines.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTERNAL LINKING PILL NETWORK (Connecting Category -> Funding Types & Countries) */}
      <section className="space-y-3">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
          Explore by Country & Funding Type for {category.name}
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
              <span>{category.name} in {country.name}</span>
            </button>
          ))}

          {FUNDING_TYPE_SEO_PROFILES.slice(0, 4).map((ft) => (
            <button
              key={ft.slug}
              type="button"
              onClick={() => onSelectFundingType(ft.slug)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span>{ft.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. OPPORTUNITY CATALOG FILTER & LISTINGS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Open Opportunities in {category.name} ({displayedOpps.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified institutional calls and active grant rounds.
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
                placeholder={`Search in ${category.name}...`}
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

        {/* Opportunity Cards Grid */}
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
              No matching {category.name} opportunities found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms or explore other verified funding categories.
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

      {/* Non-intrusive Ad Placement between content sections */}
      <AdSenseSlot 
        slotId="ad-slot-category-banner" 
        format="leaderboard" 
        className="my-6"
      />

      {/* 6. RELATED CATEGORIES EXPLORER */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
            Discover Other Sectors
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Related Funding Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedCategories.map((relCat) => (
            <button
              key={relCat.id}
              type="button"
              onClick={() => onSelectCategory(relCat.slug)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left shadow-2xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getCategoryIcon(relCat.icon)}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {relCat.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {relCat.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>View Opportunities</span>
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
