import fs from 'fs';
let code = fs.readFileSync('src/pages/OpportunitiesPage.tsx', 'utf8');

// Add the default state for eligibilityStatus
code = code.replace(
  /savedOnly: false,\n\s*sortBy: /g,
  `savedOnly: false,\n    eligibilityStatus: 'all',\n    sortBy: `
);

// Add the eligibilityStatus option to reset
code = code.replace(
  /savedOnly: false,\n\s*sortBy: filters\.sortBy,\n\s*\}\);/g,
  `savedOnly: false,\n      eligibilityStatus: 'all',\n      sortBy: filters.sortBy,\n    });`
);

// Add the UI
const UI_REPLACEMENT = `
            {/* Eligibility Filter */}
            {userProfile && (
            <div className="space-y-2">
              <label htmlFor="filter-eligibility" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Eligibility Status
              </label>
              <div className="relative">
                <select
                  id="filter-eligibility"
                  value={filters.eligibilityStatus || 'all'}
                  onChange={(e) => updateFilters({ eligibilityStatus: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none truncate"
                >
                  <option value="all">All Opportunities</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Likely Eligible">Likely Eligible</option>
                  <option value="Needs Verification">Needs Verification</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
              </div>
            </div>
            )}
            
            {/* Category Domain Filter */}`;

code = code.replace(/\{\/\* Category Domain Filter \*\/\}/, UI_REPLACEMENT);

// Add active filter chip
const CHIP_REPLACEMENT = `
                {filters.eligibilityStatus && filters.eligibilityStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                    Eligibility: {filters.eligibilityStatus}
                    <button
                      type="button"
                      onClick={() => updateFilters({ eligibilityStatus: 'all' })}
                      className="hover:text-emerald-900 dark:hover:text-white p-0.5 rounded-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.selectedAmountTier !== 'all'`;

code = code.replace(/\{filters\.selectedAmountTier !== 'all'/g, CHIP_REPLACEMENT);

fs.writeFileSync('src/pages/OpportunitiesPage.tsx', code);
