import { 
  ApplicationDraft, 
  ApplicationStepId, 
  ApplicationStepConfig,
  SectionValidationResult,
  ApplicationCompletionStatus,
  BudgetItem,
  TimelineMilestone
} from '../types/application';
import { Opportunity, UserProfile } from '../types';
import { calculateTotalBudget, formatCurrencyDisplay } from './budgetCalculations';

const STORAGE_KEY = 'fundora_application_drafts';

export const APPLICATION_STEPS_CONFIG: ApplicationStepConfig[] = [
  {
    id: 'opportunity_summary',
    stepNumber: 1,
    title: 'Opportunity Summary',
    shortTitle: 'Summary',
    description: 'Review guidelines, key dates, award amount, and eligibility constraints.',
    isRequired: true,
  },
  {
    id: 'applicant_info',
    stepNumber: 2,
    title: 'Applicant Information',
    shortTitle: 'Applicant',
    description: 'Lead applicant profile, contact details, and professional background.',
    isRequired: true,
  },
  {
    id: 'organization_info',
    stepNumber: 3,
    title: 'Organization / Business Information',
    shortTitle: 'Organization',
    description: 'Entity registration, team size, structure, and operational status.',
    isRequired: false,
  },
  {
    id: 'funding_request',
    stepNumber: 4,
    title: 'Funding Request & Duration',
    shortTitle: 'Request',
    description: 'Requested grant amount, target project duration, and expense focus.',
    isRequired: true,
  },
  {
    id: 'problem_statement',
    stepNumber: 5,
    title: 'Problem / Need Statement',
    shortTitle: 'Problem',
    description: 'Explain the critical challenge, community urgency, or market gap being addressed.',
    isRequired: true,
  },
  {
    id: 'proposed_solution',
    stepNumber: 6,
    title: 'Proposed Solution & Project Approach',
    shortTitle: 'Solution',
    description: 'Detail your innovation, execution methodology, and operational workflow.',
    isRequired: true,
  },
  {
    id: 'goals_impact',
    stepNumber: 7,
    title: 'Goals & Expected Impact',
    shortTitle: 'Impact',
    description: 'Define clear objectives, key performance indicators, and tangible outcomes.',
    isRequired: true,
  },
  {
    id: 'target_beneficiaries',
    stepNumber: 8,
    title: 'Target Beneficiaries & Community',
    shortTitle: 'Beneficiaries',
    description: 'Describe direct and indirect stakeholders and community inclusion strategy.',
    isRequired: true,
  },
  {
    id: 'budget',
    stepNumber: 9,
    title: 'Budget & Cost Breakdown',
    shortTitle: 'Budget',
    description: 'Build an itemized table of personnel, operational, and equipment expenses.',
    isRequired: true,
  },
  {
    id: 'timeline',
    stepNumber: 10,
    title: 'Timeline & Project Milestones',
    shortTitle: 'Timeline',
    description: 'Set phased roadmap milestones, target completion windows, and deliverables.',
    isRequired: true,
  },
  {
    id: 'additional_questions',
    stepNumber: 11,
    title: 'Additional Evaluator Questions',
    shortTitle: 'Questions',
    description: 'Sustainability plan, risk mitigation, and team competencies.',
    isRequired: false,
  },
  {
    id: 'final_review',
    stepNumber: 12,
    title: 'Final Review & Preparation',
    shortTitle: 'Review',
    description: 'Audit completeness, inspect section draft texts, and finalize proposal.',
    isRequired: true,
  },
];

/**
 * Creates an initial application draft for an opportunity, pre-populating with user profile details if present.
 */
