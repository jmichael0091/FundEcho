import React from 'react';
import { Clock, AlertTriangle, CheckCircle, CalendarX } from 'lucide-react';
import { calculateDeadlineStatus } from '../../utils/deadlineUtils';

export interface DeadlineBadgeProps {
  deadline?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  referenceDate?: Date | string;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  deadline,
  size = 'sm',
  showIcon = true,
  className = '',
  referenceDate,
}) => {
  const status = calculateDeadlineStatus(deadline, undefined, referenceDate);

  const getVariantStyles = () => {
    switch (status.urgencyStatus) {
      case 'closing_today':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20 animate-pulse';
      case 'closing_soon':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70';
      case 'closing_this_week':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70';
      case 'upcoming':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'deadline_passed':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 line-through opacity-80';
      case 'no_deadline':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'text-[10px] px-1.5 py-0.5 rounded-md gap-1 font-semibold';
      case 'sm':
        return 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-semibold';
      case 'md':
        return 'text-sm px-3 py-1.5 rounded-xl gap-2 font-bold';
      case 'lg':
        return 'text-base px-4 py-2 rounded-2xl gap-2.5 font-extrabold';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    const iconClass = size === 'xs' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

    if (status.isToday) {
      return <AlertTriangle className={`${iconClass} text-rose-600 dark:text-rose-400 shrink-0`} />;
    }
    if (status.isPast) {
      return <CalendarX className={`${iconClass} text-slate-400 shrink-0`} />;
    }
    if (status.urgencyStatus === 'closing_soon' || status.urgencyStatus === 'closing_this_week') {
      return <Clock className={`${iconClass} text-amber-600 dark:text-amber-400 shrink-0`} />;
    }
    return <Clock className={`${iconClass} text-slate-400 shrink-0`} />;
  };

  return (
    <span
      className={`inline-flex items-center border shadow-2xs whitespace-nowrap transition-colors ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      title={status.formattedDeadline}
    >
      {getIcon()}
      <span>{status.badgeText}</span>
    </span>
  );
};
