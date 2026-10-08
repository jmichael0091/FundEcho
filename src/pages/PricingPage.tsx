import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowLeft, 
  Coins, 
  HelpCircle,
  Clock,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PageId } from '../types';
import { useMonetization } from '../context/MonetizationContext';
import { BillingCycle, SubscriptionPlan } from '../types/monetization';
import { SEOHead } from '../components/seo/SEOHead';
import { getSiteOrigin } from '../utils/seoUtils';

export interface PricingPageProps {
  onNavigate: (page: PageId) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { 
    plans,
    isPremium, 
    isAdmin,
    subscription, 
    activePlan,
    activateDemoSubscription, 
    cancelDemoSubscription,
    trackEvent 
  } = useMonetization();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/pricing`;

  const activePlans = plans.filter(p => p.status === 'active');
  const freePlan = activePlans.find(p => p.tier === 'free') || plans[0];
  const premiumPlans = activePlans.filter(p => p.tier !== 'free');

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    trackEvent('premium_cta_clicked', {
      source: 'pricing_page_card',
      selectedPlanId: plan.id,
      selectedTier: plan.tier,
      billingCycle
    });

    if (plan.tier === 'free') {
      cancelDemoSubscription();
      setSuccessToast('Switched to Free Tier (Demo).');
    } else {
      await activateDemoSubscription(plan.id, billingCycle);
      setSuccessToast(`Successfully activated ${plan.name} (${billingCycle}) in Demo Mode!`);
    }

    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <SEOHead
        metadata={{
          title: "FundEcho Premium Plans & Pricing | Grants & Funding Acceleration",
          description: "Choose the right plan for your funding journey. Free open directory discovery or FundEcho Premium with advanced AI proposal audits and deadline automation.",
          canonicalUrl: canonicalUrl,
          ogType: "website"
        }}
      />

      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-emerald-900 text-emerald-100 px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-extrabold">{successToast}</div>
              <div className="text-[10px] text-emerald-300 font-normal">
                Sandbox Mode &bull; No credit card or real money charged
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('opportunities')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </button>

          {/* Sandbox Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Sandbox Preview Mode &bull; Simulated Transactions</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Funding Intelligence &bull; Ethical Monetization</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Accelerate Your Funding Journey
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Core opportunity discovery and search are always completely free. Upgrade to Premium for accelerated AI proposal reviews, institutional funder playbooks, and generous monthly credit allowances.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800 flex items-center border border-slate-300/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-amber-950">
                  Save 35%+
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {/* FREE PLAN */}
          <div className={`rounded-3xl border p-7 flex flex-col justify-between transition-all relative ${
            !isPremium && !isAdmin
              ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50'
          }`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {freePlan.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Free community open directory access.
                  </p>
                </div>
                {!isPremium && !isAdmin && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    Current
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">$0</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">free forever</span>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Included Capabilities:
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {freePlan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={!isPremium}
                onClick={() => handleSelectPlan(freePlan)}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
                  !isPremium
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                    : 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200'
                }`}
              >
                {!isPremium ? 'Active Plan' : 'Downgrade to Free (Demo)'}
              </button>
            </div>
          </div>

          {/* PREMIUM PLANS FROM CONFIG */}
          {premiumPlans.map((plan) => {
            const isCurrentActive = isPremium && subscription.planId === plan.id;
            const monthlyEquivalent = billingCycle === 'annual'
              ? Math.round(plan.annualPriceUSD / 12)
              : plan.monthlyPriceUSD;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl border-2 p-7 flex flex-col justify-between transition-all relative ${
                  plan.isRecommended
                    ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-xl'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Top Badge */}
                {plan.isRecommended && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-indigo-600 text-white shadow-md">
                    Recommended
                  </span>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{plan.name}</span>
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {plan.description}
                      </p>
                    </div>
                    {isCurrentActive && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                      ${monthlyEquivalent}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      /month {billingCycle === 'annual' ? `(billed $${plan.annualPriceUSD}/yr)` : '(billed monthly)'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Includes {plan.includedCredits} monthly AI credits</span>
                    </div>

                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block pt-1">
                      Plan Capabilities:
                    </span>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {plan.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 font-bold" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 px-4 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                      isCurrentActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:scale-[1.02]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>{isCurrentActive ? 'Active Plan' : `Activate ${plan.name} (Demo)`}</span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Instant demo upgrade &bull; Cancel anytime</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alternative: On-Demand Credits Banner */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
              <Coins className="w-3.5 h-3.5" />
              <span>Prefer Not to Subscribe?</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Pay As You Go with AI Credits
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Purchase credit packages on demand to power single proposal reviews, AI rewriting, and institutional matching whenever you need them. Credits never expire.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('credits')}
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all shrink-0 hover:scale-[1.02]"
          >
            <Coins className="w-4 h-4" />
            <span>Explore Credit Packages</span>
          </button>
        </div>

        {/* FundEcho Neutrality & Monetization Code of Ethics */}
        <div className="max-w-4xl mx-auto p-6 sm:p-7 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              FundEcho Monetization Ethics & Applicant Rights
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">
                1. Equal Opportunity Access
              </strong>
              <p>
                Core opportunity discovery and search are always free. Public opportunities are never hidden behind paywalls.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">
                2. No Pay-To-Win Matching
              </strong>
              <p>
                Subscribing does not bias eligibility algorithms, alter match scoring, or guarantee grant awards.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">
                3. Clear Sponsorship Transparency
              </strong>
              <p>
                Any sponsored placement is explicitly labeled. Paid status never grants automatic verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
