import { 
  SubscriptionPlan, 
  SubscriptionBenefit, 
  CreditPackage, 
  FeatureAccessRule, 
  PartnerPlacement, 
  FeaturedOpportunityConfig,
  AdSlotConfig
} from '../types/monetization';

/**
 * Modular subscription benefits list
 */
export const SUBSCRIPTION_BENEFITS: SubscriptionBenefit[] = [
  {
    id: 'benefit-discovery',
    label: 'Full Opportunity Directory Access',
    description: 'Browse, search, and filter thousands of verified global grants, scholarships, and fellowships.',
    includedInFree: true,
    includedInPremium: true,
    category: 'discovery'
  },
  {
    id: 'benefit-search-filters',
    label: 'Standard Geographic & Topic Filters',
    description: 'Filter by country, region, category, target audience, and award amount.',
    includedInFree: true,
    includedInPremium: true,
    category: 'discovery'
  },
  {
    id: 'benefit-bookmarks',
    label: 'Saved Opportunities & Deadlines',
    description: 'Save opportunities to your personal dashboard and receive basic deadline countdowns.',
    includedInFree: true,
    includedInPremium: true,
    category: 'discovery'
  },
  {
    id: 'benefit-basic-matching',
    label: 'Basic Opportunity Matching',
    description: 'Automated matching against your profile country and organization type.',
    includedInFree: true,
    includedInPremium: true,
    category: 'discovery'
  },
  {
    id: 'benefit-basic-eligibility',
    label: 'Standard Eligibility Checking',
    description: 'Instant heuristic verification based on public grant criteria.',
    includedInFree: true,
    includedInPremium: true,
    category: 'application'
  },
  {
    id: 'benefit-adv-matching',
    label: 'Advanced AI Opportunity Matching',
    description: 'Deep semantic compatibility scoring based on your specific venture mission, traction, and sector keywords.',
    includedInFree: false,
    includedInPremium: true,
    category: 'ai',
    highlight: true
  },
  {
    id: 'benefit-ai-assistance',
    label: 'Advanced AI Application Assistance',
    description: 'Draft review, narrative structure refinement, and compliance checklist generation.',
    includedInFree: false,
    includedInPremium: true,
    category: 'ai',
    highlight: true
  },
  {
    id: 'benefit-ai-limits',
    label: 'Higher AI Usage Limits',
    description: '500+ AI credits per month included for proposal drafting and iterative reviews.',
    includedInFree: false,
    includedInPremium: true,
    category: 'ai'
  },
  {
    id: 'benefit-deadline-tools',
    label: 'Advanced Deadline Tools & T-30 Milestone Sync',
    description: 'Automated reminder sequences, multi-stakeholder milestone roadmaps, and custom calendar webhooks.',
    includedInFree: false,
    includedInPremium: true,
    category: 'deadlines'
  },
  {
    id: 'benefit-workspace',
    label: 'Premium Application Workspace Features',
    description: 'Multi-document attachment staging, team review comments, and reviewer scoring simulations.',
    includedInFree: false,
    includedInPremium: true,
    category: 'application'
  },
  {
    id: 'benefit-funder-intel',
    label: 'Institutional Funder Intelligence Dossiers',
    description: 'Unsolicited proposal playbook, historical grant cycle benchmarks, and past recipient spotlights.',
    includedInFree: false,
    includedInPremium: true,
    category: 'discovery'
  },
  {
    id: 'benefit-reduced-ads',
    label: 'Reduced & Uninterrupted Advertising',
    description: 'Completely ad-free workflow across all search feeds, listings, and application preparation views.',
    includedInFree: false,
    includedInPremium: true,
    category: 'experience'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'FundEcho Free',
    tagline: 'Essential discovery tools for global grant seekers, founders, and scholars.',
    description: 'Essential discovery tools for global grant seekers, founders, and scholars.',
    tier: 'free',
    monthlyPriceUSD: 0,
    annualPriceUSD: 0,
    annualDiscountPercent: 0,
    ctaText: 'Current Plan',
    includedCredits: 0,
    status: 'active',
    featurePermissions: {
      opportunity_discovery: true,
      standard_search: true,
      opportunity_details: true,
      basic_matching: true,
      basic_eligibility_checker: true
    },
    usageLimits: {
      savedOpportunitiesLimit: 5,
      activeWorkspaceDraftsLimit: 1,
      monthlyAiAssistsLimit: 5,
      monthlyEligibilityChecksLimit: 10,
      exportCalendarLimit: 5
    },
    benefits: [
      'Browse all public opportunities',
      'Search and filter by region & sector',
      'Save opportunities & deadline tracking',
      'Basic eligibility self-checks',
      'Community public funder profiles',
      'Standard Google & iCal calendar sync'
    ]
  },
  {
    id: 'premium',
    name: 'FundEcho Premium',
    tagline: 'Professional AI proposal assistance, deep matching, and accelerated funding preparation.',
    description: 'Professional AI proposal assistance, deep matching, and accelerated funding preparation.',
    tier: 'premium',
    monthlyPriceUSD: 19,
    annualPriceUSD: 144, // $12/mo
    annualDiscountPercent: 37,
    featured: true,
    isRecommended: true,
    badge: 'Recommended for Active Applicants',
    ctaText: 'Upgrade to Premium',
    includedCredits: 150,
    status: 'active',
    featurePermissions: {
      opportunity_discovery: true,
      standard_search: true,
      opportunity_details: true,
      basic_matching: true,
      basic_eligibility_checker: true,
      advanced_matching: true,
      ai_proposal_assistant: true,
      ai_writing_improvement: true,
      advanced_eligibility_analysis: true,
      unlimited_saved_opportunities: true,
      advanced_milestone_planner: true,
      priority_export: true,
      funder_intelligence_dossiers: true
    },
    usageLimits: {
      savedOpportunitiesLimit: -1,
      activeWorkspaceDraftsLimit: -1,
      monthlyAiAssistsLimit: -1,
      monthlyEligibilityChecksLimit: -1,
      exportCalendarLimit: -1
    },
    benefits: [
      'Everything in Free, plus:',
      'Advanced semantic opportunity matching',
      'AI proposal assistant & grant scoring',
      'Full T-30 milestone workflow sync',
      'Institutional funder intelligence dossiers',
      'Premium multi-section workspace & checklists',
      '150 monthly bonus AI credits included',
      'Clean, uninterrupted ad-free workflow',
      'Priority email & review support'
    ]
  }
];

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 25,
    bonusCredits: 0,
    priceUSD: 9,
    priceFormatted: '$9',
    perCreditRate: '$0.36',
    currency: 'USD',
    status: 'active',
    displayPriority: 1,
    description: 'Ideal for running a targeted AI proposal audit or deep scoring 2-3 major grants.',
    features: [
      '25 AI assistance credits',
      'Instant access to AI Proposal Assistant',
      'Deep Opportunity Matching audit',
      'Credits never expire'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    credits: 75,
    bonusCredits: 15,
    priceUSD: 19,
    priceFormatted: '$19',
    perCreditRate: '$0.21',
    popular: true,
    currency: 'USD',
    status: 'active',
    displayPriority: 2,
    description: 'Our most popular pack for founders and non-profits submitting multiple applications.',
    features: [
      '90 total credits (75 + 15 bonus)',
      'Multi-draft proposal refinement',
      'Comprehensive funder intelligence audits',
      'Milestone preparation checklist exports',
      'Best value per credit (Save 40%)'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 250,
    bonusCredits: 50,
    priceUSD: 49,
    priceFormatted: '$49',
    perCreditRate: '$0.16',
    currency: 'USD',
    status: 'active',
    displayPriority: 3,
    description: 'Designed for institutions, research labs, and consultants applying year-round.',
    features: [
      '300 total credits (250 + 50 bonus)',
      'Unlimited high-depth AI evaluations',
      'Custom rubric proposal scorecards',
      'Priority processing queue',
      'Credits never expire'
    ]
  }
];

