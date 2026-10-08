import fs from 'fs';
let code = fs.readFileSync('src/services/firebase/firestoreService.ts', 'utf8');

code = code.replace(
  /tags: Array.isArray\(data\.tags\) \? data\.tags : \['Verified', 'Funding'\],/,
  `tags: Array.isArray(data.tags) ? data.tags : ['Verified', 'Funding'],\n    eligibilityCriteria: data.eligibilityCriteria || { applicantTypes: [] },`
);

fs.writeFileSync('src/services/firebase/firestoreService.ts', code);
