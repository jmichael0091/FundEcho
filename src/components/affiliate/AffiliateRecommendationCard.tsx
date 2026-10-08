import React from 'react';
import { 
  ExternalLink, 
  Sparkles, 
  Calculator, 
  FileText, 
  GraduationCap, 
  HeartHandshake, 
  Globe, 
  Shield, 
  CheckCircle2,
  Tag
} from 'lucide-react';
import { AffiliateMatchResult } from '../../types/affiliate';
import { recordAffiliateClick } from '../../utils/affiliateTracking';

export interface AffiliateRecommendationCardProps {
  matchResult: AffiliateMatchResult;
  placement: string;
  userId?: string;
  opportunityId?: string;
  onLinkClick?: (offerId: string) => void;
}

export const AffiliateRecommendationCard: React.FC<AffiliateRecommendationCardProps> = ({
  matchResult,
  placement,
  userId,
  opportunityId,
  onLinkClick
}) => {
  const { offer, score, reasons } = matchResult;

  const handleCtaClick = () => {
    // Record internal click event
    recordAffiliateClick(offer.id, placement, score, userId, opportunityId);
    if (onLinkClick) {
      onLinkClick(offer.id);
    }
  };

  // Determine icon based on logo string or category
  const renderIcon = () => {
    switch (offer.logo) {
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  // Score color styling
  const getScoreBadgeClass = () => {
    if (score >= 85) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (score >= 65) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  const primaryReason = reasons[0] || 'Recommended based on your funding search context';

  return (
    <div 
      id={`affiliate-offer-card-${offer.id}`}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 relative group"
    >
      {/* Top Header: Partner Name, Type & Match Score */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
              {renderIcon()}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate">
                {offer.partnerName}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <Tag className="w-2.5 h-2.5" />
                {offer.category}
              </span>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className={`px-2.5 py-1 rounded-full border text-[11px] font-extrabold shrink-0 flex items-center gap-1 ${getScoreBadgeClass()}`}>
            <Sparkles className="w-3 h-3" />
            <span>{score}% Relevant</span>
          </div>
        </div>

        {/* Offer Title & Description */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {offer.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {offer.description}
          </p>
        </div>

        {/* Explainable Personalization Reason */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
          <span className="leading-tight">
            <strong>Why it matches:</strong> {primaryReason}
          </span>
        </div>
      </div>

      {/* Bottom CTA Action & Safe External Link */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          Independent Partner Tool
        </span>

        <a
          id={`affiliate-cta-${offer.id}`}
          href={offer.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleCtaClick}
          className="inline-flex items-center justify-center font-bold text-xs py-2 px-3.5 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 dark:text-slate-100 transition-all gap-1.5 min-h-[44px] shadow-xs active:scale-98"
        >
          <span>Learn More</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
        </a>
      </div>
    </div>
  );
};
