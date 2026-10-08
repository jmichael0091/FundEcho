import React, { useState, useEffect } from 'react';
import {
  FileText,
  Lock,
  Save,
  Check,
  PlusCircle,
  Shield,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface WorkspaceNotesTabProps {
  notes: string;
  onUpdateNotes: (newNotes: string) => void;
  isSaving: boolean;
}

export const WorkspaceNotesTab: React.FC<WorkspaceNotesTabProps> = ({
  notes,
  onUpdateNotes,
  isSaving,
}) => {
  const [localNotes, setLocalNotes] = useState<string>(notes);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalNotes(value);
    onUpdateNotes(value);
  };

  const handleInsertTemplate = (templateText: string) => {
    const updated = localNotes ? `${localNotes}\n\n${templateText}` : templateText;
    setLocalNotes(updated);
    onUpdateNotes(updated);
  };

  const wordCount = localNotes.trim() ? localNotes.trim().split(/\s+/).length : 0;
  const charCount = localNotes.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Private Application Notes
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Private to you
            </span>
            {isSaving && (
              <span className="text-[11px] text-slate-400 italic animate-pulse">
                Saving to Cloud...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Jot down internal notes, funder correspondence, clarification questions, and follow-up checkpoints.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
      </div>

      {/* Quick Template Prompts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1">Insert template:</span>
        <button
          id="notes-template-funder-meeting"
          onClick={() =>
            handleInsertTemplate(
              `### 📞 Funder Q&A / Correspondence\n- Date: ${new Date().toLocaleDateString()}\n- Contact Person:\n- Key Clarification Points:\n- Feedback Received:`
            )
          }
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
          Funder Correspondence
        </button>

        <button
          id="notes-template-budget-checks"
          onClick={() =>
            handleInsertTemplate(
              `### 💰 Budget & Indirect Cost Notes\n- Total requested: \n- Institutional match / co-funding: \n- Allowable indirect cost rate: \n- Fiscal sponsor fee:`
            )
          }
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
          Budget Checklist
        </button>

        <button
          id="notes-template-submission-steps"
          onClick={() =>
            handleInsertTemplate(
              `### 🚀 Final Submission Checkpoints\n- [ ] Official portal account created & verified\n- [ ] Lead investigator CV signed\n- [ ] Proof of incorporation PDF attached\n- [ ] Final word count compliance check`
            )
          }
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
          Submission Checkpoints
        </button>
      </div>

      {/* Main Notes Editor */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <textarea
          id="workspace-notes-textarea"
          rows={14}
          value={localNotes}
          onChange={handleChange}
          placeholder="Start typing your internal preparation notes here. Everything is autosaved securely to your Cloud Firestore application record..."
          className="w-full p-5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-y leading-relaxed font-sans"
        />
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 text-xs text-slate-500">
        <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          Strict Privacy Isolation: These notes are strictly private to your authenticated account UID and are never visible to grant providers or public visitors.
        </span>
      </div>
    </div>
  );
};
