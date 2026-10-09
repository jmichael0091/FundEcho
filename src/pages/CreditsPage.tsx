import React, { useState } from 'react';
import { 
  Coins, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  Zap, 
  HelpCircle,
  Clock,
  Plus,
  RefreshCw,
  FileCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { PageId } from '../types';
import { useMonetization } from '../context/MonetizationContext';
import { CreditPackage } from '../types/monetization';
import { SEOHead } from '../components/seo/SEOHead';
import { getSiteOrigin } from '../utils/seoUtils';

export interface CreditsPageProps {
  onNavigate: (page: PageId) => void;
}

export const CreditsPage: React.FC<CreditsPageProps> = ({ onNavigate }) => {
  const { 
    wallet, 
    credits, 
    packages, 
    featureCosts, 
    addDemoCredits, 
    isPremium, 
    trackEvent 
  } = useMonetization();

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}/credits`;

  const [selectedPack, setSelectedPack] = useState<CreditPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectAndPurchase = async (pkg: CreditPackage) => {
    trackEvent('credit_package_selected', { packId: pkg.id, source: 'credits_page' });
    setSelectedPack(pkg);
    setIsProcessing(true);

    const total = pkg.credits + (pkg.bonusCredits || 0);

    try {
      await addDemoCredits(pkg.id);
      setSuccessMessage(`Added ${total} credits to your wallet!`);
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedPack(null);
      }, 5000);
    } catch {
      // Handled
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <SEOHead
        metadata={{
          title: "FundEcho Credits Center | Flexible On-Demand AI Resources",
          description: "Power your grant and proposal drafting with on-demand FundEcho credits. Starter, Growth, and Pro credit packages with zero recurring commitment.",
          canonicalUrl: canonicalUrl,
          ogType: "website"
        }}
      />

      {/* Success Notification Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-extrabold">{successMessage}</div>
              <div className="text-[10px] text-slate-400 font-normal">
                Updated Balance: {wallet.balance} Credits
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('opportunities')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Instant Credit Balance Sync</span>
          </div>
        </div>

        {/* Hero Section with Current Balance Display */}
        <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-linear-to-b from-amber-50/60 via-white to-amber-50/20 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/10 p-8 sm:p-10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold">
              <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>FundEcho Credit Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              On-Demand Application Credits
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Use credits for heavy-compute AI operations — like section-by-section proposal audits, rubric scoring, and semantic grant matching — with complete freedom and no recurring monthly commitment.
            </p>

            {isPremium && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>FundEcho Premium Active:</strong> You receive monthly included AI assists as well.
                </span>
              </div>
            )}
          </div>

          {/* Prominent Balance Display Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border-2 border-amber-300/80 dark:border-amber-700/60 shadow-lg text-center space-y-2 shrink-0 min-w-[220px]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Available Balance
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl sm:text-5xl font-black text-amber-600 dark:text-amber-400">
                {wallet.balance}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Credits: {wallet.balance}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Lifetime Earned: {wallet.lifetimeEarned} &bull; Spent: {wallet.lifetimeUsed}
            </p>
          </div>
        </div>

        {/* Dynamic Credit Packages Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Choose a Credit Package
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-time purchase. No monthly recurring fees. Credits never expire and remain attached to your account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {packages.map((pkg) => {
              const totalCredits = pkg.credits + (pkg.bonusCredits || 0);
              const isCurrentProcessing = isProcessing && selectedPack?.id === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`rounded-3xl border p-7 flex flex-col justify-between transition-all relative ${
                    pkg.popular
                      ? 'border-indigo-500 bg-white dark:bg-slate-900 shadow-xl'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-indigo-600 text-white shadow-md">
                      Best Value
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {pkg.name}
                      </h3>
                      {pkg.perCreditRate && (
                        <span className="text-xs font-semibold text-slate-400">
                          {pkg.perCreditRate}/credit
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">
                          {totalCredits}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Credits
                        </span>
                      </div>
                      {pkg.bonusCredits && pkg.bonusCredits > 0 ? (
                        <span className="inline-block mt-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
                          +{pkg.bonusCredits} Bonus Credits Included
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Price (USD):</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {pkg.priceFormatted || `$${pkg.priceUSD}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleSelectAndPurchase(pkg)}
                      className={`w-full py-3 px-4 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                        pkg.popular
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      }`}
                    >
                      {isCurrentProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          <span>Purchase {pkg.name} Package</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Feature Credit Cost Reference Table */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                How Credits Are Used
              </h3>
              <p className="text-xs text-slate-500">
                Transparent and predictable pricing per AI operation across your workspace.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Admin Configured
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Scope</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 text-right">Credit Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {featureCosts.filter(f => f.enabled).map((feat) => (
                  <tr key={feat.key} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">
                      {feat.name}
                    </td>
                    <td className="py-3 pr-4 capitalize text-indigo-600 dark:text-indigo-400 font-medium">
                      {feat.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {feat.description}
                    </td>
                    <td className="py-3 text-right font-black text-amber-600 dark:text-amber-400">
                      {feat.creditCost} Credits
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade to Premium Banner */}
        <div className="p-6 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Applying to grants frequently?</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              A recurring FundEcho Premium subscription includes generous monthly credits, unlimited saved opportunities, and milestone tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('pricing')}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shrink-0 transition-all"
          >
            <span>View Premium Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
