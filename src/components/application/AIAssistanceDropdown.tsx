import React, { useState } from 'react';
import { 
  Sparkles, 
  Maximize2, 
  Briefcase, 
  FileText, 
  Minimize2, 
  HelpCircle, 
  Check, 
  Copy, 
  X, 
  AlertCircle, 
  Loader2,
  ChevronDown
} from 'lucide-react';
import { 
  AIAssistanceAction, 
  AIAssistRequestPayload, 
  AIAssistResponsePayload 
} from '../../types/application';
import { requestAIAssistance, AI_ASSISTANCE_ACTIONS } from '../../utils/aiService';
import { Opportunity } from '../../types';
import { useMonetization } from '../../context/MonetizationContext';

interface AIAssistanceDropdownProps {
  fieldKey: string;
  fieldLabel: string;
  currentValue: string;
  opportunity: Opportunity;
  applicantName?: string;
  applicantCountry?: string;
  applicantEducation?: string;
  organizationName?: string;
  organizationType?: string;
  onApplyText: (newText: string, mode: 'replace' | 'append') => void;
  onRecordGeneratedContent?: (record: {
    action: string;
    generatedText: string;
    originalText: string;
  }) => void;
}

export const AIAssistanceDropdown: React.FC<AIAssistanceDropdownProps> = ({
  fieldKey,
  fieldLabel,
  currentValue,
  opportunity,
  applicantName,
  applicantCountry,
  applicantEducation,
  organizationName,
  organizationType,
  onApplyText,
  onRecordGeneratedContent,
}) => {
  const { requireFeatureAccess } = useMonetization();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<AIAssistanceAction | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<AIAssistResponsePayload | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getActionIcon = (id: AIAssistanceAction) => {
    switch (id) {
      case 'improve_writing':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case 'expand':
        return <Maximize2 className="w-4 h-4 text-emerald-500" />;
      case 'make_professional':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'generate_draft':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'shorten':
        return <Minimize2 className="w-4 h-4 text-rose-500" />;
      case 'explain_question':
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
    }
  };

  const getFeatureKeyForAction = (action: AIAssistanceAction) => {
    switch (action) {
      case 'generate_draft':
        return 'ai_proposal_draft';
      case 'expand':
        return 'ai_expansion';
      case 'improve_writing':
      case 'make_professional':
      case 'shorten':
      case 'explain_question':
      default:
        return 'ai_writing_improvement';
    }
  };

  const handleSelectAction = (action: AIAssistanceAction) => {
    setIsOpen(false);
    const featureKey = getFeatureKeyForAction(action);

    requireFeatureAccess(
      featureKey,
      async () => {
        setActiveModal(action);
        setErrorMessage(null);
        setResultData(null);
        setCustomPrompt('');

        // If it's a direct action and has content or is explain_question, trigger immediately
        if (action === 'explain_question' || (action !== 'generate_draft' && currentValue.trim().length > 0)) {
          await executeAIRequest(action, '');
        }
      },
      action === 'generate_draft' ? 'AI Proposal Draft Generation' : 'AI Writing & Tone Refinement',
      'Advanced proposal intelligence, narrative synthesis, and review rubric auditing.'
    );
  };

  const executeAIRequest = async (action: AIAssistanceAction, promptOverride?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    const payload: AIAssistRequestPayload = {
      action,
      fieldKey,
      fieldLabel,
      currentText: currentValue,
      userPrompt: promptOverride || customPrompt,
      opportunityContext: {
        id: opportunity.id,
        title: opportunity.title,
        organization: opportunity.organization,
        category: opportunity.category,
        targetAudience: opportunity.targetAudience,
        requirements: opportunity.requirements,
        eligibility: opportunity.eligibility,
      },
      applicantContext: {
        fullName: applicantName,
        country: applicantCountry,
        highestEducation: applicantEducation,
      },
      organizationContext: {
        orgName: organizationName,
        orgType: organizationType,
      },
    };

    const response = await requestAIAssistance(payload);
    setIsLoading(false);

    if (response.success && response.resultText) {
      setResultData(response);
      if (onRecordGeneratedContent) {
        onRecordGeneratedContent({
          action,
          generatedText: response.resultText,
          originalText: currentValue,
        });
      }
    } else {
      setErrorMessage(response.error || 'Failed to generate assistance. Please try again.');
    }
  };

  const handleCopy = () => {
    if (!resultData?.resultText) return;
    navigator.clipboard.writeText(resultData.resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (mode: 'replace' | 'append') => {
    if (!resultData?.resultText) return;
    onApplyText(resultData.resultText, mode);
    setActiveModal(null);
    setResultData(null);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        id={`ai-assist-btn-${fieldKey}`}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-colors shadow-xs"
        title="AI Writing & Proposal Co-Pilot"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>AI Assistance</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {/* Action Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-72 origin-top-right rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 p-1.5 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="px-2.5 py-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Grant Proposal Co-Pilot
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                Assisting with: <span className="text-indigo-600 dark:text-indigo-400">{fieldLabel}</span>
              </p>
            </div>

            <div className="py-1">
              {AI_ASSISTANCE_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  id={`ai-action-${action.id}-${fieldKey}`}
                  onClick={() => handleSelectAction(action.id)}
                  className="w-full flex items-start gap-2.5 px-2.5 py-2 text-left rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
                >
                  <div className="mt-0.5 p-1 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-2xs">
                    {getActionIcon(action.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="px-2.5 py-1.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-lg">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Factual grounding: FundEcho AI strictly refines your inputs without fabricating metrics or awards.
              </p>
            </div>
          </div>
        </>
      )}

      {/* AI Assistant Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  {getActionIcon(activeModal)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {AI_ASSISTANCE_ACTIONS.find((a) => a.id === activeModal)?.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    For field: <span className="font-semibold text-slate-700 dark:text-slate-300">{fieldLabel}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                id={`close-ai-modal-${fieldKey}`}
                onClick={() => {
                  setActiveModal(null);
                  setResultData(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Optional Custom Notes Input for Generate Draft / Refinement */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Additional Notes or Instructions for AI (Optional):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id={`ai-custom-prompt-${fieldKey}`}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={
                      AI_ASSISTANCE_ACTIONS.find((a) => a.id === activeModal)?.promptPlaceholder ||
                      'e.g. Focus on climate resilience and local job creation...'
                    }
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        executeAIRequest(activeModal, customPrompt);
                      }
                    }}
                  />
                  <button
                    type="button"
                    id={`ai-run-prompt-${fieldKey}`}
                    disabled={isLoading}
                    onClick={() => executeAIRequest(activeModal, customPrompt)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>AI Service Notification</span>
                  </div>
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Crafting Proposal Suggestion...
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      Aligning with opportunity criteria for {opportunity.organization} while safeguarding factual integrity.
                    </p>
                  </div>
                </div>
              )}

              {/* Generated Result Display */}
              {resultData && !isLoading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3.5 h-3.5" />
                      AI-Assisted Draft (Please Review)
                    </span>
                    <button
                      type="button"
                      id={`copy-ai-result-${fieldKey}`}
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {resultData.resultText}
                  </div>

                  {/* Anti-Hallucination Disclaimer */}
                  <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">Important:</span> Review all placeholders such as <code className="px-1 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/70 text-indigo-800 dark:text-indigo-200">[Insert metric]</code> and confirm all facts match your authentic project before submitting.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {resultData && !isLoading && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  id={`discard-ai-result-${fieldKey}`}
                  onClick={() => {
                    setActiveModal(null);
                    setResultData(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Discard
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id={`append-ai-result-${fieldKey}`}
                    onClick={() => handleApply('append')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Insert Below Existing Text
                  </button>
                  <button
                    type="button"
                    id={`replace-ai-result-${fieldKey}`}
                    onClick={() => handleApply('replace')}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                  >
                    Accept & Replace Field Text
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
