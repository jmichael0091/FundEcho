import { BudgetItem, BudgetCategory } from '../types/application';

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  'Personnel & Salaries',
  'Equipment & Technology',
  'Operational & Logistics',
  'Travel & Fieldwork',
  'Marketing & Outreach',
  'Monitoring & Evaluation',
  'Indirect / Administrative',
  'Other Expenses',
];

/**
 * Sanitizes and calculates a budget item total.
 * Ensures quantity and unitCost are non-negative valid numbers.
 */
export function calculateBudgetItemTotal(quantity: number | string, unitCost: number | string): number {
  const q = typeof quantity === 'number' ? quantity : parseFloat(quantity);
  const c = typeof unitCost === 'number' ? unitCost : parseFloat(unitCost);

  if (isNaN(q) || isNaN(c) || q < 0 || c < 0) {
    return 0;
  }

  // Round to 2 decimal places to avoid floating point inaccuracies
  return Math.round(q * c * 100) / 100;
}

/**
 * Calculates total requested budget from list of budget items.
 */
export function calculateTotalBudget(items: BudgetItem[]): number {
  if (!items || items.length === 0) return 0;
  const sum = items.reduce((acc, item) => {
    const itemTotal = calculateBudgetItemTotal(item.quantity, item.unitCost);
    return acc + itemTotal;
  }, 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Computes breakdown by budget category.
 */
export function calculateBudgetCategoryBreakdown(items: BudgetItem[]): Record<BudgetCategory, { total: number; count: number; percentage: number }> {
  const breakdown: Record<string, { total: number; count: number; percentage: number }> = {};
  
  BUDGET_CATEGORIES.forEach((cat) => {
    breakdown[cat] = { total: 0, count: 0, percentage: 0 };
  });

  const totalSum = calculateTotalBudget(items);

  items.forEach((item) => {
    const itemTotal = calculateBudgetItemTotal(item.quantity, item.unitCost);
    const cat = item.category || 'Other Expenses';
    if (!breakdown[cat]) {
      breakdown[cat] = { total: 0, count: 0, percentage: 0 };
    }
    breakdown[cat].total += itemTotal;
    breakdown[cat].count += 1;
  });

  if (totalSum > 0) {
    Object.keys(breakdown).forEach((cat) => {
      breakdown[cat].percentage = Math.round((breakdown[cat].total / totalSum) * 100);
    });
  }

  return breakdown as Record<BudgetCategory, { total: number; count: number; percentage: number }>;
}

/**
 * Validates a single budget item.
 */
export function validateBudgetItem(item: Partial<BudgetItem>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.description || item.description.trim().length < 3) {
    errors.push('Item description must be at least 3 characters long.');
  }

  if (item.quantity === undefined || item.quantity === null || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
    errors.push('Quantity must be a positive number greater than 0.');
  }

  if (item.unitCost === undefined || item.unitCost === null || isNaN(Number(item.unitCost)) || Number(item.unitCost) < 0) {
    errors.push('Unit cost must be a non-negative number.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats a currency amount with comma separators.
 */
export function formatCurrencyDisplay(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}
