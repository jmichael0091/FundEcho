import React, { useState } from 'react';
import { 
  Sparkles, 
  Coins, 
  Zap, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useMonetization } from '../../context/MonetizationContext';
import { PageId } from '../../types';

export interface DemoMonetizationBarProps {
  onNavigate: (page: PageId) => void;
  currentPage: PageId;
}

export const DemoMonetizationBar: React.FC<DemoMonetizationBarProps> = ({
  onNavigate,
  currentPage
}) => {
  const { 
    isPremium, 
    credits, 
    toggleDemoTier, 
    addDemoCredits, 
    recentEvents, 
    demoFeedbackMessage, 
    clearDemoFeedback 
  } = useMonetization();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showEventLog, setShowEventLog] = useState(false);

  return (
    <div className="fixed bottom-3 right-3 z-40 max-w-sm sm:max-w-md transition-all">
      {/* Transient feedback toast if present */}
      {demoFeedbackMessage && (
        <div className="mb-2 p-3 rounded-2xl bg-indigo-900 text-white text-xs shadow-xl border border-indigo-700 flex items-start justify-between gap-2 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <p className="leading-snug">{demoFeedbackMessage}</p>
          </div>
          <button 
            type="button"
            onClick={clearDemoFeedback}
            className="text-slate-300 hover:text-white p-0.5"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Bar Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl p-2.5 sm:p-3 text-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-slate-900 dark:text-white text-[11px] tracking-tight">
              Monetization Sandbox
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isPremium 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {isPremium ? 'Premium (Demo)' : 'Free User'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Collapse controls' : 'Expand monetization controls'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Current Balance: <strong className="text-amber-600 dark:text-amber-400 font-bold">{credits.balance} Credits</strong>
              </span>

              <button
                type="button"
                onClick={() => addDemoCredits('starter')}
                className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-bold hover:bg-amber-100 transition-colors"
              >
                +25 Credits (Demo)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={toggleDemoTier}
                className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  isPremium
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isPremium ? 'Switch to Free' : 'Switch to Premium'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate(currentPage === 'pricing' ? 'credits' : 'pricing')}
                className="w-full py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1"
              >
                <span>{currentPage === 'pricing' ? 'View Credits' : 'View Pricing'}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Event log inspector toggle */}
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setShowEventLog(!showEventLog)}
                className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 underline font-medium"
              >
                <Activity className="w-3 h-3 text-emerald-500" />
                <span>Telemetry ({recentEvents.length} events logged)</span>
              </button>

              <span className="text-[10px] text-slate-400">
                Zero PII &bull; Safe Tracking
              </span>
            </div>

            {showEventLog && (
              <div className="max-h-36 overflow-y-auto rounded-xl bg-slate-950 text-slate-300 p-2 text-[10px] font-mono space-y-1">
                {recentEvents.length === 0 ? (
                  <p className="text-slate-500 italic">No events triggered yet.</p>
                ) : (
                  recentEvents.slice(0, 10).map((ev) => (
                    <div key={ev.id} className="truncate border-b border-slate-900 pb-0.5">
                      <span className="text-emerald-400">{ev.type}</span>
                      <span className="text-slate-500 ml-1">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
