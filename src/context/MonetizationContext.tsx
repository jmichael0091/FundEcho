import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Subscription,
  SubscriptionPlan,
  CreditWallet,
  CreditBalance,
  CreditPackage,
  FeatureCreditCost,
  CreditTransaction,
  SubscriptionTier, 
  SubscriptionStatus,
  BillingCycle,
  FeatureKey, 
  FeatureAccessResult,
  MonetizationEventType,
  MonetizationEvent,
  UsagePeriod,
  UsageRecord
} from '../types/monetization';
import { FEATURE_ACCESS_RULES } from '../data/monetizationData';
import { trackMonetizationEvent, getStoredMonetizationEvents } from '../utils/monetizationAnalytics';
import { CreditService } from '../services/creditService';
import { SubscriptionService } from '../services/subscriptionService';
import { UsageLimitService } from '../services/usageLimitService';
import { PaymentService } from '../services/paymentService';

interface GatedFeatureDetails {
  key?: string;
  title?: string;
  description?: string;
  requiredCredits?: number;
  limitMessage?: string;
  reason?: 'premium_only' | 'insufficient_credits' | 'limit_reached';
}

interface InsufficientCreditsDetails {
  featureName: string;
  requiredCredits: number;
  availableCredits: number;
}

interface MonetizationContextValue {
  subscription: Subscription;
  wallet: CreditWallet;
  credits: CreditBalance; // Backward-compatible alias
  isPremium: boolean;
  isAdmin: boolean;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  plans: SubscriptionPlan[];
  packages: CreditPackage[];
  featureCosts: FeatureCreditCost[];
  activePlan: SubscriptionPlan;
  transactions: CreditTransaction[];

  // Demo state toggles
  toggleDemoTier: () => void;
  activateDemoSubscription: (planId?: string, cycle?: BillingCycle) => Promise<void>;
  cancelDemoSubscription: () => void;
  expireDemoSubscription: () => void;
  restoreDemoSubscription: () => void;
  toggleAdminDemoTier: () => void;

  // Credit operations
  addDemoCredits: (packageId: string) => Promise<void>;
  useCredits: (amount: number, featureName: string) => boolean;
  consumeFeatureCredits: (featureKey: string, customDesc?: string) => boolean;
  refreshCredits: () => void;

  // Access control & usage limits
  checkFeatureAccess: (featureKey: FeatureKey | string) => FeatureAccessResult & {
    limitReached?: boolean;
    limitMessage?: string;
    usageInfo?: { used: number; limit: number; remaining: number };
  };
  requireFeatureAccess: (
    featureKey: FeatureKey | string, 
    onGranted: () => void,
    fallbackTitle?: string,
    fallbackDesc?: string
  ) => void;
  executeWithFeatureGate: (
    featureKey: string,
    onExecute: () => void,
    options?: {
      fallbackTitle?: string;
      fallbackDesc?: string;
      customCost?: number;
    }
  ) => void;

  // Usage limits query
  getFeatureUsage: (featureKey: string, period?: UsagePeriod) => UsageRecord;
  getAllUsageRecords: () => UsageRecord[];

  // Modals
  isUpgradeModalOpen: boolean;
  gatedFeatureDetails: GatedFeatureDetails | null;
  openUpgradeModal: (featureKey?: string, customTitle?: string, customDescription?: string) => void;
  closeUpgradeModal: () => void;

  isCreditModalOpen: boolean;
  openCreditModal: () => void;
  closeCreditModal: () => void;

  isInsufficientModalOpen: boolean;
  insufficientDetails: InsufficientCreditsDetails | null;
  openInsufficientModal: (details: InsufficientCreditsDetails) => void;
  closeInsufficientModal: () => void;

  // Analytics & feedback
  trackEvent: (type: MonetizationEventType, data?: Record<string, string | number | boolean | undefined>) => void;
  recentEvents: MonetizationEvent[];
  demoFeedbackMessage: string | null;
  clearDemoFeedback: () => void;

  // Admin configuration refresh
  refreshMonetizationConfig: () => void;
}

const MonetizationContext = createContext<MonetizationContextValue | null>(null);

