import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Globe, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink, 
  Layers, 
  Award, 
  CheckCircle2, 
  FileText, 
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Opportunity, PageId } from '../types';
import { FunderProfile, FunderType, UnsolicitedPolicy } from '../types/funder';
import { getAllFunders } from '../data/funderDirectoryData';
import { getSiteOrigin } from '../utils/seoUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { SEOMetaData } from '../types/seo';

interface FundersPageProps {
  allOpportunities: Opportunity[];
  onSelectFunder: (funderSlug: string) => void;
  onNavigate: (page: PageId) => void;
}

export const FundersPage: React.FC<FundersPageProps> = ({
  allOpportunities,
  onSelectFunder,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<string>('all');

  const allFunders = useMemo(() => getAllFunders(), []);

  // Compute active opportunities count for each funder
  const funderActiveCounts = useMemo(() => {
    const map = new Map<string, number>();
    allFunders.forEach((funder) => {
      const count = allOpportunities.filter((opp) => {
        const org = opp.organization.toLowerCase();
        const fName = funder.name.toLowerCase();
        const fAcronym = funder.acronym ? funder.acronym.toLowerCase() : '';
        return org.includes(fName) || fName.includes(org) || (fAcronym && org.includes(fAcronym));
      }).length;
      map.set(funder.id, count);
    });
    return map;
  }, [allFunders, allOpportunities]);

  const filteredFunders = useMemo(() => {
    return allFunders.filter((funder) => {
      if (selectedType !== 'all' && funder.type !== selectedType) {
        return false;
      }
      if (selectedPolicy !== 'all' && funder.unsolicitedPolicy !== selectedPolicy) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = funder.name.toLowerCase().includes(q);
        const matchAcronym = funder.acronym?.toLowerCase().includes(q);
        const matchCountry = funder.headquarters.country.toLowerCase().includes(q);
        const matchMission = funder.mission.toLowerCase().includes(q);
        const matchPriority = funder.strategicPriorities.some((p) => p.toLowerCase().includes(q));
        if (!matchName && !matchAcronym && !matchCountry && !matchMission && !matchPriority) {
          return false;
        }
      }
      return true;
    });
  }, [allFunders, selectedType, selectedPolicy, searchQuery]);

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/funders`;

  const seoMetadata: SEOMetaData = {
    title: 'Funder & Institutional Intelligence Directory (2026) | FundEcho',
    description: 'Explore verified global funding foundations, philanthropic trusts, corporate accelerators, and government grantmakers with verified funding priorities and active opportunities.',
    canonicalUrl: canonicalUrl,
    ogTitle: 'Funder & Institutional Intelligence Directory | FundEcho',
    ogDescription: 'Explore verified global funding foundations, philanthropic trusts, and corporate accelerators with active opportunities.',
    ogType: 'website',
    robots: 'index, follow',
    keywords: [
      'grantmakers directory',
      'foundations directory',
      'verified funders',
      'global philanthropy directory',
      'institutional funding partners'
    ],
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 overflow-x-clip">
      {/* Dynamic SEO Meta */}
      <SEOHead metadata={seoMetadata} />

      {/* 1. BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-semibold">
          Funder Intelligence Directory
        </span>
      </nav>

      {/* 2. HERO HEADER */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-indigo-800/60 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-indigo-200">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Institutional Grant-Maker & Donor Intelligence</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Verified Funding Foundations & Institutions
        </h1>

        <p className="text-sm sm:text-base text-indigo-200 max-w-3xl leading-relaxed">
          Access verified donor intelligence, typical grant ticket sizes, annual review cycles, unsolicited proposal policies, and all active open calls hosted on FundEcho.
        </p>

        <div className="flex items-center gap-6 pt-2 text-xs sm:text-sm text-indigo-200/90 flex-wrap">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Institutionally Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Non-Dilutive & Philanthropic Capital</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Global & Regional Foundations</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by foundation name, acronym, country, or mission focus..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Organization Types</option>
              <option value="Private Foundation">Private Foundation</option>
              <option value="Corporate CSR & Tech Accelerator">Corporate CSR & Accelerator</option>
              <option value="Government & Bilateral Agency">Government & Bilateral</option>
              <option value="Intergovernmental / Multilateral">Intergovernmental</option>
              <option value="Academic & Charitable Trust">Academic & Trust</option>
              <option value="Venture Philanthropy">Venture Philanthropy</option>
            </select>

            {/* Proposal Acceptance Filter */}
            <select
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Proposal Policies</option>
              <option value="Open Public Calls">Open Public Calls</option>
              <option value="Letter of Inquiry (LOI) First">Letter of Inquiry (LOI) First</option>
              <option value="Rolling Concept Submissions">Rolling Concept Submissions</option>
              <option value="By Invitation / Partner Only">By Invitation Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. FUNDER DIRECTORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFunders.map((funder) => {
          const activeCount = funderActiveCounts.get(funder.id) || 0;

          return (
            <div
              key={funder.id}
              onClick={() => onSelectFunder(funder.slug)}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header: Logo, Name & Verified Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-extrabold text-white shadow-sm ${funder.logoBg}`}>
                      {funder.initials}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {funder.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{funder.headquarters.city}, {funder.headquarters.country}</span>
                      </div>
                    </div>
                  </div>

                  <span className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" title="Verified Funding Institution">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>

                {/* Organization Type Pill & Policy */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {funder.type}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {funder.unsolicitedPolicy}
                  </span>
                </div>

                {/* Mission Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {funder.mission}
                </p>

                {/* Key Metrics Grid */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Typical Award
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {funder.typicalGrantRange}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Review Turnaround
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {funder.averageTurnaroundTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer: Active Opportunities Count & CTA */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeCount > 0 ? `${activeCount} Active Grant Calls` : 'Profile & Historical Grants'}
                </span>

                <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
                  <span>Intelligence Profile</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
