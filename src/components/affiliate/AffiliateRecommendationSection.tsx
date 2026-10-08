import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { AffiliateUserContext } from '../../types/affiliate';
import { getStoredAffiliateOffers } from '../../data/affiliateData';
import { getPersonalizedAffiliateRecommendations } from '../../utils/affiliateMatchingEngine';
import { recordAffiliateImpression } from '../../utils/affiliateTracking';
import { AffiliateRecommendationCard } from './AffiliateRecommendationCard';
import { AffiliateDisclosure } from './AffiliateDisclosure';

export interface AffiliateRecommendationSectionProps {
  context: AffiliateUserContext;
  placement: string;
  title?: string;
  subtitle?: string;
  initialLimit?: number;
  maxResults?: number;
  showDisclosure?: boolean;
  className?: string;
}

export const AffiliateRecommendationSection: React.FC<AffiliateRecommendationSectionProps> = ({
  context,
  placement,
  title = 'Recommended Tools & Resources',
  subtitle = 'Curated third-party tools and services to assist your project planning and proposal readiness.',
  initialLimit = 3,
  maxResults = 6,
  showDisclosure = true,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);

  // Retrieve active offers and run deterministic matching engine
  const matchedRecommendations = useMemo(() => {
    const allOffers = getStoredAffiliateOffers();
    return getPersonalizedAffiliateRecommendations(allOffers, context, maxResults);
  }, [context, maxResults]);

  // Record impressions on load
  useEffect(() => {
    if (matchedRecommendations.length > 0) {
      matchedRecommendations.forEach((match) => {
        recordAffiliateImpression(
          match.offer.id,
          placement,
          match.score,
          context.userId,
          context.currentOpportunity?.id
        );
      });
    }
  }, [matchedRecommendations, placement, context.userId, context.currentOpportunity?.id]);

  // If no offers meet the minimum threshold, show no recommendation
  if (matchedRecommendations.length === 0) {
    return null;
  }

  const visibleRecommendations = showAll 
    ? matchedRecommendations 
    : matchedRecommendations.slice(0, initialLimit);

  const hasMore = matchedRecommendations.length > initialLimit;

  return (
    <section 
      id={`affiliate-recommendations-${placement}`}
      className={`rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-6 lg:p-7 space-y-5 ${className}`}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <Wrench className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Preparatory Resources & Tools
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {matchedRecommendations.length} available
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Clear Non-Grant Distinction Notice Badge */}
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Independent Partner Tools</span>
          </span>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {visibleRecommendations.map((match) => (
          <AffiliateRecommendationCard
            key={match.offer.id}
            matchResult={match}
            placement={placement}
            userId={context.userId}
            opportunityId={context.currentOpportunity?.id}
          />
        ))}
      </div>

      {/* Show More / Show Less Toggle Button */}
      {hasMore && (
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            id={`toggle-more-affiliates-${placement}`}
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-all shadow-xs min-h-[44px]"
          >
            {showAll ? (
              <>
                <span>Show Fewer Recommendations</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>View {matchedRecommendations.length - initialLimit} More Matched Tools</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Bottom Mandatory Ethical Disclosure */}
      {showDisclosure && (
        <div className="pt-2">
          <AffiliateDisclosure compact={false} />
        </div>
      )}
    </section>
  );
};
