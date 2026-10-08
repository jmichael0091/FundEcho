import fs from 'fs';
let code = fs.readFileSync('src/pages/SavedOpportunitiesPage.tsx', 'utf8');

code = code.replace(
  /export interface SavedOpportunitiesPageProps \{/,
  `import { UserProfile } from '../types';\nimport { calculateOpportunityMatch } from '../services/matching/matchingEngine';\n\nexport interface SavedOpportunitiesPageProps {\n  userProfile?: UserProfile | null;`
);

code = code.replace(
  /onToggleBookmark,\n\}\) => \{/,
  `onToggleBookmark,\n  userProfile,\n}) => {`
);

code = code.replace(
  /const filteredAndSortedOpportunities = useMemo\(\(\) => \{/,
  `const filteredAndSortedOpportunities = useMemo(() => {`
);

code = code.replace(
  /return savedOpportunities\n\s*\.filter\(/,
  `const scoredOpportunities = savedOpportunities.map(opp => {\n      return { ...opp, matchResult: userProfile ? calculateOpportunityMatch(userProfile, opp) : null };\n    });\n    return scoredOpportunities.filter(`
);

fs.writeFileSync('src/pages/SavedOpportunitiesPage.tsx', code);
