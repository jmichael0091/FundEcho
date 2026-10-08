import fs from 'fs';
let code = fs.readFileSync('src/types/firebase/index.ts', 'utf8');

code = code.replace(
  /eligibility: string \| string\[\];/,
  `eligibility: string | string[];\n  eligibilityCriteria?: any;`
);

fs.writeFileSync('src/types/firebase/index.ts', code);
