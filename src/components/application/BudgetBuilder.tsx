import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  DollarSign, 
  AlertTriangle, 
  Layers, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { BudgetItem, BudgetCategory } from '../../types/application';
import { 
  BUDGET_CATEGORIES, 
  calculateBudgetItemTotal, 
  calculateTotalBudget, 
  formatCurrencyDisplay,
  validateBudgetItem,
  calculateBudgetCategoryBreakdown
} from '../../utils/budgetCalculations';

interface BudgetBuilderProps {
  items: BudgetItem[];
  currency: string;
  maxGrantCeiling?: number;
  onChangeItems: (items: BudgetItem[]) => void;
}

export const BudgetBuilder: React.FC<BudgetBuilderProps> = ({
  items,
  currency,
  maxGrantCeiling = 0,
  onChangeItems,
}) => {
  // New Item Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form Fields
  const [formCategory, setFormCategory] = useState<BudgetCategory>('Personnel & Salaries');
  const [formDescription, setFormDescription] = useState('');
  const [formQuantity, setFormQuantity] = useState<number | string>(1);
  const [formUnitCost, setFormUnitCost] = useState<number | string>(1000);
  const [formJustification, setFormJustification] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const totalCalculatedBudget = calculateTotalBudget(items);
  const categoryBreakdown = calculateBudgetCategoryBreakdown(items);

  const resetForm = () => {
    setFormCategory('Personnel & Salaries');
    setFormDescription('');
    setFormQuantity(1);
    setFormUnitCost(1000);
    setFormJustification('');
    setFormErrors([]);
    setIsAdding(false);
    setEditingItemId(null);
  };

  const startEdit = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormQuantity(item.quantity);
    setFormUnitCost(item.unitCost);
    setFormJustification(item.justification || '');
    setFormErrors([]);
    setIsAdding(false);
  };

  const handleSaveItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const q = typeof formQuantity === 'string' ? parseFloat(formQuantity) : formQuantity;
    const c = typeof formUnitCost === 'string' ? parseFloat(formUnitCost) : formUnitCost;

    const validation = validateBudgetItem({
      description: formDescription,
      quantity: q,
      unitCost: c,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const itemTotal = calculateBudgetItemTotal(q, c);

    if (editingItemId) {
      // Update existing item
      const updated = items.map((item) => {
        if (item.id === editingItemId) {
          return {
            ...item,
            category: formCategory,
            description: formDescription.trim(),
            quantity: q,
            unitCost: c,
            total: itemTotal,
            justification: formJustification.trim(),
          };
        }
        return item;
      });
      onChangeItems(updated);
    } else {
      // Add new item
      const newItem: BudgetItem = {
        id: `budget-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: formCategory,
        description: formDescription.trim(),
        quantity: q,
        unitCost: c,
        total: itemTotal,
        justification: formJustification.trim(),
      };
      onChangeItems([...items, newItem]);
    }

    resetForm();
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    onChangeItems(updated);
    if (editingItemId === id) {
      resetForm();
    }
  };

  const isExceedingCeiling = maxGrantCeiling > 0 && totalCalculatedBudget > maxGrantCeiling;

  return (
    <div className="space-y-6">
      {/* Header & Overall Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Requested Budget */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Itemized Budget</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrencyDisplay(totalCalculatedBudget, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {items.length} line {items.length === 1 ? 'item' : 'items'} defined
          </p>
        </div>

        {/* Card 2: Opportunity Grant Ceiling */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Opportunity Ceiling</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {maxGrantCeiling > 0 ? formatCurrencyDisplay(maxGrantCeiling, currency) : 'Flexible'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official maximum award limit
          </p>
        </div>

        {/* Card 3: Compliance Status */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          isExceedingCeiling
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Budget Status</span>
            {isExceedingCeiling ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <p className="text-base font-bold">
            {isExceedingCeiling ? 'Exceeds Opportunity Ceiling' : 'Within Allowed Range'}
          </p>
          <p className="text-xs mt-1 opacity-90">
            {isExceedingCeiling
              ? `Requested budget exceeds limit by ${formatCurrencyDisplay(totalCalculatedBudget - maxGrantCeiling, currency)}`
              : 'Itemized totals match grant requirements'}
          </p>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Itemized Cost Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide realistic unit estimates and justifications for each expenditure category.
            </p>
          </div>

          {!isAdding && !editingItemId && (
            <button
              type="button"
              id="add-budget-item-btn"
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Budget Line Item</span>
            </button>
          )}
        </div>

        {/* Add/Edit Form Inline */}
        {(isAdding || editingItemId) && (
          <div className="p-5 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                {editingItemId ? 'Edit Budget Line Item' : 'New Budget Line Item'}
              </h4>
              <button
                type="button"
                id="cancel-budget-form-btn"
                onClick={resetForm}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs space-y-1">
                {formErrors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Category */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  id="budget-category-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as BudgetCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  id="budget-description-input"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Lead Project Researcher (12 months full-time)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Quantity */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="budget-quantity-input"
                  min="1"
                  step="1"
                  value={formQuantity}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                    setFormQuantity(val);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Unit Cost */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit Cost ({currency}) *
                </label>
                <input
                  type="number"
                  id="budget-unitcost-input"
                  min="0"
                  step="any"
                  value={formUnitCost}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                    setFormUnitCost(val);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Calculated Line Total */}
              <div className="sm:col-span-5 flex flex-col justify-end">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    Calculated Line Total
                  </span>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrencyDisplay(
                      calculateBudgetItemTotal(formQuantity, formUnitCost),
                      currency
                    )}
                  </p>
                </div>
              </div>

              {/* Justification */}
              <div className="sm:col-span-12">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expenditure Justification (Optional):
                </label>
                <input
                  type="text"
                  id="budget-justification-input"
                  value={formJustification}
                  onChange={(e) => setFormJustification(e.target.value)}
                  placeholder="Briefly state why this expense is essential to deliver project milestones."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                id="cancel-save-budget-btn"
                onClick={resetForm}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-save-budget-btn"
                onClick={() => handleSaveItem()}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                {editingItemId ? 'Update Line Item' : 'Add Item to Schedule'}
              </button>
            </div>
          </div>
        )}

        {/* Items List / Table */}
        {items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No budget line items added yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Every funding proposal requires an itemized cost schedule showing how requested funds will be allocated.
              </p>
            </div>
            {!isAdding && (
              <button
                type="button"
                id="empty-add-budget-btn"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Budget Item</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, index) => {
                  const itemTotal = calculateBudgetItemTotal(item.quantity, item.unitCost);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.description}
                        </div>
                        {item.justification && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {item.justification}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatCurrencyDisplay(item.unitCost, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrencyDisplay(itemTotal, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            id={`edit-budget-item-${item.id}`}
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            id={`delete-budget-item-${item.id}`}
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50/70 dark:bg-slate-800/70 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-right uppercase text-xs">
                    Grand Total Requested:
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-indigo-600 dark:text-indigo-400">
                    {formatCurrencyDisplay(totalCalculatedBudget, currency)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Category Breakdown Bar */}
      {items.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Budget Allocation Breakdown</span>
            <span>100% Itemized</span>
          </div>

          {/* Color bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
            {Object.entries(categoryBreakdown).map(([cat, data], idx) => {
              if (data.percentage <= 0) return null;
              const colors = [
                'bg-indigo-500',
                'bg-emerald-500',
                'bg-blue-500',
                'bg-amber-500',
                'bg-rose-500',
                'bg-purple-500',
                'bg-teal-500',
                'bg-cyan-500',
              ];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={cat}
                  style={{ width: `${data.percentage}%` }}
                  className={`${color} h-full transition-all duration-300`}
                  title={`${cat}: ${data.percentage}% (${formatCurrencyDisplay(data.total, currency)})`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {Object.entries(categoryBreakdown).map(([cat, data]) => {
              if (data.percentage <= 0) return null;
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cat}:</span>
                  <span>{data.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
