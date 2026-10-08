import fs from 'fs';
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(
  /export interface EligibilityCriteria \{/,
  `export interface EligibilityCriteria {\n  eligibleOrganizationTypes?: string[];\n  eligibleIndustries?: string[];\n  eligibleFundingTypes?: string[];\n  eligibleAgeRange?: { min?: number; max?: number };\n  eligibleGenders?: string[];\n  eligibleEducationLevels?: string[];\n  eligibleBusinessStages?: string[];\n  eligibleBusinessSizes?: string[];\n  eligibilityRequirements?: string[];\n  eligibilityNotes?: string;`
);

code = code.replace(
  /export interface UserProfile \{/,
  `export interface UserProfile {\n  stateProvince?: string;\n  organizationType?: string;\n  occupation?: string;\n  fundingTypes?: string[];\n  gender?: string;\n  businessSize?: string;\n  organizationSize?: string;\n  goals?: string[];`
);

fs.writeFileSync('src/types/index.ts', code);