export function createDefaultApplicationDraft(
  opportunity: Opportunity,
  user?: UserProfile | null
): ApplicationDraft {
  const now = new Date().toISOString();
  const draftId = `app-${opportunity.id}-${user?.id || 'guest'}-${Date.now().toString(36)}`;

  const defaultBudgetItems: BudgetItem[] = [
    {
      id: `budget-1`,
      category: 'Personnel & Salaries',
      description: 'Lead Project Coordinator & Technical Specialist (12 months)',
      quantity: 1,
      unitCost: opportunity.amount.max > 0 ? Math.round(opportunity.amount.max * 0.4) : 12000,
      total: opportunity.amount.max > 0 ? Math.round(opportunity.amount.max * 0.4) : 12000,
      justification: 'Primary project leadership and oversight',
    },
    {
      id: `budget-2`,
      category: 'Equipment & Technology',
      description: 'Computing hardware, field equipment, and data infrastructure',
      quantity: 1,
      unitCost: opportunity.amount.max > 0 ? Math.round(opportunity.amount.max * 0.25) : 6000,
      total: opportunity.amount.max > 0 ? Math.round(opportunity.amount.max * 0.25) : 6000,
      justification: 'Critical tools required for project execution',
    },
    {
      id: `budget-3`,
      category: 'Operational & Logistics',
      description: 'Fieldwork operations, community workshops, and materials',
      quantity: 1,
      unitCost: opportunity.amount.max > 0 ? Math.round(opportunity.amount.max * 0.2) : 5000,
      total: opportunity.amount.max > 0 ? Math.round(opportunity.amount.max * 0.2) : 5000,
      justification: 'Direct community deployment expenses',
    },
  ];

  const defaultMilestones: TimelineMilestone[] = [
    {
      id: `milestone-1`,
      phaseNumber: 1,
      title: 'Project Inception & Baseline Stakeholder Alignment',
      timeframe: 'Months 1–2',
      keyActivities: 'Conduct initial stakeholder kickoff, finalize research instrumentation, and establish project governance protocols.',
      expectedDeliverables: 'Inception report, partner agreement frameworks, and stakeholder baseline dataset.',
      targetCompletionDate: 'Month 2',
    },
    {
      id: `milestone-2`,
      phaseNumber: 2,
      title: 'Core Implementation & Solution Deployment',
      timeframe: 'Months 3–8',
      keyActivities: 'Execute primary project activities, roll out technological tools, and deliver community workshops.',
      expectedDeliverables: 'Operational solution prototype, 500+ participant training logs, and interim progress monitoring report.',
      targetCompletionDate: 'Month 8',
    },
    {
      id: `milestone-3`,
      phaseNumber: 3,
      title: 'Impact Evaluation & Project Closeout',
      timeframe: 'Months 9–12',
      keyActivities: 'Measure key outcome indicators, gather beneficiary testimonials, and compile final evaluation.',
      expectedDeliverables: 'Comprehensive impact audit, financial expenditure reconciliation, and public dissemination report.',
      targetCompletionDate: 'Month 12',
    },
  ];

  return {
    id: draftId,
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    opportunityOrganization: opportunity.organization,
    opportunityMaxAmount: opportunity.amount.max,
    opportunityCurrency: opportunity.amount.currency || 'USD',
    opportunityDeadline: opportunity.deadline,
    userId: user?.id,
    currentStepId: 'opportunity_summary',
    completionStatus: 'in_progress',
    applicantInfo: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      country: user?.country || (opportunity.location.includes('Global') ? 'Nigeria' : opportunity.location),
      city: '',
      professionalTitle: user?.applicantType || '',
      highestEducation: user?.educationLevel || 'bachelors',
      yearsOfExperience: user?.yearsOfExperience || '',
      linkedInOrWebsite: '',
      bioSummary: '',
    },
    organizationInfo: {
      hasOrganization: true,
      orgName: '',
      orgType: 'Non-Profit / NGO',
      registrationNumber: '',
      countryOfRegistration: user?.country || 'Nigeria',
      yearEstablished: '2022',
      teamSize: '5-15 members',
      website: '',
      address: '',
      missionStatement: '',
    },
    fundingRequest: {
      requestedAmount: opportunity.amount.max > 0 ? Math.min(opportunity.amount.max, 50000) : 25000,
      currency: opportunity.amount.currency || 'USD',
      fundingDurationMonths: 12,
      primaryExpenseCategory: 'Personnel & Program Delivery',
      hasCoFunding: false,
      coFundingDetails: '',
      bankCountry: user?.country || 'Nigeria',
    },
    problemStatement: '',
    proposedSolution: '',
    goalsAndImpact: '',
    targetBeneficiaries: '',
    additionalQuestions: {
      sustainabilityPlan: '',
      riskMitigation: '',
      teamExpertise: '',
      previousGrantExperience: '',
    },
    budgetItems: defaultBudgetItems,
    timelineMilestones: defaultMilestones,
    generatedContent: {},
    createdAt: now,
    lastUpdated: now,
    isDemoDraft: false,
  };
}

export const createInitialApplicationDraft = createDefaultApplicationDraft;

/**
 * Retrieves all stored application drafts from localStorage.
 */
export function getAllStoredApplications(userId?: string): ApplicationDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const drafts: ApplicationDraft[] = JSON.parse(raw);
    if (userId) {
      return drafts.filter((d) => !d.userId || d.userId === userId);
    }
    return drafts;
  } catch (err) {
    console.error('Error loading stored application drafts:', err);
    return [];
  }
}

/**
 * Retrieves the most recent draft for a specific opportunity.
 */
