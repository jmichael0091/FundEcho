import React from 'react';
import { DollarSign, Clock, PieChart, Landmark, CheckCircle, AlertCircle } from 'lucide-react';
import { FundingRequest } from '../../../types/application';
import { Opportunity } from '../../../types';
import { formatCurrencyDisplay } from '../../../utils/budgetCalculations';

interface FundingRequestStepProps {
  funding: FundingRequest;
  opportunity: Opportunity;
  onChange: (updated: FundingRequest) => void;
}

export const FundingRequestStep: React.FC<FundingRequestStepProps> = ({
  funding,
  opportunity,
  onChange,
}) => {
  const handleChange = (field: keyof FundingRequest, value: any) => {
    onChange({
      ...funding,
      [field]: value,
    });
  };

  const requestedAmountNum = Number(funding.requestedAmount) || 0;
  const isOverCeiling = opportunity.amount.max > 0 && requestedAmountNum > opportunity.amount.max;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Funding Request & Project Parameters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Specify the exact funding amount requested from this opportunity, planned timeline, and co-funding details.
          </p>
        </div>

        {/* Opportunity Max Award Notice */}
        <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-700 dark:text-indigo-300">
              Provider Award Ceiling
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {opportunity.amount.displayText || formatCurrencyDisplay(opportunity.amount.max, opportunity.amount.currency)}
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Currency: <strong className="text-slate-800 dark:text-slate-200">{opportunity.amount.currency || 'USD'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Requested Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Total Requested Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                {funding.currency}
              </span>
              <input
                type="number"
                id="funding-requestedAmount-input"
                min="1"
                step="any"
                value={funding.requestedAmount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                  handleChange('requestedAmount', val);
                }}
                placeholder="25000"
                className={`w-full pl-14 pr-3 py-2 text-xs rounded-xl border ${
                  isOverCeiling
                    ? 'border-amber-400 focus:ring-amber-500 dark:border-amber-600'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2`}
              />
            </div>
            {isOverCeiling && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Requested amount exceeds opportunity ceiling of {formatCurrencyDisplay(opportunity.amount.max, opportunity.amount.currency)}.</span>
              </p>
            )}
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Funding Currency *
            </label>
            <select
              id="funding-currency-select"
              value={funding.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="CAD">CAD ($) - Canadian Dollar</option>
              <option value="AUD">AUD ($) - Australian Dollar</option>
              <option value="NGN">NGN (₦) - Nigerian Naira</option>
              <option value="KES">KES (KSh) - Kenyan Shilling</option>
              <option value="ZAR">ZAR (R) - South African Rand</option>
            </select>
          </div>

          {/* Funding Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Execution Duration (Months) *
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="number"
                id="funding-duration-input"
                min="1"
                max="60"
                value={funding.fundingDurationMonths}
                onChange={(e) => handleChange('fundingDurationMonths', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="12"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Primary Expense Focus */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Expenditure Focus *
            </label>
            <div className="relative">
              <PieChart className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                id="funding-expense-select"
                value={funding.primaryExpenseCategory}
                onChange={(e) => handleChange('primaryExpenseCategory', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Personnel & Salaries">Personnel & Project Team</option>
                <option value="Operational & Logistics">Operational & Field Delivery</option>
                <option value="Equipment & Technology">Equipment & Technology Infrastructure</option>
                <option value="Training & Workshops">Community Training & Workshops</option>
                <option value="Research & Pilot Testing">Research & Pilot Testing</option>
              </select>
            </div>
          </div>

          {/* Bank Country */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Disbursement Account Country
            </label>
            <div className="relative">
              <Landmark className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                id="funding-bankCountry-input"
                value={funding.bankCountry}
                onChange={(e) => handleChange('bankCountry', e.target.value)}
                placeholder="Country where grant disbursement funds will be held"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Co-Funding Toggle */}
          <div className="sm:col-span-2 space-y-3 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                id="funding-coFunding-checkbox"
                checked={funding.hasCoFunding}
                onChange={(e) => handleChange('hasCoFunding', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                This project has secured or pledged co-funding / matching support
              </span>
            </label>

            {funding.hasCoFunding && (
              <div className="pl-6 space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Co-Funding Details & Sources:
                </label>
                <textarea
                  rows={2}
                  id="funding-coFundingDetails-input"
                  value={funding.coFundingDetails}
                  onChange={(e) => handleChange('coFundingDetails', e.target.value)}
                  placeholder="Specify matching fund amounts, partnering foundations, institutional in-kind contributions, or sponsor commitments..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
