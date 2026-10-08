import fs from 'fs';
let code = fs.readFileSync('src/pages/OpportunitiesPage.tsx', 'utf8');

if (!code.includes('userProfile?: UserProfile | null;')) {
  code = code.replace(
    /export interface OpportunitiesPageProps \{/,
    `import { UserProfile } from '../types';\n\nexport interface OpportunitiesPageProps {\n  userProfile?: UserProfile | null;`
  );
  
  code = code.replace(
    /onToggleBookmark,\n\}\) => \{/,
    `onToggleBookmark,\n  userProfile,\n}) => {`
  );
  fs.writeFileSync('src/pages/OpportunitiesPage.tsx', code);
}