export const FEATURE_ACCESS_RULES: Record<string, FeatureAccessRule> = {
  basic_search: {
    key: 'basic_search',
    name: 'Opportunity Search & Discovery',
    description: 'Search and browse open grants and funding opportunities.',
    accessType: 'free',
    minimumTier: 'free'
  },
  basic_matching: {
    key: 'basic_matching',
    name: 'Basic Matching',
    description: 'Match opportunities by primary category and geography.',
    accessType: 'free',
    minimumTier: 'free'
  },
  save_opportunities: {
    key: 'save_opportunities',
    name: 'Save Opportunities',
    description: 'Save opportunities to your dashboard for offline and session tracking.',
    accessType: 'free',
    minimumTier: 'free'
  },
  basic_eligibility_check: {
    key: 'basic_eligibility_check',
    name: 'Standard Eligibility Assessment',
    description: 'Instant checklist to evaluate minimum stated grant rules.',
    accessType: 'free',
    minimumTier: 'free'
  },
  advanced_opportunity_matching: {
    key: 'advanced_opportunity_matching',
    name: 'Advanced Semantic Matching',
    description: 'Evaluate high-confidence match percentages against complex project abstracts.',
    accessType: 'credit_based',
    requiredCredits: 2,
    minimumTier: 'premium'
  },
  ai_proposal_assistant: {
    key: 'ai_proposal_assistant',
    name: 'AI Proposal Drafting Assistant',
    description: 'Intelligent section-by-section draft generation and narrative strengthening.',
    accessType: 'credit_based',
    requiredCredits: 5,
    minimumTier: 'premium'
  },
  ai_grant_scorer: {
    key: 'ai_grant_scorer',
    name: 'Grant Readiness & Reviewer Scorecard',
    description: 'Rigorous peer-review simulation that flags weak logic and budget gaps.',
    accessType: 'credit_based',
    requiredCredits: 4,
    minimumTier: 'premium'
  },
  advanced_milestone_planner: {
    key: 'advanced_milestone_planner',
    name: 'Milestone Timeline & Reminder Sequences',
    description: 'Interactive T-30 backward roadmap for application sign-offs.',
    accessType: 'free', // Keep milestone planning free as completed in Step 13, premium unlocks custom auto-sequences
    minimumTier: 'free'
  },
  deep_funder_intelligence: {
    key: 'deep_funder_intelligence',
    name: 'Deep Institutional Funder Dossiers',
    description: 'Detailed acceptance rates, board priorities, and previous award statistics.',
    accessType: 'credit_based',
    requiredCredits: 3,
    minimumTier: 'premium'
  },
  reduced_advertising: {
    key: 'reduced_advertising',
    name: 'Ad-Free Navigation Experience',
    description: 'Hide all third-party advertisement placements across the platform.',
    accessType: 'premium',
    minimumTier: 'premium'
  }
};

