import React from 'react';
import { 
  X, 
  Coins, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useMonetization } from '../../context/MonetizationContext';

export interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToCredits?: () => void;
}

export const InsufficientCreditsModal: React.FC<InsufficientCreditsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPricing,
  onNavigateToCredits
}) => {
  const { 
    insufficientDetails, 
    credits, 
    openCreditModal, 
    openUpgradeModal 
  } = useMonetization();

  if (!isOpen) return null;

  const featureName = insufficientDetails?.featureName || 'Requested AI Capability';
  const required = insufficientDetails?.requiredCredits || 10;
  const available = credits.balance;
  const deficit = Math.max(0, required - available);

  const handleOpenPurchase = () => {
    onClose();
    if (onNavigateToCredits) {
      onNavigateToCredits();
    } else {
      openCreditModal();
    }
  };

  const handleOpenUpgrade = () => {
    onClose();
    if (onNavigateToPricing) {
      onNavigateToPricing();
    } else {
      openUpgradeModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="insufficient-credits-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-800 shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Wallet Balance Exhausted
              </span>
              <h3 id="insufficient-credits-title" className="text-lg font-black text-slate-900 dark:text-white">
                Insufficient Credits
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Action:</span>
              <strong className="text-slate-900 dark:text-white">{featureName}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Required:</span>
              <strong className="text-amber-600 dark:text-amber-400">{required} Credits</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Your Balance:</span>
              <strong className="text-slate-900 dark:text-white">{available} Credits</strong>
            </div>
            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60 flex justify-between items-center font-bold text-amber-700 dark:text-amber-300">
              <span>Needed:</span>
              <span>+{deficit} Credits</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            You need additional credits to run this AI operation, or you can unlock unlimited monthly access with FundEcho Premium.
          </p>

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleOpenPurchase}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01]"
            >
              <Coins className="w-4 h-4" />
              <span>Purchase Credits (On-Demand)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </button>

            <button
              type="button"
              onClick={handleOpenUpgrade}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Upgrade to Premium (Unlimited Access)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Instant Credit Allocation &bull; Secure Account Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
