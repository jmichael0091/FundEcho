import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<HomePage\n\s*categories=\{allCategories\}/,
  `<HomePage\n            userProfile={user}\n            categories={allCategories}`
);

fs.writeFileSync('src/App.tsx', code);
