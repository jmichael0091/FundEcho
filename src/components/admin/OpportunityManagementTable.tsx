import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Clock, 
  Archive, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Globe,
  Sliders,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Opportunity, Category, OpportunityType } from '../../types';
import { PublicationStatus, AdminVerificationStatus } from '../../types/admin';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DeadlineBadge } from '../deadlines/DeadlineBadge';
import { AdminConfirmationModal } from './AdminConfirmationModal';

export interface OpportunityManagementTableProps {
  opportunities: Opportunity[];
  categories: Category[];
  onAddNew: () => void;
  onView: (opportunity: Opportunity) => void;
  onEdit: (opportunity: Opportunity) => void;
  onReview: (opportunity: Opportunity) => void;
  onArchive: (opportunityId: string) => void;
  onDelete: (opportunityId: string) => void;
  onStatusChange: (opportunityId: string, status: 'Open' | 'Verifying' | 'Expired') => void;
  onVerificationChange?: (opportunityId: string, verification: AdminVerificationStatus) => void;
  onToggleVerified?: (opportunityId: string, currentVerified: boolean) => void;
  onToggleFeatured?: (opportunityId: string, currentFeatured: boolean) => void;
}

export const OpportunityManagementTable: React.FC<OpportunityManagementTableProps> = ({
  opportunities,
  categories,
  onAddNew,
  onView,
  onEdit,
  onReview,
  onArchive,
  onDelete,
  onStatusChange,
  onVerificationChange,
  onToggleVerified,
  onToggleFeatured,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFeatured, setSelectedFeatured] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'archive';
    opportunityId: string;
    opportunityTitle: string;
  }>({
    isOpen: false,
    type: 'delete',
    opportunityId: '',
    opportunityTitle: '',
  });

  // Calculate effective status
  const getOpportunityStatus = (opp: Opportunity): 'Open' | 'Verifying' | 'Expired' => {
    if ((opp as any).status === 'Expired' || opp.publicationStatus === 'Expired' || opp.status === 'Closed') {
      return 'Expired';
    }
    if ((opp as any).status === 'Verifying' || opp.publicationStatus === 'Pending Review' || opp.status === 'Reviewing') {
      return 'Verifying';
    }
    if (opp.deadline) {
      const d = new Date(opp.deadline);
      if (!isNaN(d.getTime()) && d.getTime() < Date.now()) {
        return 'Expired';
      }
    }
    return 'Open';
  };

  // Filter logic
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Search by title or provider
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = opp.title?.toLowerCase().includes(q);
        const matchesOrg = opp.organization?.toLowerCase().includes(q) || (opp as any).provider?.toLowerCase().includes(q);
        const matchesTags = opp.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesOrg && !matchesTags) return false;
      }

      // Status: Open, Verifying, Expired
      if (selectedStatus !== 'all') {
        const effectiveStatus = getOpportunityStatus(opp);
        if (effectiveStatus !== selectedStatus) return false;
      }

      // Verification: Verified vs Unverified
      if (selectedVerification !== 'all') {
        const isVerified = Boolean(opp.verified);
        if (selectedVerification === 'verified' && !isVerified) return false;
        if (selectedVerification === 'unverified' && isVerified) return false;
      }

      // Featured
      if (selectedFeatured !== 'all') {
        const isFeatured = Boolean(opp.featured);
        if (selectedFeatured === 'featured' && !isFeatured) return false;
        if (selectedFeatured === 'standard' && isFeatured) return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        if (opp.category !== selectedCategory) return false;
      }

      // Funding Type
      if (selectedType !== 'all') {
        if (opp.type !== selectedType) return false;
      }

      return true;
    });
  }, [opportunities, searchQuery, selectedStatus, selectedVerification, selectedFeatured, selectedCategory, selectedType]);

  const handleConfirmAction = () => {
    if (confirmModal.type === 'delete') {
      onDelete(confirmModal.opportunityId);
    } else if (confirmModal.type === 'archive') {
      onArchive(confirmModal.opportunityId);
    }
    setConfirmModal({ isOpen: false, type: 'delete', opportunityId: '', opportunityTitle: '' });
  };

  const renderStatusBadge = (status: 'Open' | 'Verifying' | 'Expired') => {
    switch (status) {
      case 'Open':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Open
          </span>
        );
      case 'Verifying':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-500" />
            Verifying
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Expired
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Funding Opportunities Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authorized admin view. Managing {filteredOpportunities.length} of {opportunities.length} funding programs.
          </p>
        </div>

        <Button
          id="admin-add-opportunity-top-btn"
          variant="primary"
          size="sm"
          onClick={onAddNew}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add Opportunity
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input: title or provider */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="admin-table-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, provider, or keyword..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters: Status, Category, Funding Type, Featured, Verification */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
            <select
              id="admin-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Verifying">Verifying</option>
              <option value="Expired">Expired</option>
            </select>

            {/* Category Filter */}
            <select
              id="admin-filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[140px]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Funding Type Filter */}
            <select
              id="admin-filter-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[130px]"
            >
              <option value="all">All Types</option>
              <option value="Grant">Grant</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Fellowship">Fellowship</option>
              <option value="Competition">Competition</option>
              <option value="Prize">Prize</option>
              <option value="Mentorship">Mentorship</option>
              <option value="Accelerator">Accelerator</option>
              <option value="Incubator">Incubator</option>
            </select>

            {/* Featured Filter */}
            <select
              id="admin-filter-featured"
              value={selectedFeatured}
              onChange={(e) => setSelectedFeatured(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Visibility</option>
              <option value="featured">Featured Only</option>
              <option value="standard">Standard Only</option>
            </select>

            {/* Verification Filter */}
            <select
              id="admin-filter-verification"
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Opportunities Table (Desktop) / Cards (Mobile) */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No opportunities match your filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or clearing the selected status/category filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('all');
              setSelectedCategory('all');
              setSelectedType('all');
              setSelectedFeatured('all');
              setSelectedVerification('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-3.5 px-4">Opportunity & Provider</th>
                  <th className="py-3.5 px-3">Category / Type</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">Amount</th>
                  <th className="py-3.5 px-3">Deadline</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-center">Verified</th>
                  <th className="py-3.5 px-3 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOpportunities.map((opp) => {
                  const currentEffectiveStatus = getOpportunityStatus(opp);
                  const isVerified = Boolean(opp.verified);
                  const isFeatured = Boolean(opp.featured);

                  return (
                    <tr 
                      key={opp.id} 
                      id={`admin-opp-row-${opp.id}`}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Title & Provider */}
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <div className="space-y-0.5">
                          <div 
                            onClick={() => onView(opp)}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1 text-xs"
                            title={opp.title}
                          >
                            {opp.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {opp.organization}
                          </div>
                        </div>
                      </td>

                      {/* Category & Type */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">
                          {opp.type}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {opp.category}
                        </div>
                      </td>

                      {/* Location / Region */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {opp.location || opp.region || 'Global'}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {opp.amount?.displayText || '$50,000 USD'}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <DeadlineBadge deadline={opp.deadline} size="xs" />
                      </td>

                      {/* Status - with direct change selector */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <select
                            id={`admin-select-status-${opp.id}`}
                            value={currentEffectiveStatus}
                            onChange={(e) => onStatusChange(opp.id, e.target.value as any)}
                            className="text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="Open">Open</option>
                            <option value="Verifying">Verifying</option>
                            <option value="Expired">Expired</option>
                          </select>
                        </div>
                      </td>

                      {/* Verified - Separate Boolean with quick toggle button */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <button
                          type="button"
                          id={`admin-toggle-verified-${opp.id}`}
                          onClick={() => {
                            if (onToggleVerified) {
                              onToggleVerified(opp.id, isVerified);
                            }
                          }}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                            isVerified
                              ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/70'
                          }`}
                          title={`Click to mark as ${isVerified ? 'Unverified' : 'Verified'}`}
                        >
                          <ShieldCheck className={`w-3.5 h-3.5 ${isVerified ? 'text-sky-600' : 'text-slate-400'}`} />
                          <span>{isVerified ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>

                      {/* Featured - Separate Boolean with quick toggle button */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <button
                          type="button"
                          id={`admin-toggle-featured-${opp.id}`}
                          onClick={() => {
                            if (onToggleFeatured) {
                              onToggleFeatured(opp.id, isFeatured);
                            }
                          }}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                            isFeatured
                              ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/70'
                          }`}
                          title={`Click to ${isFeatured ? 'unfeature' : 'feature on homepage'}`}
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isFeatured ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                          <span>{isFeatured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            id={`admin-btn-view-${opp.id}`}
                            onClick={() => onView(opp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Inspect Opportunity"
                            aria-label="Inspect Opportunity"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            id={`admin-btn-edit-${opp.id}`}
                            onClick={() => onEdit(opp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Opportunity"
                            aria-label="Edit Opportunity"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            id={`admin-btn-delete-${opp.id}`}
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: 'delete',
                                opportunityId: opp.id,
                                opportunityTitle: opp.title,
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                            title="Delete Opportunity"
                            aria-label="Delete Opportunity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards List View */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800 p-4 space-y-4">
            {filteredOpportunities.map((opp) => {
              const currentEffectiveStatus = getOpportunityStatus(opp);
              const isVerified = Boolean(opp.verified);
              const isFeatured = Boolean(opp.featured);

              return (
                <div
                  key={opp.id}
                  id={`admin-card-${opp.id}`}
                  className="pt-4 first:pt-0 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderStatusBadge(currentEffectiveStatus)}
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          <ShieldCheck className="w-3 h-3 text-sky-600" />
                          Verified
                        </span>
                      )}
                      {isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          Featured
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      {opp.amount?.displayText || '$50,000 USD'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3
                      onClick={() => onView(opp)}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer"
                    >
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>{opp.organization}</span>
                      <span>•</span>
                      <span>{opp.type}</span>
                      <span>•</span>
                      <span>{opp.location || opp.region || 'Global'}</span>
                    </div>
                  </div>

                  {/* Mobile Quick Status Selector */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Status:</span>
                      <select
                        value={currentEffectiveStatus}
                        onChange={(e) => onStatusChange(opp.id, e.target.value as any)}
                        className="text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Open">Open</option>
                        <option value="Verifying">Verifying</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>

                    <DeadlineBadge deadline={opp.deadline} size="xs" />
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleVerified && onToggleVerified(opp.id, isVerified)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                          isVerified 
                            ? 'bg-sky-50 text-sky-700 border-sky-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {isVerified ? '✓ Verified' : '+ Verify'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleFeatured && onToggleFeatured(opp.id, isFeatured)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                          isFeatured 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {isFeatured ? '★ Featured' : '+ Feature'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onView(opp)}
                      >
                        View
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => onEdit(opp)}
                      >
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            type: 'delete',
                            opportunityId: opp.id,
                            opportunityTitle: opp.title,
                          })
                        }
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                        title="Delete Permanently"
                        aria-label="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Protected Permanent Delete Confirmation Dialog */}
      <AdminConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: 'delete', opportunityId: '', opportunityTitle: '' })}
        onConfirm={handleConfirmAction}
        title={confirmModal.type === 'delete' ? 'Permanently Delete Opportunity?' : 'Archive Opportunity?'}
        description={
          confirmModal.type === 'delete'
            ? `Are you sure you want to permanently delete "${confirmModal.opportunityTitle}" from the database? This operation cannot be reversed.\n\nNote: Expired opportunities do not need to be deleted—FundEcho preserves expired opportunities with status "Expired" for historical transparency and analytics.`
            : `Are you sure you want to archive "${confirmModal.opportunityTitle}"? It will no longer be visible on the public seeker directory.`
        }
        confirmLabel={confirmModal.type === 'delete' ? 'Delete Permanently' : 'Archive Opportunity'}
        variant={confirmModal.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
};

