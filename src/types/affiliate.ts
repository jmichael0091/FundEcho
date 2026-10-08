import { Opportunity } from './index';

export type AffiliateOfferStatus = 'Active' | 'Inactive' | 'Archived';
export type AffiliateOfferType = 'Software' | 'Service' | 'Course' | 'Platform' | 'Tool' | 'Consulting';
export type AffiliatePremiumEligibility = 'all' | 'free_only' | 'premium_only';

export interface AffiliateOffer {
  id: string;
  partnerName: string;
  title: string;
  description: string;
  category: string;
  offerType: AffiliateOfferType;
  logo?: string;
  affiliateUrl: string;
  disclosure?: string;
  countries: string[];
  regions: string[];
  userTypes: string[];
  interests: string[];
  fundingTypes: string[];
  opportunityCategories: string[];
  businessStages: string[];
  industries: string[];
  intentSignals: string[];
  premiumEligibility: AffiliatePremiumEligibility;
  minimumMatchScore: number;
  priority: number;
  startDate: string;
  endDate: string;
  status: AffiliateOfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateUserContext {
  userId?: string;
  country?: string;
  region?: string;
  interests?: string[];
  fundingPreferences?: string[];
  fundingType?: string;
  opportunityCategory?: string;
  businessStage?: string;
  industry?: string;
  userType?: string;
  currentSearchIntent?: string;
  currentOpportunity?: Opportunity | null;
  isPremium?: boolean;
}

export interface AffiliateMatchResult {
  offer: AffiliateOffer;
  score: number; // 0 to 100
  isQualified: boolean;
  reasons: string[];
  disqualificationReasons?: string[];
}

export interface AffiliateTrackingEvent {
  id: string;
  eventType: 'impression' | 'click';
  offerId: string;
  userId?: string;
  timestamp: string;
  placement: string;
  matchScore: number;
  opportunityId?: string;
}

export interface AffiliatePerformanceStats {
  totalOffers: number;
  activeOffers: number;
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  topPerformingOffers: {
    offerId: string;
    partnerName: string;
    title: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
  placementsBreakdown: {
    placement: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
}
