/**
 * FUNDORA Monetization Architecture Types (Step 14 & Step 17)
 * Supports Google Ads, Premium Subscriptions, Credit System, Feature Gating,
 * Admin Plan Management, Credit Packages, and Payment Abstraction.
 */

export type SubscriptionTier = 'free' | 'premium' | 'admin';

export type SubscriptionStatus = 'free' | 'active' | 'expired' | 'cancelled' | 'pending';

export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionBenefit {
  id: string;
  label: string;
  description: string;
  includedInFree: boolean;
  includedInPremium: boolean;
  category: 'discovery' | 'application' | 'ai' | 'deadlines' | 'experience';
  highlight?: boolean;
}

export interface PlanUsageLimits {
  savedOpportunitiesLimit: number; // -1 for unlimited
  activeWorkspaceDraftsLimit: number; // -1 for unlimited
  monthlyAiAssistsLimit: number; // -1 for unlimited
  monthlyEligibilityChecksLimit: number; // -1 for unlimited
  exportCalendarLimit: number; // -1 for unlimited
  [key: string]: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  tier: SubscriptionTier;
  monthlyPriceUSD: number;
  annualPriceUSD: number;
  annualDiscountPercent: number;
  includedCredits: number;
  featurePermissions: Record<string, boolean>;
  usageLimits: PlanUsageLimits;
  isRecommended?: boolean;
  featured?: boolean;
  badge?: string;
  ctaText?: string;
  status: 'active' | 'inactive' | 'archived';
  benefits: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  billingCycle?: BillingCycle;
  isDemo?: boolean;
}

// Backward compatible alias
export type UserSubscription = Subscription;

export interface CreditWallet {
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeUsed: number;
  updatedAt: string;
}

// Backward compatible alias for CreditBalance
export interface CreditBalance {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastUpdated: string;
}

export type CreditTransactionType = 
  | 'purchase' 
  | 'bonus' 
  | 'usage' 
  | 'refund' 
  | 'adjustment' 
  | 'expiration';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number;
  feature?: string;
  description: string;
  reference?: string;
  timestamp: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonusCredits?: number;
  priceUSD: number;
  currency: string;
  status: 'active' | 'inactive' | 'archived';
  displayPriority: number;
  priceFormatted?: string;
  perCreditRate?: string;
  popular?: boolean;
  description: string;
  features?: string[];
}

export interface FeatureCreditCost {
  key: string;
  name: string;
  description: string;
  creditCost: number;
  category: 'ai_draft' | 'ai_review' | 'matching' | 'intelligence' | 'other';
  enabled: boolean;
}

export type UsagePeriod = 'daily' | 'monthly' | 'lifetime' | 'unlimited';

export interface UsageRecord {
  userId: string;
  feature: string;
  period: UsagePeriod;
  usageCount: number;
  limit: number;
  periodKey: string; // e.g. "2026-09"
}

// Payment Service Abstraction Interfaces
export interface PaymentInitParams {
  type: 'subscription' | 'credit_purchase';
  planId?: string;
  billingCycle?: BillingCycle;
  packageId?: string;
  userId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
}

export interface PaymentSession {
  sessionId: string;
  provider: 'demo' | 'stripe' | 'paystack' | 'flutterwave';
  status: 'pending' | 'completed' | 'failed';
  initParams: PaymentInitParams;
  createdAt: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  sessionId?: string;
  amount: number;
  currency: string;
  message: string;
  timestamp: string;
  isDemo: boolean;
}

export type FeatureKey =
  | 'basic_search'
  | 'basic_matching'
  | 'save_opportunities'
  | 'basic_eligibility_check'
  | 'advanced_opportunity_matching'
  | 'ai_proposal_assistant'
  | 'ai_grant_scorer'
  | 'advanced_milestone_planner'
  | 'batch_calendar_export'
  | 'deep_funder_intelligence'
  | 'reduced_advertising'
  | 'priority_support';

export type FeatureAccessType = 'free' | 'premium' | 'credit_based';

export interface FeatureAccessRule {
  key: FeatureKey;
  name: string;
  description: string;
  accessType: FeatureAccessType;
  requiredCredits?: number;
  minimumTier: SubscriptionTier;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  reason: 'free_tier' | 'premium_subscription' | 'credits_available' | 'locked_upgrade_required';
  rule: FeatureAccessRule;
  requiredCredits?: number;
}

export type AdSlotFormat = 'leaderboard' | 'rectangle' | 'in_feed' | 'banner' | 'sidebar';

export interface AdSlotConfig {
  id: string;
  slotName: string;
  format: AdSlotFormat;
  placement: string;
  minWidth?: number;
  minHeight?: number;
  isEnabled: boolean;
}

export type FeaturedPlacement = 'top_of_search' | 'sidebar' | 'home_carousel' | 'directory_spotlight';

export interface FeaturedOpportunityConfig {
  opportunityId: string;
  isSponsored: boolean;
  sponsorName: string;
  placement: FeaturedPlacement;
  priority: number; // Higher number = higher priority
  startDate: string;
  endDate: string;
  badgeText: 'Sponsored' | 'Featured';
  tagline?: string;
  customCtaLabel?: string;
  customCtaUrl?: string;
}

export type PartnerCategory = 
  | 'business_tools'
  | 'education_platforms'
  | 'productivity_tools'
  | 'professional_services'
  | 'funding_resources';

export interface PartnerPlacement {
  id: string;
  name: string;
  category: PartnerCategory;
  tag: string;
  headline: string;
  description: string;
  features: string[];
  offerBadge?: string;
  logoBg: string;
  initials: string;
  url: string;
  affiliateDisclosure: string;
  isExclusive?: boolean;
}

export type MonetizationEventType =
  | 'ad_impression'
  | 'premium_cta_clicked'
  | 'upgrade_started'
  | 'upgrade_completed'
  | 'credit_purchase_started'
  | 'credit_package_selected'
  | 'credit_used'
  | 'featured_opportunity_viewed'
  | 'featured_opportunity_clicked'
  | 'partner_link_clicked'
  | 'feature_gate_shown';

export interface MonetizationEvent {
  id: string;
  type: MonetizationEventType;
  timestamp: string;
  data: Record<string, string | number | boolean | undefined>;
}
