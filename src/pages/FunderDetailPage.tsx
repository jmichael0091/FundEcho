import React, { useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Lightbulb, 
  Bookmark, 
  Layers, 
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';
import { Opportunity, PageId } from '../types';
import { FunderProfile } from '../types/funder';
import { getFunderBySlug } from '../data/funderDirectoryData';
import { getSiteOrigin } from '../utils/seoUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { SEOMetaData } from '../types/seo';
import { calculateDeadlineStatus } from '../utils/deadlineUtils';

interface FunderDetailPageProps {
  funderSlug: string;
  allOpportunities: Opportunity[];
  bookmarkedIds: Set<string>;
  onNavigate: (page: PageId) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onToggleBookmark: (opportunity: Opportunity) => void;
}

export const FunderDetailPage: React.FC<FunderDetailPageProps> = ({
  funderSlug,
  allOpportunities,
  bookmarkedIds,
  onNavigate,
  onSelectOpportunity,
  onToggleBookmark,
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const funder = useMemo(() => getFunderBySlug(funderSlug), [funderSlug]);

  // Active opportunities matching this funder
  const hostedOpportunities = useMemo(() => {
    if (!funder) return [];
    return allOpportunities.filter((opp) => {
      const org = opp.organization.toLowerCase();
      const fName = funder.name.toLowerCase();
      const fAcronym = funder.acronym ? funder.acronym.toLowerCase() : '';
      return org.includes(fName) || fName.includes(org) || (fAcronym && org.includes(fAcronym));
    });
  }, [funder, allOpportunities]);

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/funders/${funderSlug}`;

  const handleShare = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!funder) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Funder Profile Not Found
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested institutional profile could not be located in our verified directory.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('funders')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Funder Directory</span>
        </button>
      </div>
    );
  }

  const seoTitle = `${funder.name} Grants & Funding Intelligence (2026) | FundEcho`;
  const seoDescription = `${funder.mission} Discover typical grant ticket ranges, unsolicited proposal policies, reviewer criteria, and active grant calls.`;

  const seoMetadata: SEOMetaData = {
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: canonicalUrl,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogType: 'website',
    robots: 'index, follow',
    keywords: [
      funder.name,
      funder.acronym || '',
      'grantmaker profile',
      'foundation grants 2026',
      'unsolicited proposals policy',
      ...funder.strategicPriorities.slice(0, 3),
    ],
    breadcrumbs: [
      { name: 'Home', url: `${origin}/` },
      { name: 'Funders', url: `${origin}/funders` },
      { name: funder.name, url: canonicalUrl },
    ],
    jsonLdSchema: {
      '@context': 'https://schema.org',
      '@type': 'FundingAgency',
      name: funder.name,
      alternateName: funder.acronym,
      url: funder.website,
      description: funder.overview,
      foundingDate: `${funder.foundedYear}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: funder.headquarters.city,
        addressCountry: funder.headquarters.country,
      },
    },
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 overflow-x-clip">
      {/* Dynamic SEO Meta */}
      <SEOHead metadata={seoMetadata} />

      {/* 1. BREADCRUMB NAVIGATION */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => onNavigate('funders')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
          >
            Funders
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold truncate max-w-xs">
            {funder.name}
          </span>
        </nav>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Link Copied' : 'Share Profile'}</span>
        </button>
      </div>

      {/* 2. PROFILE HERO CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <span className={`h-16 w-16 sm:h-20 sm:w-20 rounded-3xl flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-md ${funder.logoBg} shrink-0`}>
              {funder.initials}
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {funder.type}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Transparency {funder.transparencyRating}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Est. {funder.foundedYear}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {funder.name} {funder.acronym && `(${funder.acronym})`}
              </h1>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {funder.headquarters.city}, {funder.headquarters.country}
                </span>
                <span>•</span>
                <a
                  href={funder.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={funder.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              <span>Visit Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Strategic Intelligence KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Capital Deployed
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {funder.totalFundingDeployed}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Typical Award Size
            </span>
            <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
              {funder.typicalGrantRange}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Unsolicited Proposals
            </span>
            <div className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {funder.unsolicitedPolicy}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Review Cycle
            </span>
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {funder.reviewCycle}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Avg Turnaround
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {funder.averageTurnaroundTime}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TWO COLUMN MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLUMNS: MISSION, PRIORITIES & HISTORICAL GRANTEES */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mission & Overview */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Institutional Mission & Strategic Overview
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              "{funder.mission}"
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {funder.overview}
            </p>
          </section>

          {/* Strategic Priorities */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Core Thematic Priorities & Mandates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {funder.strategicPriorities.map((priority, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {priority}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Grantee Spotlight & Past Precedents */}
          {funder.granteeHighlights.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Past Funded Grantee Precedents
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Benchmarks of past funded initiatives demonstrating the funder’s scale and impact expectations.
              </p>

              <div className="space-y-3">
                {funder.granteeHighlights.map((grantee, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {grantee.name}
                        </h4>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                          {grantee.project}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {grantee.amount}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {grantee.year} • {grantee.country}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-indigo-400 pl-3">
                      Outcome: {grantee.outcome}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ACTIVE OPPORTUNITIES HOSTED ON FundEcho */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Active Grant Calls by {funder.name} ({hostedOpportunities.length})
              </h2>
            </div>

            {hostedOpportunities.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Open Calls at this Exact Moment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  This funder operates on scheduled annual or cohort cycles. Bookmark this profile or check back during their next application window.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {hostedOpportunities.map((opp) => {
                  const deadlineStatus = calculateDeadlineStatus(opp.deadline);
                  const isSaved = bookmarkedIds.has(opp.id);

                  return (
                    <div
                      key={opp.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {opp.amount?.displayText}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {opp.category}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                            {deadlineStatus.badgeText}
                          </span>
                        </div>

                        <h3 
                          onClick={() => onSelectOpportunity(opp)}
                          className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                        >
                          {opp.title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {opp.summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelectOpportunity(opp)}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleBookmark(opp)}
                          className={`p-2 rounded-xl border transition-colors ${
                            isSaved
                              ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                          }`}
                          title={isSaved ? 'Saved' : 'Save opportunity'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT 1 COLUMN: APPLICATION GUIDANCE & REGIONAL SCOPE */}
        <div className="space-y-6">
          {/* Reviewer Advice Card */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-3xl border border-amber-200/80 dark:border-amber-900/40 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Grant Evaluator Tips & Pitfalls
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-amber-900/90 dark:text-amber-200/90">
              {funder.applicationTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Eligible Regions & Countries */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Eligible Geographic Focus
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {funder.eligibleRegions.map((region, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Support & Contact */}
          <div className="bg-slate-50 dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Official Grant Inquiry
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Program guidelines and proposal inquiries should be directed to the funder's verified program office.
            </p>
            <a
              href={funder.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              <span>Visit Funder Grant Desk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
