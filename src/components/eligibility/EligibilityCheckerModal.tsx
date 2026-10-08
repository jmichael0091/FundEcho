import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Building2,
  Lock,
  Compass
} from 'lucide-react';
import { 
  Opportunity, 
  UserProfile, 
  UserEligibilityAnswers, 
  EligibilityAssessmentResult,
  RequirementCheckResult,
  PageId
} from '../../types';
import { 
  evaluateEligibility, 
  generateDynamicQuestions, 
  DynamicEligibilityQuestionItem,
  saveEligibilityAssessment
} from '../../utils/eligibilityEngine';
import { getCurrentUser } from '../../utils/auth';
import { useMonetization } from '../../context/MonetizationContext';
import { FeatureGate } from '../monetization/FeatureGate';

export interface EligibilityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  initialAssessment?: EligibilityAssessmentResult | null;
  onAssessmentCompleted?: (result: EligibilityAssessmentResult) => void;
  onNavigate: (page: PageId) => void;
}

export const EligibilityCheckerModal: React.FC<EligibilityCheckerModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  initialAssessment,
  onAssessmentCompleted,
  onNavigate,
}) => {
  const user = getCurrentUser();
  const [questions, setQuestions] = useState<DynamicEligibilityQuestionItem[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<UserEligibilityAnswers>({
    customAnswers: {},
  });
  const [assessmentResult, setAssessmentResult] = useState<EligibilityAssessmentResult | null>(initialAssessment || null);
  const [showRequirementBreakdown, setShowRequirementBreakdown] = useState<boolean>(true);
  const [hasPrefilledFromProfile, setHasPrefilledFromProfile] = useState<boolean>(false);

  // Initialize questions and initial answers when modal opens or opportunity changes
  useEffect(() => {
    if (isOpen) {
      const dynamicQs = generateDynamicQuestions(opportunity.eligibilityCriteria, opportunity, user);
      setQuestions(dynamicQs);

      if (initialAssessment && initialAssessment.opportunityId === opportunity.id) {
        setAssessmentResult(initialAssessment);
        setAnswers(initialAssessment.userAnswers);
      } else {
        // Pre-fill answers from user profile if logged in
        const prefilled: UserEligibilityAnswers = {
          country: user?.country || 'Nigeria',
          age: user?.age || 26,
          applicantType: user?.applicantType || 'Individual Innovator / Professional',
          educationLevel: user?.educationLevel || 'bachelors',
          experienceYears: user?.yearsOfExperience || 4,
          customAnswers: {},
        };

        // Prepopulate custom questions defaults
        dynamicQs.forEach((q) => {
          if (q.field === 'custom' && q.customQuestionId) {
            prefilled.customAnswers![q.customQuestionId] = q.defaultValue !== undefined ? q.defaultValue : true;
          }
        });

        setAnswers(prefilled);
        setHasPrefilledFromProfile(Boolean(user));
        setAssessmentResult(null);
        setCurrentStep(0);
      }
    }
  }, [isOpen, opportunity.id, user?.id]);

  if (!isOpen) return null;

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const progressPercent = questions.length > 0 ? Math.round(((currentStep + 1) / questions.length) * 100) : 100;

  // Handle single question change
  const handleAnswerChange = (field: keyof UserEligibilityAnswers | 'custom', value: any, customId?: string) => {
    setAnswers((prev) => {
      if (field === 'custom' && customId) {
        return {
          ...prev,
          customAnswers: {
            ...prev.customAnswers,
            [customId]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Complete Assessment
      runEvaluation();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, questions.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const runEvaluation = () => {
    const result = evaluateEligibility(answers, opportunity.eligibilityCriteria, opportunity);
    setAssessmentResult(result);
    saveEligibilityAssessment(result);
    if (onAssessmentCompleted) {
      onAssessmentCompleted(result);
    }
  };

  const handleRetake = () => {
    setAssessmentResult(null);
    setCurrentStep(0);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eligibility-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Step 7 • Rules-Based Eligibility Engine
              </span>
              {hasPrefilledFromProfile && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3" />
                  Pre-filled from Profile
                </span>
              )}
            </div>
            <h2 id="eligibility-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {assessmentResult ? 'Eligibility Assessment Result' : 'Check Eligibility Questionnaire'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-lg">
              {opportunity.title} • {opportunity.organization}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!assessmentResult ? (
            /* QUESTIONNAIRE FLOW */
            <div className="space-y-6">
              {/* Progress Bar & Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Question {currentStep + 1} of {questions.length}</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Active Question Box */}
              {currentQuestion && (
                <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {currentQuestion.title}
                    </h3>
                    {currentQuestion.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {currentQuestion.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Input Rendering based on Question Type */}
                  <div className="pt-2">
                    {/* Boolean Yes/No Selection */}
                    {currentQuestion.type === 'boolean' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(currentQuestion.field, true, currentQuestion.customQuestionId)}
                          className={`p-4 rounded-xl border text-left font-semibold transition-all flex items-center justify-between ${
                            (currentQuestion.field === 'custom'
                              ? answers.customAnswers?.[currentQuestion.customQuestionId!] === true
                              : (answers as any)[currentQuestion.field] === true)
                              ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              (currentQuestion.field === 'custom'
                                ? answers.customAnswers?.[currentQuestion.customQuestionId!] === true
                                : (answers as any)[currentQuestion.field] === true)
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-400'
                            }`}>
                              {(currentQuestion.field === 'custom'
                                ? answers.customAnswers?.[currentQuestion.customQuestionId!] === true
                                : (answers as any)[currentQuestion.field] === true) && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </span>
                            <span>Yes, I satisfy this criterion</span>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAnswerChange(currentQuestion.field, false, currentQuestion.customQuestionId)}
                          className={`p-4 rounded-xl border text-left font-semibold transition-all flex items-center justify-between ${
                            (currentQuestion.field === 'custom'
                              ? answers.customAnswers?.[currentQuestion.customQuestionId!] === false
                              : (answers as any)[currentQuestion.field] === false)
                              ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 dark:border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              (currentQuestion.field === 'custom'
                                ? answers.customAnswers?.[currentQuestion.customQuestionId!] === false
                                : (answers as any)[currentQuestion.field] === false)
                                ? 'border-amber-600 bg-amber-600 text-white'
                                : 'border-slate-400'
                            }`}>
                              {(currentQuestion.field === 'custom'
                                ? answers.customAnswers?.[currentQuestion.customQuestionId!] === false
                                : (answers as any)[currentQuestion.field] === false) && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </span>
                            <span>No / Not at this time</span>
                          </div>
                          <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        </button>
                      </div>
                    )}

                    {/* Select Dropdown / Option Cards */}
                    {currentQuestion.type === 'select' && currentQuestion.options && (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {currentQuestion.options.map((opt) => {
                          const isSelected = currentQuestion.field === 'custom'
                            ? answers.customAnswers?.[currentQuestion.customQuestionId!] === opt.value
                            : (answers as any)[currentQuestion.field] === opt.value;

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleAnswerChange(currentQuestion.field, opt.value, currentQuestion.customQuestionId)}
                              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                                isSelected
                                  ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-sm">{opt.label}</p>
                                {opt.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</p>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Number Input (e.g. Age, Years of Experience) */}
                    {currentQuestion.type === 'number' && (
                      <div className="space-y-2">
                        <div className="relative max-w-xs">
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={(answers as any)[currentQuestion.field] || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.field, e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder={currentQuestion.placeholder || 'Enter value'}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                          />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Values entered are used strictly for local evaluation and are not transmitted externally.
                        </p>
                      </div>
                    )}

                    {/* Text Input */}
                    {currentQuestion.type === 'text' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={(answers as any)[currentQuestion.field] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.field, e.target.value)}
                          placeholder={currentQuestion.placeholder || 'Enter details'}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Engine Architecture Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Rules-Based Evaluation:</strong> This checker matches your answers strictly against verified opportunity criteria. Questions are dynamically tailored to this specific program.
                </span>
              </div>
            </div>
          ) : (
            /* RESULTS SCREEN */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Overall Status Banner */}
              <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${
                assessmentResult.overallStatus === 'likely_eligible'
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : assessmentResult.overallStatus === 'possibly_eligible'
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                  : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    assessmentResult.overallStatus === 'likely_eligible'
                      ? 'bg-emerald-600 text-white'
                      : assessmentResult.overallStatus === 'possibly_eligible'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {assessmentResult.overallStatus === 'likely_eligible' && <CheckCircle2 className="w-8 h-8" />}
                    {assessmentResult.overallStatus === 'possibly_eligible' && <AlertTriangle className="w-8 h-8" />}
                    {assessmentResult.overallStatus === 'likely_not_eligible' && <XCircle className="w-8 h-8" />}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase font-extrabold tracking-wider opacity-80">
                      Assessment Result
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                      {assessmentResult.headline}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90 leading-relaxed max-w-xl">
                      {assessmentResult.summary}
                    </p>
                  </div>
                </div>

                {/* Score Chip */}
                <div className="shrink-0 bg-white/80 dark:bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-current/20 text-center">
                  <span className="text-xs font-semibold block opacity-70">Met Criteria</span>
                  <span className="text-xl font-black">{assessmentResult.metCount} / {assessmentResult.totalCount}</span>
                </div>
              </div>

              {/* Requirement Breakdown Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setShowRequirementBreakdown(!showRequirementBreakdown)}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Detailed Requirement Breakdown ({assessmentResult.requirementResults.length} Items)
                  </span>
                  {showRequirementBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showRequirementBreakdown && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2 sm:p-4 space-y-3">
                    {assessmentResult.requirementResults.map((req, idx) => (
                      <div key={idx} className="pt-3 first:pt-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 shrink-0">
                              {req.status === 'met' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                              {req.status === 'needs_review' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                              {req.status === 'failed' && <XCircle className="w-4 h-4 text-rose-500" />}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {req.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Required: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.requirementDisplay}</span>
                              </p>
                            </div>
                          </div>

                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            req.status === 'met'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : req.status === 'needs_review'
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          }`}>
                            {req.status === 'met' ? 'Requirement Met' : req.status === 'needs_review' ? 'Needs Review' : 'Did Not Meet'}
                          </span>
                        </div>

                        {/* Explanation */}
                        <div className="pl-7 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                          <p>{req.explanation}</p>
                          {req.userValueDisplay && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                              Your input: <span className="font-medium text-slate-600 dark:text-slate-300">{req.userValueDisplay}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 17: Detailed Rubric Breakdown & Funder Strategic Preference Analysis (Gated) */}
              <FeatureGate
                featureKey="advanced_eligibility_analysis"
                title="Deep Rubric & Funder Preference Audit"
                description="Unlock detailed institutional evaluation weights, unstated reviewer preferences, and competitive improvement suggestions."
                requiredCredits={5}
                onNavigateToPricing={() => {
                  onClose();
                  onNavigate('pricing');
                }}
                onNavigateToCredits={() => {
                  onClose();
                  onNavigate('credits');
                }}
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Advanced Evaluator Rubric & Funder Insight
                      </h4>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Premium Analysis
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Based on historical awards from <strong>{opportunity.organization}</strong> and institutional review rubrics in <strong>{opportunity.category}</strong>:
                  </p>

                  {/* Rubric Criteria Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>1. Problem Urgency & Scope</span>
                        <span className="text-indigo-600 dark:text-indigo-400">25% Weight</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Reviewers prioritize localized impact data and verified evidence of community need.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>2. Execution Capability & Team</span>
                        <span className="text-indigo-600 dark:text-indigo-400">30% Weight</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Evaluators favor multidisciplinary teams with established field presence and previous milestone delivery.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>3. Strategic Mission Fit</span>
                        <span className="text-indigo-600 dark:text-indigo-400">25% Weight</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Direct alignment with {opportunity.organization}&apos;s annual funding themes and cross-cutting sustainability goals.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>4. Budget Feasibility & ROI</span>
                        <span className="text-indigo-600 dark:text-indigo-400">20% Weight</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Realistic direct costs without excessive administrative overhead. Co-financing or in-kind support scores higher.
                      </p>
                    </div>
                  </div>

                  {/* Funder Unstated Priorities & Improvement Tips */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 space-y-2 text-xs">
                    <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Actionable Recommendations to Strengthen Your Standing</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-amber-800 dark:text-amber-300 list-disc pl-5">
                      <li>Highlight measurable KPIs rather than aspirational goals in your project proposal.</li>
                      <li>Explicitly reference previous beneficiaries or pilot results to satisfy feasibility thresholds.</li>
                      <li>Ensure your requested amount aligns with {typeof opportunity.amount === 'object' && opportunity.amount ? (opportunity.amount.displayText || (opportunity.amount.max ? `$${opportunity.amount.max.toLocaleString()}` : 'the stated award range')) : (opportunity.amount || 'the stated award range')} and is itemized.</li>
                    </ul>
                  </div>

                  <div className="text-[10px] text-slate-400 italic">
                    * Monetization Neutrality: Advanced rubric insights are educational tools derived from public funder guidelines. They do not alter algorithm scoring or guarantee funding decisions.
                  </div>
                </div>
              </FeatureGate>

              {/* Recommended Next Action Box */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Recommended Next Action
                </div>

                {assessmentResult.overallStatus === 'likely_eligible' && (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
                      Your profile and answers satisfy all evaluated requirements. We strongly recommend preparing your proposal and submitting directly to the official provider portal before the deadline.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      <button
                        type="button"
                        id="modal-start-workspace-btn"
                        onClick={() => {
                          onClose();
                          onNavigate('application-workspace');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-200" />
                        <span>Start Application in Workspace</span>
                      </button>

                      <a
                        href={opportunity.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>Official External Link</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {assessmentResult.overallStatus === 'possibly_eligible' && (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
                      You meet core requirements, but certain opportunity-specific items require additional confirmation or host documentation. Review the provider’s guidelines before submission.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      <a
                        href={opportunity.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
                      >
                        <span>Review Provider Guidelines</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigate('opportunities');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>Explore Alternative Opportunities</span>
                      </button>
                    </div>
                  </div>
                )}

                {assessmentResult.overallStatus === 'likely_not_eligible' && (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
                      Based on criteria thresholds, this opportunity may not be the optimal fit for your current background. Explore similar opportunities in our directory tailored to your profile.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigate('opportunities');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
                      >
                        <span>Explore Similar Opportunities</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mandatory Official Disclaimer */}
              <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Important Legal & Assessment Disclaimer</span>
                </div>
                <p className="leading-relaxed">
                  {assessmentResult.disclaimer}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  FundEcho does not guarantee approval or grant decisions. Official awards are solely at the discretion of {opportunity.organization}.
                </p>
              </div>

              {/* Not Logged In Prompt */}
              {!user && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Save your eligibility checks across sessions
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Sign in to store your assessment results and auto-fill future questionnaires.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('login');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-2xs transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 flex items-center justify-between gap-3">
          {!assessmentResult ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${
                  currentStep === 0
                    ? 'border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-600 cursor-not-allowed'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>{isLastQuestion ? 'Evaluate Eligibility' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Retake Check</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm transition-colors shadow-2xs"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