export const MonetizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Subscription State loaded from SubscriptionService
  const [subscription, setSubscription] = useState<Subscription>(() => {
    return SubscriptionService.getSubscription('current_user');
  });

  // 2. Credit Wallet loaded from CreditService
  const [wallet, setWallet] = useState<CreditWallet>(() => {
    return CreditService.getWallet('current_user');
  });

  // 3. Admin-configurable plans, packages, feature costs
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => SubscriptionService.getPlans());
  const [packages, setPackages] = useState<CreditPackage[]>(() => SubscriptionService.getPackages());
  const [featureCosts, setFeatureCosts] = useState<FeatureCreditCost[]>(() => SubscriptionService.getFeatureCosts());
  const [transactions, setTransactions] = useState<CreditTransaction[]>(() => CreditService.getTransactions('current_user'));

  // Modals and Transient UI State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [gatedFeatureDetails, setGatedFeatureDetails] = useState<GatedFeatureDetails | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isInsufficientModalOpen, setIsInsufficientModalOpen] = useState(false);
  const [insufficientDetails, setInsufficientDetails] = useState<InsufficientCreditsDetails | null>(null);
  const [demoFeedbackMessage, setDemoFeedbackMessage] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<MonetizationEvent[]>(() => getStoredMonetizationEvents());

  const showFeedback = useCallback((msg: string) => {
    setDemoFeedbackMessage(msg);
    setTimeout(() => {
      setDemoFeedbackMessage(null);
    }, 4500);
  }, []);

  const refreshMonetizationConfig = useCallback(() => {
    setPlans(SubscriptionService.getPlans());
    setPackages(SubscriptionService.getPackages());
    setFeatureCosts(SubscriptionService.getFeatureCosts());
    setSubscription(SubscriptionService.getSubscription('current_user'));
    setWallet(CreditService.getWallet('current_user'));
    setTransactions(CreditService.getTransactions('current_user'));
  }, []);

  const refreshCredits = useCallback(() => {
    const updatedWallet = CreditService.getWallet('current_user');
    setWallet(updatedWallet);
    setTransactions(CreditService.getTransactions('current_user'));
  }, []);

  // Backward compatible credits alias
  const credits: CreditBalance = {
    balance: wallet.balance,
    lifetimeEarned: wallet.lifetimeEarned,
    lifetimeSpent: wallet.lifetimeUsed,
    lastUpdated: wallet.updatedAt
  };

  const isAdmin = subscription.tier === 'admin';
  const isPremium = (subscription.tier === 'premium' && subscription.status === 'active') || isAdmin;

  // Current active plan definition
  const activePlan = plans.find(p => p.id === subscription.planId) || plans.find(p => p.tier === subscription.tier) || plans[0];

  const trackEvent = useCallback((type: MonetizationEventType, data: Record<string, string | number | boolean | undefined> = {}) => {
    const ev = trackMonetizationEvent(type, {
      ...data,
      userTier: subscription.tier,
      creditBalance: wallet.balance
    });
    setRecentEvents(prev => [ev, ...prev.slice(0, 49)]);
  }, [subscription.tier, wallet.balance]);

  // Demo Subscription Actions
  const activateDemoSubscription = async (planId: string = 'plan-premium', cycle: BillingCycle = 'annual') => {
    trackEvent('upgrade_started', { planId, cycle });
    
    // Process via PaymentService abstraction
    await PaymentService.processSubscription(planId, cycle, 'current_user');
    
    const updatedSub = SubscriptionService.getSubscription('current_user');
    setSubscription(updatedSub);
    refreshCredits();
    
    trackEvent('upgrade_completed', { planId, cycle });
    showFeedback(`Activated ${updatedSub.tier.toUpperCase()} plan (${cycle}). Full workspace & tools are now unlocked.`);
    setIsUpgradeModalOpen(false);
  };

  const cancelDemoSubscription = () => {
    const updated = SubscriptionService.cancelSubscription('current_user');
    setSubscription(updated);
    showFeedback('Subscription status set to Cancelled (retains access until expiry).');
  };

  const expireDemoSubscription = () => {
    const updated = SubscriptionService.expireSubscription('current_user');
    setSubscription(updated);
    showFeedback('Subscription marked as Expired.');
  };

  const restoreDemoSubscription = () => {
    const updated = SubscriptionService.restoreToFree('current_user');
    setSubscription(updated);
    showFeedback('Reverted to FundEcho Free tier.');
  };

  const toggleAdminDemoTier = () => {
    if (isAdmin) {
      const updated = SubscriptionService.restoreToFree('current_user');
      setSubscription(updated);
      showFeedback('Reverted from Admin to Free tier.');
    } else {
      const updated = SubscriptionService.setAdminTier(true, 'current_user');
      setSubscription(updated);
      showFeedback('Switched to Administrator access.');
    }
  };

  const toggleDemoTier = () => {
    if (isPremium) {
      restoreDemoSubscription();
    } else {
      activateDemoSubscription('plan-premium', 'annual');
    }
  };

  // Credit Actions
  const addDemoCredits = async (packageId: string) => {
    trackEvent('credit_purchase_started', { packageId });

    await PaymentService.processCreditPurchase(packageId, 'current_user');
    refreshCredits();

    const pkg = packages.find(p => p.id === packageId) || packages[0];
    const totalAdded = pkg.credits + (pkg.bonusCredits || 0);

    trackEvent('credit_package_selected', { packageId: pkg.id, addedAmount: totalAdded });
    showFeedback(`Added ${totalAdded} credits to your wallet.`);
    setIsCreditModalOpen(false);
    setIsUpgradeModalOpen(false);
    setIsInsufficientModalOpen(false);
  };

  const useCredits = (amount: number, featureName: string): boolean => {
    if (isAdmin) {
      trackEvent('credit_used', { amount: 0, featureName, tier: 'admin_unrestricted' });
      return true;
    }

    const result = CreditService.consumeCredits(amount, featureName, `Action: ${featureName}`, 'current_user');
    if (result.success) {
      refreshCredits();
      trackEvent('credit_used', { amount, featureName, remaining: result.newBalance });
      showFeedback(`Used ${amount} credits for ${featureName}. Remaining balance: ${result.newBalance}`);
      return true;
    }

    // Insufficient credits
    openInsufficientModal({
      featureName,
      requiredCredits: amount,
      availableCredits: wallet.balance
    });
    return false;
  };

  const consumeFeatureCredits = (featureKey: string, customDesc?: string): boolean => {
    if (isAdmin) return true;
    const cost = SubscriptionService.getCostForFeature(featureKey);
    const costRule = featureCosts.find(c => c.key === featureKey);
    const label = costRule?.name || featureKey.replace(/_/g, ' ');
    return useCredits(cost, customDesc || label);
  };

  // Feature Access Control & Usage Limits
  const checkFeatureAccess = (featureKey: FeatureKey | string): FeatureAccessResult & {
    limitReached?: boolean;
    limitMessage?: string;
    usageInfo?: { used: number; limit: number; remaining: number };
  } => {
    // 1. Admin tier has unrestricted access to all features
    if (isAdmin) {
      return {
        hasAccess: true,
        reason: 'free_tier',
        rule: {
          key: featureKey as FeatureKey,
          name: featureKey,
          description: 'Unrestricted admin privileges',
          accessType: 'free',
          minimumTier: 'free'
        }
      };
    }

    // 2. Check Plan Feature Permissions
    const planPermission = activePlan.featurePermissions[featureKey];
    const cost = SubscriptionService.getCostForFeature(featureKey);

    // Map featureKey to usage limits if applicable
    let limitKey: string | null = null;
    if (featureKey.includes('save') || featureKey === 'save_opportunities') limitKey = 'savedOpportunitiesLimit';
    else if (featureKey.includes('workspace') || featureKey.includes('draft')) limitKey = 'activeWorkspaceDraftsLimit';
    else if (featureKey.includes('ai') || featureKey.includes('proposal') || featureKey.includes('scorer')) limitKey = 'monthlyAiAssistsLimit';
    else if (featureKey.includes('eligibility')) limitKey = 'monthlyEligibilityChecksLimit';
    else if (featureKey.includes('calendar') || featureKey.includes('export')) limitKey = 'exportCalendarLimit';

    if (limitKey && activePlan.usageLimits[limitKey] !== undefined) {
      const limitVal = activePlan.usageLimits[limitKey];
      const check = UsageLimitService.checkLimit(featureKey, limitVal, 'current_user', 'monthly');

      if (!check.allowed) {
        return {
          hasAccess: false,
          reason: 'locked_upgrade_required',
          limitReached: true,
          limitMessage: check.message,
          usageInfo: { used: check.used, limit: check.limit, remaining: check.remaining },
          rule: {
            key: featureKey as FeatureKey,
            name: featureKey,
            description: check.message,
            accessType: 'free',
            minimumTier: 'premium'
          },
          requiredCredits: cost
        };
      }
    }

    // If explicit plan permission is granted
    if (planPermission === true) {
      return {
        hasAccess: true,
        reason: isPremium ? 'premium_subscription' : 'free_tier',
        rule: {
          key: featureKey as FeatureKey,
          name: featureKey,
          description: 'Included in active plan',
          accessType: 'free',
          minimumTier: activePlan.tier
        }
      };
    }

    // If feature is credit-based, check credit balance
    if (wallet.balance >= cost) {
      return {
        hasAccess: true,
        reason: 'credits_available',
        requiredCredits: cost,
        rule: {
          key: featureKey as FeatureKey,
          name: featureKey,
          description: `Requires ${cost} credits`,
          accessType: 'credit_based',
          requiredCredits: cost,
          minimumTier: 'free'
        }
      };
    }

    // Default: Locked, requires upgrade or credits
    return {
      hasAccess: false,
      reason: 'locked_upgrade_required',
      requiredCredits: cost,
      rule: {
        key: featureKey as FeatureKey,
        name: featureKey,
        description: `Requires FundEcho Premium or ${cost} credits.`,
        accessType: 'premium',
        requiredCredits: cost,
        minimumTier: 'premium'
      }
    };
  };

  const requireFeatureAccess = (
    featureKey: FeatureKey | string, 
    onGranted: () => void,
    fallbackTitle?: string,
    fallbackDesc?: string
  ) => {
    const access = checkFeatureAccess(featureKey);
    if (access.hasAccess) {
      // Deduct credits if credit based and not premium/admin
      if (!isPremium && access.reason === 'credits_available' && access.requiredCredits) {
        const success = useCredits(access.requiredCredits, fallbackTitle || String(featureKey));
        if (success) {
          UsageLimitService.recordUsage(featureKey);
          onGranted();
        }
        return;
      }

      UsageLimitService.recordUsage(featureKey);
      onGranted();
      return;
    }

    // Not accessible: open upgrade or insufficient credits modal
    if (access.limitReached) {
      openUpgradeModal(
        featureKey,
        `Monthly Limit Reached`,
        access.limitMessage || 'You have reached your free plan monthly usage limit.'
      );
      return;
    }

    openUpgradeModal(
      featureKey, 
      fallbackTitle || access.rule.name, 
      fallbackDesc || access.rule.description
    );
  };

  const executeWithFeatureGate = (
    featureKey: string,
    onExecute: () => void,
    options?: {
      fallbackTitle?: string;
      fallbackDesc?: string;
      customCost?: number;
    }
  ) => {
    requireFeatureAccess(
      featureKey,
      onExecute,
      options?.fallbackTitle,
      options?.fallbackDesc
    );
  };

  // Usage info queries
  const getFeatureUsage = (featureKey: string, period: UsagePeriod = 'monthly'): UsageRecord => {
    return UsageLimitService.getUsage(featureKey, 'current_user', period);
  };

  const getAllUsageRecords = (): UsageRecord[] => {
    return UsageLimitService.getCurrentPeriodUsage('current_user');
  };

  // Modal helpers
  const openUpgradeModal = (featureKey?: string, customTitle?: string, customDescription?: string) => {
    trackEvent('feature_gate_shown', { featureKey, customTitle });
    const cost = featureKey ? SubscriptionService.getCostForFeature(featureKey) : undefined;
    const rule = featureKey ? FEATURE_ACCESS_RULES[featureKey as FeatureKey] : undefined;

    setGatedFeatureDetails({
      key: featureKey,
      title: customTitle || rule?.name || 'Unlock Advanced Capabilities',
      description: customDescription || rule?.description || 'Upgrade to FundEcho Premium or use credits to continue.',
      requiredCredits: cost || rule?.requiredCredits,
      reason: 'premium_only'
    });
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setGatedFeatureDetails(null);
  };

  const openCreditModal = () => {
    trackEvent('credit_purchase_started', { source: 'badge_click' });
    setIsCreditModalOpen(true);
  };

  const closeCreditModal = () => {
    setIsCreditModalOpen(false);
  };

  const openInsufficientModal = (details: InsufficientCreditsDetails) => {
    setInsufficientDetails(details);
    setIsInsufficientModalOpen(true);
  };

  const closeInsufficientModal = () => {
    setIsInsufficientModalOpen(false);
    setInsufficientDetails(null);
  };

  return (
    <MonetizationContext.Provider
      value={{
        subscription,
        wallet,
        credits,
        isPremium,
        isAdmin,
        tier: subscription.tier,
        status: subscription.status,
        plans,
        packages,
        featureCosts,
        activePlan,
        transactions,
        toggleDemoTier,
        activateDemoSubscription,
        cancelDemoSubscription,
        expireDemoSubscription,
        restoreDemoSubscription,
        toggleAdminDemoTier,
        addDemoCredits,
        useCredits,
        consumeFeatureCredits,
        refreshCredits,
        checkFeatureAccess,
        requireFeatureAccess,
        executeWithFeatureGate,
        getFeatureUsage,
        getAllUsageRecords,
        isUpgradeModalOpen,
        gatedFeatureDetails,
        openUpgradeModal,
        closeUpgradeModal,
        isCreditModalOpen,
        openCreditModal,
        closeCreditModal,
        isInsufficientModalOpen,
        insufficientDetails,
        openInsufficientModal,
        closeInsufficientModal,
        trackEvent,
        recentEvents,
        demoFeedbackMessage,
        clearDemoFeedback: () => setDemoFeedbackMessage(null),
        refreshMonetizationConfig
      }}
    >
      {children}
    </MonetizationContext.Provider>
  );
};

export function useMonetization() {
  const context = useContext(MonetizationContext);
  if (!context) {
    throw new Error('useMonetization must be used within a MonetizationProvider');
  }
  return context;
}
