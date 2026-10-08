import React from 'react';
import { 
  Compass, 
  DownloadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  ShieldAlert, 
  BadgeCheck, 
  XCircle, 
  Globe 
} from 'lucide-react';
import { PipelineStatus } from '../../../types/pipeline';

export interface PipelineStatusBadgeProps {
  status: PipelineStatus;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
}

export const PipelineStatusBadge: React.FC<PipelineStatusBadgeProps> = ({
  status,
  size = 'sm',
  showIcon = true,
}) => {
  const getConfig = () => {
    switch (status) {
      case 'Discovered':
        return {
          icon: Compass,
          label: 'Discovered',
          bg: 'bg-sky-50 dark:bg-sky-950/70',
          text: 'text-sky-700 dark:text-sky-300',
          border: 'border-sky-200 dark:border-sky-800',
        };
      case 'Imported':
        return {
          icon: DownloadCloud,
          label: 'Imported',
          bg: 'bg-indigo-50 dark:bg-indigo-950/70',
          text: 'text-indigo-700 dark:text-indigo-300',
          border: 'border-indigo-200 dark:border-indigo-800',
        };
      case 'Validation Failed':
        return {
          icon: AlertTriangle,
          label: 'Validation Failed',
          bg: 'bg-rose-50 dark:bg-rose-950/70',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-800',
        };
      case 'Ready for Review':
        return {
          icon: CheckCircle2,
          label: 'Ready for Review',
          bg: 'bg-blue-50 dark:bg-blue-950/70',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
        };
      case 'Duplicate Suspected':
        return {
          icon: Copy,
          label: 'Duplicate Suspected',
          bg: 'bg-amber-50 dark:bg-amber-950/70',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
        };
      case 'Under Verification':
        return {
          icon: ShieldAlert,
          label: 'Under Verification',
          bg: 'bg-purple-50 dark:bg-purple-950/70',
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-800',
        };
      case 'Verified':
        return {
          icon: BadgeCheck,
          label: 'Verified',
          bg: 'bg-emerald-50 dark:bg-emerald-950/70',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
        };
      case 'Rejected':
        return {
          icon: XCircle,
          label: 'Rejected',
          bg: 'bg-red-50 dark:bg-red-950/70',
          text: 'text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
        };
      case 'Published':
        return {
          icon: Globe,
          label: 'Published to Catalog',
          bg: 'bg-teal-50 dark:bg-teal-950/70',
          text: 'text-teal-700 dark:text-teal-300',
          border: 'border-teal-200 dark:border-teal-800',
        };
      default:
        return {
          icon: Compass,
          label: status,
          bg: 'bg-slate-50 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-700',
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
      className={`inline-flex items-center font-bold rounded-full border whitespace-nowrap ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};