/**
 * Verified Featured Opportunities (Sponsored & Institutional Spotlights)
 * Clearly distinct from organically ranked opportunities.
 */
export const FEATURED_OPPORTUNITY_CONFIGS: Record<string, FeaturedOpportunityConfig> = {
  'opp-6': {
    opportunityId: 'opp-6',
    isSponsored: true,
    sponsorName: 'Google for Startups Accelerator',
    placement: 'top_of_search',
    priority: 100,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    badgeText: 'Sponsored',
    tagline: 'Partner Spotlight: Equity-free capital, Cloud credits, and dedicated Google engineering mentorship.'
  },
  'google-for-startups-2026': {
    opportunityId: 'opp-6',
    isSponsored: true,
    sponsorName: 'Google for Startups Accelerator',
    placement: 'top_of_search',
    priority: 100,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    badgeText: 'Sponsored',
    tagline: 'Partner Spotlight: Equity-free capital, Cloud credits, and dedicated Google engineering mentorship.'
  },
  'gates-global-health-2026': {
    opportunityId: 'gates-global-health-2026',
    isSponsored: true,
    sponsorName: 'Bill & Melinda Gates Foundation',
    placement: 'home_carousel',
    priority: 95,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    badgeText: 'Featured',
    tagline: 'Global Call: Catalyzing maternal and neonatal health breakthroughs worldwide.'
  }
};

/**
 * Professional Partner & Resource Placements
 * With strict editorial disclosure and high-value utilities for applicants.
 */
