import fs from 'fs';
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(
  /export interface Opportunity \{/,
  `export interface Opportunity {\n  matchResult?: any;`
);

fs.writeFileSync('src/types/index.ts', code);
