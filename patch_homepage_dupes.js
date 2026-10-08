import fs from 'fs';
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

code = code.replace(/import \{ Clock \} from 'lucide-react';\nimport \{ Clock \} from 'lucide-react';/, `import { Clock } from 'lucide-react';`);
code = code.replace(/userProfile\?: UserProfile \| null;\n\s*userProfile\?: UserProfile \| null;/, `userProfile?: UserProfile | null;`);

fs.writeFileSync('src/pages/HomePage.tsx', code);
