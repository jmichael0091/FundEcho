import { UsageRecord, UsagePeriod } from '../types/monetization';

const STORAGE_KEY_USAGE = 'fundora_usage_records';

/**
 * Reusable Usage-Limit System (Step 17)
 * Tracks and enforces feature usage caps across daily, monthly, or lifetime intervals.
 */
export class UsageLimitService {
  private static getPeriodKey(period: UsagePeriod): string {
    const now = new Date();
    if (period === 'daily') {
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    if (period === 'monthly') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`; // YYYY-MM
    }
    return 'lifetime';
  }

  private static getStorageKey(userId?: string): string {
    return userId ? `${STORAGE_KEY_USAGE}_${userId}` : STORAGE_KEY_USAGE;
  }

  private static loadRecords(userId: string = 'current_user'): Record<string, UsageRecord> {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId));
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return {};
  }

  private static saveRecords(records: Record<string, UsageRecord>, userId: string = 'current_user'): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(records));
    } catch {
      // Fallback
    }
  }

  /**
   * Look up usage record for a given feature and period
   */
  public static getUsage(
    feature: string,
    userId: string = 'current_user',
    period: UsagePeriod = 'monthly'
  ): UsageRecord {
    const periodKey = this.getPeriodKey(period);
    const lookupKey = `${feature}__${period}__${periodKey}`;
    const records = this.loadRecords(userId);

    if (records[lookupKey]) {
      return records[lookupKey];
    }

    return {
      userId,
      feature,
      period,
      usageCount: 0,
      limit: -1,
      periodKey
    };
  }

  /**
   * Check whether a user has exceeded their configured limit for this feature
   * limit = -1 means unlimited
   */
  public static checkLimit(
    feature: string,
    limit: number,
    userId: string = 'current_user',
    period: UsagePeriod = 'monthly',
    featureLabel?: string
  ): {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    message: string;
    isUnlimited: boolean;
  } {
    // -1 signifies unlimited access
    if (limit === -1) {
      const current = this.getUsage(feature, userId, period);
      return {
        allowed: true,
        used: current.usageCount,
        limit: -1,
        remaining: Infinity,
        message: 'Unlimited access',
        isUnlimited: true
      };
    }

    const current = this.getUsage(feature, userId, period);
    const used = current.usageCount;
    const remaining = Math.max(0, limit - used);
    const allowed = used < limit;

    const label = featureLabel || feature.replace(/_/g, ' ');
    const periodName = period === 'monthly' ? 'this month' : period === 'daily' ? 'today' : 'all-time';

    const message = allowed
      ? `You've used ${used} of ${limit} ${label} ${periodName}.`
      : `You've reached your limit of ${limit} ${label} ${periodName}. Upgrade to Premium for higher allowances.`;

    return {
      allowed,
      used,
      limit,
      remaining,
      message,
      isUnlimited: false
    };
  }

  /**
   * Record a successful usage of a limited feature
   */
  public static recordUsage(
    feature: string,
    limit: number = -1,
    userId: string = 'current_user',
    period: UsagePeriod = 'monthly'
  ): UsageRecord {
    const periodKey = this.getPeriodKey(period);
    const lookupKey = `${feature}__${period}__${periodKey}`;
    const records = this.loadRecords(userId);

    const existing = records[lookupKey] || {
      userId,
      feature,
      period,
      usageCount: 0,
      limit,
      periodKey
    };

    const updatedRecord: UsageRecord = {
      ...existing,
      usageCount: existing.usageCount + 1,
      limit
    };

    records[lookupKey] = updatedRecord;
    this.saveRecords(records, userId);

    return updatedRecord;
  }

  /**
   * Reset usage for a feature (e.g., admin reset)
   */
  public static resetUsage(
    feature: string,
    userId: string = 'current_user',
    period: UsagePeriod = 'monthly'
  ): void {
    const periodKey = this.getPeriodKey(period);
    const lookupKey = `${feature}__${period}__${periodKey}`;
    const records = this.loadRecords(userId);
    if (records[lookupKey]) {
      delete records[lookupKey];
      this.saveRecords(records, userId);
    }
  }

  /**
   * Get all active usage records for the current period (for billing/dashboard view)
   */
  public static getCurrentPeriodUsage(userId: string = 'current_user'): UsageRecord[] {
    const records = this.loadRecords(userId);
    const monthlyKey = this.getPeriodKey('monthly');
    return Object.values(records).filter(r => r.periodKey === monthlyKey || r.periodKey === 'lifetime');
  }
}
