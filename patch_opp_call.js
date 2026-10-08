import fs from 'fs';
let code = fs.readFileSync('src/pages/OpportunitiesPage.tsx', 'utf8');

code = code.replace(
  /return executeDiscoverySearch\(opportunities, categories, filters, bookmarkedIds\);/,
  `return executeDiscoverySearch(opportunities, categories, filters, bookmarkedIds, userProfile);`
);

code = code.replace(
  /\[opportunities, categories, filters, bookmarkedIds\]\)/,
  `[opportunities, categories, filters, bookmarkedIds, userProfile])`
);

fs.writeFileSync('src/pages/OpportunitiesPage.tsx', code);
