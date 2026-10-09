import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  Clock,
  FileText,
  AlertCircle,
  Sparkles,
  Eye,
  CheckCircle2,
  FolderOpen,
  HelpCircle,
  Lock,
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { Opportunity, UserProfile } from '../types';
import {
  ApplicationDraft,
  ApplicationStepId,
} from '../types/application';
import {
  APPLICATION_STEPS_CONFIG,
  createDefaultApplicationDraft,
  loadApplicationDraft,
  saveApplicationDraft,
  validateFullApplication,
} from '../utils/applicationStorage';
import {
  FirestoreApplication,
  ApplicationTrackerStatus,
  ApplicationRequirement,
  ApplicationDocument,
  ApplicationResponse,
} from '../types/firebase';
import {
  startApplication,
  updateApplicationRequirements,
  updateApplicationDocuments,
  updateApplicationResponses,
  updateApplicationNotes,
  updateApplicationStatus,
  calculateApplicationReadiness,
  generateInitialRequirements,
  generateInitialDocuments,
  generateInitialResponses,
} from '../services/firebase/applicationService';
import { useAuth } from '../context/AuthContext';
import { useMonetization } from '../context/MonetizationContext';

// Workspace sub-tabs
import { WorkspaceOverviewTab } from '../components/workspace/WorkspaceOverviewTab';
import { WorkspaceRequirementsTab } from '../components/workspace/WorkspaceRequirementsTab';
import { WorkspaceDocumentsTab } from '../components/workspace/WorkspaceDocumentsTab';
import { WorkspaceResponsesTab } from '../components/workspace/WorkspaceResponsesTab';
import { WorkspaceNotesTab } from '../components/workspace/WorkspaceNotesTab';

// Wizard step components (preserved for deep narrative drafting)
import { ApplicationProgressIndicator } from '../components/application/ApplicationProgressIndicator';
import { OpportunitySummaryStep } from '../components/application/steps/OpportunitySummaryStep';
import { ApplicantInfoStep } from '../components/application/steps/ApplicantInfoStep';
import { OrganizationInfoStep } from '../components/application/steps/OrganizationInfoStep';
import { FundingRequestStep } from '../components/application/steps/FundingRequestStep';
import { ProblemStatementStep } from '../components/application/steps/ProblemStatementStep';
import { ProposedSolutionStep } from '../components/application/steps/ProposedSolutionStep';
import { GoalsImpactStep } from '../components/application/steps/GoalsImpactStep';
import { TargetBeneficiariesStep } from '../components/application/steps/TargetBeneficiariesStep';
import { BudgetStep } from '../components/application/steps/BudgetStep';
import { TimelineStep } from '../components/application/steps/TimelineStep';
import { AdditionalQuestionsStep } from '../components/application/steps/AdditionalQuestionsStep';
import { FinalReviewStep } from '../components/application/steps/FinalReviewStep';

import { AffiliateRecommendationSection } from '../components/affiliate/AffiliateRecommendationSection';
import { DeadlineReminderModal } from '../components/deadlines/DeadlineReminderModal';

export type WorkspaceTabId = 'overview' | 'requirements' | 'documents' | 'responses' | 'notes';

interface ApplicationWorkspacePageProps {
  opportunity: Opportunity;
  userProfile?: UserProfile | null;
  onBackToOpportunity: () => void;
}

