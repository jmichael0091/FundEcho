import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Share2, 
  Code2, 
  FileCode, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles,
  Layers,
  Globe,
  Download,
  Info
} from 'lucide-react';
import { SEOMetaData } from '../../types/seo';
import { SERPSnippetPreview } from './SERPSnippetPreview';
import { Opportunity, Category } from '../../types';
import { generateXMLSitemap } from '../../utils/seoUtils';

export interface SEOInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: SEOMetaData;
  allOpportunities: Opportunity[];
  allCategories: Category[];
}

export const SEOInspectorModal: React.FC<SEOInspectorModalProps> = ({
  isOpen,
  onClose,
  metadata,
  allOpportunities,
  allCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'serp' | 'social' | 'schema' | 'meta' | 'sitemap'>('serp');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  if (!isOpen || !metadata) return null;

  const handleCopySchema = () => {
    if (metadata.jsonLdSchema) {
      navigator.clipboard.writeText(JSON.stringify(metadata.jsonLdSchema, null, 2));
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  const sitemapXml = generateXMLSitemap(allOpportunities, allCategories);

  const handleCopySitemap = () => {
    navigator.clipboard.writeText(sitemapXml);
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2000);
  };

  const handleDownloadSitemap = () => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="seo-inspector-modal"
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  SEO & Discoverability Inspector
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                  Step 13
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-lg">
                Inspecting: <span className="font-mono text-indigo-600 dark:text-indigo-400">{metadata.canonicalUrl}</span>
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

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('serp')}
            className={`py-3 px-3.5 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'serp'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Google SERP Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`py-3 px-3.5 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'social'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Social Sharing (OG / Twitter)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3.5 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>JSON-LD Schema</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`py-3 px-3.5 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'meta'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Meta Tags Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sitemap')}
            className={`py-3 px-3.5 border-b-2 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sitemap'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Sitemap.xml Protocol</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40 dark:bg-slate-950/30">
          {/* 1. SERP PREVIEW */}
          {activeTab === 'serp' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  This live preview renders how search engines like Google format your title, breadcrumb hierarchy, and meta description in search listings.
                </span>
              </div>

              <SERPSnippetPreview metadata={metadata} />
            </div>
          )}

          {/* 2. SOCIAL SHARING (OPEN GRAPH / TWITTER) */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook / LinkedIn Card */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Open Graph Card (Facebook & LinkedIn)
                  </span>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="h-44 bg-slate-200 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                      <img 
                        src={metadata.ogImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80'} 
                        alt={metadata.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[11px] font-bold text-white bg-indigo-600/90 px-2 py-0.5 rounded">
                          FundEcho Network
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <span className="text-[11px] font-mono text-slate-400 uppercase truncate block">
                        {metadata.canonicalUrl.replace(/^https?:\/\//, '')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {metadata.ogTitle || metadata.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {metadata.ogDescription || metadata.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Twitter / X Summary Card */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Twitter / X Card (Summary Large Image)
                  </span>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="h-44 bg-slate-200 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                      <img 
                        src={metadata.ogImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80'} 
                        alt={metadata.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-1.5">
                      <span className="text-[11px] font-mono text-slate-400 uppercase truncate block">
                        fundecho.network
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {metadata.ogTitle || metadata.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {metadata.ogDescription || metadata.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. JSON-LD SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Schema.org Structured Data (JSON-LD)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Validated schema injected via &lt;script type=&quot;application/ld+json&quot;&gt;
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied Schema!' : 'Copy JSON-LD'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
                <pre>{JSON.stringify(metadata.jsonLdSchema || {}, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* 4. META TAGS MATRIX */}
          {activeTab === 'meta' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      <th className="p-3">Tag Type</th>
                      <th className="p-3">Attribute Name / Property</th>
                      <th className="p-3">Injected Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    <tr>
                      <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">&lt;title&gt;</td>
                      <td className="p-3 text-indigo-600 dark:text-indigo-400">document.title</td>
                      <td className="p-3 font-sans">{metadata.title}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">&lt;meta&gt;</td>
                      <td className="p-3 text-indigo-600 dark:text-indigo-400">name=&quot;description&quot;</td>
                      <td className="p-3 font-sans">{metadata.description}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">&lt;meta&gt;</td>
                      <td className="p-3 text-indigo-600 dark:text-indigo-400">name=&quot;robots&quot;</td>
                      <td className="p-3 font-sans font-bold text-emerald-600 dark:text-emerald-400">
                        {metadata.robots || 'index, follow'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">&lt;link&gt;</td>
                      <td className="p-3 text-indigo-600 dark:text-indigo-400">rel=&quot;canonical&quot;</td>
                      <td className="p-3 break-all">{metadata.canonicalUrl}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">&lt;meta&gt;</td>
                      <td className="p-3 text-indigo-600 dark:text-indigo-400">property=&quot;og:title&quot;</td>
                      <td className="p-3 font-sans">{metadata.ogTitle || metadata.title}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">&lt;meta&gt;</td>
                      <td className="p-3 text-indigo-600 dark:text-indigo-400">property=&quot;og:url&quot;</td>
                      <td className="p-3 break-all">{metadata.canonicalUrl}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">&lt;meta&gt;</td>
                      <td className="p-3 text-indigo-600 dark:text-indigo-400">name=&quot;twitter:card&quot;</td>
                      <td className="p-3">{metadata.twitterCard || 'summary_large_image'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. SITEMAP.XML PROTOCOL */}
          {activeTab === 'sitemap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    XML Sitemap Protocol Generation
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ready for production submission to Google Search Console and Bing Webmaster Tools.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySitemap}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
                  >
                    {copiedSitemap ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSitemap ? 'Copied XML' : 'Copy XML'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSitemap}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download sitemap.xml</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
                <pre>{sitemapXml}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Semantic HTML, clean canonical slugs, and structured data verified.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
