import React from 'react';
import { 
  DownloadCloud, 
  Trash2, 
  FileEdit, 
  ExternalLink, 
  Eye, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { IncomingOpportunity } from '../../../types/pipeline';
import { SourceQualityBadge } from './SourceQualityBadge';
import { PipelineStatusBadge } from './PipelineStatusBadge';

export interface DiscoveryQueueProps {
  opportunities: IncomingOpportunity[];
  onImport: (id: string) => void;
  onIgnore: (id: string) => void;
  onEdit: (opp: IncomingOpportunity) => void;
  onInspect: (opp: IncomingOpportunity) => void;
}

export const DiscoveryQueue: React.FC<DiscoveryQueueProps> = ({
  opportunities,
  onImport,
  onIgnore,
  onEdit,
  onInspect,
}) => {
  if (opportunities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
        <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-3 opacity-60" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Discovery Queue is Clear
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
          No unimported opportunities waiting in discovery. Add manual intake records or check other pipeline stages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View (Hidden on mobile/tablet) */}
      <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">Opportunity & Provider</th>
              <th className="py-3.5 px-3">Source & Quality</th>
              <th className="py-3.5 px-3">Type & Geography</th>
              <th className="py-3.5 px-3">Deadline</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {opportunities.map((opp) => {
              const valResult = opp.validationResult;
              const hasIssues = valResult && !valResult.isValid;

              return (
                <tr
                  key={opp.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Title & Org */}
                  <td className="py-3.5 px-4 max-w-[260px]">
                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {opp.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {opp.organization}
                    </div>
                    {opp.amountDisplayText && (
                      <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {opp.amountDisplayText}
                      </div>
                    )}
                  </td>

                  {/* Source & Quality */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={opp.source}>
                        {opp.source}
                      </span>
                      <SourceQualityBadge quality={opp.sourceQuality} size="xs" />
                    </div>
                  </td>

                  {/* Type & Geography */}
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {opp.fundingType}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                      {opp.country}
                    </div>
                  </td>

                  {/* Deadline & Date Discovered */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {opp.deadline || 'Rolling'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Discovered: {opp.dateDiscovered}
                    </div>
                  </td>

                  {/* Pipeline Status */}
                  <td className="py-3.5 px-3">
                    <PipelineStatusBadge status={opp.pipelineStatus} size="xs" />
                    {hasIssues && (
                      <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Validation needed</span>
                      </div>
                    )}
                  </td>

                  {/* Actions: Import, Ignore, Edit, View Source, Inspect */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        id={`btn-inspect-opp-${opp.id}`}
                        onClick={() => onInspect(opp)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Open pipeline workspace"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        id={`btn-edit-opp-${opp.id}`}
                        onClick={() => onEdit(opp)}
                        className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit raw fields"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>

                      {opp.sourceUrl && (
                        <a
                          href={opp.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View source link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        id={`btn-import-opp-${opp.id}`}
                        onClick={() => onImport(opp.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-all ml-1"
                        title="Import to pipeline"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        Import
                      </button>

                      <button
                        id={`btn-ignore-opp-${opp.id}`}
                        onClick={() => onIgnore(opp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Ignore and remove from discovery"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Stacked Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3">
        {opportunities.map((opp) => {
          return (
            <div
              key={opp.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <PipelineStatusBadge status={opp.pipelineStatus} size="xs" />
                  <SourceQualityBadge quality={opp.sourceQuality} size="xs" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {opp.dateDiscovered}
                </span>
              </div>

              <div>
                <h4
                  onClick={() => onInspect(opp)}
                  className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2"
                >
                  {opp.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {opp.organization} • <span className="italic">{opp.source}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Type / Scope</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                    {opp.fundingType} ({opp.country})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Deadline</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    {opp.deadline || 'Rolling'}
                  </span>
                </div>
              </div>

              {/* Mobile Actions Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onInspect(opp)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect
                  </button>

                  <button
                    onClick={() => onEdit(opp)}
                    className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs"
                    title="Edit record"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                  </button>

                  {opp.sourceUrl && (
                    <a
                      href={opp.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs"
                      title="View source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onIgnore(opp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Ignore"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onImport(opp.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    Import
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
