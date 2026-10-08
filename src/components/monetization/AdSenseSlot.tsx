import React, { useEffect, useRef } from 'react';
import { AdSlotFormat } from '../../types/monetization';
import { AD_SLOT_CONFIGS } from '../../data/monetizationData';
import { useMonetization } from '../../context/MonetizationContext';

export interface AdSenseSlotProps {
  slotId: string;
  format?: AdSlotFormat;
  className?: string;
  label?: string;
}

/**
 * Reusable Google AdSense container.
 * Prepared for clean, non-intrusive script injection when real AdSense account is linked.
 * Completely hidden for FundEcho Premium subscribers.
 */
export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  slotId,
  format: propFormat,
  className = '',
  label = 'Advertisement'
}) => {
  const { isPremium, trackEvent } = useMonetization();
  const trackedRef = useRef(false);

  const config = AD_SLOT_CONFIGS[slotId] || {
    id: slotId,
    slotName: 'Standard Ad Slot',
    format: propFormat || 'in_feed',
    placement: 'content',
    isEnabled: true
  };

  const format = propFormat || config.format;

  useEffect(() => {
    if (!isPremium && !trackedRef.current) {
      trackedRef.current = true;
      trackEvent('ad_impression', { slotId, format });
    }
  }, [isPremium, slotId, format, trackEvent]);

  // Premium subscribers enjoy reduced / ad-free experience
  if (isPremium) {
    return null;
  }

  // Dimension helpers by format
  const getFormatClasses = () => {
    switch (format) {
      case 'leaderboard':
        return 'min-h-[90px] max-w-4xl py-3';
      case 'rectangle':
        return 'min-h-[250px] w-full max-w-sm py-4';
      case 'sidebar':
        return 'min-h-[280px] w-full py-4';
      case 'banner':
        return 'min-h-[80px] w-full py-2.5';
      case 'in_feed':
      default:
        return 'min-h-[110px] w-full py-3';
    }
  };

  return (
    <div 
      className={`w-full mx-auto my-4 transition-opacity duration-300 ${className}`}
      data-ad-slot-id={slotId}
      data-ad-format={format}
      aria-label="Advertisement Container"
    >
      <div className="w-full flex flex-col items-center">
        {/* Ad disclosure label */}
        <div className="w-full flex items-center justify-between px-3 py-1 mb-1 max-w-4xl">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
            {label}
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Non-intrusive AdSense Slot
          </span>
        </div>

        {/* Ad placeholder container ready for AdSense tag */}
        <div className={`w-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center p-4 overflow-hidden relative ${getFormatClasses()}`}>
          {/* AdSense HTML Slot anchor for future production snippet */}
          <ins 
            className="adsbygoogle w-full flex flex-col items-center justify-center text-center"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-FundEcho_RESERVED"
            data-ad-slot={slotId}
            data-ad-format={format === 'rectangle' ? 'rectangle' : 'horizontal'}
            data-full-width-responsive="true"
          >
            <div className="space-y-1 select-none pointer-events-none py-2">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800">
                Google AdSense Placement Slot
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ethical partner placement reserved for non-profit and education sponsors
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Format: <span className="font-mono">{format}</span> &bull; ID: <span className="font-mono">{slotId}</span>
              </p>
            </div>
          </ins>
        </div>
      </div>
    </div>
  );
};
