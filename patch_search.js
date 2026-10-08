import fs from 'fs';
let code = fs.readFileSync('src/utils/searchEngine.ts', 'utf8');

code = code.replace(
  /export interface FilterState \{/,
  `export interface FilterState {\n  eligibilityStatus?: string;`
);

code = code.replace(
  /import \{ Opportunity, Category \} from '\.\.\/types';/,
  `import { Opportunity, Category, UserProfile } from '../types';\nimport { calculateOpportunityMatch } from '../services/matching/matchingEngine';`
);

code = code.replace(
  /export function executeDiscoverySearch\(\n  opportunities: Opportunity\[\],\n  categories: Category\[\],\n  filters: FilterState,\n  bookmarkedIds: Set<string>\n\): \{ results: Opportunity\[\]; totalCount: number \} \{/,
  `export function executeDiscoverySearch(
  opportunities: Opportunity[],
  categories: Category[],
  filters: FilterState,
  bookmarkedIds: Set<string>,
  userProfile?: Partial<UserProfile> | null
): { results: (Opportunity & { matchResult?: any })[]; totalCount: number } {`
);

fs.writeFileSync('src/utils/searchEngine.ts', code);
