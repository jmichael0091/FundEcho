import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Copy,
  Check,
  HelpCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ApplicationResponse } from '../../types/firebase';

interface WorkspaceResponsesTabProps {
  responses: ApplicationResponse[];
  onUpdateResponses: (newResponses: ApplicationResponse[]) => void;
  isSaving: boolean;
}

export const WorkspaceResponsesTab: React.FC<WorkspaceResponsesTabProps> = ({
  responses,
  onUpdateResponses,
  isSaving,
}) => {
  const [localResponses, setLocalResponses] = useState<ApplicationResponse[]>(responses);
  const [hasCopiedAll, setHasCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newGuidelines, setNewGuidelines] = useState('');
  const [newWordLimit, setNewWordLimit] = useState<number | undefined>(undefined);
  const [newRequired, setNewRequired] = useState(true);

  // Sync incoming responses from parent
  useEffect(() => {
    setLocalResponses(responses);
  }, [responses]);

  const countAnswered = localResponses.filter(
    (r) => r.completed || (r.answer && r.answer.trim().length > 30)
  ).length;
  const countTotal = localResponses.length;
  const percent = countTotal > 0 ? Math.round((countAnswered / countTotal) * 100) : 0;

  const countWords = (text: string) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  // Debounced parent update
  const handleAnswerChange = (respId: string, answer: string) => {
    const updated = localResponses.map((r) => {
      if (r.id === respId) {
        return {
          ...r,
          answer,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    setLocalResponses(updated);
    onUpdateResponses(updated);
  };

  const handleToggleComplete = (respId: string) => {
    const updated = localResponses.map((r) => {
      if (r.id === respId) {
        return { ...r, completed: !r.completed };
      }
      return r;
    });
    setLocalResponses(updated);
    onUpdateResponses(updated);
  };

  const handleDeleteQuestion = (respId: string) => {
    const updated = localResponses.filter((r) => r.id !== respId);
    setLocalResponses(updated);
    onUpdateResponses(updated);
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newItem: ApplicationResponse = {
      id: `resp_custom_${Date.now()}`,
      question: newQuestion.trim(),
      answer: '',
      guidelines: newGuidelines.trim() || undefined,
      wordLimit: newWordLimit && newWordLimit > 0 ? Number(newWordLimit) : undefined,
      required: newRequired,
      completed: false,
      updatedAt: new Date().toISOString(),
    };

    const updated = [...localResponses, newItem];
    setLocalResponses(updated);
    onUpdateResponses(updated);

    setNewQuestion('');
    setNewGuidelines('');
    setNewWordLimit(undefined);
    setIsAddingQuestion(false);
  };

  const handleCopySingle = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const fullDraft = localResponses
      .map((r, i) => `### ${i + 1}. ${r.question}\n\n${r.answer || '[No response entered yet]'}\n`)
      .join('\n---\n\n');

    navigator.clipboard.writeText(fullDraft);
    setHasCopiedAll(true);
    setTimeout(() => setHasCopiedAll(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Application Narrative Responses
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              {countAnswered} of {countTotal} answered ({percent}%)
            </span>
            {isSaving && (
              <span className="text-[11px] text-slate-400 italic animate-pulse">
                Autosaving to Firestore...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Structured responses tailored for grant applications. Draft, refine, and copy directly to funding portals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="workspace-copy-all-responses-btn"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {hasCopiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                Copied All!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All Responses
              </>
            )}
          </button>

          <button
            id="workspace-add-question-btn"
            onClick={() => setIsAddingQuestion(!isAddingQuestion)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Add Custom Question Form */}
      {isAddingQuestion && (
        <form
          id="workspace-add-question-form"
          onSubmit={handleAddCustomQuestion}
          className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 space-y-4"
        >
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Custom Application Question
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Question Prompt *
            </label>
            <input
              type="text"
              id="new-question-input"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g., How will your team ensure long-term community sustainability?"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Answering Guidelines or Tips (Optional)
              </label>
              <input
                type="text"
                id="new-guidelines-input"
                value={newGuidelines}
                onChange={(e) => setNewGuidelines(e.target.value)}
                placeholder="e.g., Mention partnership agreements and recurring funding models."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Word Limit (Optional)
              </label>
              <input
                type="number"
                id="new-word-limit-input"
                value={newWordLimit || ''}
                onChange={(e) => setNewWordLimit(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 300"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="new-question-required-checkbox"
              checked={newRequired}
              onChange={(e) => setNewRequired(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="new-question-required-checkbox" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Mandatory Question
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingQuestion(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-new-question-btn"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Add Question
            </button>
          </div>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {localResponses.map((item, index) => {
          const wordCount = countWords(item.answer);
          const isOverLimit = item.wordLimit ? wordCount > item.wordLimit : false;

          return (
            <div
              key={item.id}
              id={`response-card-${item.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {item.question}
                      {item.required && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                          Required
                        </span>
                      )}
                    </h4>
                    {item.guidelines && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {item.guidelines}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right actions: Copy single & Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id={`copy-resp-${item.id}`}
                    onClick={() => handleCopySingle(item.id, item.answer)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Copy response to clipboard"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    id={`delete-resp-${item.id}`}
                    onClick={() => handleDeleteQuestion(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  id={`resp-textarea-${item.id}`}
                  rows={4}
                  value={item.answer}
                  onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                  placeholder="Draft your clear, concise narrative response here..."
                  className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y leading-relaxed font-sans"
                />
              </div>

              {/* Footer bar of card: Word Count, Mark Complete, Last Updated */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    id={`toggle-complete-resp-${item.id}`}
                    onClick={() => handleToggleComplete(item.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{item.completed ? 'Marked Complete' : 'Mark as Complete'}</span>
                  </button>

                  <span className="text-slate-400">•</span>

                  <span
                    className={`font-medium ${
                      isOverLimit ? 'text-red-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {wordCount} {item.wordLimit ? `/ ${item.wordLimit}` : ''} words
                    {isOverLimit && ' (Exceeds limit)'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Last updated: {new Date(item.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