export const PARTNER_PLACEMENTS: PartnerPlacement[] = [
  {
    id: 'partner-grant-writer-pro',
    name: 'ProposalCraft AI Suite',
    category: 'productivity_tools',
    tag: 'Grant Writing',
    headline: 'AI Proposal Structuring & Compliance Audits',
    description: 'Collaborative writing environment specifically formatted for multilateral grants, NIH, Horizon Europe, and foundation templates.',
    features: ['Real-time compliance validation', 'Multi-author comments', 'Export to PDF/Word'],
    offerBadge: '20% Off First Quarter',
    logoBg: 'bg-emerald-600',
    initials: 'PC',
    url: 'https://example.com/partner/proposalcraft',
    affiliateDisclosure: 'Affiliate Disclosure: FundEcho partners with verified grant-tech services. When you subscribe through our links, we may receive a commission at no additional cost to you.',
    isExclusive: true
  },
  {
    id: 'partner-nonprofit-legal',
    name: 'GlobalGrant Legal Counsel',
    category: 'professional_services',
    tag: 'Legal & Fiscal Sponsorship',
    headline: '501(c)(3) & International NGO Registration',
    description: 'Certified charity incorporation, international tax-exempt determination, and fiscal sponsorship for grassroots grant eligibility.',
    features: ['Expedited IRS/Charity filing', 'Fiscal sponsorship matching', 'Compliance audit'],
    offerBadge: 'Free Initial Assessment',
    logoBg: 'bg-indigo-600',
    initials: 'GL',
    url: 'https://example.com/partner/globalgrant-legal',
    affiliateDisclosure: 'Affiliate Disclosure: FundEcho vets legal advisory partners for non-profit and cross-border grant eligibility. We may earn a referral fee if you book services.'
  },
  {
    id: 'partner-fellowship-masterclass',
    name: 'Rhodes & Fulbright Prep Academy',
    category: 'education_platforms',
    tag: 'Fellowship Prep',
    headline: 'Personal Statement & Interview Coaching',
    description: 'One-on-one mentorship from past Rhodes, Marshall, and Gates Cambridge scholars to refine competitive scholarship applications.',
    features: ['Mock panel interviews', 'Personal essay developmental editing', 'Referee guidance'],
    offerBadge: 'Cohort Discounts',
    logoBg: 'bg-amber-600',
    initials: 'FA',
    url: 'https://example.com/partner/fellowship-prep',
    affiliateDisclosure: 'Affiliate Disclosure: Educational partners are selected based on track record. FundEcho receives partner commission on enrolled masterclasses.'
  },
  {
    id: 'partner-startup-accounting',
    name: 'GrantLedger Financials',
    category: 'business_tools',
    tag: 'Grant Accounting',
    headline: 'Automated Post-Award Expense & Budget Tracking',
    description: 'Audit-ready financial management built for SBIR/STTR, EU Horizon, and foundation expenditure reporting.',
    features: ['Automated receipts reconciliation', 'Direct allowable-cost tagging', 'Audit report generation'],
    offerBadge: '30-Day Free Trial',
    logoBg: 'bg-blue-600',
    initials: 'GL',
    url: 'https://example.com/partner/grantledger',
    affiliateDisclosure: 'Affiliate Disclosure: Financial tools featured here assist with post-award compliance. We may receive partner consideration.'
  }
];

/**
 * Standard AdSense Slot Placeholders
 */
export const AD_SLOT_CONFIGS: Record<string, AdSlotConfig> = {
  'ad-slot-opps-feed': {
    id: 'ad-slot-opps-feed',
    slotName: 'Opportunities Listing In-Feed Placement',
    format: 'in_feed',
    placement: 'opportunities_listing',
    minHeight: 120,
    isEnabled: true
  },
  'ad-slot-opp-detail-sidebar': {
    id: 'ad-slot-opp-detail-sidebar',
    slotName: 'Opportunity Detail Sidebar Slot',
    format: 'rectangle',
    placement: 'opportunity_detail_sidebar',
    minHeight: 250,
    isEnabled: true
  },
  'ad-slot-category-banner': {
    id: 'ad-slot-category-banner',
    slotName: 'Category Hub Leaderboard Slot',
    format: 'leaderboard',
    placement: 'category_landing',
    minHeight: 90,
    isEnabled: true
  },
  'ad-slot-country-banner': {
    id: 'ad-slot-country-banner',
    slotName: 'Country Hub Leaderboard Slot',
    format: 'leaderboard',
    placement: 'country_landing',
    minHeight: 90,
    isEnabled: true
  },
  'ad-slot-directory-bottom': {
    id: 'ad-slot-directory-bottom',
    slotName: 'Directory Master Hub Footer Banner',
    format: 'banner',
    placement: 'directory_footer',
    minHeight: 90,
    isEnabled: true
  }
};
