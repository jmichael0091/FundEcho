import React from 'react';
import { Sparkles, Lock, Coins, ArrowRight, ShieldCheck } from 'lucide-react';
import { useMonetization } from '../../context/MonetizationContext';

export interface FeatureGateProps {
  featureKey: string;
  title?: string;
  description?: string;
  requiredCredits?: number;
  mode?: 'card' | 'inline' | 'banner';
  children: React.ReactNode;
  onNavigateToPricing?: () => void;
  onNavigateToCredits?: () => void;
}

/**
 * Reusable FeatureGate Component (Step 17)
 * Conditionally renders children if allowed, or displays a clean, elegant upgrade card
 * without breaking the page or showing unstyled broken layouts.
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  title,
  description,
  requiredCredits,
  mode = 'card',
  children,
  onNavigateToPricing,
  onNavigateToCredits
}) => {
  const { 
    checkFeatureAccess, 
    isPremium, 
    isAdmin, 
    credits, 
    useCredits, 
    openUpgradeModal, 
    openCreditModal 
  } = useMonetization();

  const access = checkFeatureAccess(featureKey);

  // If user has access, render children
  if (access.hasAccess) {
    return <>{children}</>;
  }

  const heading = title || access.rule.name || 'Premium Feature';
  const desc = description || access.rule.description || 'Unlock advanced application assistance with FundEcho Premium.';
  const cost = requiredCredits || access.requiredCredits || 5;
  const canAffordWithCredits = credits.balance >= cost;

  const handleUseCredits = () => {
    useCredits(cost, heading);
  };

  const handleViewPremium = () => {
    if (onNavigateToPricing) {
      onNavigateToPricing();
    } else {
      openUpgradeModal(featureKey, heading, desc);
    }
  };

  const handleGetCredits = () => {
    if (onNavigateToCredits) {
      onNavigateToCredits();
    } else {
      openCreditModal();
    }
  };

  if (mode === 'inline' || mode === 'banner') {
    return (
      <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{heading}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                PRO
              </span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              {desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canAffordWithCredits ? (
            <button
              type="button"
              onClick={handleUseCredits}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Use {cost} Credits</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGetCredits}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition-all"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Get Credits</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleViewPremium}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Premium</span>
          </button>
        </div>
      </div>
    );
  }

  // Default 'card' mode
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-b from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mx-auto">
        <Lock className="w-6 h-6" />
      </div>

      <div className="max-w-md mx-auto space-y-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Premium Feature
        </span>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          {heading}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleViewPremium}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>View Premium</span>
        </button>

        {canAffordWithCredits ? (
          <button
            type="button"
            onClick={handleUseCredits}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            <Coins className="w-4 h-4" />
            <span>Use {cost} Credits (Bal: {credits.balance})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGetCredits}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 font-bold text-xs transition-all"
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Get Credits ({credits.balance} available)</span>
          </button>
        )}
      </div>

      <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-medium pt-1">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>FundEcho Premium &bull; Intelligent Funding Tools</span>
      </div>
    </div>
  );
};
