import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  CreditCard,
  ArrowRight,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useMonetization } from '../../context/MonetizationContext';
import { CreditPackage } from '../../types/monetization';

export interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCreditsPage?: () => void;
}

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
  onNavigateToCreditsPage
}) => {
  const { credits, packages, addDemoCredits } = useMonetization();

  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPurchasedAmount, setLastPurchasedAmount] = useState<number>(0);

  if (!isOpen) return null;

  const handleSelectPackage = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setCheckoutStep('confirm');
  };

  const handleConfirmDemoPurchase = async () => {
    if (!selectedPackage) return;
    setIsProcessing(true);

    const total = selectedPackage.credits + (selectedPackage.bonusCredits || 0);
    setLastPurchasedAmount(total);

    try {
      await addDemoCredits(selectedPackage.id);
      setCheckoutStep('success');
    } catch {
      // Fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setCheckoutStep('select');
    setSelectedPackage(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credit-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden relative my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 relative bg-linear-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-900">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  On-Demand AI Resources
                </span>
                <h2 id="credit-modal-title" className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Add Application Credits
                </h2>
              </div>
            </div>

            {/* Current Balance Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold">
              <span>Current Balance:</span>
              <span className="text-amber-700 dark:text-amber-300 font-extrabold">{credits.balance} Credits</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 max-w-xl">
            Credits power on-demand AI proposal auditing, semantic compatibility scoring, and reviewer simulation without requiring a recurring monthly subscription. Credits never expire.
          </p>
        </div>

        {/* STEP 1: SELECT PACKAGE */}
        {checkoutStep === 'select' && (
          <div className="p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const totalCredits = pkg.credits + (pkg.bonusCredits || 0);
                return (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all relative ${
                      pkg.popular
                        ? 'border-indigo-500/80 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md shadow-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850/60'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-indigo-600 text-white shadow-xs">
                        Most Popular
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {pkg.name}
                        </h3>
                        {pkg.perCreditRate && (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {pkg.perCreditRate}/ea
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            {totalCredits}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            credits
                          </span>
                        </div>
                        {pkg.bonusCredits && pkg.bonusCredits > 0 ? (
                          <span className="inline-block mt-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                            +{pkg.bonusCredits} Bonus Included
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">One-time:</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {pkg.priceFormatted || `$${pkg.priceUSD}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectPackage(pkg)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                          pkg.popular
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900'
                        }`}
                      >
                        <span>Select Package</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sandbox Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Sandbox Demo System:</strong> Packages simulate credit allocation without processing actual financial transactions.
                </span>
              </div>
              {onNavigateToCreditsPage && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToCreditsPage();
                  }}
                  className="underline hover:text-amber-700 font-bold shrink-0 ml-3"
                >
                  View Full Rates
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: SIMULATED CHECKOUT CONFIRMATION */}
        {checkoutStep === 'confirm' && selectedPackage && (
          <div className="p-6 sm:p-7 space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedPackage.name} Credit Package
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedPackage.credits + (selectedPackage.bonusCredits || 0)} Total AI Application Credits
                  </p>
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedPackage.priceFormatted || `$${selectedPackage.priceUSD}`}
                </span>
              </div>
            </div>

            {/* Simulated Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Simulated Payment Method (Sandbox)
              </label>
              <div className="p-3.5 rounded-2xl border-2 border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Sandbox Test Card &bull;&bull;&bull;&bull; 4242
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Auto-approved sandbox test payment token
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  Demo
                </span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>No actual charge:</strong> Clicking "Complete Demo Purchase" adds credits to your local session wallet without charging your card.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutStep('select')}
                disabled={isProcessing}
                className="py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmDemoPurchase}
                disabled={isProcessing}
                className="flex-1 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Demo Transaction...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Complete Demo Purchase ({selectedPackage.priceFormatted || `$${selectedPackage.priceUSD}`})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {checkoutStep === 'success' && (
          <div className="p-8 sm:p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Demo Transaction Confirmed
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                +{lastPurchasedAmount} Credits Added!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Your credits are active immediately. Your updated balance is now{' '}
                <strong className="text-slate-900 dark:text-white">{credits.balance} credits</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="py-3 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black text-xs shadow-md transition-all"
            >
              Continue to Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
