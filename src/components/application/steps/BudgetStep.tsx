import React from 'react';
import { DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import { BudgetItem } from '../../../types/application';
import { Opportunity } from '../../../types';
import { BudgetBuilder } from '../BudgetBuilder';

interface BudgetStepProps {
  items: BudgetItem[];
  currency: string;
  opportunity: Opportunity;
  onChangeItems: (items: BudgetItem[]) => void;
}

export const BudgetStep: React.FC<BudgetStepProps> = ({
  items,
  currency,
  opportunity,
  onChangeItems,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <DollarSign className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Project Budget & Itemized Financial Schedule
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Funders require an itemized breakdown of expenses with transparent unit calculations and descriptions. Add all anticipated personnel, equipment, travel, and operational costs below.
        </p>
      </div>

      {/* Main Budget Builder Component */}
      <BudgetBuilder
        items={items}
        currency={currency}
        maxGrantCeiling={opportunity.amount.max}
        onChangeItems={onChangeItems}
      />
    </div>
  );
};
