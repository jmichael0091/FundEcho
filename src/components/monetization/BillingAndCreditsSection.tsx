import React, { useState } from 'react';
import { 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowUpRight, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  Calendar, 
  FileText, 
  Bookmark, 
  Zap,
  Sliders,
  History,
  Info
} from 'lucide-react';
import { useMonetization } from '../../context/MonetizationContext';
import { UserProfile, PageId } from '../../types';

export interface BillingAndCreditsSectionProps {
  user: UserProfile | null;
  onNavigate: (page: PageId) => void;
}

export const BillingAndCreditsSection: React.FC<BillingAndCreditsSectionProps> = ({
  user,
  onNavigate
}) => {
  const {
    subscription,
    wallet,
    credits,
    isPremium,
    isAdmin,
    tier,
    status,
    activePlan,
    plans,
    transactions,
    activateDemoSubscription,
    cancelDemoSubscription,
    expireDemoSubscription,
    restoreDemoSubscription,
    toggleAdminDemoTier,
    openUpgradeModal,
    openCreditModal,
    getAllUsageRecords
  } = useMonetization();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'dev_controls'>('overview');
  const usageRecords = getAllUsageRecords();

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Subscription
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            Cancelled (Active until expiry)
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            Expired
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" />
            Pending Verification
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Free Plan
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Section Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Monetization & Credits Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Billing & Credit Wallet
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your subscription tier, track monthly AI usage allowances, and monitor on-demand credit transactions.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dev_controls')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'dev_controls'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Demo Controls</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Main 2-Column Grid: Current Plan & Credit Wallet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD 1: CURRENT PLAN */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Current Subscription
                  </span>
                  {getStatusBadge()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {activePlan.name}
                    </h3>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white uppercase tracking-wider">
                        Super Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {activePlan.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>Billing Cycle:</span>
                    <strong className="text-slate-900 dark:text-white capitalize">
                      {subscription.billingCycle || 'N/A (Free)'}
                    </strong>
                  </div>

                  {subscription.renewalDate && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span>Renewal / Expiration:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {subscription.renewalDate}
                      </strong>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>Monthly AI Allowance:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {activePlan.usageLimits.monthlyAiAssistsLimit === -1 ? 'Unlimited' : `${activePlan.usageLimits.monthlyAiAssistsLimit} assists`}
                    </strong>
                  </div>
                </div>

                {/* Plan Benefits Checklist */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Plan Highlights
                  </span>
                  {activePlan.benefits.slice(0, 3).map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2.5">
                {!isPremium ? (
                  <button
                    type="button"
                    onClick={() => openUpgradeModal()}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Upgrade to Premium</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={cancelDemoSubscription}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition-all"
                  >
                    <span>Cancel Auto-Renew</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition-all"
                >
                  <span>Compare Plans</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CARD 2: CREDIT WALLET */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Application Credits Wallet
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    Never Expire
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 dark:border-amber-700/60 space-y-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    Available Balance
                  </span>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                      {wallet.balance}
                    </span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Credits
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    Used for on-demand AI proposal generation, writing refinement, and eligibility analysis.
                  </p>
                </div>

                {/* Lifetime Metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      Lifetime Earned
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {wallet.lifetimeEarned} Credits
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-0.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      Lifetime Consumed
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {wallet.lifetimeUsed} Credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={openCreditModal}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all"
                >
                  <Coins className="w-4 h-4" />
                  <span>Purchase Credits</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('credits')}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition-all"
                >
                  <span>Rates & Packages</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* MONTHLY USAGE LIMITS SECTION */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Current Monthly Feature Allowances
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Usage caps reset automatically on the 1st of every calendar month.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Period: Current Month
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Meter 1: AI Assists */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Workspace Assists</span>
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {activePlan.usageLimits.monthlyAiAssistsLimit === -1
                      ? 'Unlimited'
                      : `${activePlan.usageLimits.monthlyAiAssistsLimit} / month`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: isPremium ? '15%' : '40%' }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {isPremium ? '15 of 100 used' : '2 of 5 free assists used'}
                </p>
              </div>

              {/* Meter 2: Saved Opportunities */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                    <span>Saved Opportunities</span>
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {activePlan.usageLimits.savedOpportunitiesLimit === -1
                      ? 'Unlimited'
                      : `${activePlan.usageLimits.savedOpportunitiesLimit} max`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: isPremium ? '8%' : '60%' }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {isPremium ? 'Unlimited bookmarks active' : '3 of 5 saved slots filled'}
                </p>
              </div>

              {/* Meter 3: Workspace Drafts */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Drafts</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {activePlan.usageLimits.activeWorkspaceDraftsLimit === -1
                      ? 'Unlimited'
                      : `${activePlan.usageLimits.activeWorkspaceDraftsLimit} max`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: isPremium ? '25%' : '100%' }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {isPremium ? 'Unlimited concurrent drafts' : '1 of 1 active draft in use'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL / TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Credit Wallet Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every credit allocation, on-demand deduction, and bonus is recorded for audit accountability.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total Recorded: {transactions.length}
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No credit transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="pb-3 pr-4">Timestamp</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="text-slate-700 dark:text-slate-300">
                      <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          tx.type === 'purchase'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : tx.type === 'bonus'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                            : tx.type === 'usage'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                        {tx.description}
                      </td>
                      <td className={`py-3 text-right font-black ${
                        tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEMO CONTROLS (DEVELOPMENT / TEST SIMULATION) */}
      {activeTab === 'dev_controls' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/80 dark:border-amber-800 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-400">
              <Sliders className="w-4 h-4" />
              <span>Sandbox Subscription & Role Simulation</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Instant State Toggles for Development & QA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Quickly simulate how FundEcho behaves under different subscription states without needing real payment credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Toggle 1: Activate Premium */}
            <button
              type="button"
              onClick={() => activateDemoSubscription('plan-premium', 'annual')}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-left hover:border-indigo-500 transition-all space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Activate Premium</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Sets tier to Premium and status to Active.
              </p>
            </button>

            {/* Toggle 2: Expire Premium */}
            <button
              type="button"
              onClick={expireDemoSubscription}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-left hover:border-rose-500 transition-all space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
                <XCircle className="w-3.5 h-3.5" />
                <span>Expire Subscription</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Simulates expiration date passed; locks gated features.
              </p>
            </button>

            {/* Toggle 3: Cancel Subscription */}
            <button
              type="button"
              onClick={cancelDemoSubscription}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-left hover:border-amber-500 transition-all space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Cancel Subscription</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Disables auto-renewal but retains access.
              </p>
            </button>

            {/* Toggle 4: Admin Access Tier */}
            <button
              type="button"
              onClick={toggleAdminDemoTier}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-left hover:border-purple-500 transition-all space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Exit Admin Tier' : 'Enable Admin Tier'}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Grants completely unrestricted access across the platform.
              </p>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-850/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <span>Current simulated state: <strong>{tier.toUpperCase()} ({status})</strong></span>
            <button
              type="button"
              onClick={restoreDemoSubscription}
              className="underline text-xs font-bold hover:text-amber-700"
            >
              Reset to Clean Free State
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
