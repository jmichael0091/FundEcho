import fs from 'fs';
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// Imports
code = code.replace(
  /import \{ Category, Opportunity, PageId \} from '\.\.\/types';/,
  `import { Category, Opportunity, PageId, UserProfile } from '../types';\nimport { generateDiscoverySections } from '../utils/discoveryUtils';\nimport { MatchCard } from '../components/ui/MatchCard';`
);

code = code.replace(
  /import \{ Badge \} from '\.\.\/components\/ui\/Badge';/,
  `import { Badge } from '../components/ui/Badge';\nimport { Clock } from 'lucide-react';`
);

// Props
code = code.replace(
  /export interface HomePageProps \{/,
  `export interface HomePageProps {\n  userProfile?: UserProfile | null;`
);

code = code.replace(
  /export const HomePage: React\.FC<HomePageProps> = \(\{/,
  `export const HomePage: React.FC<HomePageProps> = ({\n  userProfile,`
);

// State / useMemo
code = code.replace(
  /const \[selectedFeaturedTab, setSelectedFeaturedTab\] = useState.*?;/,
  `const discovery = React.useMemo(() => generateDiscoverySections(userProfile, opportunities), [userProfile, opportunities]);`
);

code = code.replace(
  /\/\/ Filter featured opportunities by tab[\s\S]*?value: 'Competition' as const \},\n\s*\];/,
  ``
);

fs.writeFileSync('src/pages/HomePage.tsx', code);
