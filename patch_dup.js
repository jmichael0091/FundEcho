import fs from 'fs';
let code = fs.readFileSync('src/services/firebase/firestoreService.ts', 'utf8');

code = code.replace(
  /eligibilityCriteria: \{\n\s*isDemoData: Boolean\(data\.isSampleData\),\n\s*eligibleCountries: data\.eligibleCountries \|\| \['Global'\],\n\s*applicantTypes: \['Early-Stage Startup \/ Founder', 'Non-Profit \/ NGO \/ Community Group', 'Academic \/ Researcher \/ Faculty', 'Individual Innovator \/ Professional'\],\n\s*minimumAge: 18,\n\s*\}/,
  ""
);

fs.writeFileSync('src/services/firebase/firestoreService.ts', code);