export const ApplicationWorkspacePage: React.FC<ApplicationWorkspacePageProps> = ({
  opportunity,
  userProfile,
  onBackToOpportunity,
}) => {
  const { user: authUser } = useAuth();
  const { isPremium } = useMonetization();

  // Active view: either workspace tabs or the multi-step proposal wizard
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('overview');
  const [viewMode, setViewMode] = useState<'workspace' | 'wizard'>('workspace');

  // Modal states
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Firestore Application record state
  const [firestoreApp, setFirestoreApp] = useState<FirestoreApplication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Multi-step draft state (preserved for backwards compatibility and export)
  const [draft, setDraft] = useState<ApplicationDraft>(() => {
    const existing = loadApplicationDraft(opportunity.id);
    if (existing) return existing;
    return createDefaultApplicationDraft(opportunity, userProfile);
  });

  const activeUserId = authUser?.id || userProfile?.id || 'guest-applicant';

  // Initialize or retrieve the Firestore Application record
  useEffect(() => {
    let isMounted = true;

    async function initWorkspace() {
      try {
        const { application } = await startApplication(activeUserId, {
          id: opportunity.id,
          title: opportunity.title,
          provider: opportunity.provider || opportunity.organization,
          deadline: opportunity.deadline,
        });

        if (isMounted && application) {
          // Ensure arrays are initialized
          const reqs = application.requirements?.length
            ? application.requirements
            : generateInitialRequirements(opportunity);
          const docs = application.documents?.length
            ? application.documents
            : generateInitialDocuments(opportunity).map((d) => ({
                ...d,
                userId: activeUserId,
                applicationId: application.id,
              }));
          const resps = application.responses?.length
            ? application.responses
            : generateInitialResponses(opportunity);

          setFirestoreApp({
            ...application,
            requirements: reqs,
            documents: docs,
            responses: resps,
          });
        }
      } catch (err) {
        console.warn('[ApplicationWorkspacePage] Error initializing Firestore application:', err);
      }
    }

    initWorkspace();

    return () => {
      isMounted = false;
    };
  }, [activeUserId, opportunity]);

  // Derived readiness score
  const readiness = useMemo(() => {
    return calculateApplicationReadiness(
      firestoreApp?.requirements,
      firestoreApp?.documents,
      firestoreApp?.responses
    );
  }, [firestoreApp?.requirements, firestoreApp?.documents, firestoreApp?.responses]);

  // Trigger feedback banner
  const triggerSaveNotification = useCallback(() => {
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  }, []);

  // Update handlers with optimistic state + background Firestore persistence
  const handleUpdateRequirements = useCallback(
    async (newReqs: ApplicationRequirement[]) => {
      if (!firestoreApp) return;
      setFirestoreApp((prev) => (prev ? { ...prev, requirements: newReqs } : prev));
      setIsSaving(true);
      try {
        await updateApplicationRequirements(
          firestoreApp.id,
          newReqs,
          activeUserId,
          firestoreApp.documents,
          firestoreApp.responses
        );
        triggerSaveNotification();
      } catch (err) {
        console.error('Failed to persist requirements:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [firestoreApp, activeUserId, triggerSaveNotification]
  );

  const handleUpdateDocuments = useCallback(
    async (newDocs: ApplicationDocument[]) => {
      if (!firestoreApp) return;
      setFirestoreApp((prev) => (prev ? { ...prev, documents: newDocs } : prev));
      setIsSaving(true);
      try {
        await updateApplicationDocuments(
          firestoreApp.id,
          newDocs,
          activeUserId,
          firestoreApp.requirements,
          firestoreApp.responses
        );
        triggerSaveNotification();
      } catch (err) {
        console.error('Failed to persist documents:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [firestoreApp, activeUserId, triggerSaveNotification]
  );

  const handleUpdateResponses = useCallback(
    async (newResponses: ApplicationResponse[]) => {
      if (!firestoreApp) return;
      setFirestoreApp((prev) => (prev ? { ...prev, responses: newResponses } : prev));
      setIsSaving(true);
      try {
        await updateApplicationResponses(
          firestoreApp.id,
          newResponses,
          activeUserId,
          firestoreApp.requirements,
          firestoreApp.documents
        );
        triggerSaveNotification();
      } catch (err) {
        console.error('Failed to persist responses:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [firestoreApp, activeUserId, triggerSaveNotification]
  );

  const handleUpdateNotes = useCallback(
    async (newNotes: string) => {
      if (!firestoreApp) return;
      setFirestoreApp((prev) => (prev ? { ...prev, notes: newNotes } : prev));
      setIsSaving(true);
      try {
        await updateApplicationNotes(firestoreApp.id, newNotes, activeUserId);
        triggerSaveNotification();
      } catch (err) {
        console.error('Failed to persist notes:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [firestoreApp, activeUserId, triggerSaveNotification]
  );

  const handleUpdateStatus = useCallback(
    async (newStatus: ApplicationTrackerStatus) => {
      if (!firestoreApp) return;
      setFirestoreApp((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setIsSaving(true);
      try {
        await updateApplicationStatus(
          firestoreApp.id,
          newStatus,
          activeUserId
        );
        triggerSaveNotification();
      } catch (err) {
        console.error('Failed to persist status:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [firestoreApp, activeUserId, triggerSaveNotification]
  );

  // Proposal Wizard helpers (Step navigation)
  const currentStepIndex = APPLICATION_STEPS_CONFIG.findIndex((s) => s.id === draft.currentStepId);
  const currentStepConfig = APPLICATION_STEPS_CONFIG[currentStepIndex] || APPLICATION_STEPS_CONFIG[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === APPLICATION_STEPS_CONFIG.length - 1;

  const validation = validateFullApplication(draft, opportunity);
  const completedStepIds = new Set<ApplicationStepId>(validation.completedSteps);
  const incompleteStepIds = new Set<ApplicationStepId>(validation.incompleteSteps);

  const handleStepSelect = (stepId: ApplicationStepId) => {
    const updated = { ...draft, currentStepId: stepId };
    setDraft(updated);
    saveApplicationDraft(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep = () => {
    if (!isLastStep) {
      const nextStepConfig = APPLICATION_STEPS_CONFIG[currentStepIndex + 1];
      const updated = { ...draft, currentStepId: nextStepConfig.id };
      setDraft(updated);
      saveApplicationDraft(updated);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (!isFirstStep) {
      const prevStepConfig = APPLICATION_STEPS_CONFIG[currentStepIndex - 1];
      const updated = { ...draft, currentStepId: prevStepConfig.id };
      setDraft(updated);
      saveApplicationDraft(updated);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render active step component in wizard mode
  const renderWizardStepContent = () => {
    switch (draft.currentStepId) {
      case 'opportunity_summary':
        return (
          <OpportunitySummaryStep
            opportunity={opportunity}
            draft={draft}
            onContinue={handleNextStep}
          />
        );
      case 'applicant_info':
        return (
          <ApplicantInfoStep
            info={draft.applicantInfo}
            opportunity={opportunity}
            onChange={(updated) => {
              const newDraft = { ...draft, applicantInfo: updated };
              setDraft(newDraft);
            }}
          />
        );
      case 'organization_info':
        return (
          <OrganizationInfoStep
            info={draft.organizationInfo}
            opportunity={opportunity}
            onChange={(updated) => {
              const newDraft = { ...draft, organizationInfo: updated };
              setDraft(newDraft);
            }}
          />
        );
      case 'funding_request':
        return (
          <FundingRequestStep
            funding={draft.fundingRequest}
            opportunity={opportunity}
            onChange={(updated) => {
              const newDraft = { ...draft, fundingRequest: updated };
              setDraft(newDraft);
            }}
          />
        );
      case 'problem_statement':
        return (
          <ProblemStatementStep
            value={draft.problemStatement}
            opportunity={opportunity}
            applicantName={draft.applicantInfo.fullName}
            organizationName={draft.organizationInfo.orgName}
            onChange={(val) => {
              const newDraft = { ...draft, problemStatement: val };
              setDraft(newDraft);
            }}
          />
        );
      case 'proposed_solution':
        return (
          <ProposedSolutionStep
            value={draft.proposedSolution}
            opportunity={opportunity}
            applicantName={draft.applicantInfo.fullName}
            organizationName={draft.organizationInfo.orgName}
            onChange={(val) => {
              const newDraft = { ...draft, proposedSolution: val };
              setDraft(newDraft);
            }}
          />
        );
      case 'goals_impact':
        return (
          <GoalsImpactStep
            value={draft.goalsAndImpact}
            opportunity={opportunity}
            applicantName={draft.applicantInfo.fullName}
            organizationName={draft.organizationInfo.orgName}
            onChange={(val) => {
              const newDraft = { ...draft, goalsAndImpact: val };
              setDraft(newDraft);
            }}
          />
        );
      case 'target_beneficiaries':
        return (
          <TargetBeneficiariesStep
            value={draft.targetBeneficiaries}
            opportunity={opportunity}
            applicantName={draft.applicantInfo.fullName}
            organizationName={draft.organizationInfo.orgName}
            onChange={(val) => {
              const newDraft = { ...draft, targetBeneficiaries: val };
              setDraft(newDraft);
            }}
          />
        );
      case 'budget':
        return (
          <BudgetStep
            budgetItems={draft.budgetItems}
            currency={draft.opportunityCurrency || '$'}
            requestedAmount={draft.fundingRequest.requestedAmount}
            opportunity={opportunity}
            onChange={(items) => {
              const newDraft = { ...draft, budgetItems: items };
              setDraft(newDraft);
            }}
          />
        );
      case 'timeline':
        return (
          <TimelineStep
            milestones={draft.timelineMilestones}
            opportunity={opportunity}
            onChange={(items) => {
              const newDraft = { ...draft, timelineMilestones: items };
              setDraft(newDraft);
            }}
          />
        );
      case 'additional_questions':
        return (
          <AdditionalQuestionsStep
            questions={draft.additionalQuestions}
            opportunity={opportunity}
            applicantName={draft.applicantInfo.fullName}
            organizationName={draft.organizationInfo.orgName}
            onChange={(updated) => {
              const newDraft = { ...draft, additionalQuestions: updated };
              setDraft(newDraft);
            }}
          />
        );
      case 'final_review':
        return (
          <FinalReviewStep
            draft={draft}
            opportunity={opportunity}
            onSelectStep={handleStepSelect}
            onSave={() => {
              saveApplicationDraft(draft);
              triggerSaveNotification();
            }}
          />
        );
      default:
        return null;
    }
  };

  const affiliateContext = useMemo(() => {
    return {
      opportunityCategory: opportunity.category,
      country: userProfile?.country,
      applicantType: userProfile?.userType || 'Individual / Startup',
      currency: opportunity.currency || '$',
    };
  }, [opportunity, userProfile]);

  return (
    <div id="application-workspace-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="workspace-back-btn"
              onClick={onBackToOpportunity}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Return to Opportunity"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Workspace
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500 truncate max-w-[140px] sm:max-w-[200px]">
                  {opportunity.provider || opportunity.organization}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {opportunity.title}
              </h1>
            </div>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Readiness Chip */}
            <div
              id="workspace-header-readiness-chip"
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>{readiness.score}% Ready</span>
            </div>

            {/* Save notice */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
              {isSaving ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                  Saving...
                </span>
              ) : saveSuccessNotice ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              ) : (
                <span>Saved {lastSavedTime}</span>
              )}
            </div>

            {/* View Mode Toggle: Workspace vs Proposal Wizard */}
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 border border-slate-200/60 dark:border-slate-700/60">
              <button
                id="mode-toggle-workspace"
                onClick={() => setViewMode('workspace')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  viewMode === 'workspace'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Workspace
              </button>
              <button
                id="mode-toggle-wizard"
                onClick={() => setViewMode('wizard')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  viewMode === 'wizard'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Full Proposal Draft
              </button>
            </div>
          </div>
        </div>

        {/* Primary Workspace Navigation Tabs (Visible when in Workspace mode) */}
        {viewMode === 'workspace' && (
          <div className="border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
              <button
                id="workspace-tab-overview"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </button>

              <button
                id="workspace-tab-requirements"
                onClick={() => setActiveTab('requirements')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'requirements'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Requirements
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {readiness.checklistCompleted}/{readiness.checklistTotal}
                </span>
              </button>

              <button
                id="workspace-tab-documents"
                onClick={() => setActiveTab('documents')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'documents'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Documents
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {readiness.documentsReadyOrUploaded}/{readiness.documentsTotal}
                </span>
              </button>

              <button
                id="workspace-tab-responses"
                onClick={() => setActiveTab('responses')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'responses'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                Responses
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {readiness.responsesAnswered}/{readiness.responsesTotal}
                </span>
              </button>

              <button
                id="workspace-tab-notes"
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'notes'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Lock className="w-4 h-4" />
                Private Notes
                {firestoreApp?.notes && firestoreApp.notes.trim() && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {viewMode === 'workspace' ? (
          <div>
            {activeTab === 'overview' && firestoreApp && (
              <WorkspaceOverviewTab
                application={firestoreApp}
                opportunity={opportunity}
                readiness={readiness}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onUpdateStatus={handleUpdateStatus}
                onOpenDeadlineReminder={() => setIsReminderModalOpen(true)}
                onOpenWizard={() => setViewMode('wizard')}
              />
            )}

            {activeTab === 'requirements' && (
              <WorkspaceRequirementsTab
                requirements={firestoreApp?.requirements || []}
                onUpdateRequirements={handleUpdateRequirements}
                isSaving={isSaving}
              />
            )}

            {activeTab === 'documents' && firestoreApp && (
              <WorkspaceDocumentsTab
                applicationId={firestoreApp.id}
                userId={activeUserId}
                documents={firestoreApp.documents || []}
                onUpdateDocuments={handleUpdateDocuments}
                isSaving={isSaving}
              />
            )}

            {activeTab === 'responses' && (
              <WorkspaceResponsesTab
                responses={firestoreApp?.responses || []}
                onUpdateResponses={handleUpdateResponses}
                isSaving={isSaving}
              />
            )}

            {activeTab === 'notes' && firestoreApp && (
              <WorkspaceNotesTab
                notes={firestoreApp.notes || ''}
                onUpdateNotes={handleUpdateNotes}
                isSaving={isSaving}
              />
            )}
          </div>
        ) : (
          /* Multi-Step Proposal Wizard Mode */
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  You are in <strong>Full Proposal Draft Mode</strong> (12-section standardized grant narrative generator).
                </span>
              </div>
              <button
                onClick={() => setViewMode('workspace')}
                className="shrink-0 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 shadow-xs"
              >
                Return to Workspace Tabs
              </button>
            </div>

            {/* Stepper Header */}
            <ApplicationProgressIndicator
              steps={APPLICATION_STEPS_CONFIG}
              currentStepId={draft.currentStepId}
              completedSteps={completedStepIds}
              incompleteSteps={incompleteStepIds}
              onSelectStep={handleStepSelect}
            />

            {/* Step Body */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
              {renderWizardStepContent()}
            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-4">
              <button
                id="wizard-prev-step-btn"
                onClick={handlePrevStep}
                disabled={isFirstStep}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  isFirstStep
                    ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>

              <div className="text-xs text-slate-400">
                Step {currentStepIndex + 1} of {APPLICATION_STEPS_CONFIG.length}
              </div>

              <button
                id="wizard-next-step-btn"
                onClick={handleNextStep}
                disabled={isLastStep}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLastStep
                    ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Affiliate Recommended Partner Tools */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800">
          <AffiliateRecommendationSection userContext={affiliateContext} />
        </div>
      </main>

      {/* Deadline Reminder Modal */}
      <DeadlineReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        opportunity={opportunity}
      />
    </div>
  );
};
