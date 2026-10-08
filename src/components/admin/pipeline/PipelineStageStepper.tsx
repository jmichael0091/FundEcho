import React from 'react';
import { 
  Compass, 
  DownloadCloud, 
  CheckSquare, 
  Copy, 
  Eye, 
  ShieldCheck, 
  Globe, 
  ChevronRight 
} from 'lucide-react';
import { PipelineStage } from '../../../types/pipeline';

export interface StageCountMap {
  discover: number;
  import: number;
  validate: number;
  deduplicate: number;
  review: number;
  verify: number;
  publish: number;
  all?: number;
}

export interface PipelineStageStepperProps {
  activeStage: PipelineStage | 'all';
  onSelectStage: (stage: PipelineStage | 'all') => void;
  counts: StageCountMap;
}

interface StageDefinition {
  id: PipelineStage;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageDefinition[] = [
  {
    id: 'discover',
    label: 'Discover',
    shortLabel: 'Discover',
    description: 'Incoming feeds & raw intake queue',
    icon: Compass,
  },
  {
    id: 'import',
    label: 'Import',
    shortLabel: 'Import',
    description: 'Manual intake triage & acceptance',
    icon: DownloadCloud,
  },
  {
    id: 'validate',
    label: 'Validate',
    shortLabel: 'Validate',
    description: 'Automated field & URL integrity checks',
    icon: CheckSquare,
  },
  {
    id: 'deduplicate',
    label: 'Deduplicate',
    shortLabel: 'Deduplicate',
    description: 'Similarity scanning & duplicate alerts',
    icon: Copy,
  },
  {
    id: 'review',
    label: 'Review',
    shortLabel: 'Review',
    description: 'Editorial assessment & enrichment',
    icon: Eye,
  },
  {
    id: 'verify',
    label: 'Verify',
    shortLabel: 'Verify',
    description: 'Deliberate official source verification',
    icon: ShieldCheck,
  },
  {
    id: 'publish',
    label: 'Publish',
    shortLabel: 'Publish',
    description: 'Live catalog release to seekers',
    icon: Globe,
  },
];

export const PipelineStageStepper: React.FC<PipelineStageStepperProps> = ({
  activeStage,
  onSelectStage,
  counts,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 md:p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pipeline Progression Stages
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Discover → Import → Validate → Deduplicate → Review → Verify → Publish
          </span>
        </div>
        <button
          id="btn-pipeline-filter-all"
          onClick={() => onSelectStage('all')}
          className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
            activeStage === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          View All ({counts.all ?? 0})
        </button>
      </div>

      {/* Horizontal Scrollable Stepper */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = activeStage === stage.id;
          const count = counts[stage.id] ?? 0;
          const isLast = idx === STAGES.length - 1;

          return (
            <React.Fragment key={stage.id}>
              <button
                id={`btn-pipeline-stage-${stage.id}`}
                onClick={() => onSelectStage(stage.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-left border transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-[72px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold leading-tight">{stage.label}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : count > 0
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[90px] hidden sm:inline">
                    {stage.shortLabel}
                  </span>
                </div>
              </button>

              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 mx-0.5" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
