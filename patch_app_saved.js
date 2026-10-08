import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<SavedOpportunitiesPage\n\s+allOpportunities=\{allOpportunities\}/g,
  `<SavedOpportunitiesPage\n            userProfile={user}\n            allOpportunities={allOpportunities}`
);

fs.writeFileSync('src/App.tsx', code);
