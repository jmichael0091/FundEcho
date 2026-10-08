import React from 'react';
import { 
  History, 
  PlusCircle, 
  DownloadCloud, 
  CheckSquare, 
  FileEdit, 
  Eye, 
  ShieldCheck, 
  Globe, 
  XCircle, 
  GitMerge, 
  EyeOff, 
  Clock 
} from 'lucide-react';
import { PipelineEvent, PipelineEventType } from '../../../types/pipeline';

export interface PipelineHistoryTimelineProps {
  events: PipelineEvent[];
}

export const PipelineHistoryTimeline: React.FC<PipelineHistoryTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
        <History className="w-6 h-6 mx-auto mb-1 opacity-50" />
        No audit history recorded yet.
      </div>
    );
  }

  const getEventIcon = (type: PipelineEventType) => {
    switch (type) {
      case 'Created':
        return { icon: PlusCircle, bg: 'bg-sky-500', text: 'text-sky-500' };
      case 'Imported':
        return { icon: DownloadCloud, bg: 'bg-indigo-500', text: 'text-indigo-500' };
      case 'Validation Ran':
        return { icon: CheckSquare, bg: 'bg-blue-500', text: 'text-blue-500' };
      case 'Edited':
      case 'Updated':
        return { icon: FileEdit, bg: 'bg-amber-500', text: 'text-amber-500' };
      case 'Reviewed':
        return { icon: Eye, bg: 'bg-purple-500', text: 'text-purple-500' };
      case 'Verification status changed':
      case 'Verified':
        return { icon: ShieldCheck, bg: 'bg-emerald-500', text: 'text-emerald-500' };
      case 'Published':
        return { icon: Globe, bg: 'bg-teal-500', text: 'text-teal-500' };
      case 'Rejected':
        return { icon: XCircle, bg: 'bg-rose-500', text: 'text-rose-500' };
      case 'Merged':
        return { icon: GitMerge, bg: 'bg-indigo-500', text: 'text-indigo-500' };
      case 'Duplicate Ignored':
        return { icon: EyeOff, bg: 'bg-slate-400', text: 'text-slate-400' };
      default:
        return { icon: Clock, bg: 'bg-slate-500', text: 'text-slate-500' };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Opportunity State Audit Timeline
        </h4>
        <span className="text-xs text-slate-400 font-normal">
          ({events.length} {events.length === 1 ? 'event' : 'events'})
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {events.map((evt) => {
          const config = getEventIcon(evt.type);
          const Icon = config.icon;
          const formattedDate = new Date(evt.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Bullet */}
              <div
                className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full ${config.bg} text-white flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-xs`}
              >
                <Icon className="w-2.5 h-2.5" />
              </div>

              {/* Event Content */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    {evt.type}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {formattedDate}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {evt.description}
                </p>
                <div className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  Actor: <span className="font-semibold text-slate-600 dark:text-slate-400">{evt.actor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
