/**
 * FUNDECHO - DISCOVERY RESULTS MODAL (STEP 4)
 * Admin modal inspecting discovered opportunity URLs recorded in "crawlResults".
 * Displays discovery date, originating source, target URL, detected opportunity type,
 * confidence score, and processing status ("unprocessed").
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Compass,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Layers,
  Sparkles,
  AlertCircle,
  Clock,
  Globe,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { CrawlResultDoc } from '../../types/crawlerPipelineSchema';
import { Button } from '../ui/Button';

export interface DiscoveryResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: CrawlResultDoc[];
  isLoading: boolean;
  onRefresh: () => void;
  onRunDiscovery?: () => void;
  isDiscovering?: boolean;
}

export const DiscoveryResultsModal: React.FC<DiscoveryResultsModalProps> = ({
  isOpen,
  onClose,
  results,
  isLoading,
  onRefresh,
  onRunDiscovery,
  isDiscovering = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const title = (item.pageTitle || '').toLowerCase();
      const url = (item.sourceUrl || item.url || '').toLowerCase();
      const source = (item.sourceName || '').toLowerCase();
      const keywords = (item.relevanceKeywords || []).join(' ').toLowerCase();

      const matchesQuery =
        !q ||
        title.includes(q) ||
        url.includes(q) ||
        source.includes(q) ||
        keywords.includes(q);

      const matchesType =
        typeFilter === 'All' ||
        (item.opportunityType || '').toLowerCase() === typeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'All' ||
        (item.status || 'unprocessed').toLowerCase() === statusFilter.toLowerCase();

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [results, searchQuery, typeFilter, statusFilter]);

  if (!isOpen) return null;

  const getTypeBadgeClass = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'grant':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'scholarship':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'fellowship':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'accelerator':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'competition':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8 text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Compass className={`w-6 h-6 ${isDiscovering ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Opportunity Discovery Engine
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Step 4
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Discovered candidate opportunity URLs recorded in <code className="font-mono text-indigo-600 dark:text-indigo-400">crawlResults</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRunDiscovery && (
              <Button
                variant="primary"
                size="sm"
                onClick={onRunDiscovery}
                disabled={isDiscovering}
                leftIcon={<Compass className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />}
              >
                {isDiscovering ? 'Scanning Portals...' : 'Run Discovery Now'}
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 4 Boundary Advisory Notice */}
        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Discovery Engine Foundation:</strong> Discovered URLs are recorded in the cloud <code className="font-mono font-bold">crawlResults</code> collection with status <span className="font-bold underline decoration-indigo-400">unprocessed</span>. To protect data integrity, opportunities are not published until subsequent crawler and AI extraction verification steps.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 my-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by page title, URL, source, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="All">All Opportunity Types</option>
              <option value="Grant">Grants</option>
              <option value="Scholarship">Scholarships</option>
              <option value="Fellowship">Fellowships</option>
              <option value="Competition">Competitions / Prizes</option>
              <option value="Accelerator">Accelerators</option>
              <option value="Award">Awards</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="unprocessed">Unprocessed</option>
              <option value="drafted">Drafted</option>
              <option value="duplicate_skipped">Duplicate Skipped</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Results Table / List */}
        <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Fetching discovery captures from cloud database...
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Discovered URLs Found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No opportunity links match your query. Click "Run Discovery Now" to scan active sources for new grant, scholarship, and funding pages.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredResults.map((item) => {
                const targetUrl = item.sourceUrl || item.url || '';
                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTypeBadgeClass(
                              item.opportunityType
                            )}`}
                          >
                            {item.opportunityType || 'Opportunity'}
                          </span>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.confidenceScore ? `${item.confidenceScore}% Match Confidence` : 'Verified Source'}
                          </span>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Status: {item.status || 'unprocessed'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.pageTitle || 'Discovered Opportunity Link'}
                        </h4>

                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline break-all font-mono"
                        >
                          <span>{targetUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>

                      <div className="text-right shrink-0 space-y-1 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 justify-end font-semibold text-slate-600 dark:text-slate-300">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{item.sourceName || 'Monitored Source'}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Discovered: {item.discoveryDate || 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    {item.rawHtmlSnippet && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl line-clamp-2">
                        "{item.rawHtmlSnippet}"
                      </p>
                    )}

                    {item.relevanceKeywords && item.relevanceKeywords.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {item.relevanceKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>
            Showing <strong className="text-slate-900 dark:text-white">{filteredResults.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{results.length}</strong> discovered URL records
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Inspection
          </Button>
        </div>
      </div>
    </div>
  );
};
