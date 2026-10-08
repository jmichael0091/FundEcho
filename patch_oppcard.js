import fs from 'fs';
let code = fs.readFileSync('src/components/ui/OpportunityCard.tsx', 'utf8');

const replacement = `{opportunity.featured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/70 dark:border-indigo-800/60">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Featured
              </span>
            )}
            {opportunity.matchResult && (
              <span className={\`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border \${
                opportunity.matchResult.eligibilityStatus === 'Eligible' 
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/60'
                  : opportunity.matchResult.eligibilityStatus === 'Likely Eligible'
                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800/60'
                  : opportunity.matchResult.eligibilityStatus === 'Not Eligible'
                  ? 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800/60'
                  : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800/60'
              }\`}>
                {opportunity.matchResult.matchScore}% Match
              </span>
            )}`;

code = code.replace(
  /\{opportunity\.featured && \(\n\s*<span className="inline-flex items-center gap-1 text-\[11px\] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950\/60 px-2 py-0.5 rounded-md border border-indigo-200\/70 dark:border-indigo-800\/60">\n\s*<Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" \/>\n\s*.*?\n\s*<\/span>\n\s*\)\}/s,
  replacement
);

fs.writeFileSync('src/components/ui/OpportunityCard.tsx', code);
