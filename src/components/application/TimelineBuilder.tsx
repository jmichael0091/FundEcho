import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  X, 
  Clock,
  Flag
} from 'lucide-react';
import { TimelineMilestone } from '../../types/application';

interface TimelineBuilderProps {
  milestones: TimelineMilestone[];
  onChangeMilestones: (milestones: TimelineMilestone[]) => void;
}

export const TimelineBuilder: React.FC<TimelineBuilderProps> = ({
  milestones,
  onChangeMilestones,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formTimeframe, setFormTimeframe] = useState('Months 1 - 3');
  const [formActivities, setFormActivities] = useState('');
  const [formDeliverables, setFormDeliverables] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormTitle('');
    setFormTimeframe('Months 1 - 3');
    setFormActivities('');
    setFormDeliverables('');
    setFormError(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (m: TimelineMilestone) => {
    setEditingId(m.id);
    setFormTitle(m.title);
    setFormTimeframe(m.timeframe);
    setFormActivities(m.keyActivities);
    setFormDeliverables(m.expectedDeliverables);
    setFormError(null);
    setIsAdding(false);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formTitle.trim()) {
      setFormError('Milestone title is required.');
      return;
    }
    if (!formTimeframe.trim()) {
      setFormError('Timeframe (e.g. Months 1-3) is required.');
      return;
    }

    if (editingId) {
      const updated = milestones.map((m) => {
        if (m.id === editingId) {
          return {
            ...m,
            title: formTitle.trim(),
            timeframe: formTimeframe.trim(),
            keyActivities: formActivities.trim(),
            expectedDeliverables: formDeliverables.trim(),
          };
        }
        return m;
      });
      onChangeMilestones(updated);
    } else {
      const newMilestone: TimelineMilestone = {
        id: `milestone-${Date.now()}`,
        phaseNumber: milestones.length + 1,
        title: formTitle.trim(),
        timeframe: formTimeframe.trim(),
        keyActivities: formActivities.trim(),
        expectedDeliverables: formDeliverables.trim(),
      };
      onChangeMilestones([...milestones, newMilestone]);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    const filtered = milestones.filter((m) => m.id !== id);
    // Renumber phases
    const renumbered = filtered.map((m, idx) => ({ ...m, phaseNumber: idx + 1 }));
    onChangeMilestones(renumbered);
    if (editingId === id) resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Project Execution Roadmap & Key Milestones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Break down your workplan into structured phases with verifiable deliverables.
            </p>
          </div>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            id="add-milestone-btn"
            onClick={() => {
              resetForm();
              setFormTimeframe(`Months ${(milestones.length * 3) + 1} - ${(milestones.length + 1) * 3}`);
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project Phase</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" />
              {editingId ? 'Edit Project Milestone' : 'Add New Project Milestone'}
            </h4>
            <button
              type="button"
              id="cancel-milestone-form-btn"
              onClick={resetForm}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Milestone Title *
              </label>
              <input
                type="text"
                id="milestone-title-input"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Stakeholder Consultation & Curriculum Finalization"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Timeframe / Window *
              </label>
              <input
                type="text"
                id="milestone-timeframe-input"
                value={formTimeframe}
                onChange={(e) => setFormTimeframe(e.target.value)}
                placeholder="e.g. Months 1 - 3 or Q2 2027"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Key Activities:
              </label>
              <textarea
                rows={2}
                id="milestone-activities-input"
                value={formActivities}
                onChange={(e) => setFormActivities(e.target.value)}
                placeholder="Outline core actions undertaken in this phase..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tangible Deliverables:
              </label>
              <textarea
                rows={2}
                id="milestone-deliverables-input"
                value={formDeliverables}
                onChange={(e) => setFormDeliverables(e.target.value)}
                placeholder="Proof of completion (e.g. Audit report, launch event, cohort certificates)..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              id="cancel-milestone-btn"
              onClick={resetForm}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              id="confirm-save-milestone-btn"
              onClick={() => handleSave()}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              {editingId ? 'Update Milestone' : 'Save Milestone'}
            </button>
          </div>
        </div>
      )}

      {/* Milestones List Timeline View */}
      {milestones.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No timeline milestones added yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Evaluators look for phased execution roadmaps with clear target timeframes and tangible outcomes.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((m, index) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    P{m.phaseNumber || index + 1}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                    Phase {m.phaseNumber || index + 1}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {m.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                      <Calendar className="w-3 h-3" />
                      {m.timeframe}
                    </span>
                  </div>

                  {m.keyActivities && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <strong className="font-semibold text-slate-700 dark:text-slate-300">Activities:</strong> {m.keyActivities}
                    </p>
                  )}

                  {m.expectedDeliverables && (
                    <div className="flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Deliverables:</strong> {m.expectedDeliverables}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  id={`edit-milestone-${m.id}`}
                  onClick={() => startEdit(m)}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Milestone"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id={`delete-milestone-${m.id}`}
                  onClick={() => handleDelete(m.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
