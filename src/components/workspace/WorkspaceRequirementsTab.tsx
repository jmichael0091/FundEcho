import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  AlertCircle,
  Tag,
  Sparkles,
  RotateCcw,
  CheckCheck,
  HelpCircle,
} from 'lucide-react';
import { ApplicationRequirement, RequirementCategory } from '../../types/firebase';

interface WorkspaceRequirementsTabProps {
  requirements: ApplicationRequirement[];
  onUpdateRequirements: (newReqs: ApplicationRequirement[]) => void;
  isSaving: boolean;
}

export const WorkspaceRequirementsTab: React.FC<WorkspaceRequirementsTabProps> = ({
  requirements,
  onUpdateRequirements,
  isSaving,
}) => {
  const [filter, setFilter] = useState<'all' | 'required' | 'pending' | 'completed'>('all');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<RequirementCategory>('custom');
  const [newIsRequired, setNewIsRequired] = useState(true);

  const completedCount = requirements.filter((r) => r.completed).length;
  const totalCount = requirements.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredRequirements = requirements.filter((req) => {
    if (filter === 'required') return req.required;
    if (filter === 'pending') return !req.completed;
    if (filter === 'completed') return req.completed;
    return true;
  });

  const handleToggle = (reqId: string) => {
    const updated = requirements.map((r) =>
      r.id === reqId ? { ...r, completed: !r.completed } : r
    );
    onUpdateRequirements(updated);
  };

  const handleDelete = (reqId: string) => {
    const updated = requirements.filter((r) => r.id !== reqId);
    onUpdateRequirements(updated);
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ApplicationRequirement = {
      id: `req_custom_${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      category: newCategory,
      required: newIsRequired,
      completed: false,
    };

    onUpdateRequirements([...requirements, newItem]);
    setNewTitle('');
    setNewDescription('');
    setIsAddingCustom(false);
  };

  const handleMarkAllComplete = () => {
    const updated = requirements.map((r) => ({ ...r, completed: true }));
    onUpdateRequirements(updated);
  };

  const handleResetChecklist = () => {
    const updated = requirements.map((r) => ({ ...r, completed: false }));
    onUpdateRequirements(updated);
  };

  const getCategoryBadgeClass = (category?: RequirementCategory) => {
    switch (category) {
      case 'eligibility':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
      case 'document':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/40';
      case 'form':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/40';
      case 'action':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress & Header Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Requirements Checklist
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {completedCount} of {totalCount} completed ({percent}%)
            </span>
            {isSaving && (
              <span className="text-[11px] text-slate-400 italic animate-pulse">
                Saving to Cloud...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track mandatory eligibility rules, compliance checks, and application milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="workspace-add-req-btn"
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Requirement
          </button>
        </div>
      </div>

      {/* Visual Progress Line */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Filter Tabs & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'required', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              id={`workspace-req-filter-${tab}`}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === tab
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab === 'all'
                ? `All (${totalCount})`
                : tab === 'required'
                ? `Mandatory (${requirements.filter((r) => r.required).length})`
                : tab === 'pending'
                ? `Pending (${totalCount - completedCount})`
                : `Completed (${completedCount})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="workspace-req-complete-all"
            onClick={handleMarkAllComplete}
            title="Mark all as completed"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Check All
          </button>
          <button
            id="workspace-req-reset"
            onClick={handleResetChecklist}
            title="Reset checklist"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Add Custom Requirement Form Modal/Card */}
      {isAddingCustom && (
        <form
          id="workspace-add-req-form"
          onSubmit={handleAddRequirement}
          className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 space-y-4"
        >
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600" />
            Add New Requirement or Checklist Item
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Requirement Title *
            </label>
            <input
              type="text"
              id="new-req-title-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Obtain Dean's endorsement letter"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              id="new-req-desc-input"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g., Must include official university letterhead and digital signature."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                id="new-req-category-select"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as RequirementCategory)}
                className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="custom">Custom Milestone</option>
                <option value="eligibility">Eligibility Verification</option>
                <option value="document">Required Document</option>
                <option value="form">Narrative / Form</option>
                <option value="action">Action Item</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4 sm:pt-5">
              <input
                type="checkbox"
                id="new-req-required-checkbox"
                checked={newIsRequired}
                onChange={(e) => setNewIsRequired(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="new-req-required-checkbox" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Mandatory Requirement
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-new-req-btn"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Checklist Items List */}
      <div className="space-y-2.5">
        {filteredRequirements.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No requirements match the selected filter.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Switch filter to "All" or add custom items to your preparation tracker.
            </p>
          </div>
        ) : (
          filteredRequirements.map((req) => (
            <div
              key={req.id}
              id={`req-item-${req.id}`}
              className={`p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                req.completed
                  ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 text-slate-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Interactive Checkbox */}
                <button
                  id={`toggle-req-${req.id}`}
                  onClick={() => handleToggle(req.id)}
                  className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                  title={req.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {req.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        req.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {req.title}
                    </span>

                    {req.required && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                        Mandatory
                      </span>
                    )}

                    {req.category && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getCategoryBadgeClass(
                          req.category
                        )}`}
                      >
                        {req.category}
                      </span>
                    )}
                  </div>

                  {req.description && (
                    <p
                      className={`text-xs ${
                        req.completed
                          ? 'text-slate-400 dark:text-slate-500'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {req.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex items-center gap-1">
                <button
                  id={`delete-req-${req.id}`}
                  onClick={() => handleDelete(req.id)}
                  title="Remove requirement"
                  className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
