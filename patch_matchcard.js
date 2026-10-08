import fs from 'fs';
let code = fs.readFileSync('src/components/ui/MatchCard.tsx', 'utf8');

const regex = /const getScoreTheme = \(score: number\) => \{[\s\S]*?const scoreTheme = getScoreTheme\(match\.score\);/;
const replacement = `const getScoreTheme = (score: number) => {
    if (score >= 90) return {
      badgeBg: 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-700 dark:border-indigo-400',
    };
    if (score >= 75) return {
      badgeBg: 'bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500',
    };
    if (score >= 60) return {
      badgeBg: 'bg-amber-500 dark:bg-amber-600 text-white border-amber-600 dark:border-amber-500',
    };
    return {
      badgeBg: 'bg-slate-600 text-white border-slate-700',
    };
  };

  const scoreTheme = getScoreTheme(match.matchScore);`;

code = code.replace(regex, replacement);

const regex2 = /<span>\{match\.score\}% Match<\/span>/;
code = code.replace(regex2, `<span>{match.matchScore}% Match</span>`);

const regex3 = /<span className="text-xs font-bold text-slate-600 dark:text-slate-300">\s*\{match\.qualityLabel\}\s*<\/span>/;
code = code.replace(regex3, `<span className="text-xs font-bold text-slate-600 dark:text-slate-300">{match.eligibilityStatus}</span>`);

const regex4 = /\{match\.criteria && match\.criteria\.length > 0 && \([\s\S]*?<\/div>\s*\)\}/;
const replacement4 = `{match.reasons && match.reasons.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>{showBreakdown ? 'Hide reasons' : 'Why this score?'}</span>
              {showBreakdown ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {showBreakdown && (
              <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs animate-in fade-in duration-150">
                <ul className="space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-300">
                  {match.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  {match.warnings.map((w, i) => <li key={'w'+i} className="text-rose-600 dark:text-rose-400">{w}</li>)}
                </ul>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    Match score indicates relevance, not guaranteed eligibility.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}`;
code = code.replace(regex4, replacement4);

fs.writeFileSync('src/components/ui/MatchCard.tsx', code);
