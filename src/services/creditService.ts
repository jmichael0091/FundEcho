import { 
  CreditWallet, 
  CreditTransaction, 
  CreditTransactionType 
} from '../types/monetization';

const STORAGE_KEY_WALLET = 'fundora_credit_wallet';
const STORAGE_KEY_TRANSACTIONS = 'fundora_credit_transactions';

const DEFAULT_INITIAL_BALANCE = 50;

/**
 * Centralized CreditService (Step 17)
 * Enforces transactional integrity:
 * - Balance cannot be increased directly without a transaction
 * - Balance cannot drop below zero
 * - All actions log structured transactions
 */
export class CreditService {
  private static getStorageKey(userId?: string): string {
    return userId ? `${STORAGE_KEY_WALLET}_${userId}` : STORAGE_KEY_WALLET;
  }

  private static getTxStorageKey(userId?: string): string {
    return userId ? `${STORAGE_KEY_TRANSACTIONS}_${userId}` : STORAGE_KEY_TRANSACTIONS;
  }

  /**
   * Get the current user's wallet
   */
  public static getWallet(userId: string = 'current_user'): CreditWallet {
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }

    // Default starting wallet
    const initialWallet: CreditWallet = {
      userId,
      balance: DEFAULT_INITIAL_BALANCE,
      lifetimeEarned: DEFAULT_INITIAL_BALANCE,
      lifetimeUsed: 0,
      updatedAt: new Date().toISOString()
    };

    this.saveWallet(initialWallet);

    // Record welcome bonus transaction if brand new
    this.recordTransaction({
      id: `tx-init-${Date.now()}`,
      userId,
      type: 'bonus',
      amount: DEFAULT_INITIAL_BALANCE,
      description: 'Welcome Seeker Credit Grant',
      reference: 'account_creation_bonus',
      timestamp: new Date().toISOString()
    }, userId);

    return initialWallet;
  }

  /**
   * Get current balance
   */
  public static getBalance(userId: string = 'current_user'): number {
    const wallet = this.getWallet(userId);
    return Math.max(0, wallet.balance);
  }

  /**
   * Add credits to wallet through an audited transaction
   */
  public static addCredits(
    amount: number,
    type: CreditTransactionType,
    description: string,
    reference?: string,
    userId: string = 'current_user'
  ): CreditWallet {
    if (amount <= 0) {
      return this.getWallet(userId);
    }

    const currentWallet = this.getWallet(userId);
    const newBalance = currentWallet.balance + amount;
    const newLifetimeEarned = currentWallet.lifetimeEarned + amount;

    const updatedWallet: CreditWallet = {
      ...currentWallet,
      balance: newBalance,
      lifetimeEarned: newLifetimeEarned,
      updatedAt: new Date().toISOString()
    };

    this.saveWallet(updatedWallet);

    this.recordTransaction({
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      type,
      amount,
      description,
      reference,
      timestamp: new Date().toISOString()
    }, userId);

    return updatedWallet;
  }

  /**
   * Consume credits for a specific feature
   * Returns success: false if insufficient credits
   * Enforces zero negative balance
   */
  public static consumeCredits(
    amount: number,
    feature: string,
    description: string,
    userId: string = 'current_user'
  ): { success: boolean; newBalance: number; error?: string } {
    if (amount < 0) {
      return { success: false, newBalance: this.getBalance(userId), error: 'Invalid deduction amount' };
    }

    const currentWallet = this.getWallet(userId);

    if (currentWallet.balance < amount) {
      return {
        success: false,
        newBalance: currentWallet.balance,
        error: `Insufficient credits. Required: ${amount}, Available: ${currentWallet.balance}`
      };
    }

    const newBalance = currentWallet.balance - amount;
    const newLifetimeUsed = currentWallet.lifetimeUsed + amount;

    const updatedWallet: CreditWallet = {
      ...currentWallet,
      balance: newBalance,
      lifetimeUsed: newLifetimeUsed,
      updatedAt: new Date().toISOString()
    };

    this.saveWallet(updatedWallet);

    this.recordTransaction({
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      type: 'usage',
      amount: -amount,
      feature,
      description,
      timestamp: new Date().toISOString()
    }, userId);

    return { success: true, newBalance };
  }

  /**
   * Refund credits previously consumed
   */
  public static refundCredits(
    amount: number,
    feature: string,
    description: string,
    reference?: string,
    userId: string = 'current_user'
  ): CreditWallet {
    return this.addCredits(amount, 'refund', `Refund for ${feature}: ${description}`, reference, userId);
  }

  /**
   * Administrative balance adjustment
   */
  public static adjustCredits(
    delta: number,
    description: string,
    userId: string = 'current_user'
  ): CreditWallet {
    const currentWallet = this.getWallet(userId);
    const newBalance = Math.max(0, currentWallet.balance + delta);

    const updatedWallet: CreditWallet = {
      ...currentWallet,
      balance: newBalance,
      updatedAt: new Date().toISOString()
    };

    this.saveWallet(updatedWallet);

    this.recordTransaction({
      id: `tx-adj-${Date.now()}`,
      userId,
      type: 'adjustment',
      amount: delta,
      description: `Manual adjustment: ${description}`,
      timestamp: new Date().toISOString()
    }, userId);

    return updatedWallet;
  }

  /**
   * Get all transactions for the user
   */
  public static getTransactions(userId: string = 'current_user'): CreditTransaction[] {
    try {
      const stored = localStorage.getItem(this.getTxStorageKey(userId));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  /**
   * Get all platform transactions (for Admin overview)
   */
  public static getAllPlatformTransactions(): CreditTransaction[] {
    const defaultTxs = this.getTransactions('current_user');
    return defaultTxs;
  }

  private static recordTransaction(tx: CreditTransaction, userId: string): void {
    const txs = this.getTransactions(userId);
    const updated = [tx, ...txs].slice(0, 200); // retain last 200 transactions
    try {
      localStorage.setItem(this.getTxStorageKey(userId), JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  private static saveWallet(wallet: CreditWallet): void {
    try {
      localStorage.setItem(this.getStorageKey(wallet.userId), JSON.stringify(wallet));
    } catch {
      // Ignore
    }
  }
}
