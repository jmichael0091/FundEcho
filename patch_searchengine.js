import fs from 'fs';
let code = fs.readFileSync('src/utils/searchEngine.ts', 'utf8');

code = code.replace(
  /import \{ Opportunity, Category, OpportunityType, OpportunityRegion \} from '\.\.\/types';/,
  `import { Opportunity, Category, OpportunityType, OpportunityRegion, UserProfile } from '../types';\nimport { calculateOpportunityMatch } from './matching';`
);

fs.writeFileSync('src/utils/searchEngine.ts', code);