export function loadApplicationDraft(
  opportunityId: string,
  userId?: string
): ApplicationDraft | null {
  const drafts = getAllStoredApplications(userId);
  const matched = drafts
    .filter((d) => d.opportunityId === opportunityId)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  return matched.length > 0 ? matched[0] : null;
}

export const getStoredApplicationForOpportunity = loadApplicationDraft;

/**
 * Saves or updates an application draft in localStorage.
 */
export function saveApplicationDraft(draft: ApplicationDraft): ApplicationDraft {
  try {
    const drafts = getAllStoredApplications();
    const now = new Date().toISOString();

    const validation = validateFullApplication(draft);
    if (validation.overallComplete) {
      if (draft.completionStatus !== 'completed') {
        draft.completionStatus = 'ready_for_review';
      }
    } else {
      draft.completionStatus = 'in_progress';
    }

    const updatedDraft: ApplicationDraft = {
      ...draft,
      lastUpdated: now,
    };

    const existingIndex = drafts.findIndex((d) => d.id === draft.id);
    if (existingIndex >= 0) {
      drafts[existingIndex] = updatedDraft;
    } else {
      drafts.unshift(updatedDraft);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    return updatedDraft;
  } catch (err) {
    console.error('Error saving application draft:', err);
    return draft;
  }
}

/**
 * Deletes an application draft from localStorage.
 */
export function deleteApplicationDraft(draftId: string): boolean {
  try {
    const drafts = getAllStoredApplications();
    const filtered = drafts.filter((d) => d.id !== draftId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Error deleting draft:', err);
    return false;
  }
}

export interface ValidationFieldIssue {
  stepId: ApplicationStepId;
  stepTitle: string;
  fieldKey: string;
  label: string;
  description?: string;
}

/**
 * Validates a single section of the application draft.
 */
export function validateApplicationSection(
  draft: ApplicationDraft,
  stepId: ApplicationStepId
): SectionValidationResult {
  const missingFields: { fieldKey: string; label: string; description?: string }[] = [];

  switch (stepId) {
    case 'opportunity_summary':
      break;

    case 'applicant_info': {
      const info = draft.applicantInfo;
      if (!info.fullName?.trim()) {
        missingFields.push({ fieldKey: 'fullName', label: 'Full Name', description: 'Lead applicant full legal name' });
      }
      if (!info.email?.trim() || !info.email.includes('@')) {
        missingFields.push({ fieldKey: 'email', label: 'Email Address', description: 'Valid contact email' });
      }
      if (!info.country?.trim()) {
        missingFields.push({ fieldKey: 'country', label: 'Country of Residence', description: 'Country for eligibility checking' });
      }
      break;
    }

    case 'organization_info': {
      const org = draft.organizationInfo;
      if (org.hasOrganization) {
        if (!org.orgName?.trim()) {
          missingFields.push({ fieldKey: 'orgName', label: 'Organization / Business Name', description: 'Official entity name' });
        }
        if (!org.orgType?.trim()) {
          missingFields.push({ fieldKey: 'orgType', label: 'Organization Type', description: 'NGO, Startup, Academic, etc.' });
        }
      }
      break;
    }

    case 'funding_request': {
      const req = draft.fundingRequest;
      const amount = Number(req.requestedAmount);
      if (isNaN(amount) || amount <= 0) {
        missingFields.push({ fieldKey: 'requestedAmount', label: 'Requested Funding Amount', description: 'Must be greater than 0' });
      }
      const months = Number(req.fundingDurationMonths);
      if (isNaN(months) || months <= 0) {
        missingFields.push({ fieldKey: 'fundingDurationMonths', label: 'Project Duration', description: 'Duration in months' });
      }
      break;
    }

    case 'problem_statement': {
      const text = draft.problemStatement?.trim() || '';
      if (text.length < 30) {
        missingFields.push({
          fieldKey: 'problemStatement',
          label: 'Problem Statement',
          description: 'Provide a clear explanation of the challenge (minimum 30 characters)',
        });
      }
      break;
    }

    case 'proposed_solution': {
      const text = draft.proposedSolution?.trim() || '';
      if (text.length < 30) {
        missingFields.push({
          fieldKey: 'proposedSolution',
          label: 'Proposed Solution',
          description: 'Describe your innovation and project execution plan (minimum 30 characters)',
        });
      }
      break;
    }

    case 'goals_impact': {
      const text = draft.goalsAndImpact?.trim() || '';
      if (text.length < 30) {
        missingFields.push({
          fieldKey: 'goalsAndImpact',
          label: 'Goals & Expected Impact',
          description: 'List concrete goals and expected outcomes (minimum 30 characters)',
        });
      }
      break;
    }

    case 'target_beneficiaries': {
      const text = draft.targetBeneficiaries?.trim() || '';
      if (text.length < 20) {
        missingFields.push({
          fieldKey: 'targetBeneficiaries',
          label: 'Target Beneficiaries',
          description: 'Identify community groups and direct stakeholders (minimum 20 characters)',
        });
      }
      break;
    }

    case 'budget': {
      const items = draft.budgetItems || [];
      if (items.length === 0) {
        missingFields.push({
          fieldKey: 'budgetItems',
          label: 'Itemized Budget',
          description: 'Add at least one line item with valid quantity and unit cost',
        });
      } else {
        const total = calculateTotalBudget(items);
        if (total <= 0) {
          missingFields.push({
            fieldKey: 'budgetTotal',
            label: 'Budget Total',
            description: 'Total budget must be greater than 0',
          });
        }
      }
      break;
    }

    case 'timeline': {
      const milestones = draft.timelineMilestones || [];
      if (milestones.length === 0) {
        missingFields.push({
          fieldKey: 'milestones',
          label: 'Timeline Milestones',
          description: 'Add at least one project milestone with deliverables',
        });
      }
      break;
    }

    case 'additional_questions':
      break;

    case 'final_review':
      break;
  }

  const stepConfig = APPLICATION_STEPS_CONFIG.find((s) => s.id === stepId);

  return {
    stepId,
    title: stepConfig?.title || stepId,
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Evaluates full application completeness across all steps.
 */
export function validateFullApplication(
  draft: ApplicationDraft,
  _opportunity?: Opportunity
): {
  overallComplete: boolean;
  completionScore: number;
  completionPercentage: number;
  completedStepsCount: number;
  totalRequiredStepsCount: number;
  completedSteps: ApplicationStepId[];
  incompleteSteps: ApplicationStepId[];
  sectionResults: SectionValidationResult[];
  allMissingFields: ValidationFieldIssue[];
  missingFields: ValidationFieldIssue[];
} {
  const sectionResults: SectionValidationResult[] = [];
  const allMissingFields: ValidationFieldIssue[] = [];
  const completedSteps: ApplicationStepId[] = [];
  const incompleteSteps: ApplicationStepId[] = [];

  let completedRequiredCount = 0;
  let totalRequiredCount = 0;

  APPLICATION_STEPS_CONFIG.forEach((step) => {
    if (step.id === 'final_review') return;

    const result = validateApplicationSection(draft, step.id);
    sectionResults.push(result);

    if (result.isComplete) {
      completedSteps.push(step.id);
    } else {
      incompleteSteps.push(step.id);
    }

    if (step.isRequired) {
      totalRequiredCount += 1;
      if (result.isComplete) {
        completedRequiredCount += 1;
      }
    }

    if (!result.isComplete) {
      result.missingFields.forEach((mf) => {
        allMissingFields.push({
          stepId: step.id,
          stepTitle: step.title,
          ...mf,
        });
      });
    }
  });

  const completionPercentage = totalRequiredCount > 0 
    ? Math.round((completedRequiredCount / totalRequiredCount) * 100) 
    : 100;

  return {
    overallComplete: allMissingFields.length === 0,
    completionScore: completionPercentage,
    completionPercentage,
    completedStepsCount: completedRequiredCount,
    totalRequiredStepsCount: totalRequiredCount,
    completedSteps,
    incompleteSteps,
    sectionResults,
    allMissingFields,
    missingFields: allMissingFields,
  };
}

/**
 * Generates formatted clean plain text summary for export/copying.
 */
export function generateApplicationSummaryText(
  draft: ApplicationDraft,
  opportunity: Opportunity
): string {
  const totalBudget = calculateTotalBudget(draft.budgetItems);
  const currency = draft.fundingRequest.currency || 'USD';

  return `=======================================================
FundEcho FUNDING APPLICATION & PROPOSAL PROOF
=======================================================
Opportunity: ${opportunity.title}
Funder / Organization: ${opportunity.organization}
Deadline: ${opportunity.deadline}
Category: ${opportunity.category}
Generated via FundEcho AI Application Workspace: ${new Date().toLocaleDateString()}

-------------------------------------------------------
1. APPLICANT INFORMATION
-------------------------------------------------------
Full Legal Name: ${draft.applicantInfo.fullName || 'Not specified'}
Email: ${draft.applicantInfo.email || 'Not specified'}
Phone: ${draft.applicantInfo.phone || 'Not specified'}
Country of Residence: ${draft.applicantInfo.country || 'Not specified'}
City: ${draft.applicantInfo.city || 'Not specified'}
Professional Title: ${draft.applicantInfo.professionalTitle || 'Not specified'}
Highest Education Level: ${draft.applicantInfo.highestEducation || 'Not specified'}
Years of Experience: ${draft.applicantInfo.yearsOfExperience || 'Not specified'}
Portfolio / LinkedIn: ${draft.applicantInfo.linkedInOrWebsite || 'Not specified'}
Bio Summary: ${draft.applicantInfo.bioSummary || 'Not specified'}

-------------------------------------------------------
2. ENTITY & ORGANIZATION DETAILS
-------------------------------------------------------
Operating via Organization: ${draft.organizationInfo.hasOrganization ? 'Yes' : 'No (Individual Applicant)'}
${draft.organizationInfo.hasOrganization ? `Organization Name: ${draft.organizationInfo.orgName}
Entity Type: ${draft.organizationInfo.orgType}
Registration Number: ${draft.organizationInfo.registrationNumber || 'Pending/Unregistered'}
Country of Registration: ${draft.organizationInfo.countryOfRegistration}
Year Established: ${draft.organizationInfo.yearEstablished}
Team Size: ${draft.organizationInfo.teamSize}
Website: ${draft.organizationInfo.website || 'N/A'}
Address: ${draft.organizationInfo.address || 'N/A'}
Mission Statement: ${draft.organizationInfo.missionStatement || 'N/A'}` : ''}

-------------------------------------------------------
3. FUNDING REQUEST & PROJECT DURATION
-------------------------------------------------------
Requested Amount: ${formatCurrencyDisplay(draft.fundingRequest.requestedAmount || 0, currency)}
Project Duration: ${draft.fundingRequest.fundingDurationMonths} Months
Primary Expense Category: ${draft.fundingRequest.primaryExpenseCategory}
Co-Funding Secured: ${draft.fundingRequest.hasCoFunding ? `Yes (${draft.fundingRequest.coFundingDetails})` : 'No (Seeking full funding)'}
Target Disbursement Country: ${draft.fundingRequest.bankCountry}

-------------------------------------------------------
4. PROBLEM & NEED STATEMENT
-------------------------------------------------------
${draft.problemStatement || '[Problem Statement not yet provided]'}

-------------------------------------------------------
5. PROPOSED SOLUTION & TECHNICAL METHODOLOGY
-------------------------------------------------------
${draft.proposedSolution || '[Proposed Solution not yet provided]'}

-------------------------------------------------------
6. GOALS & EXPECTED COMMUNITY IMPACT
-------------------------------------------------------
${draft.goalsAndImpact || '[Goals and Impact not yet provided]'}

-------------------------------------------------------
7. TARGET BENEFICIARIES & STAKEHOLDERS
-------------------------------------------------------
${draft.targetBeneficiaries || '[Target Beneficiaries not yet provided]'}

-------------------------------------------------------
8. ITEMIZED BUDGET SCHEDULE (Total: ${formatCurrencyDisplay(totalBudget, currency)})
-------------------------------------------------------
${draft.budgetItems.map((item, idx) => `[${idx + 1}] ${item.category} - ${item.description}
    Qty: ${item.quantity} x ${formatCurrencyDisplay(item.unitCost, currency)} = ${formatCurrencyDisplay(item.total, currency)}
    ${item.justification ? `Justification: ${item.justification}` : ''}`).join('\n\n')}

-------------------------------------------------------
9. PROJECT TIMELINE & MILESTONES
-------------------------------------------------------
${draft.timelineMilestones.map((m) => `Phase ${m.phaseNumber}: ${m.title} (${m.timeframe})
    Activities: ${m.keyActivities}
    Deliverables: ${m.expectedDeliverables}
    Target Completion: ${m.targetCompletionDate || 'End of phase'}`).join('\n\n')}

-------------------------------------------------------
10. ADDITIONAL EVALUATOR QUESTIONS
-------------------------------------------------------
Sustainability & Exit Strategy:
${draft.additionalQuestions.sustainabilityPlan || 'N/A'}

Risk Assessment & Mitigation:
${draft.additionalQuestions.riskMitigation || 'N/A'}

Team Competencies & Personnel:
${draft.additionalQuestions.teamExpertise || 'N/A'}

Previous Grant Experience:
${draft.additionalQuestions.previousGrantExperience || 'None specified'}

=======================================================
SUBMISSION NOTICE:
Submit this finalized proposal package directly through the official host portal at:
${opportunity.applicationUrl}
=======================================================`;
}
