import fs from 'fs';
let code = fs.readFileSync('src/pages/RecommendedPage.tsx', 'utf8');

code = code.replace(/match\.score/g, 'match.matchScore');

fs.writeFileSync('src/pages/RecommendedPage.tsx', code);
