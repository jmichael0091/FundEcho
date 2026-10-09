import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  BarChart3, 
  SlidersHorizontal,
  ExternalLink,
  Tag,
  Calendar,
  Layers,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  AffiliateOffer, 
  AffiliateOfferStatus, 
  AffiliateOfferType, 
  AffiliatePremiumEligibility,
  AffiliatePerformanceStats 
} from '../../types/affiliate';
import { 
  getStoredAffiliateOffers, 
  saveAffiliateOffer, 
  deleteAffiliateOffer, 
  toggleAffiliateOfferStatus,
  resetAffiliateOffersToDefaults 
} from '../../data/affiliateData';
import { 
  getAffiliatePerformanceStats, 
  clearAffiliateTrackingData 
} from '../../utils/affiliateTracking';
import { AffiliateMatchPreview } from './AffiliateMatchPreview';

export const AffiliateAdminManager: React.FC = () => {
  const [subTab, setSubTab] = useState<'offers' | 'preview' | 'analytics'>('offers');
  const [offers, setOffers] = useState<AffiliateOffer[]>([]);
  const [stats, setStats] = useState<AffiliatePerformanceStats>(getAffiliatePerformanceStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AffiliateOffer | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    partnerName: string;
    title: string;
    description: string;
    category: string;
    offerType: AffiliateOfferType;
    logo: string;
    affiliateUrl: string;
    disclosure: string;
    status: AffiliateOfferStatus;
    countriesStr: string;
    userTypesStr: string;
    interestsStr: string;
    fundingTypesStr: string;
    opportunityCategoriesStr: string;
    businessStagesStr: string;
    industriesStr: string;
    intentSignalsStr: string;
    premiumEligibility: AffiliatePremiumEligibility;
    minimumMatchScore: number;
    priority: number;
    startDate: string;
    endDate: string;
  }>({
    partnerName: '',
    title: '',
    description: '',
    category: 'Accounting & Finance',
    offerType: 'Software',
    logo: 'Calculator',
    affiliateUrl: '',
    disclosure: 'Some links may be affiliate links. FundEcho may earn a commission at no additional cost to you.',
    status: 'Active',
    countriesStr: '',
    userTypesStr: 'Startup Founder, Small Business Owner',
    interestsStr: 'technology, business',
    fundingTypesStr: 'Grant, Business Funding',
    opportunityCategoriesStr: 'Technology, Business',
    businessStagesStr: 'Early Stage, Growth',
    industriesStr: 'Software, Tech',
    intentSignalsStr: 'accounting, budgeting',
    premiumEligibility: 'all',
    minimumMatchScore: 50,
    priority: 80,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '2028-12-31'
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = () => {
    setOffers(getStoredAffiliateOffers());
    setStats(getAffiliatePerformanceStats());
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setFormData({
      partnerName: '',
      title: '',
      description: '',
      category: 'Accounting & Finance',
      offerType: 'Software',
      logo: 'Calculator',
      affiliateUrl: '',
      disclosure: 'Some links may be affiliate links. FundEcho may earn a commission at no additional cost to you.',
      status: 'Active',
      countriesStr: '',
      userTypesStr: 'Startup Founder, Small Business Owner',
      interestsStr: 'technology, business',
      fundingTypesStr: 'Grant, Business Funding',
      opportunityCategoriesStr: 'Technology, Business',
      businessStagesStr: 'Early Stage, Growth',
      industriesStr: 'Software, Tech',
      intentSignalsStr: 'accounting, budgeting',
      premiumEligibility: 'all',
      minimumMatchScore: 50,
      priority: 80,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '2028-12-31'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: AffiliateOffer) => {
    setEditingOffer(offer);
    setFormData({
      id: offer.id,
      partnerName: offer.partnerName,
      title: offer.title,
      description: offer.description,
      category: offer.category,
      offerType: offer.offerType,
      logo: offer.logo || 'Sparkles',
      affiliateUrl: offer.affiliateUrl,
      disclosure: offer.disclosure || 'Some links may be affiliate links. FundEcho may earn a commission at no additional cost to you.',
      status: offer.status,
      countriesStr: (offer.countries || []).join(', '),
      userTypesStr: (offer.userTypes || []).join(', '),
      interestsStr: (offer.interests || []).join(', '),
      fundingTypesStr: (offer.fundingTypes || []).join(', '),
      opportunityCategoriesStr: (offer.opportunityCategories || []).join(', '),
      businessStagesStr: (offer.businessStages || []).join(', '),
      industriesStr: (offer.industries || []).join(', '),
      intentSignalsStr: (offer.intentSignals || []).join(', '),
      premiumEligibility: offer.premiumEligibility || 'all',
      minimumMatchScore: offer.minimumMatchScore || 50,
      priority: offer.priority || 80,
      startDate: offer.startDate || '2025-01-01',
      endDate: offer.endDate || '2028-12-31'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (offerId: string) => {
    const updated = toggleAffiliateOfferStatus(offerId);
    if (updated) {
      loadData();
      triggerToast(`Offer status set to ${updated.status}`);
    }
  };

  const handleDelete = (offerId: string) => {
    if (confirm('Are you sure you want to archive/delete this affiliate offer?')) {
      deleteAffiliateOffer(offerId);
      loadData();
      triggerToast('Offer removed successfully');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset affiliate catalog to verified catalog defaults?')) {
      resetAffiliateOffersToDefaults();
      loadData();
      triggerToast('Affiliate offers reset to defaults');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerName.trim()) {
      setFormError('Partner Name is required.');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Offer Title is required.');
      return;
    }
    if (!formData.affiliateUrl.trim()) {
      setFormError('Official Affiliate URL is required.');
      return;
    }

    const parseList = (str: string) =>
      str.split(',').map((s) => s.trim()).filter(Boolean);

    const offerToSave: AffiliateOffer = {
      id: editingOffer ? editingOffer.id : `aff-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      partnerName: formData.partnerName.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      offerType: formData.offerType,
      logo: formData.logo,
      affiliateUrl: formData.affiliateUrl.trim(),
      disclosure: formData.disclosure.trim(),
      status: formData.status,
      countries: parseList(formData.countriesStr),
      regions: [],
      userTypes: parseList(formData.userTypesStr),
      interests: parseList(formData.interestsStr),
      fundingTypes: parseList(formData.fundingTypesStr),
      opportunityCategories: parseList(formData.opportunityCategoriesStr),
      businessStages: parseList(formData.businessStagesStr),
      industries: parseList(formData.industriesStr),
      intentSignals: parseList(formData.intentSignalsStr),
      premiumEligibility: formData.premiumEligibility,
      minimumMatchScore: Number(formData.minimumMatchScore) || 50,
      priority: Number(formData.priority) || 80,
      startDate: formData.startDate,
      endDate: formData.endDate,
      createdAt: editingOffer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveAffiliateOffer(offerToSave);
    setIsModalOpen(false);
    loadData();
    triggerToast(editingOffer ? 'Affiliate offer updated successfully' : 'New affiliate offer created successfully');
  };

  // Filter offers for management table
  const filteredOffers = offers.filter((offer) => {
    if (statusFilter !== 'all' && offer.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && offer.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        offer.partnerName.toLowerCase().includes(q) ||
        offer.title.toLowerCase().includes(q) ||
        offer.description.toLowerCase().includes(q) ||
        offer.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(new Set(offers.map((o) => o.category)));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2">
          <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Top Affiliate Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Affiliate & Partner Offer Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Administer verified partner tools, configure deterministic targeting rules, and preview seeker matching.
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('offers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'offers'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Offers ({offers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('preview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'preview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Match Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'analytics'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Performance</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: OFFERS LIST & CONTROLS */}
      {subTab === 'offers' && (
        <div className="space-y-4">
          {/* Action Header: Search, Filters, Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search offers by partner, title, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Add New Offer Button */}
              <button
                type="button"
                id="admin-add-affiliate-offer-btn"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors min-h-[38px]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Offer</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                title="Reset to Catalog Defaults"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Offers Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Partner & Offer</th>
                    <th className="py-3.5 px-3">Category / Type</th>
                    <th className="py-3.5 px-3">Targeting Summary</th>
                    <th className="py-3.5 px-3">Matching Controls</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOffers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No affiliate offers found matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOffers.map((offer) => (
                      <tr
                        key={offer.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Partner & Offer */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="space-y-0.5 max-w-xs">
                            <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 block">
                              {offer.partnerName}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {offer.title}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                              {offer.description}
                            </span>
                            <a
                              href={offer.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-slate-400 hover:text-indigo-500 inline-flex items-center gap-1 font-mono mt-0.5 truncate max-w-[200px]"
                            >
                              <span>{offer.affiliateUrl}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          </div>
                        </td>

                        {/* Category & Type */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {offer.category}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            Type: {offer.offerType}
                          </span>
                        </td>

                        {/* Targeting Summary */}
                        <td className="py-3.5 px-3 max-w-[180px]">
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 truncate">
                            <div>
                              <strong>Audience:</strong>{' '}
                              {offer.userTypes && offer.userTypes.length > 0
                                ? offer.userTypes.slice(0, 2).join(', ')
                                : 'All Seeker Types'}
                            </div>
                            <div>
                              <strong>Geotargeting:</strong>{' '}
                              {offer.countries && offer.countries.length > 0
                                ? offer.countries.join(', ')
                                : 'Global'}
                            </div>
                            <div>
                              <strong>Funding:</strong>{' '}
                              {offer.fundingTypes && offer.fundingTypes.length > 0
                                ? offer.fundingTypes.slice(0, 2).join(', ')
                                : 'All'}
                            </div>
                          </div>
                        </td>

                        {/* Matching Controls */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-[11px]">
                          <div className="space-y-0.5">
                            <div>
                              Min Score: <strong className="text-slate-900 dark:text-white">{offer.minimumMatchScore}%</strong>
                            </div>
                            <div>
                              Priority: <strong className="text-slate-900 dark:text-white">{offer.priority}</strong>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Expires: {offer.endDate}
                            </div>
                          </div>
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(offer.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors ${
                              offer.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {offer.status === 'Active' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{offer.status}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(offer)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Offer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(offer.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                              title="Delete Offer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MATCH SIMULATOR & TARGETING PREVIEW */}
      {subTab === 'preview' && (
        <AffiliateMatchPreview offers={offers} />
      )}

      {/* SUBTAB 3: PERFORMANCE & CLICK TRACKING STATS */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Offers</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalOffers}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Active Campaigns</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.activeOffers}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Impressions</span>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {stats.totalImpressions}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Clicks Tracked</span>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {stats.totalClicks}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 lg:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Click-Through Rate</span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {stats.clickThroughRate}%
              </div>
            </div>
          </div>

          {/* Detailed Performance Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Offers */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Top Performing Partner Offers</span>
                <span className="text-xs font-normal text-slate-400">Ranked by clicks</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.topPerformingOffers.slice(0, 5).map((item) => (
                  <div key={item.offerId} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-3">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">
                        {item.partnerName}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.clicks}</span>
                        <span className="text-[10px] text-slate-400">clicks</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.impressions}</span>
                        <span className="text-[10px] text-slate-400">views</span>
                      </div>
                      <div className="w-12 text-right">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block">{item.ctr}%</span>
                        <span className="text-[10px] text-slate-400">CTR</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Placements Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Placement Effectiveness</span>
                <span className="text-xs font-normal text-slate-400">Impression contexts</span>
              </h4>

              <div className="space-y-3">
                {stats.placementsBreakdown.map((item) => (
                  <div key={item.placement} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white capitalize">
                        {item.placement.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        {item.ctr}% CTR
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, item.ctr * 5)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.impressions} impressions</span>
                      <span>{item.clicks} clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ethics & Compliance Notice */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start justify-between gap-4">
            <div>
              <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">
                Partner Tracking & Compliance Safeguards:
              </strong>
              <span>
                All impressions and clicks are tracked to maintain user privacy. Real-world conversion values, payouts, and third-party tracking cookies are strictly omitted to maintain privacy and compliance.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear local tracking events?')) {
                  clearAffiliateTrackingData();
                  loadData();
                  triggerToast('Local event history cleared.');
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shrink-0"
            >
              Reset Events
            </button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT OFFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingOffer ? 'Edit Affiliate Offer' : 'Create New Affiliate Offer'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Basic Information Section */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  1. Basic Offer Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Partner / Provider Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.partnerName}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                      placeholder="e.g. LedgerBloom Accounting"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Accounting & Finance">Accounting & Finance</option>
                      <option value="Proposal & Document Tools">Proposal & Document Tools</option>
                      <option value="Education & Learning">Education & Learning</option>
                      <option value="Nonprofit Management">Nonprofit Management</option>
                      <option value="Website & Digital Tools">Website & Digital Tools</option>
                      <option value="Legal & Compliance">Legal & Compliance</option>
                      <option value="Analytics & Reporting">Analytics & Reporting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Automated Grant Budgeting & Audit-Ready Books"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the tool or service..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Offer Type
                    </label>
                    <select
                      value={formData.offerType}
                      onChange={(e) => setFormData({ ...formData, offerType: e.target.value as AffiliateOfferType })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Software">Software</option>
                      <option value="Tool">Tool</option>
                      <option value="Service">Service</option>
                      <option value="Course">Course</option>
                      <option value="Platform">Platform</option>
                      <option value="Consulting">Consulting</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Icon Emblem
                    </label>
                    <select
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Calculator">Calculator (Finance)</option>
                      <option value="FileText">FileText (Proposals)</option>
                      <option value="GraduationCap">GraduationCap (Education)</option>
                      <option value="HeartHandshake">HeartHandshake (NGO)</option>
                      <option value="Globe">Globe (Web/Digital)</option>
                      <option value="Shield">Shield (Legal/Security)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as AffiliateOfferStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Affiliate URL (Admin-Managed) */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Official Affiliate / Tracking URL * (Admin-Managed)
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.affiliateUrl}
                    onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                    placeholder="https://partners.fundecho.org/partner-link?ref=fundecho"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Frontend components will direct users to this URL upon click. Never hardcode links in components.
                  </span>
                </div>
              </div>

              {/* Targeting Rules Section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  2. Targeting & Qualification Rules (Comma-separated)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Target Countries (Leave blank for Worldwide)
                    </label>
                    <input
                      type="text"
                      value={formData.countriesStr}
                      onChange={(e) => setFormData({ ...formData, countriesStr: e.target.value })}
                      placeholder="e.g. United States, Canada, United Kingdom"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Target User Types
                    </label>
                    <input
                      type="text"
                      value={formData.userTypesStr}
                      onChange={(e) => setFormData({ ...formData, userTypesStr: e.target.value })}
                      placeholder="e.g. Startup Founder, Small Business Owner, Student"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Target Funding Types
                    </label>
                    <input
                      type="text"
                      value={formData.fundingTypesStr}
                      onChange={(e) => setFormData({ ...formData, fundingTypesStr: e.target.value })}
                      placeholder="e.g. Grant, Business Funding, Fellowship"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Target Categories & Interests
                    </label>
                    <input
                      type="text"
                      value={formData.opportunityCategoriesStr}
                      onChange={(e) => setFormData({ ...formData, opportunityCategoriesStr: e.target.value })}
                      placeholder="e.g. Technology, Education, Social Impact"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Business Stages
                    </label>
                    <input
                      type="text"
                      value={formData.businessStagesStr}
                      onChange={(e) => setFormData({ ...formData, businessStagesStr: e.target.value })}
                      placeholder="e.g. Ideation, Early Stage, Growth"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Member Plan Eligibility
                    </label>
                    <select
                      value={formData.premiumEligibility}
                      onChange={(e) => setFormData({ ...formData, premiumEligibility: e.target.value as AffiliatePremiumEligibility })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="all">All Members (Free & Premium)</option>
                      <option value="free_only">Free Tier Accounts Only</option>
                      <option value="premium_only">FundEcho Premium Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Matching Controls */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  3. Matching Controls & Timeline
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Min Score (0-100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.minimumMatchScore}
                      onChange={(e) => setFormData({ ...formData, minimumMatchScore: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Priority (0-100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  {editingOffer ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
