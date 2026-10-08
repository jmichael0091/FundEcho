import {
  Subscription,
  SubscriptionPlan,
  CreditPackage,
  FeatureCreditCost,
  BillingCycle
} from '../types/monetization';
import { CreditService } from './creditService';

const STORAGE_KEY_SUBSCRIPTION = 'fundora_user_subscription';
const STORAGE_KEY_ADMIN_PLANS = 'fundora_admin_subscription_plans';
const STORAGE_KEY_ADMIN_PACKAGES = 'fundora_admin_credit_packages';
const STORAGE_KEY_ADMIN_FEATURE_COSTS = 'fundora_admin_feature_costs';

/**
 * Initial Demo Subscription Plans (Step 17)
 * Configurable by Admin; pricing and limits are NOT hardcoded in UI.
 */
export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'FundEcho Free',
    tagline: 'Essential discovery tools for grant seekers, researchers, and community founders.',
    description: 'Basic opportunity discovery, standard geographic filters, and introductory AI tools.',
    tier: 'free',
    monthlyPriceUSD: 0,
    annualPriceUSD: 0,
    annualDiscountPercent: 0,
    includedCredits: 25,
    status: 'active',
    isRecommended: false,
    ctaText: 'Current Plan',
    featurePermissions: {
      basic_search: true,
      basic_matching: true,
      save_opportunities: true,
      basic_eligibility_check: true,
      advanced_opportunity_matching: false,
      ai_proposal_assistant: false,
      ai_grant_scorer: false,
      advanced_milestone_planner: false,
      batch_calendar_export: false,
      deep_funder_intelligence: false,
      reduced_advertising: false,
      priority_support: false
    },
    usageLimits: {
      savedOpportunitiesLimit: 5,
      activeWorkspaceDraftsLimit: 1,
      monthlyAiAssistsLimit: 5,
      monthlyEligibilityChecksLimit: 10,
      exportCalendarLimit: 2
    },
    benefits: [
      'Search and browse verified global opportunities',
      'Save up to 5 opportunities to your dashboard',
      'Basic eligibility self-checks (10/month)',
      '1 active proposal workspace draft',
      '5 free introductory AI assistance credits'
    ]
  },
  {
    id: 'plan-premium',
    name: 'FundEcho Premium',
    tagline: 'Professional AI proposal drafting, deep matching, and accelerated funding workflows.',
    description: 'Unlimited opportunity discovery, advanced semantic matching, deep reviewer scorecard, and full workspace.',
    tier: 'premium',
    monthlyPriceUSD: 19,
    annualPriceUSD: 144, // $12/month equivalent
    annualDiscountPercent: 37,
    includedCredits: 150,
    status: 'active',
    isRecommended: true,
    featured: true,
    badge: 'Recommended for Active Applicants',
    ctaText: 'Upgrade to Premium',
    featurePermissions: {
      basic_search: true,
      basic_matching: true,
      save_opportunities: true,
      basic_eligibility_check: true,
      advanced_opportunity_matching: true,
      ai_proposal_assistant: true,
      ai_grant_scorer: true,
      advanced_milestone_planner: true,
      batch_calendar_export: true,
      deep_funder_intelligence: true,
      reduced_advertising: true,
      priority_support: true
    },
    usageLimits: {
      savedOpportunitiesLimit: -1, // Unlimited
      activeWorkspaceDraftsLimit: -1, // Unlimited
      monthlyAiAssistsLimit: 100,
      monthlyEligibilityChecksLimit: -1, // Unlimited
      exportCalendarLimit: -1 // Unlimited
    },
    benefits: [
      'Unlimited saved opportunities & active drafts',
      'Advanced semantic opportunity matching',
      'Full AI Application Workspace with iterative draft auditor',
      '150 monthly bonus AI credits included',
      'Deep funder intelligence & acceptance dossier data',
      'Ad-free uninterrupted application workflow',
      'Priority support & reviewer feedback'
    ]
  },
  {
    id: 'plan-admin',
    name: 'FundEcho Admin Tier',
    tagline: 'Unrestricted institutional oversight and platform administration privileges.',
    description: 'System-level access exempt from all usage limits and paywalls.',
    tier: 'admin',
    monthlyPriceUSD: 0,
    annualPriceUSD: 0,
    annualDiscountPercent: 0,
    includedCredits: 9999,
    status: 'active',
    isRecommended: false,
    ctaText: 'Admin Access Active',
    featurePermissions: {
      basic_search: true,
      basic_matching: true,
      save_opportunities: true,
      basic_eligibility_check: true,
      advanced_opportunity_matching: true,
      ai_proposal_assistant: true,
      ai_grant_scorer: true,
      advanced_milestone_planner: true,
      batch_calendar_export: true,
      deep_funder_intelligence: true,
      reduced_advertising: true,
      priority_support: true
    },
    usageLimits: {
      savedOpportunitiesLimit: -1,
      activeWorkspaceDraftsLimit: -1,
      monthlyAiAssistsLimit: -1,
      monthlyEligibilityChecksLimit: -1,
      exportCalendarLimit: -1
    },
    benefits: [
      'Unrestricted administrative access',
      'Zero credit deductions or rate limits',
      'Complete catalog moderation controls'
    ]
  }
];

