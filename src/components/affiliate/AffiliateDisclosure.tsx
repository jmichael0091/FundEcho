import React from 'react';
import { Info } from 'lucide-react';

export interface AffiliateDisclosureProps {
  className?: string;
  compact?: boolean;
}

export const AffiliateDisclosure: React.FC<AffiliateDisclosureProps> = ({ 
  className = '',
  compact = false 
}) => {
  if (compact) {
    return (
      <p className={`text-[11px] text-slate-500 dark:text-slate-400 leading-normal flex items-center gap-1.5 ${className}`}>
        <Info className="w-3 h-3 text-slate-400 shrink-0" />
        <span>
          Some links may be affiliate links. FundEcho may earn a commission at no additional cost to you.
        </span>
      </p>
    );
  }

  return (
    <div className={`p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5 ${className}`}>
      <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Transparency & Editorial Independence:
        </p>
        <p className="leading-relaxed">
          Some links may be affiliate links. FundEcho may earn a commission at no additional cost to you. These recommended tools and preparatory resources are strictly independent and never influence opportunity ranking, eligibility verification, or funding evaluations.
        </p>
      </div>
    </div>
  );
};
