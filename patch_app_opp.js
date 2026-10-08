import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<OpportunitiesPage\n\s+opportunities=\{allOpportunities\}/g,
  `<OpportunitiesPage\n            userProfile={user}\n            opportunities={allOpportunities}`
);

fs.writeFileSync('src/App.tsx', code);
