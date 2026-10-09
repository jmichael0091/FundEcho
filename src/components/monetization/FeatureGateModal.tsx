import React from 'react';
import { 
  X, 
  Sparkles, 
  Lock, 
  Check, 
  Coins, 
  ArrowRight, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { useMonetization } from '../../context/MonetizationContext';

export interface FeatureGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToCredits?: () => void;
}

export const FeatureGateModal: React.FC<FeatureGateModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPricing,
  onNavigateToCredits
}) => {
  const { 
    gatedFeatureDetails, 
    credits, 
    activateDemoSubscription, 
    useCredits,
    openCreditModal,
    trackEvent
  } = useMonetization();

  if (!isOpen) return null;

  const title = gatedFeatureDetails?.title || 'Unlock Advanced Capability';
  const description = gatedFeatureDetails?.description || 'Upgrade to FundEcho Premium or use credits to continue.';
  const requiredCredits = gatedFeatureDetails?.requiredCredits || 3;
  const hasEnoughCredits = credits.balance >= requiredCredits;

  const handleUseCredits = () => {
    const success = useCredits(requiredCredits, title);
    if (success) {
      onClose();
    }
  };

  const handleDemoUpgrade = () => {
    trackEvent('premium_cta_clicked', { source: 'feature_gate_modal', feature: title });
    activateDemoSubscription('premium', 'annual');
    onClose();
  };

  const handleViewPricing = () => {
    onClose();
    if (onNavigateToPricing) {
      onNavigateToPricing();
    }
  };

  const handleViewCredits = () => {
    onClose();
    if (onNavigateToCredits) {
      onNavigateToCredits();
    } else {
      openCreditModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-gate-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 relative bg-linear-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Premium Feature Gated
              </span>
              <h2 id="feature-gate-title" className="text-xl font-extrabold text-slate-900 dark:text-white">
                Unlock This Feature
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
            <span className="font-semibold text-slate-900 dark:text-white">{title}:</span> {description}
          </p>
        </div>

        {/* Pathways: Premium or Credits */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* OPTION 1: Upgrade to Premium */}
          <div className="p-5 rounded-2xl border-2 border-indigo-500/80 bg-indigo-50/40 dark:bg-indigo-950/30 relative space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  FundEcho Premium
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                Best Value
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Unlimited AI proposal audits, semantic opportunity matching, T-30 roadmap sync, and an ad-free workflow.
            </p>

            <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Unlimited AI Audits</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Ad-Free Experience</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Funder Dossiers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Priority Review</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleDemoUpgrade}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Activate Premium Plan</span>
              </button>
              <button
                type="button"
                onClick={handleViewPricing}
                className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 font-semibold text-xs whitespace-nowrap"
              >
                <span>View Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* OPTION 2: Use Credits */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Pay with Credits
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Requires <span className="font-bold text-slate-900 dark:text-white">{requiredCredits} credits</span>. 
                Your balance: <span className="font-bold text-amber-600 dark:text-amber-400">{credits.balance} credits</span>.
              </p>
            </div>

            {hasEnoughCredits ? (
              <button
                type="button"
                onClick={handleUseCredits}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-colors shrink-0"
              >
                Use {requiredCredits} Credits
              </button>
            ) : (
              <button
                type="button"
                onClick={handleViewCredits}
                className="px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 font-bold text-xs shadow-2xs transition-colors shrink-0"
              >
                Get More Credits
              </button>
            )}
          </div>
        </div>

        {/* Footer info & ethical guarantee */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Core opportunity search & discovery always remains 100% free.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-xs underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
