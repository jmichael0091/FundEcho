export type FunderType = 
  | 'Private Foundation'
  | 'Corporate CSR & Tech Accelerator'
  | 'Government & Bilateral Agency'
  | 'Intergovernmental / Multilateral'
  | 'Academic & Charitable Trust'
  | 'Venture Philanthropy';

export type UnsolicitedPolicy = 
  | 'Open Public Calls'
  | 'Letter of Inquiry (LOI) First'
  | 'By Invitation / Partner Only'
  | 'Rolling Concept Submissions'
  | 'Open Call Windows Only';

export interface GranteeHighlight {
  name: string;
  year: string;
  project: string;
  amount: string;
  country: string;
  outcome: string;
}

export interface FunderProfile {
  id: string;
  name: string;
  slug: string;
  acronym?: string;
  initials: string;
  logoBg: string;
  type: FunderType;
  headquarters: {
    city: string;
    country: string;
  };
  foundedYear: number;
  website: string;
  verified: boolean;
  transparencyRating: 'A+' | 'A' | 'A-';
  mission: string;
  overview: string;
  totalFundingDeployed: string;
  typicalGrantRange: string;
  reviewCycle: string;
  unsolicitedPolicy: UnsolicitedPolicy;
  strategicPriorities: string[];
  eligibleRegions: string[];
  prioritySectors: string[];
  averageTurnaroundTime: string;
  granteeHighlights: GranteeHighlight[];
  applicationTips: string[];
  officialContactUrl?: string;
}