/**
 * Initial Demo Credit Packages (Step 17)
 */
export const DEFAULT_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg-starter',
    name: 'Starter',
    credits: 100,
    bonusCredits: 0,
    priceUSD: 9,
    currency: 'USD',
    status: 'active',
    displayPriority: 1,
    priceFormatted: '$9',
    perCreditRate: '$0.09',
    description: 'Great for targeted proposal audits and evaluating 2-3 complex funding applications.',
    features: [
      '100 AI credits',
      'Instant access to AI Proposal Drafts',
      'Deep Eligibility Analysis',
      'Credits never expire'
    ]
  },
  {
    id: 'pkg-growth',
    name: 'Growth',
    credits: 500,
    bonusCredits: 50,
    priceUSD: 29,
    currency: 'USD',
    status: 'active',
    displayPriority: 2,
    popular: true,
    priceFormatted: '$29',
    perCreditRate: '$0.05',
    description: 'Our most popular pack for founders, researchers, and non-profits preparing several applications.',
    features: [
      '550 total credits (500 + 50 bonus)',
      'Multi-draft proposal refinement & expansion',
      'Comprehensive institutional funder intelligence',
      'Save 44% compared to Starter rate',
      'Credits never expire'
    ]
  },
  {
    id: 'pkg-pro',
    name: 'Pro',
    credits: 1500,
    bonusCredits: 200,
    priceUSD: 69,
    currency: 'USD',
    status: 'active',
    displayPriority: 3,
    priceFormatted: '$69',
    perCreditRate: '$0.04',
    description: 'Designed for institutions, research labs, and grant consultants submitting year-round.',
    features: [
      '1,700 total credits (1,500 + 200 bonus)',
      'Unlimited high-depth AI evaluations',
      'Rubric-based reviewer scoring simulations',
      'Priority compute processing queue',
      'Credits never expire'
    ]
  }
];

/**
 * Initial Admin-Controlled Feature Credit Costs (Step 17)
 */
export const DEFAULT_FEATURE_COSTS: FeatureCreditCost[] = [
  {
    key: 'ai_proposal_draft',
    name: 'AI Proposal Draft Generation',
    description: 'Generate complete, structured grant proposal sections aligned to funder prompts.',
    creditCost: 10,
    category: 'ai_draft',
    enabled: true
  },
  {
    key: 'ai_writing_improvement',
    name: 'AI Writing & Tone Refinement',
    description: 'Strengthen clarity, persuasiveness, academic tone, and eliminate jargon.',
    creditCost: 5,
    category: 'ai_review',
    enabled: true
  },
  {
    key: 'ai_expansion',
    name: 'AI Section Expansion & Elaboration',
    description: 'Flesh out project milestones, risk mitigation matrices, and sustainability plans.',
    creditCost: 4,
    category: 'ai_draft',
    enabled: true
  },
  {
    key: 'ai_application_analysis',
    name: 'AI Comprehensive Reviewer Analysis',
    description: 'Simulate an expert grant review committee scorecard with critique and fixes.',
    creditCost: 8,
    category: 'ai_review',
    enabled: true
  },
  {
    key: 'advanced_opportunity_matching',
    name: 'Advanced Semantic Matching Audit',
    description: 'Deep NLP alignment between applicant venture abstract and funder mission statement.',
    creditCost: 3,
    category: 'matching',
    enabled: true
  },
  {
    key: 'advanced_eligibility_analysis',
    name: 'In-Depth Eligibility & Compliance Audit',
    description: 'Complex multi-variable eligibility scan across international criteria.',
    creditCost: 5,
    category: 'intelligence',
    enabled: true
  },
  {
    key: 'deep_funder_intelligence',
    name: 'Institutional Funder Intelligence Dossier',
    description: 'Historical award trends, program officer notes, and previous winner spotlights.',
    creditCost: 4,
    category: 'intelligence',
    enabled: true
  }
];

