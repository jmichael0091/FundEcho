import {
  PaymentInitParams,
  PaymentSession,
  PaymentResult,
  BillingCycle
} from '../types/monetization';
import { CreditService } from './creditService';
import { SubscriptionService } from './subscriptionService';

/**
 * PaymentService Abstraction Layer (Step 17)
 * Provides a uniform contract for payment processing.
 * Prepared for real gateway drivers (Stripe, Paystack, Flutterwave) in production.
 * Currently uses local demo sandbox responses (no real charges, no fabricated transactions).
 */
export class PaymentService {
  /**
   * Initializes a checkout session
   */
  public static async initializePayment(params: PaymentInitParams): Promise<PaymentSession> {
    // Simulated network latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    const sessionId = `demo_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      sessionId,
      provider: 'demo',
      status: 'pending',
      initParams: params,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Verifies a completed payment session
   */
  public static async verifyPayment(sessionId: string): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    return {
      success: true,
      transactionId: `demo_tx_${Date.now()}`,
      sessionId,
      amount: 0,
      currency: 'USD',
      message: 'Demo Sandbox Payment verified successfully. No monetary transaction occurred.',
      timestamp: new Date().toISOString(),
      isDemo: true
    };
  }

  /**
   * Process a subscription checkout in demo mode
   */
  public static async processSubscription(
    planId: string,
    cycle: BillingCycle = 'annual',
    userId: string = 'current_user'
  ): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Activate the subscription in local service
    SubscriptionService.activateSubscription(planId, cycle, userId);

    const plans = SubscriptionService.getPlans();
    const plan = plans.find((p) => p.id === planId) || plans[1];
    const amount = cycle === 'annual' ? plan.annualPriceUSD : plan.monthlyPriceUSD;

    return {
      success: true,
      transactionId: `sub_demo_${Date.now()}`,
      amount,
      currency: 'USD',
      message: `Demo mode: ${plan.name} (${cycle}) activated. No card was charged.`,
      timestamp: new Date().toISOString(),
      isDemo: true
    };
  }

  /**
   * Process a credit package purchase in demo mode
   */
  public static async processCreditPurchase(
    packageId: string,
    userId: string = 'current_user'
  ): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const packages = SubscriptionService.getPackages();
    const pkg = packages.find((p) => p.id === packageId) || packages[0];
    const totalCredits = pkg.credits + (pkg.bonusCredits || 0);

    // Credit the wallet through transaction
    CreditService.addCredits(
      totalCredits,
      'purchase',
      `Demo Purchase: ${pkg.name} Package (${totalCredits} credits)`,
      `pkg_${pkg.id}`,
      userId
    );

    return {
      success: true,
      transactionId: `cred_demo_${Date.now()}`,
      amount: pkg.priceUSD,
      currency: pkg.currency || 'USD',
      message: `Demo mode: Added ${totalCredits} credits to wallet. No real charge processed.`,
      timestamp: new Date().toISOString(),
      isDemo: true
    };
  }

  /**
   * Refund an existing transaction in demo mode
   */
  public static async refundPayment(transactionId: string): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      success: true,
      transactionId: `refund_${transactionId}`,
      amount: 0,
      currency: 'USD',
      message: 'Demo transaction refunded in local state.',
      timestamp: new Date().toISOString(),
      isDemo: true
    };
  }

  /**
   * Ingest external webhook events (stubs for future Stripe / Paystack webhooks)
   */
  public static async handleWebhook(event: { type: string; payload: Record<string, unknown> }): Promise<boolean> {
    console.log('[PaymentService] Demo webhook received:', event.type);
    return true;
  }
}
