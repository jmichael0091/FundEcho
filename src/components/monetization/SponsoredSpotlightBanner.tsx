import React, { useEffect, useRef } from 'react';
import { 
  Building2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { Opportunity } from '../../types';
import { FeaturedOpportunityConfig } from '../../types/monetization';
import { FeaturedOpportunityBadge } from './FeaturedOpportunityBadge';
import { useMonetization } from '../../context/MonetizationContext';

export interface SponsoredSpotlightBannerProps {
  opportunity: Opportunity;
  config: FeaturedOpportunityConfig;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  className?: string;
}

export const SponsoredSpotlightBanner: React.FC<SponsoredSpotlightBannerProps> = ({
  opportunity,
  config,
  onSelectOpportunity,
  className = ''
}) => {
  const { trackEvent } = useMonetization();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackEvent('featured_opportunity_viewed', {
        opportunityId: opportunity.id,
        sponsor: config.sponsorName,
        placement: config.placement
      });
    }
  }, [opportunity.id, config.sponsorName, config.placement, trackEvent]);

  const handleCardClick = () => {
    trackEvent('featured_opportunity_clicked', {
      opportunityId: opportunity.id,
      sponsor: config.sponsorName,
      placement: config.placement
    });
    onSelectOpportunity(opportunity);
  };

  if (!opportunity) return null;

  return (
    <article
      onClick={handleCardClick}
      className={`group cursor-pointer rounded-3xl border-2 border-amber-300/80 dark:border-amber-700/60 bg-linear-to-r from-amber-50/50 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-950/10 p-6 sm:p-7 shadow-md hover:shadow-lg transition-all relative overflow-hidden ${className}`}
      aria-label={`Sponsored Opportunity: ${opportunity?.title || 'Featured Program'}`}
    >
      {/* Top Banner Tag line */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-200/60 dark:border-amber-850/60 text-xs">
        <div className="flex items-center gap-2">
          <FeaturedOpportunityBadge 
            badgeText={config?.badgeText || 'Featured'} 
            sponsorName={config?.sponsorName || 'Partner'} 
          />
          <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-medium hidden sm:inline">
            Promoted Placement
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Distinct from organic ranking</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {opportunity?.organization || 'Partner Institution'}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {opportunity?.location || 'Global'}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
            {opportunity?.title || 'Featured Opportunity'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {config?.tagline || opportunity?.summary || ''}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="inline-flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400">
              <span>{opportunity?.amount?.displayText || 'Grant Award'}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <div className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Deadline: {opportunity?.deadline || 'Ongoing'}</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="shrink-0 pt-2 lg:pt-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all group-hover:translate-x-0.5"
          >
            <span>{config?.customCtaLabel || 'View Opportunity'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
