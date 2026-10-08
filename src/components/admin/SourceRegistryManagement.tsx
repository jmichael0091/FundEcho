/**
 * FUNDECHO - SOURCE REGISTRY MANAGEMENT (STEP 3)
 * Admin-only management console for websites and organizations monitored by FundEcho's global crawler.
 * Allows adding, editing, pausing, resuming, and removing sources connected to the "sources" collection.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Shield,
  Clock,
  Building2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';
import { CrawlerSourceDoc, SourceType, SourceTrustLevel, CrawlResultDoc } from '../../types/crawlerPipelineSchema';
import { Category, UserProfile } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AddEditSourceModal } from './AddEditSourceModal';
import { AdminConfirmationModal } from './AdminConfirmationModal';
import { DiscoveryResultsModal } from './DiscoveryResultsModal';
import {
  getCrawlerSources,
  saveCrawlerSource,
  toggleSourcePauseStatus,
  deleteCrawlerSource,
  seedBaselineCrawlerSources,
  triggerDiscoveryEngineRun,
  getCrawlResults,
} from '../../services/firebase/crawlerPipelineService';

export interface SourceRegistryManagementProps {
  categories: Category[];
  currentUser: UserProfile;
}

export const SourceRegistryManagement: React.FC<SourceRegistryManagementProps> = ({
  categories,
  currentUser,
}) => {
  const [sources, setSources] = useState<CrawlerSourceDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Paused'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [trustFilter, setTrustFilter] = useState<string>('All');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<CrawlerSourceDoc | null>(null);
  const [deletingSource, setDeletingSource] = useState<CrawlerSourceDoc | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Step 4 Discovery Engine state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [crawlResults, setCrawlResults] = useState<CrawlResultDoc[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const items = await getCrawlerSources();
      setSources(items);
      const results = await getCrawlResults({ limitCount: 100 });
      setCrawlResults(results);
    } catch (error) {
      console.error('Failed to load crawler sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDiscovery = async (targetSourceId?: string) => {
    setIsDiscovering(true);
    showToast(targetSourceId ? 'Discovery Engine: Scanning target source...' : 'Discovery Engine: Scanning all active sources...');
    try {
      const res = await triggerDiscoveryEngineRun(targetSourceId, {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
      });
      showToast(res.summaryMessage);
      await loadSources();
    } catch (err: any) {
      showToast(`Discovery failed: ${err?.message || 'Error occurred'}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleOpenResultsModal = async () => {
    setIsResultsModalOpen(true);
    setIsLoadingResults(true);
    try {
      const results = await getCrawlResults({ limitCount: 100 });
      setCrawlResults(results);
    } catch (e) {
      console.warn('Failed to load crawl results:', e);
    } finally {
      setIsLoadingResults(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  // Filtered sources
  const filteredSources = useMemo(() => {
    return sources.filter((src) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const name = (src.sourceName || src.name || '').toLowerCase();
      const domain = (src.domain || '').toLowerCase();
      const region = (src.countryRegion || src.region || '').toLowerCase();
      const notes = (src.notes || '').toLowerCase();
      const matchesSearch =
        !query ||
        name.includes(query) ||
        domain.includes(query) ||
        region.includes(query) ||
        notes.includes(query);

      // Status match
      const isSrcActive = src.status === 'Active' || src.status === 'active';
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && isSrcActive) ||
        (statusFilter === 'Paused' && !isSrcActive);

      // Type match
      const matchesType =
        typeFilter === 'All' ||
        (src.sourceType || '').toLowerCase() === typeFilter.toLowerCase();

      // Trust match
      const matchesTrust =
        trustFilter === 'All' ||
        (src.trustLevel || '').toLowerCase() === trustFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType && matchesTrust;
    });
  }, [sources, searchQuery, statusFilter, typeFilter, trustFilter]);

  // Handle Save (Add or Edit)
  const handleSaveSource = async (sourceData: Partial<CrawlerSourceDoc>) => {
    try {
      const saved = await saveCrawlerSource(sourceData as any);
      setSources((prev) => {
        const index = prev.findIndex((s) => s.id === saved.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
      showToast(
        sourceData.id
          ? `Updated source "${saved.sourceName}" successfully.`
          : `Registered source "${saved.sourceName}" in crawler registry.`
      );
    } catch (err: any) {
      showToast(`Error saving source: ${err?.message || 'Action failed'}`);
      throw err;
    }
  };

  // Handle Pause / Resume toggle
  const handleToggleStatus = async (source: CrawlerSourceDoc) => {
    try {
      const newStatus = await toggleSourcePauseStatus(
        source.id,
        source.status,
        { id: currentUser.id, email: currentUser.email, name: currentUser.name }
      );
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, status: newStatus } : s))
      );
      showToast(
        newStatus === 'Paused'
          ? `Paused monitoring for "${source.sourceName || source.name}".`
          : `Resumed active monitoring for "${source.sourceName || source.name}".`
      );
    } catch (err: any) {
      showToast(`Error toggling status: ${err?.message || 'Failed'}`);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingSource) return;
    try {
      await deleteCrawlerSource(deletingSource.id, {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
      });
      setSources((prev) => prev.filter((s) => s.id !== deletingSource.id));
      showToast(`Removed source "${deletingSource.sourceName || deletingSource.name}".`);
      setDeletingSource(null);
    } catch (err: any) {
      showToast(`Error removing source: ${err?.message || 'Failed'}`);
    }
  };

  // Handle Seed baseline
  const handleSeedBaseline = async () => {
    setIsLoading(true);
    try {
      const seeded = await seedBaselineCrawlerSources();
      setSources(seeded);
      showToast(`Synchronized ${seeded.length} verified global funding sources.`);
    } catch (err: any) {
      showToast('Error syncing default sources.');
    } finally {
      setIsLoading(false);
    }
  };

  // Counts
  const activeCount = sources.filter((s) => s.status === 'Active' || s.status === 'active').length;
  const pausedCount = sources.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-3 border border-slate-700 dark:border-slate-200 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                <Globe className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                FundEcho Source Registry
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Step 3
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Manage the global network of foundations, government portals, universities, and accelerators monitored by FundEcho for automated discovery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenResultsModal}
              leftIcon={<Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            >
              Discovered URLs ({crawlResults.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSources}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleRunDiscovery()}
              disabled={isDiscovering}
              leftIcon={<Compass className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500/50"
            >
              {isDiscovering ? 'Scanning...' : 'Run Discovery Engine'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingSource(null);
                setIsAddEditModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New Source
            </Button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sources</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{sources.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Monitoring
            </div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">{activeCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Paused / Standby</div>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">{pausedCount}</div>
          </div>
          <div
            onClick={handleOpenResultsModal}
            className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center justify-between">
              <span>Discovered URLs</span>
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
              {crawlResults.length}
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
              Click to view in crawlResults
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by source name, domain, region, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shrink-0 text-xs font-semibold">
            {(['All', 'Active', 'Paused'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Filters: Type & Trust */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Types</option>
              <option value="Government">Government</option>
              <option value="Foundation">Foundation</option>
              <option value="NGO">NGO</option>
              <option value="University">University</option>
              <option value="Corporation">Corporation</option>
              <option value="Accelerator">Accelerator</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Trust Level:</span>
            <select
              value={trustFilter}
              onChange={(e) => setTrustFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Trust Levels</option>
              <option value="Verified">Verified</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'All' || typeFilter !== 'All' || trustFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setTypeFilter('All');
                setTrustFilter('All');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Sources List / Table View */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Loading source registry from cloud database...
            </p>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {sources.length === 0 ? 'No Crawler Sources Found' : 'No Sources Match Your Search'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {sources.length === 0
                  ? 'Your source registry is currently empty. You can register custom sources or seed the baseline catalog of verified grantmakers.'
                  : 'Try clearing your search query or adjusting your status and type filters.'}
              </p>
            </div>
            {sources.length === 0 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button size="sm" variant="primary" onClick={handleSeedBaseline}>
                  Seed Verified Global Sources
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingSource(null);
                    setIsAddEditModalOpen(true);
                  }}
                >
                  Register Source Manually
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 pl-6 pr-4">Source & Domain</th>
                  <th className="py-3.5 px-4">Type & Region</th>
                  <th className="py-3.5 px-4">Categories</th>
                  <th className="py-3.5 px-4">Trust & Frequency</th>
                  <th className="py-3.5 px-4">Crawl Schedule</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredSources.map((source) => {
                  const isActive = source.status === 'Active' || source.status === 'active';
                  const cats = source.opportunityCategories || source.categories || [];
                  const rawUrl = source.websiteUrl || source.baseUrl || '';

                  return (
                    <tr
                      key={source.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Name & Domain */}
                      <td className="py-4 pl-6 pr-4 align-top">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{source.sourceName || source.name}</span>
                            {source.trustLevel === 'Verified' && (
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </div>
                          {rawUrl && (
                            <a
                              href={rawUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors font-mono"
                            >
                              <span>{source.domain || rawUrl.replace(/https?:\/\//, '')}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                          {source.notes && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic line-clamp-1 max-w-xs">
                              {source.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Type & Region */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {source.sourceType || 'Foundation'}
                          </span>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Globe className="w-3 h-3 shrink-0 text-slate-400" />
                            <span>{source.countryRegion || source.region || 'Global'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Categories */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {cats.slice(0, 2).map((c) => (
                            <span
                              key={c}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium"
                            >
                              {c.replace(/-/g, ' ')}
                            </span>
                          ))}
                          {cats.length > 2 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                              +{cats.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Trust & Crawl Frequency */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              source.trustLevel === 'Verified'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : source.trustLevel === 'High'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <Shield className="w-2.5 h-2.5" />
                            {source.trustLevel || 'High'} Trust
                          </span>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{source.crawlFrequency || 'Daily (24h)'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Crawl Schedule (Last & Next) */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1 text-[11px]">
                          <div className="text-slate-600 dark:text-slate-400">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Last: </span>
                            {source.lastCrawled
                              ? typeof source.lastCrawled === 'string'
                                ? source.lastCrawled.split('T')[0]
                                : 'Recently'
                              : 'Pending crawl'}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Next: </span>
                            {isActive
                              ? source.nextScheduledCrawl
                                ? typeof source.nextScheduledCrawl === 'string'
                                  ? source.nextScheduledCrawl.split('T')[0]
                                  : 'Scheduled'
                                : 'Daily scheduled'
                              : 'Standby'}
                          </div>
                        </div>
                      </td>

                      {/* Active / Paused Status */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                            }`}
                          />
                          {isActive ? 'Active' : 'Paused'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 align-top text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Run Discovery On Source Button */}
                          <button
                            type="button"
                            title="Run discovery on this source"
                            onClick={() => handleRunDiscovery(source.id)}
                            disabled={isDiscovering}
                            className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                          >
                            <Compass className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
                          </button>

                          {/* Pause / Resume Button */}
                          <button
                            type="button"
                            title={isActive ? 'Pause crawler' : 'Resume crawler'}
                            onClick={() => handleToggleStatus(source)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            title="Edit source parameters"
                            onClick={() => {
                              setEditingSource(source);
                              setIsAddEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            title="Remove source"
                            onClick={() => setDeletingSource(source)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AddEditSourceModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingSource(null);
        }}
        onSave={handleSaveSource}
        editingSource={editingSource}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {deletingSource && (
        <AdminConfirmationModal
          isOpen={Boolean(deletingSource)}
          onClose={() => setDeletingSource(null)}
          onConfirm={handleConfirmDelete}
          title="Remove Monitored Source?"
          description={`Are you sure you want to remove "${deletingSource.sourceName || deletingSource.name}" (${deletingSource.domain}) from the FundEcho Source Registry? The crawler will stop monitoring this website for new opportunities.`}
          confirmLabel="Remove Source"
          confirmVariant="danger"
        />
      )}

      {/* Step 4 Discovery Results Modal */}
      <DiscoveryResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        results={crawlResults}
        isLoading={isLoadingResults}
        onRefresh={handleOpenResultsModal}
        onRunDiscovery={() => handleRunDiscovery()}
        isDiscovering={isDiscovering}
      />
    </div>
  );
};
