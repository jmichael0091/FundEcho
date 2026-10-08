export type ApplicationCompletionStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'ready_for_review' 
  | 'completed';

export type ApplicationStepId = 
  | 'opportunity_summary'
  | 'applicant_info'
  | 'organization_info'
  | 'funding_request'
  | 'problem_statement'
  | 'proposed_solution'
  | 'goals_impact'
  | 'target_beneficiaries'
  | 'budget'
  | 'timeline'
  | 'additional_questions'
  | 'final_review';

export interface ApplicationStepConfig {
  id: ApplicationStepId;
  title: string;
  shortTitle: string;
  description: string;
  stepNumber: number;
  isRequired: boolean;
}

export interface ApplicantInformation {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  professionalTitle: string;
  highestEducation: string;
  yearsOfExperience?: number | '';
  linkedInOrWebsite: string;
  bioSummary: string;
}

export interface OrganizationInformation {
  hasOrganization: boolean;
  orgName: string;
  orgType: string;
  registrationNumber: string;
  countryOfRegistration: string;
  yearEstablished: string;
  teamSize: string;
  website: string;
  address: string;
  missionStatement: string;
}

export interface FundingRequest {
  requestedAmount: number | '';
  currency: string;
  fundingDurationMonths: number | '';
  primaryExpenseCategory: string;
  hasCoFunding: boolean;
  coFundingDetails: string;
  bankCountry: string;
}

export interface AdditionalQuestions {
  sustainabilityPlan: string;
  riskMitigation: string;
  teamExpertise: string;
  previousGrantExperience?: string;
  [key: string]: string | undefined;
}

export type BudgetCategory = 
  | 'Personnel & Salaries'
  | 'Equipment & Technology'
  | 'Operational & Logistics'
  | 'Travel & Fieldwork'
  | 'Marketing & Outreach'
  | 'Monitoring & Evaluation'
  | 'Indirect / Administrative'
  | 'Other Expenses';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
  justification?: string;
}

export interface TimelineMilestone {
  id: string;
  phaseNumber: number;
  title: string;
  timeframe: string; // e.g. "Months 1-3" or "Q1 2027"
  keyActivities: string;
  expectedDeliverables: string;
  targetCompletionDate?: string;
}

export interface GeneratedContentRecord {
  id: string;
  fieldKey: string;
  action: string;
  promptNotes?: string;
  originalText?: string;
  generatedText: string;
  timestamp: string;
  reviewedByUser: boolean;
}

export interface ApplicationDraft {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityOrganization: string;
  opportunityMaxAmount: number;
  opportunityCurrency: string;
  opportunityDeadline: string;
  userId?: string;
  currentStepId: ApplicationStepId;
  completionStatus: ApplicationCompletionStatus;
  applicantInfo: ApplicantInformation;
  organizationInfo: OrganizationInformation;
  fundingRequest: FundingRequest;
  problemStatement: string;
  proposedSolution: string;
  goalsAndImpact: string;
  targetBeneficiaries: string;
  additionalQuestions: AdditionalQuestions;
  budgetItems: BudgetItem[];
  timelineMilestones: TimelineMilestone[];
  generatedContent: Record<string, GeneratedContentRecord>;
  validationErrors?: Record<string, string[]>;
  createdAt: string;
  lastUpdated: string;
  isDemoDraft?: boolean;
}

export type AIAssistanceAction = 
  | 'improve_writing'
  | 'expand'
  | 'make_professional'
  | 'generate_draft'
  | 'shorten'
  | 'explain_question';

export interface AIAssistRequestPayload {
  action: AIAssistanceAction;
  fieldKey: string;
  fieldLabel: string;
  currentText: string;
  userPrompt?: string;
  opportunityContext: {
    id: string;
    title: string;
    organization: string;
    category: string;
    targetAudience?: string;
    requirements?: string[];
    eligibility?: string[];
  };
  applicantContext?: Partial<ApplicantInformation>;
  organizationContext?: Partial<OrganizationInformation>;
}

export interface AIAssistResponsePayload {
  success: boolean;
  action: string;
  fieldKey: string;
  resultText: string;
  timestamp: string;
  error?: string;
  fallbackAvailable?: boolean;
}

export interface SectionValidationResult {
  stepId: ApplicationStepId;
  title: string;
  isComplete: boolean;
  missingFields: { fieldKey: string; label: string; description?: string }[];
}
