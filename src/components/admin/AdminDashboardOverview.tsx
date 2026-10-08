import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Clock, 
  AlertCircle, 
  Users, 
  PlusCircle, 
  Sliders, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  FileText,
  Archive,
  Edit3,
  Globe
} from 'lucide-react';
import { AdminStats, AdminTabId } from '../../types/admin';
import { Opportunity } from '../../types';
import { Button } from '../ui/Button';
import { FirebaseFoundationCard } from './FirebaseFoundationCard';

export interface AdminDashboardOverviewProps {
  stats: AdminStats;
  recentOpportunities: Opportunity[];
  pendingReviewList: Opportunity[];
  onSelectTab: (tab: AdminTabId) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onEditOpportunity: (opp: Opportunity) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  stats,
  recentOpportunities,
  pendingReviewList,
  onSelectTab,
  onSelectOpportunity,
  onEditOpportunity,
}) => {
  const statCards = [
    {
      id: 'total',
      label: 'Total Opportunities',
      value: stats.totalOpportunities,
      subtitle: `${stats.verifiedOpportunities || 0} verified programs`,
      icon: Layers,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      action: () => onSelectTab('opportunities'),
    },
    {
      id: 'open',
      label: 'Open Opportunities',
      value: stats.openOpportunities ?? stats.activeOpportunities,
      subtitle: 'Accepting applications',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      action: () => onSelectTab('opportunities'),
    },
    {
      id: 'verifying',
      label: 'Verifying Opportunities',
      value: stats.verifyingOpportunities ?? stats.pendingReviewOpportunities,
      subtitle: (stats.verifyingOpportunities ?? stats.pendingReviewOpportunities) === 1 ? '1 awaiting audit' : `${stats.verifyingOpportunities ?? stats.pendingReviewOpportunities} in review queue`,
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      action: () => onSelectTab('review-queue'),
      isUrgent: (stats.verifyingOpportunities ?? stats.pendingReviewOpportunities) > 0,
    },
    {
      id: 'expired',
      label: 'Expired Opportunities',
      value: stats.expiredOpportunities,
      subtitle: 'Deadline passed / preserved',
      icon: Archive,
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      action: () => onSelectTab('opportunities'),
    },
    {
      id: 'featured',
      label: 'Featured Opportunities',
      value: stats.featuredOpportunities ?? 0,
      subtitle: 'Promoted on portal',
      icon: Sparkles,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
      action: () => onSelectTab('opportunities'),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner / Quick Action CTA Hub */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
              Administrative Control
            </span>
            <span className="text-xs text-slate-400">• Real Application Data</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Funding Directory Management & Moderation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Publish vetted grants, approve submitted opportunities, maintain eligibility criteria taxonomy, and oversee user registries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap">
          <Button
            id="admin-quick-pipeline-btn"
            variant="secondary"
            size="sm"
            onClick={() => onSelectTab('pipeline')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 shadow-xs"
          >
            Opportunity Pipeline
          </Button>
          <Button
            id="admin-quick-sources-btn"
            variant="outline"
            size="sm"
            onClick={() => onSelectTab('sources')}
            leftIcon={<Globe className="w-4 h-4" />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Source Registry
          </Button>
          <Button
            id="admin-quick-add-btn"
            variant="primary"
            size="sm"
            onClick={() => onSelectTab('add-opportunity')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Opportunity
          </Button>
          <Button
            id="admin-quick-review-btn"
            variant="outline"
            size="sm"
            onClick={() => onSelectTab('review-queue')}
            leftIcon={<Clock className="w-4 h-4" />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Review Queue ({stats.pendingReviewOpportunities})
          </Button>
        </div>
      </div>

      {/* 5 Simple Core Platform Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={`admin-stat-${card.id}`}
              onClick={card.action}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${
                card.isUrgent
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`p-2 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {card.value}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                <span className="truncate">{card.subtitle}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Moderation Queue Alert & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Moderation Queue Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pending Review Queue
                </h3>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                {pendingReviewList.length} Items
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Opportunities submitted by editors or partners that require verification and publication approval.
            </p>

            {pendingReviewList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                No opportunities pending moderation.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingReviewList.slice(0, 3).map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => onSelectTab('review-queue')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                        {opp.organization}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {opp.type}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {opp.title}
                    </h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onSelectTab('review-queue')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Open Review Queue
          </Button>
        </div>

        {/* Directory Overview & Quick Moderation List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recently Updated Opportunities
              </h3>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => onSelectTab('opportunities')}
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              View all ({stats.totalOpportunities})
            </Button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentOpportunities.slice(0, 6).map((opp) => {
              const displayStatus = opp.status === 'Closed' ? 'Expired' : opp.status === 'Reviewing' ? 'Verifying' : 'Open';
              return (
                <div
                  key={opp.id}
                  className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {/* Step 20 Status Badge */}
                      <span 
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          displayStatus === 'Open'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : displayStatus === 'Verifying'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {displayStatus}
                      </span>

                      {/* Verified Badge */}
                      {opp.verified && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      )}

                      {/* Featured Badge */}
                      {opp.featured && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Featured</span>
                        </span>
                      )}

                      <span className="text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[140px]">
                        {opp.organization}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {opp.amount.displayText}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden sm:inline">
                        Deadline: {opp.deadline}
                      </span>
                    </div>

                    <h4 
                      onClick={() => onSelectOpportunity(opp)}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1"
                    >
                      {opp.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onSelectOpportunity(opp)}
                    >
                      View
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => onEditOpportunity(opp)}
                      leftIcon={<Edit3 className="w-3 h-3" />}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Firebase Backend & Database Infrastructure Foundation (Step 17) */}
      <FirebaseFoundationCard />
    </div>
  );
};
