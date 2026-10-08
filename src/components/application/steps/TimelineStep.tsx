import React from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { TimelineMilestone } from '../../../types/application';
import { Opportunity } from '../../../types';
import { TimelineBuilder } from '../TimelineBuilder';

interface TimelineStepProps {
  milestones: TimelineMilestone[];
  opportunity: Opportunity;
  onChangeMilestones: (milestones: TimelineMilestone[]) => void;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({
  milestones,
  opportunity,
  onChangeMilestones,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Calendar className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Project Timeline, Phases & Milestones
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Demonstrate operational feasibility by sequencing activities into distinct project quarters or monthly phases. Define verifiable proof of completion (deliverables) for each phase.
        </p>
      </div>

      {/* Main Timeline Builder */}
      <TimelineBuilder
        milestones={milestones}
        onChangeMilestones={onChangeMilestones}
      />
    </div>
  );
};
