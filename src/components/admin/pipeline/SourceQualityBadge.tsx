import React from 'react';
import { ShieldCheck, Building, Landmark, HelpCircle, FileText } from 'lucide-react';
import { SourceQuality } from '../../../types/pipeline';

export interface SourceQualityBadgeProps {
  quality: SourceQuality;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}

export const SourceQualityBadge: React.FC<SourceQualityBadgeProps> = ({
  quality,
  size = 'sm',
  showLabel = true,
}) => {
  const getConfig = () => {
    switch (quality) {
      case 'Government/official institution':
        return {
          icon: Landmark,
          label: 'Government / Official',
          bg: 'bg-emerald-50 dark:bg-emerald-950/70',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'Official provider':
        return {
          icon: ShieldCheck,
          label: 'Official Provider',
          bg: 'bg-blue-50 dark:bg-blue-950/70',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
        };
      case 'Established organization':
        return {
          icon: Building,
          label: 'Established Org',
          bg: 'bg-indigo-50 dark:bg-indigo-950/70',
          text: 'text-indigo-700 dark:text-indigo-300',
          border: 'border-indigo-200 dark:border-indigo-800',
          dot: 'bg-indigo-500',
        };
      case 'Secondary source':
        return {
          icon: FileText,
          label: 'Secondary Source',
          bg: 'bg-amber-50 dark:bg-amber-950/70',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      case 'Unknown source':
      default:
        return {
          icon: HelpCircle,
          label: 'Unknown Source',
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
      title={`Source Quality: ${quality} (Informational indicator - deliberate verification required)`}
    >
      <Icon className={`${iconSizes} shrink-0`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
