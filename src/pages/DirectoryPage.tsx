import React, { useState } from 'react';
import { 
  ChevronRight, 
  Globe, 
  Sparkles, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Layers, 
  MapPin, 
  Building2, 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  ExternalLink,
  Info
} from 'lucide-react';
import { Category, Opportunity, PageId } from '../types';
import { 
  COUNTRY_SEO_PROFILES, 
  FUNDING_TYPE_SEO_PROFILES, 
  generateSitemapEntries, 
  generateXMLSitemap, 
  getSiteOrigin 
} from '../utils/seoUtils';
import { SEOHead } from '../components/seo/SEOHead';
import { SEOMetaData } from '../types/seo';
import { SEOInspectorModal } from '../components/seo/SEOInspectorModal';
import { AdSenseSlot } from '../components/monetization/AdSenseSlot';

export interface DirectoryPageProps {
  allCategories: Category[];
  allOpportunities: Opportunity[];
  onNavigate: (page: PageId) => void;
  onSelectCategory: (categorySlug: string) => void;
  onSelectCountry: (countrySlug: string) => void;
  onSelectFundingType: (typeSlug: string) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

export const DirectoryPage: React.FC<DirectoryPageProps> = ({
  allCategories,
  allOpportunities,
  onNavigate,
  onSelectCategory,
  onSelectCountry,
  onSelectFundingType,
  onSelectOpportunity,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'countries' | 'types' | 'opportunities' | 'sitemap'>('categories');
  const [copiedXml, setCopiedXml] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/directory`;
  const sitemapXml = generateXMLSitemap(allOpportunities, allCategories);
  const sitemapEntries = generateSitemapEntries(allOpportunities, allCategories);

  const handleCopyXml = () => {
    navigator.clipboard.writeText(sitemapXml);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2000);
  };

  const handleDownloadXml = () => {
    const blob = new Blob([sitemapXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const seoTitle = 'FundEcho Site Directory & Discoverability Index (2026) | FundEcho';
  const seoDescription = 'Browse the complete index of verified funding categories, global country hubs, funding formats, and open grant opportunities across the FundEcho network.';

  const seoMetadata: SEOMetaData = {
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: canonicalUrl,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogType: 'website',
    robots: 'index, follow',
    keywords: [
      'funding directory',
      'grant directory',
      'scholarships index',
      'global funding sitemap',
      'verified grant network'
    ],
    breadcrumbs: [
      { name: 'Home', url: `${origin}/` },
      { name: 'Directory', url: canonicalUrl }
    ],
    jsonLdSchema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: seoTitle,
      description: seoDescription,
      url: canonicalUrl
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 overflow-x-clip">
      {/* Dynamic SEO Head Tags */}
      <SEOHead metadata={seoMetadata} />

      {/* 1. BREADCRUMB */}
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
          <span className="text-slate-900 dark:text-white font-semibold">
            Directory & Site Index
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInspectorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>SEO Inspector</span>
          </button>
        </div>
      </div>

      {/* 2. HERO HEADER */}
      <header className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-indigo-800/60">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-indigo-200">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Indexable Global Opportunity Directory</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            FundEcho Opportunity Directory & Search Index
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            A comprehensive, search-engine-accessible directory indexing all verified funding categories, eligible geographic territories, funding mechanisms, and active grant rounds.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Categories</span>
              <span className="text-xl font-black text-white">{allCategories.length} Sectors</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Country Hubs</span>
              <span className="text-xl font-black text-white">{COUNTRY_SEO_PROFILES.length} Locations</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Funding Types</span>
              <span className="text-xl font-black text-white">{FUNDING_TYPE_SEO_PROFILES.length} Formats</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Indexed URLs</span>
              <span className="text-xl font-black text-emerald-400">{sitemapEntries.length} Routes</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. DIRECTORY TABS */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`py-3 px-4 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories ({allCategories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('countries')}
          className={`py-3 px-4 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'countries'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Country & Regional Hubs ({COUNTRY_SEO_PROFILES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('types')}
          className={`py-3 px-4 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'types'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Funding Formats ({FUNDING_TYPE_SEO_PROFILES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('opportunities')}
          className={`py-3 px-4 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'opportunities'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Public Opportunities ({allOpportunities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sitemap')}
          className={`py-3 px-4 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sitemap'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>XML Sitemap Preview</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      <div>
        {/* TAB 1: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Indexed Category Landing Pages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Each category page is fully indexable with structured metadata, SEO copy, and active grant listings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between shadow-2xs hover:border-indigo-500 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        /categories/{cat.slug}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {cat.count} listings
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.slug)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Visit Category Landing Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COUNTRY HUBS */}
        {activeTab === 'countries' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Geographic & Country Funding Hubs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dynamic, localized landing pages indexing opportunities open to specific national and regional applicants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COUNTRY_SEO_PROFILES.map((country) => (
                <div
                  key={country.slug}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between shadow-2xs hover:border-indigo-500 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{country.flag}</span>
                        <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          /countries/{country.slug}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {country.region}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Funding in {country.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {country.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCountry(country.slug)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Visit {country.name} Landing Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FUNDING FORMATS */}
        {activeTab === 'types' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Funding Mechanism & Format Hubs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Indexable guides and search destinations covering specific capital structures like grants, scholarships, fellowships, and prizes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FUNDING_TYPE_SEO_PROFILES.map((ft) => (
                <div
                  key={ft.slug}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between shadow-2xs hover:border-indigo-500 transition-colors"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      /types/{ft.slug}
                    </span>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {ft.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {ft.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectFundingType(ft.slug)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Visit {ft.name} Landing Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Indexable Public Opportunity Pages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Each opportunity has a unique canonical slug, OpenGraph metadata, and Schema.org JSON-LD markup.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                    <th className="p-3">Opportunity Title</th>
                    <th className="p-3">Organization</th>
                    <th className="p-3">Canonical Slug</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  {allOpportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        {opp.title}
                      </td>
                      <td className="p-3">{opp.organization}</td>
                      <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 truncate max-w-[180px]">
                        /opportunities/{opp.slug}
                      </td>
                      <td className="p-3">{opp.deadline}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectOpportunity(opp)}
                          className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold hover:bg-indigo-100 transition-colors text-[11px]"
                        >
                          View Page
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SITEMAP XML */}
        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Live XML Sitemap Protocol (sitemap.xml)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Valid XML sitemap complying with search engine indexing standards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyXml}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
                >
                  {copiedXml ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedXml ? 'Copied XML!' : 'Copy XML Protocol'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadXml}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download sitemap.xml</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
              <pre>{sitemapXml}</pre>
            </div>
          </div>
        )}

        {/* Non-intrusive ad placement at directory footer */}
        <AdSenseSlot 
          slotId="ad-slot-directory-bottom" 
          format="banner" 
          className="pt-6"
        />
      </div>

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