/**
 * SubscriptionService (Step 17)
 * Manages user subscription lifecycle, plan configuration, credit packages, and feature costs.
 */
export class SubscriptionService {
  /**
   * Load user subscription record
   */
  public static getSubscription(userId: string = 'current_user'): Subscription {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_SUBSCRIPTION}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      // Fallback for legacy key
      const legacy = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
      if (legacy) {
        return JSON.parse(legacy);
      }
    } catch {
      // Fallback
    }

    const defaultSub: Subscription = {
      id: `sub-free-${userId}`,
      userId,
      planId: 'plan-free',
      tier: 'free',
      status: 'free',
      startDate: new Date().toISOString().split('T')[0],
      autoRenew: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true
    };

    this.saveSubscription(defaultSub);
    return defaultSub;
  }

  public static saveSubscription(sub: Subscription): void {
    try {
      const data = JSON.stringify(sub);
      localStorage.setItem(`${STORAGE_KEY_SUBSCRIPTION}_${sub.userId}`, data);
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, data);
    } catch {
      // Fallback
    }
  }

  /**
   * Activate or upgrade to a subscription plan (Demo flow)
   */
  public static activateSubscription(
    planId: string = 'plan-premium',
    cycle: BillingCycle = 'annual',
    userId: string = 'current_user'
  ): Subscription {
    const plans = this.getPlans();
    const targetPlan = plans.find(p => p.id === planId) || plans.find(p => p.tier === 'premium') || DEFAULT_PLANS[1];

    const now = new Date();
    const renewal = new Date();
    if (cycle === 'annual') {
      renewal.setFullYear(now.getFullYear() + 1);
    } else {
      renewal.setMonth(now.getMonth() + 1);
    }

    const updatedSub: Subscription = {
      id: `sub-${targetPlan.tier}-${Date.now()}`,
      userId,
      planId: targetPlan.id,
      tier: targetPlan.tier,
      status: 'active',
      startDate: now.toISOString().split('T')[0],
      endDate: renewal.toISOString().split('T')[0],
      renewalDate: renewal.toISOString().split('T')[0],
      autoRenew: true,
      billingCycle: cycle,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isDemo: true
    };

    this.saveSubscription(updatedSub);

    // Grant included monthly credits for the upgraded plan
    if (targetPlan.includedCredits > 0) {
      CreditService.addCredits(
        targetPlan.includedCredits,
        'bonus',
        `${targetPlan.name} Monthly Credit Allocation`,
        `subscription_grant_${targetPlan.id}`,
        userId
      );
    }

    return updatedSub;
  }

  /**
   * Cancel subscription (Demo flow)
   */
  public static cancelSubscription(userId: string = 'current_user'): Subscription {
    const current = this.getSubscription(userId);
    const updatedSub: Subscription = {
      ...current,
      status: 'cancelled',
      autoRenew: false,
      updatedAt: new Date().toISOString()
    };
    this.saveSubscription(updatedSub);
    return updatedSub;
  }

  /**
   * Expire subscription (Demo simulation)
   */
  public static expireSubscription(userId: string = 'current_user'): Subscription {
    const current = this.getSubscription(userId);
    const updatedSub: Subscription = {
      ...current,
      status: 'expired',
      autoRenew: false,
      updatedAt: new Date().toISOString()
    };
    this.saveSubscription(updatedSub);
    return updatedSub;
  }

  /**
   * Restore/Revert to Free tier
   */
  public static restoreToFree(userId: string = 'current_user'): Subscription {
    const updatedSub: Subscription = {
      id: `sub-free-${userId}`,
      userId,
      planId: 'plan-free',
      tier: 'free',
      status: 'free',
      startDate: new Date().toISOString().split('T')[0],
      autoRenew: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true
    };
    this.saveSubscription(updatedSub);
    return updatedSub;
  }

  /**
   * Switch between Admin, Premium, or Free (Development & Demo simulation controls)
   */
  public static setAdminTier(enable: boolean, userId: string = 'current_user'): Subscription {
    if (enable) {
      const adminSub: Subscription = {
        id: `sub-admin-${userId}`,
        userId,
        planId: 'plan-admin',
        tier: 'admin',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        autoRenew: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: true
      };
      this.saveSubscription(adminSub);
      return adminSub;
    } else {
      return this.restoreToFree(userId);
    }
  }

  // ================= ADMIN PLAN MANAGEMENT =================

  public static getPlans(): SubscriptionPlan[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADMIN_PLANS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    this.savePlans(DEFAULT_PLANS);
    return DEFAULT_PLANS;
  }

  public static savePlans(plans: SubscriptionPlan[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PLANS, JSON.stringify(plans));
    } catch {
      // Fallback
    }
  }

  public static savePlan(plan: SubscriptionPlan): SubscriptionPlan {
    const plans = this.getPlans();
    const index = plans.findIndex(p => p.id === plan.id);
    let updated: SubscriptionPlan[];
    if (index >= 0) {
      updated = [...plans];
      updated[index] = plan;
    } else {
      updated = [...plans, plan];
    }
    this.savePlans(updated);
    return plan;
  }

  public static archivePlan(planId: string): void {
    const plans = this.getPlans();
    const updated = plans.map(p => p.id === planId ? { ...p, status: 'archived' as const } : p);
    this.savePlans(updated);
  }

  public static deletePlan(planId: string): void {
    const plans = this.getPlans();
    const updated = plans.filter(p => p.id !== planId);
    this.savePlans(updated);
  }

  // ================= ADMIN CREDIT PACKAGES =================

  public static getPackages(): CreditPackage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADMIN_PACKAGES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    this.savePackages(DEFAULT_PACKAGES);
    return DEFAULT_PACKAGES;
  }

  public static savePackages(packages: CreditPackage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PACKAGES, JSON.stringify(packages));
    } catch {
      // Fallback
    }
  }

  public static savePackage(pkg: CreditPackage): CreditPackage {
    const packages = this.getPackages();
    const index = packages.findIndex(p => p.id === pkg.id);
    let updated: CreditPackage[];
    if (index >= 0) {
      updated = [...packages];
      updated[index] = pkg;
    } else {
      updated = [...packages, pkg];
    }
    this.savePackages(updated);
    return pkg;
  }

  public static deletePackage(pkgId: string): void {
    const packages = this.getPackages();
    const updated = packages.filter(p => p.id !== pkgId);
    this.savePackages(updated);
  }

  // ================= ADMIN FEATURE CREDIT COSTS =================

  public static getFeatureCosts(): FeatureCreditCost[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADMIN_FEATURE_COSTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    this.saveFeatureCosts(DEFAULT_FEATURE_COSTS);
    return DEFAULT_FEATURE_COSTS;
  }

  public static saveFeatureCosts(costs: FeatureCreditCost[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_FEATURE_COSTS, JSON.stringify(costs));
    } catch {
      // Fallback
    }
  }

  public static saveFeatureCost(cost: FeatureCreditCost): FeatureCreditCost {
    const costs = this.getFeatureCosts();
    const index = costs.findIndex(c => c.key === cost.key);
    let updated: FeatureCreditCost[];
    if (index >= 0) {
      updated = [...costs];
      updated[index] = cost;
    } else {
      updated = [...costs, cost];
    }
    this.saveFeatureCosts(updated);
    return cost;
  }

  public static getCostForFeature(featureKey: string): number {
    const costs = this.getFeatureCosts();
    const found = costs.find(c => c.key === featureKey && c.enabled);
    return found ? found.creditCost : 5; // default fallback 5 credits
  }
}
