import React from 'react';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'indigo' | 'emerald' | 'amber' | 'slate';
  align?: 'left' | 'center';
  action?: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  badge,
  badgeVariant = 'indigo',
  align = 'left',
  action,
  className = '',
  id,
}) => {
  const isCenter = align === 'center';

  return (
    <div
      id={id}
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${className}`}
    >
      <div className={`space-y-1.5 ${isCenter ? 'text-center mx-auto max-w-2xl' : 'max-w-2xl'}`}>
        {badge && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 ${
            badgeVariant === 'indigo'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
              : badgeVariant === 'emerald'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
              : badgeVariant === 'amber'
              ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            <span>{badge}</span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && !isCenter && (
        <div className="shrink-0 flex items-center pt-2 md:pt-0">
          {action}
        </div>
      )}
    </div>
  );
};
