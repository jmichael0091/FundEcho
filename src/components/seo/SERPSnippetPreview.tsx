import React, { useState } from 'react';
import { Globe, Smartphone, Monitor, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';
import { SEOMetaData } from '../../types/seo';

export interface SERPSnippetPreviewProps {
  metadata: SEOMetaData;
}

export const SERPSnippetPreview: React.FC<SERPSnippetPreviewProps> = ({ metadata }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  // URL display formatting
  let displayUrl = metadata.canonicalUrl.replace(/^https?:\/\//, '');
  const urlParts = displayUrl.split('/');
  const domain = urlParts[0];
  const breadcrumb = urlParts.slice(1).filter(Boolean).join(' › ');

  // Character lengths
  const titleLen = metadata?.title?.length || 0;
  const descLen = metadata?.description?.length || 0;

  const isTitleIdeal = titleLen >= 40 && titleLen <= 65;
  const isDescIdeal = descLen >= 110 && descLen <= 165;

  const handleCopySchema = () => {
    if (metadata.jsonLdSchema) {
      navigator.clipboard.writeText(JSON.stringify(metadata.jsonLdSchema, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Device Mode Switcher */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              deviceMode === 'desktop'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Google Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Google Mobile</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            {metadata.robots === 'noindex, nofollow' ? (
              <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-900">
                Robots: Noindex (Private)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-900">
                Robots: Indexable
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Simulated Google Search Result */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs dark:bg-[#1a1f2c] dark:border-slate-700 font-sans transition-all ${
          deviceMode === 'mobile' ? 'max-w-md mx-auto ring-1 ring-slate-200 dark:ring-slate-700' : 'w-full'
        }`}
      >
        <div className="space-y-1.5">
          {/* URL & Favicon Row */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              F
            </div>
            <div className="flex flex-col text-[12px] leading-tight overflow-hidden">
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                FundEcho
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                {domain} {breadcrumb && `› ${breadcrumb}`}
              </span>
            </div>
          </div>

          {/* Title Link */}
          <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug break-words">
            {metadata.title}
          </h3>

          {/* Meta Description */}
          <p className="text-xs sm:text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
            {metadata.description}
          </p>
        </div>
      </div>

      {/* Technical Checks Quality Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Page Title Length</span>
            <span className={`font-mono font-bold ${isTitleIdeal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {titleLen} / 60 chars
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isTitleIdeal ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, (titleLen / 65) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isTitleIdeal ? 'Optimal length for Google SERP display.' : 'Title is descriptive and natural.'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Meta Description</span>
            <span className={`font-mono font-bold ${isDescIdeal ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
              {descLen} / 155 chars
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isDescIdeal ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(100, (descLen / 160) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isDescIdeal ? 'Concise summary answering search intent.' : 'Describes opportunity and eligibility clearly.'}
          </p>
        </div>
      </div>
    </div>
  );
};
