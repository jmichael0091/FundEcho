import React from 'react';
import { ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { PartnerPlacement } from '../../types/monetization';
import { useMonetization } from '../../context/MonetizationContext';

export interface PartnerCardProps {
  partner: PartnerPlacement;
  className?: string;
  variant?: 'card' | 'compact';
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  className = '',
  variant = 'card'
}) => {
  const { trackEvent } = useMonetization();

  const handlePartnerClick = () => {
    trackEvent('partner_link_clicked', {
      partnerId: partner.id,
      partnerName: partner.name,
      category: partner.category
    });
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'business_tools':
        return 'Business & Accounting';
      case 'education_platforms':
        return 'Fellowship & Education';
      case 'productivity_tools':
        return 'Proposal Tools';
      case 'professional_services':
        return 'Legal & Advisory';
      case 'funding_resources':
        return 'Funding Resources';
      default:
        return 'Partner Resource';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3 ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`h-8 w-8 rounded-xl ${partner.logoBg} text-white font-black text-xs flex items-center justify-center shrink-0`}>
              {partner.initials}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                {getCategoryLabel(partner.category)}
              </span>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {partner.name}
              </h4>
            </div>
          </div>
          {partner.offerBadge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 shrink-0">
              {partner.offerBadge}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
          {partner.headline}
        </p>

        <a
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handlePartnerClick}
          className="inline-flex items-center justify-between w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
        >
          <span>Explore Partner Tool</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-2xl ${partner.logoBg} text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0`}>
              {partner.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                  {getCategoryLabel(partner.category)}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Vetted Partner
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {partner.name}
              </h3>
            </div>
          </div>

          {partner.offerBadge && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
              {partner.offerBadge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {partner.headline}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {partner.description}
          </p>
        </div>

        {/* Feature bullets */}
        {partner.features && partner.features.length > 0 && (
          <ul className="space-y-1.5 pt-1">
            {partner.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom CTA & Disclosure */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <a
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handlePartnerClick}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-2xs transition-colors"
        >
          <span>Visit {partner.name}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight italic">
          {partner.affiliateDisclosure}
        </p>
      </div>
    </div>
  );
};
