import React, { useState } from 'react';
import { 
  DollarSign, 
  Coins, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Archive, 
  Check, 
  X, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  TrendingUp, 
  Activity,
  History,
  FileText
} from 'lucide-react';
import { useMonetization } from '../../../context/MonetizationContext';
import { 
  SubscriptionPlan, 
  CreditPackage, 
  FeatureCreditCost,
  SubscriptionTier,
  PlanUsageLimits 
} from '../../../types/monetization';
import { SubscriptionService } from '../../../services/subscriptionService';
import { CreditService } from '../../../services/creditService';

export const AdminMonetizationSection: React.FC = () => {
  const {
    plans,
    packages,
    featureCosts,
    transactions,
    refreshMonetizationConfig
  } = useMonetization();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'plans' | 'packages' | 'feature_costs' | 'audit'>('overview');

  // Plan Edit Modal State
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editingPlanData, setEditingPlanData] = useState<SubscriptionPlan | null>(null);

  // Package Edit Modal State
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [editingPackageData, setEditingPackageData] = useState<CreditPackage | null>(null);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Metrics for Overview (Local/Demo state - clearly stated)
  const totalCreditsIssued = transactions
    .filter(t => t.type === 'purchase' || t.type === 'bonus')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCreditsConsumed = transactions
    .filter(t => t.type === 'usage')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Plan Handlers
  const handleOpenNewPlan = () => {
    const newPlan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      name: 'New Custom Plan',
      description: 'Configurable tier for specialized institutions or cohorts.',
      tier: 'premium',
      monthlyPriceUSD: 29,
      annualPriceUSD: 228,
      annualDiscountPercent: 35,
      includedCredits: 200,
      status: 'active',
      isRecommended: false,
      featurePermissions: {
        basic_search: true,
        basic_matching: true,
        save_opportunities: true,
        basic_eligibility_check: true,
        advanced_opportunity_matching: true,
        ai_proposal_assistant: true,
        ai_grant_scorer: true,
        advanced_milestone_planner: true,
        batch_calendar_export: true,
        deep_funder_intelligence: true,
        reduced_advertising: true,
        priority_support: true
      },
      usageLimits: {
        savedOpportunitiesLimit: -1,
        activeWorkspaceDraftsLimit: -1,
        monthlyAiAssistsLimit: 150,
        monthlyEligibilityChecksLimit: -1,
        exportCalendarLimit: -1
      },
      benefits: [
        'Unlimited saved opportunities',
        'Advanced semantic AI matching',
        '150 monthly AI proposal audits',
        'Priority applicant support'
      ]
    };
    setEditingPlanData(newPlan);
    setIsEditingPlan(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlanData(JSON.parse(JSON.stringify(plan)));
    setIsEditingPlan(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlanData) return;

    SubscriptionService.savePlan(editingPlanData);
    refreshMonetizationConfig();
    setIsEditingPlan(false);
    setEditingPlanData(null);
    showToast(`Subscription plan "${editingPlanData.name}" saved successfully.`);
  };

  const handleArchivePlan = (planId: string) => {
    SubscriptionService.archivePlan(planId);
    refreshMonetizationConfig();
    showToast('Plan status changed to Archived.');
  };

  const handleDeletePlan = (planId: string) => {
    SubscriptionService.deletePlan(planId);
    refreshMonetizationConfig();
    showToast('Plan removed from catalog.');
  };

  // Package Handlers
  const handleOpenNewPackage = () => {
    const newPkg: CreditPackage = {
      id: `pkg-${Date.now()}`,
      name: 'Custom Pack',
      credits: 250,
      bonusCredits: 25,
      priceUSD: 19,
      currency: 'USD',
      status: 'active',
      displayPriority: packages.length + 1,
      description: 'Special on-demand allocation.',
      features: ['275 total AI credits', 'Never expire', 'Instant activation']
    };
    setEditingPackageData(newPkg);
    setIsEditingPackage(true);
  };

  const handleEditPackage = (pkg: CreditPackage) => {
    setEditingPackageData(JSON.parse(JSON.stringify(pkg)));
    setIsEditingPackage(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackageData) return;

    SubscriptionService.savePackage(editingPackageData);
    refreshMonetizationConfig();
    setIsEditingPackage(false);
    setEditingPackageData(null);
    showToast(`Credit package "${editingPackageData.name}" saved successfully.`);
  };

  const handleDeletePackage = (pkgId: string) => {
    SubscriptionService.deletePackage(pkgId);
    refreshMonetizationConfig();
    showToast('Credit package removed.');
  };

  // Feature Cost Update
  const handleUpdateCost = (costItem: FeatureCreditCost, newCost: number) => {
    const updated = { ...costItem, creditCost: Math.max(1, newCost) };
    SubscriptionService.saveFeatureCost(updated);
    refreshMonetizationConfig();
    showToast(`Updated "${costItem.name}" to ${newCost} credits.`);
  };

  const handleToggleFeatureEnabled = (costItem: FeatureCreditCost) => {
    const updated = { ...costItem, enabled: !costItem.enabled };
    SubscriptionService.saveFeatureCost(updated);
    refreshMonetizationConfig();
    showToast(`Toggled "${costItem.name}" to ${updated.enabled ? 'Enabled' : 'Disabled'}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Monetization & Plans Control (Step 17)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscription & Credit Monetization Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure subscription tiers, credit packages, feature credit costs, and usage limits without modifying code.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('plans')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'plans'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Subscription Plans ({plans.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('packages')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'packages'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Credit Packages ({packages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('feature_costs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'feature_costs'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Feature Costs ({featureCosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Credit Audit
          </button>
        </div>
      </div>

      {/* SUBTAB 1: MONETIZATION OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Active Premium Users
              </span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                1
              </div>
              <span className="text-[11px] text-slate-500">
                1 active subscriber
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Active Plans Configured
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {plans.filter(p => p.status === 'active').length}
              </div>
              <span className="text-[11px] text-slate-500">
                {plans.length} total registered
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Credits Issued
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {totalCreditsIssued}
              </div>
              <span className="text-[11px] text-slate-500">
                Welcome & package bonuses
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Credits Consumed
              </span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {totalCreditsConsumed}
              </div>
              <span className="text-[11px] text-slate-500">
                AI proposal operations
              </span>
            </div>
          </div>

          {/* Popular Premium Features Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Premium AI Features & Dynamic Pricing
              </h3>
              <button
                type="button"
                onClick={() => setActiveSubTab('feature_costs')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Adjust Credit Costs &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {featureCosts.map((feat) => (
                <div key={feat.key} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {feat.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 capitalize">
                      {feat.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                      {feat.creditCost}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Credits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SUBSCRIPTION PLANS MANAGEMENT */}
      {activeSubTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Configured Subscription Plans
              </h3>
              <p className="text-xs text-slate-500">
                Frontend components render pricing, credit allocations, and usage limits directly from these plans.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewPlan}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
                  plan.isRecommended
                    ? 'border-indigo-500 bg-white dark:bg-slate-900 shadow-md shadow-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      plan.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }`}>
                      {plan.status}
                    </span>
                    {plan.isRecommended && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                      Tier: {plan.tier}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing Overview */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly Price:</span>
                      <strong className="text-slate-900 dark:text-white">${plan.monthlyPriceUSD} / mo</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Annual Price:</span>
                      <strong className="text-slate-900 dark:text-white">${plan.annualPriceUSD} / yr</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Included Credits:</span>
                      <strong className="text-amber-600 dark:text-amber-400">{plan.includedCredits} Credits</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly AI Assists:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {plan.usageLimits.monthlyAiAssistsLimit === -1 ? 'Unlimited' : plan.usageLimits.monthlyAiAssistsLimit}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Plan Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>

                  {plan.tier !== 'free' && (
                    <button
                      type="button"
                      onClick={() => handleArchivePlan(plan.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      title="Archive Plan"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  {plan.tier !== 'free' && plans.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CREDIT PACKAGES MANAGEMENT */}
      {activeSubTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Admin Credit Packages
              </h3>
              <p className="text-xs text-slate-500">
                Control the credit quantities, bonus allocations, and package pricing presented to applicants.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewPackage}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                      Priority: {pkg.displayPriority}
                    </span>
                    {pkg.popular && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                        Popular Badge
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {pkg.name} Package
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Credits:</span>
                      <strong className="text-slate-900 dark:text-white">{pkg.credits}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bonus Credits:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">+{pkg.bonusCredits || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Price:</span>
                      <strong className="text-slate-900 dark:text-white">${pkg.priceUSD} {pkg.currency}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Credits:</span>
                      <strong className="text-amber-600 dark:text-amber-400">
                        {pkg.credits + (pkg.bonusCredits || 0)} Credits
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditPackage(pkg)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Package</span>
                  </button>

                  {packages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: FEATURE CREDIT COSTS MANAGEMENT */}
      {activeSubTab === 'feature_costs' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Admin-Controlled Feature Credit Costs
            </h3>
            <p className="text-xs text-slate-500">
              Set the exact credit deductions for every AI or high-compute action across the workspace.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="pb-3 pr-4">Feature Name & Category</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Cost (Credits)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {featureCosts.map((feat) => (
                  <tr key={feat.key} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3.5 pr-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {feat.name}
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {feat.category}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-500 max-w-xs">
                      {feat.description}
                    </td>
                    <td className="py-3.5 pr-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatureEnabled(feat)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all ${
                          feat.enabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {feat.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={feat.creditCost}
                          onChange={(e) => handleUpdateCost(feat, parseInt(e.target.value) || 1)}
                          className="w-16 p-1.5 text-right font-black text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs"
                        />
                        <span className="text-slate-400 text-xs font-bold">Credits</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 5: AUDIT LOG */}
      {activeSubTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Platform Credit Transaction Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Permanent ledger recording additions, deducts, adjustments, and refunds.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total Recorded: {transactions.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="pb-3 pr-4">Timestamp</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                      {tx.description}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {tx.userId}
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
        </div>
      )}

      {/* PLAN EDIT MODAL */}
      {isEditingPlan && editingPlanData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 sm:p-7 my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Edit Subscription Plan
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingPlan(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlanData.name}
                    onChange={(e) => setEditingPlanData({ ...editingPlanData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tier Classification</label>
                  <select
                    value={editingPlanData.tier}
                    onChange={(e) => setEditingPlanData({ ...editingPlanData, tier: e.target.value as SubscriptionTier })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="free">Free Tier</option>
                    <option value="premium">Premium Tier</option>
                    <option value="admin">Admin Tier</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={editingPlanData.description}
                  onChange={(e) => setEditingPlanData({ ...editingPlanData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Monthly ($)</label>
                  <input
                    type="number"
                    value={editingPlanData.monthlyPriceUSD}
                    onChange={(e) => setEditingPlanData({ ...editingPlanData, monthlyPriceUSD: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Annual ($)</label>
                  <input
                    type="number"
                    value={editingPlanData.annualPriceUSD}
                    onChange={(e) => setEditingPlanData({ ...editingPlanData, annualPriceUSD: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Included Credits</label>
                  <input
                    type="number"
                    value={editingPlanData.includedCredits}
                    onChange={(e) => setEditingPlanData({ ...editingPlanData, includedCredits: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Usage Limits Configuration */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-black text-slate-900 dark:text-white block">
                  Usage Limits (-1 represents Unlimited)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-bold block">Monthly AI Assists</label>
                    <input
                      type="number"
                      value={editingPlanData.usageLimits.monthlyAiAssistsLimit}
                      onChange={(e) => setEditingPlanData({
                        ...editingPlanData,
                        usageLimits: {
                          ...editingPlanData.usageLimits,
                          monthlyAiAssistsLimit: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-bold block">Saved Opportunities Limit</label>
                    <input
                      type="number"
                      value={editingPlanData.usageLimits.savedOpportunitiesLimit}
                      onChange={(e) => setEditingPlanData({
                        ...editingPlanData,
                        usageLimits: {
                          ...editingPlanData.usageLimits,
                          savedOpportunitiesLimit: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlanData.isRecommended}
                    onChange={(e) => setEditingPlanData({ ...editingPlanData, isRecommended: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-bold">Mark as Recommended Plan</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingPlan(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PACKAGE EDIT MODAL */}
      {isEditingPackage && editingPackageData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 sm:p-7 my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Edit Credit Package
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingPackage(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Package Name</label>
                <input
                  type="text"
                  required
                  value={editingPackageData.name}
                  onChange={(e) => setEditingPackageData({ ...editingPackageData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Base Credits</label>
                  <input
                    type="number"
                    required
                    value={editingPackageData.credits}
                    onChange={(e) => setEditingPackageData({ ...editingPackageData, credits: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Bonus Credits</label>
                  <input
                    type="number"
                    value={editingPackageData.bonusCredits || 0}
                    onChange={(e) => setEditingPackageData({ ...editingPackageData, bonusCredits: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={editingPackageData.priceUSD}
                    onChange={(e) => setEditingPackageData({ ...editingPackageData, priceUSD: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Display Priority</label>
                  <input
                    type="number"
                    value={editingPackageData.displayPriority}
                    onChange={(e) => setEditingPackageData({ ...editingPackageData, displayPriority: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={editingPackageData.description}
                  onChange={(e) => setEditingPackageData({ ...editingPackageData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPackageData.popular}
                    onChange={(e) => setEditingPackageData({ ...editingPackageData, popular: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold">Highlight as Popular</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingPackage(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
