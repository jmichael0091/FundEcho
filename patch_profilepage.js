import fs from 'fs';
let code = fs.readFileSync('src/pages/ProfilePage.tsx', 'utf8');

// State definitions
code = code.replace(
  /const \[businessStage, setBusinessStage\] = useState\(user\.businessStage \|\| 'Early Stage \/ Prototype'\);/,
  `const [businessStage, setBusinessStage] = useState(user.businessStage || 'Early Stage / Prototype');\n  const [age, setAge] = useState<string>(user.age?.toString() || '');\n  const [gender, setGender] = useState(user.gender || '');\n  const [educationLevel, setEducationLevel] = useState(user.educationLevel || '');`
);

// Save handler
code = code.replace(
  /const updatedProfile: UserProfile = \{[\s\S]*?\};/,
  `const updatedProfile: UserProfile = {
      ...user,
      name,
      country,
      region,
      userType,
      businessStage,
      organizationName,
      industry,
      interests,
      preferredFundingTypes,
      age: age ? parseInt(age, 10) : undefined,
      gender,
      educationLevel,
    };`
);

const newFieldsUI = `
          {/* Demographic & Eligibility details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Demographics & Eligibility
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Optional demographic data helps us match you with specific grants.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Highest Education
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Not Specified</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate (Bachelors)</option>
                  <option value="Postgraduate">Postgraduate (Masters/PhD)</option>
                </select>
              </div>
            </div>
          </div>
`;

code = code.replace(
  /\{(\/\* Category & Sector Focus \*\/)\}/,
  newFieldsUI + "\n          {/* Category & Sector Focus */}"
);

fs.writeFileSync('src/pages/ProfilePage.tsx', code);
