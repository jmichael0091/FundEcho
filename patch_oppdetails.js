import fs from 'fs';
let code = fs.readFileSync('src/pages/OpportunityDetailPage.tsx', 'utf8');

code = code.replace(/match\.score/g, 'match.matchScore');
code = code.replace(/match\.qualityLabel/g, 'match.eligibilityStatus');
code = code.replace(/\{match\.reason\}/g, '{match.reasons.join(" ")}');

code = code.replace(
  /\{match\.matchedTags\.length > 0 && \([\s\S]*?<\/div>\s*\)\}/,
  `{match.matchedCriteria.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {match.matchedCriteria.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}`
);

fs.writeFileSync('src/pages/OpportunityDetailPage.tsx', code);
