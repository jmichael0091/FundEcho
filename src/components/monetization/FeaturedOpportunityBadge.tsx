import React from 'react';
import { Sparkles, Megaphone } from 'lucide-react';

export interface FeaturedOpportunityBadgeProps {
  badgeText?: 'Sponsored' | 'Featured';
  sponsorName?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const FeaturedOpportunityBadge: React.FC<FeaturedOpportunityBadgeProps> = ({
  badgeText = 'Sponsored',
  sponsorName,
  className = '',
  size = 'md'
}) => {
  const isSponsored = badgeText === 'Sponsored';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full shadow-2xs ${
        isSponsored
          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/60'
          : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 border border-indigo-300/80 dark:border-indigo-700/60'
      } ${
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
      } ${className}`}
      title={sponsorName ? `Promoted by ${sponsorName}` : `${badgeText} Opportunity`}
    >
      {isSponsored ? (
        <Megaphone className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      ) : (
        <Sparkles className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      )}
      <span>{badgeText}</span>
      {sponsorName && (
        <span className="opacity-75 lowercase font-normal hidden sm:inline">
          &bull; {sponsorName}
        </span>
      )}
    </span>
  );
};
