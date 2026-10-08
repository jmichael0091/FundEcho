import { 
  Opportunity, 
  EligibilityCriteria, 
  EligibilityAssessmentResult, 
  UserEligibilityAnswers, 
  RequirementCheckResult,
  EligibilityOverallStatus,
  UserProfile,
  EducationLevel
} from '../types';

/**
 * Standard Education Level Ranking
 */
const EDUCATION_LEVEL_RANKS: Record<string, number> = {
  'none': 0,
  'high_school': 1,
  'bachelors': 2,
  'masters': 3,
  'phd': 4,
  'postdoc': 5,
};

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  'none': 'No formal degree requirement',
  'high_school': 'High School / Secondary Diploma',
  'bachelors': "Bachelor's Degree (Undergraduate)",
  'masters': "Master's Degree (Graduate / Postgraduate)",
  'phd': 'Doctorate / PhD',
  'postdoc': 'Postdoctoral Fellow',
};

/**
 * Country regional mappings helper for eligibility checking
 */
const REGION_COUNTRIES: Record<string, string[]> = {
  'Africa': ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Egypt', 'Rwanda', 'Uganda', 'Tanzania', 'Ethiopia', 'Morocco', 'Senegal', 'Cameroon'],
  'Europe': ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Sweden', 'Switzerland', 'Spain', 'Italy', 'Poland', 'Belgium', 'Austria', 'Denmark', 'Norway', 'Finland', 'Ireland', 'Portugal', 'Greece'],
  'North America': ['United States', 'Canada', 'Mexico'],
  'Asia-Pacific': ['Japan', 'Australia', 'Singapore', 'India', 'New Zealand', 'South Korea', 'Indonesia', 'Malaysia', 'Vietnam', 'Philippines', 'Thailand'],
  'Latin America': ['Brazil', 'Colombia', 'Argentina', 'Chile', 'Peru', 'Costa Rica', 'Ecuador', 'Panama', 'Guatemala'],
  'Middle East': ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Jordan', 'Oman', 'Bahrain', 'Kuwait', 'Lebanon']
};

/**
 * Evaluates user answers against an opportunity's structured eligibility criteria.
 * Pure rules-based calculation engine.
 */
export function evaluateEligibility(
  answers: UserEligibilityAnswers,
  rules: EligibilityCriteria | undefined,
  opportunity: Opportunity
): EligibilityAssessmentResult {
  const requirementResults: RequirementCheckResult[] = [];
  const reasons: string[] = [];
  const uncertainRequirements: string[] = [];

  // If opportunity has no structured criteria, fallback to checking basic opportunity fields
  const effectiveRules: EligibilityCriteria = rules || extractCriteriaFromOpportunity(opportunity);

  // 1. Check Country / Geography
  if (effectiveRules.eligibleCountries && effectiveRules.eligibleCountries.length > 0) {
    const isGlobal = effectiveRules.eligibleCountries.some(
      (c) => c.toLowerCase() === 'global' || c.toLowerCase() === 'all countries' || c.toLowerCase() === 'any country'
    );

    if (isGlobal) {
      if (answers.country && answers.country.trim().length > 0) {
        requirementResults.push({
          id: 'geo-location',
          title: 'Location & Geographic Eligibility',
          status: 'met',
          userValueDisplay: answers.country,
          requirementDisplay: 'Global (Open worldwide)',
          explanation: `${answers.country} is eligible as this is an open global opportunity with no country restrictions.`,
          isMandatory: true,
        });
      } else {
        requirementResults.push({
          id: 'geo-location',
          title: 'Location & Geographic Eligibility',
          status: 'met',
          userValueDisplay: 'Worldwide',
          requirementDisplay: 'Global (Open worldwide)',
          explanation: 'Open to applicants worldwide regardless of country.',
          isMandatory: true,
        });
      }
    } else {
      // Specific country list
      if (!answers.country || answers.country.trim().length === 0) {
        requirementResults.push({
          id: 'geo-location',
          title: 'Location & Geographic Eligibility',
          status: 'needs_review',
          userValueDisplay: 'Not specified',
          requirementDisplay: effectiveRules.eligibleCountries.slice(0, 4).join(', ') + (effectiveRules.eligibleCountries.length > 4 ? ` (+${effectiveRules.eligibleCountries.length - 4} more)` : ''),
          explanation: 'Location not provided. Please verify if your country is listed among the eligible locations.',
          isMandatory: true,
        });
        uncertainRequirements.push('Geographic location was not provided.');
      } else {
        const normalizedUserCountry = answers.country.trim().toLowerCase();
        
        // Direct match or region match
        const directMatch = effectiveRules.eligibleCountries.some((c) => {
          const norm = c.toLowerCase();
          return norm === normalizedUserCountry || norm.includes(normalizedUserCountry) || normalizedUserCountry.includes(norm);
        });

        // Region match
        let regionMatch = false;
        if (!directMatch && effectiveRules.eligibleRegions && effectiveRules.eligibleRegions.length > 0) {
          for (const reg of effectiveRules.eligibleRegions) {
            const list = REGION_COUNTRIES[reg] || [];
            if (list.some((c) => c.toLowerCase() === normalizedUserCountry)) {
              regionMatch = true;
              break;
            }
          }
        }

        if (directMatch || regionMatch) {
          requirementResults.push({
            id: 'geo-location',
            title: 'Location & Geographic Eligibility',
            status: 'met',
            userValueDisplay: answers.country,
            requirementDisplay: effectiveRules.eligibleCountries.slice(0, 4).join(', ') + (effectiveRules.eligibleCountries.length > 4 ? ` (+${effectiveRules.eligibleCountries.length - 4} more)` : ''),
            explanation: `${answers.country} is listed as an eligible location for this opportunity.`,
            isMandatory: true,
          });
        } else {
          requirementResults.push({
            id: 'geo-location',
            title: 'Location & Geographic Eligibility',
            status: 'failed',
            userValueDisplay: answers.country,
            requirementDisplay: effectiveRules.eligibleCountries.slice(0, 4).join(', ') + (effectiveRules.eligibleCountries.length > 4 ? ` (+${effectiveRules.eligibleCountries.length - 4} more)` : ''),
            explanation: `Applicant must be located in eligible countries (${effectiveRules.eligibleCountries.slice(0, 3).join(', ')}). Your input indicates ${answers.country}.`,
            isMandatory: true,
          });
          reasons.push(`Location mismatch: ${answers.country} is not in the list of eligible territories.`);
        }
      }
    }
  }

  // 2. Check Age Requirement
  if (effectiveRules.minimumAge !== undefined || effectiveRules.maximumAge !== undefined) {
    const min = effectiveRules.minimumAge ?? 0;
    const max = effectiveRules.maximumAge ?? 120;
    const requirementText = effectiveRules.minimumAge && effectiveRules.maximumAge
      ? `Ages ${min}–${max}`
      : effectiveRules.minimumAge
      ? `Minimum age ${min}`
      : `Under age ${max}`;

    if (answers.age === undefined || answers.age === null || Number.isNaN(answers.age) || answers.age <= 0) {
      requirementResults.push({
        id: 'age-requirement',
        title: 'Age Requirement',
        status: 'needs_review',
        userValueDisplay: 'Not specified',
        requirementDisplay: requirementText,
        explanation: `Applicant age was not provided. Opportunity requires applicants to be ${requirementText}.`,
        isMandatory: true,
      });
      uncertainRequirements.push(`Age not provided (${requirementText}).`);
    } else {
      const userAge = Number(answers.age);
      if (userAge >= min && userAge <= max) {
        requirementResults.push({
          id: 'age-requirement',
          title: 'Age Requirement',
          status: 'met',
          userValueDisplay: `${userAge} years old`,
          requirementDisplay: requirementText,
          explanation: `Applicant is ${userAge} years old, which meets the ${requirementText} criteria.`,
          isMandatory: true,
        });
      } else {
        const failText = userAge < min 
          ? `Applicant must be at least ${min} years old. Your input indicates age ${userAge}.`
          : `Applicant must be ${requirementText}. Your input indicates age ${userAge}.`;
        
        requirementResults.push({
          id: 'age-requirement',
          title: 'Age Requirement',
          status: 'failed',
          userValueDisplay: `${userAge} years old`,
          requirementDisplay: requirementText,
          explanation: failText,
          isMandatory: true,
        });
        reasons.push(`Age criterion not met: You specified ${userAge} years old (required: ${requirementText}).`);
      }
    }
  }

  // 3. Check Applicant / Organization Type
  if (effectiveRules.applicantTypes && effectiveRules.applicantTypes.length > 0) {
    const allowedTypes = effectiveRules.applicantTypes;
    const requirementText = allowedTypes.join(', ');

    if (!answers.applicantType || answers.applicantType.trim().length === 0) {
      requirementResults.push({
        id: 'applicant-type',
        title: 'Applicant & Entity Type',
        status: 'needs_review',
        userValueDisplay: 'Not specified',
        requirementDisplay: requirementText,
        explanation: `Applicant entity type was not provided. Opportunity is tailored for: ${requirementText}.`,
        isMandatory: true,
      });
      uncertainRequirements.push('Applicant entity type was not provided.');
    } else {
      const userTypeNorm = answers.applicantType.trim().toLowerCase();
      const isAnyMatch = allowedTypes.some((t) => {
        const norm = t.toLowerCase();
        return norm.includes(userTypeNorm) || userTypeNorm.includes(norm) || (norm.includes('all') || norm.includes('any'));
      });

      if (isAnyMatch) {
        requirementResults.push({
          id: 'applicant-type',
          title: 'Applicant & Entity Type',
          status: 'met',
          userValueDisplay: answers.applicantType,
          requirementDisplay: requirementText,
          explanation: `Your applicant profile (${answers.applicantType}) matches the required eligible entity types.`,
          isMandatory: true,
        });
      } else {
        requirementResults.push({
          id: 'applicant-type',
          title: 'Applicant & Entity Type',
          status: 'failed',
          userValueDisplay: answers.applicantType,
          requirementDisplay: requirementText,
          explanation: `Opportunity is restricted to ${requirementText}. You selected ${answers.applicantType}.`,
          isMandatory: true,
        });
        reasons.push(`Entity type mismatch: Selected ${answers.applicantType} instead of ${requirementText}.`);
      }
    }
  }

  // 4. Check Education Level
  if (effectiveRules.minEducationLevel && effectiveRules.minEducationLevel !== 'none') {
    const requiredRank = EDUCATION_LEVEL_RANKS[effectiveRules.minEducationLevel] || 0;
    const requiredLabel = EDUCATION_LEVEL_LABELS[effectiveRules.minEducationLevel] || effectiveRules.minEducationLevel;

    if (!answers.educationLevel || answers.educationLevel.trim().length === 0) {
      requirementResults.push({
        id: 'education-level',
        title: 'Minimum Education Level',
        status: 'needs_review',
        userValueDisplay: 'Not specified',
        requirementDisplay: requiredLabel,
        explanation: `Education level was not specified. Opportunity requires at least ${requiredLabel}.`,
        isMandatory: true,
      });
      uncertainRequirements.push(`Education level not confirmed (minimum: ${requiredLabel}).`);
    } else {
      const userRank = EDUCATION_LEVEL_RANKS[answers.educationLevel] !== undefined
        ? EDUCATION_LEVEL_RANKS[answers.educationLevel]
        : 2; // default assumption bachelors if unknown

      const userLabel = EDUCATION_LEVEL_LABELS[answers.educationLevel] || answers.educationLevel;

      if (userRank >= requiredRank) {
        requirementResults.push({
          id: 'education-level',
          title: 'Minimum Education Level',
          status: 'met',
          userValueDisplay: userLabel,
          requirementDisplay: requiredLabel,
          explanation: `Your education level (${userLabel}) satisfies the minimum requirement of ${requiredLabel}.`,
          isMandatory: true,
        });
      } else {
        requirementResults.push({
          id: 'education-level',
          title: 'Minimum Education Level',
          status: 'failed',
          userValueDisplay: userLabel,
          requirementDisplay: requiredLabel,
          explanation: `Requires minimum ${requiredLabel}. Your input indicates ${userLabel}.`,
          isMandatory: true,
        });
        reasons.push(`Education level not met: ${userLabel} is below required ${requiredLabel}.`);
      }
    }
  }

  // 5. Check Experience Requirements
  if (effectiveRules.minExperienceYears !== undefined && effectiveRules.minExperienceYears > 0) {
    const minYears = effectiveRules.minExperienceYears;
    const requirementText = `${minYears}+ years professional/field experience`;

    if (answers.experienceYears === undefined || answers.experienceYears === null || Number.isNaN(answers.experienceYears)) {
      requirementResults.push({
        id: 'experience-years',
        title: 'Work & Field Experience',
        status: 'needs_review',
        userValueDisplay: 'Not specified',
        requirementDisplay: requirementText,
        explanation: `Experience background not specified. Opportunity requires at least ${minYears} years of relevant experience.`,
        isMandatory: true,
      });
      uncertainRequirements.push(`Experience not verified (requires ${requirementText}).`);
    } else {
      const userExp = Number(answers.experienceYears);
      if (userExp >= minYears) {
        requirementResults.push({
          id: 'experience-years',
          title: 'Work & Field Experience',
          status: 'met',
          userValueDisplay: `${userExp} years`,
          requirementDisplay: requirementText,
          explanation: `You have ${userExp} years of experience, meeting the required ${minYears}+ years threshold.`,
          isMandatory: true,
        });
      } else {
        requirementResults.push({
          id: 'experience-years',
          title: 'Work & Field Experience',
          status: 'failed',
          userValueDisplay: `${userExp} years`,
          requirementDisplay: requirementText,
          explanation: `Requires at least ${minYears} years of demonstrable experience. You specified ${userExp} years.`,
          isMandatory: true,
        });
        reasons.push(`Experience threshold: Specified ${userExp} years (required minimum ${minYears} years).`);
      }
    }
  }

  // 6. Check Additional Specific Requirements
  if (effectiveRules.additionalRequirements && effectiveRules.additionalRequirements.length > 0) {
    for (const q of effectiveRules.additionalRequirements) {
      const customVal = answers.customAnswers?.[q.id];
      const isMandatory = q.weight !== 'preferred';

      if (customVal === undefined || customVal === null || customVal === '') {
        requirementResults.push({
          id: `custom-${q.id}`,
          title: q.question,
          status: 'needs_review',
          userValueDisplay: 'Not answered',
          requirementDisplay: q.helperText || 'Specific criterion verification',
          explanation: `Criterion not answered: ${q.question}`,
          isMandatory,
        });
        if (isMandatory) {
          uncertainRequirements.push(`Unanswered criterion: ${q.question}`);
        }
      } else {
        // Evaluate answer
        let isPass = false;

        if (q.type === 'boolean') {
          const boolVal = customVal === true || customVal === 'true' || customVal === 'yes';
          const expected = q.requiredAnswer === undefined ? true : (q.requiredAnswer === true || q.requiredAnswer === 'true');
          isPass = boolVal === expected;
        } else if (q.acceptableAnswers && q.acceptableAnswers.length > 0) {
          isPass = q.acceptableAnswers.some((a) => String(a).toLowerCase() === String(customVal).toLowerCase());
        } else if (q.requiredAnswer !== undefined) {
          isPass = String(q.requiredAnswer).toLowerCase() === String(customVal).toLowerCase();
        } else {
          isPass = true;
        }

        const displayUser = typeof customVal === 'boolean' 
          ? (customVal ? 'Yes' : 'No') 
          : String(customVal);

        if (isPass) {
          requirementResults.push({
            id: `custom-${q.id}`,
            title: q.question,
            status: 'met',
            userValueDisplay: displayUser,
            requirementDisplay: q.helperText || 'Mandatory standard',
            explanation: q.explanationOnPass || `Requirement satisfied: ${q.question}`,
            isMandatory,
          });
        } else {
          requirementResults.push({
            id: `custom-${q.id}`,
            title: q.question,
            status: isMandatory ? 'failed' : 'needs_review',
            userValueDisplay: displayUser,
            requirementDisplay: q.helperText || 'Mandatory standard',
            explanation: q.explanationOnFail || `Does not meet condition: ${q.question}`,
            isMandatory,
          });
          if (isMandatory) {
            reasons.push(q.explanationOnFail || `Did not satisfy: ${q.question}`);
          }
        }
      }
    }
  }

  // Calculate Aggregates
  const totalCount = requirementResults.length;
  const metCount = requirementResults.filter((r) => r.status === 'met').length;
  const failedCount = requirementResults.filter((r) => r.status === 'failed').length;
  const uncertainCount = requirementResults.filter((r) => r.status === 'needs_review').length;

  const scorePercentage = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0;

  // Determine Overall Status
  let overallStatus: EligibilityOverallStatus;
  let headline: string;
  let summary: string;
  let recommendedAction: 'apply' | 'review' | 'explore_similar';

  if (failedCount > 0) {
    overallStatus = 'likely_not_eligible';
    headline = 'Likely Not Eligible';
    summary = `Based on your responses, you do not appear to meet ${failedCount} of the required criteria for this opportunity. You may want to explore similar opportunities that better match your background.`;
    recommendedAction = 'explore_similar';
  } else if (uncertainCount > 0) {
    overallStatus = 'possibly_eligible';
    headline = 'Possibly Eligible — Review Requirements';
    summary = `You meet ${metCount} stated requirements, but ${uncertainCount} ${uncertainCount === 1 ? 'item requires' : 'items require'} further verification before applying. Review the details below.`;
    recommendedAction = 'review';
  } else {
    overallStatus = 'likely_eligible';
    headline = 'Likely Eligible';
    summary = `Great news! You meet all ${metCount} stated eligibility requirements evaluated for this opportunity. We recommend reviewing the official guidelines and preparing your submission.`;
    recommendedAction = 'apply';
  }

  const disclaimer = 'This is a preliminary assessment based on the information provided and the opportunity requirements. Always confirm eligibility with the official provider.';

  return {
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    overallStatus,
    headline,
    summary,
    disclaimer,
    metCount,
    totalCount,
    uncertainCount,
    failedCount,
    scorePercentage,
    requirementResults,
    reasons,
    uncertainRequirements,
    recommendedAction,
    assessedAt: new Date().toISOString(),
    userAnswers: answers,
  };
}

/**
 * Extracts fallback criteria from opportunity fields if no structured criteria object exists
 */
function extractCriteriaFromOpportunity(opportunity: Opportunity): EligibilityCriteria {
  const isGlobal = opportunity.region === 'Global' || opportunity.location.toLowerCase().includes('global');
  
  const criteria: EligibilityCriteria = {
    eligibleCountries: isGlobal ? ['Global'] : [opportunity.location],
    eligibleRegions: [opportunity.region],
    applicantTypes: [opportunity.targetAudience || 'Individual Innovators / Organizations'],
    isDemoData: true,
  };

  return criteria;
}

export interface DynamicEligibilityQuestionItem {
  id: string;
  field: keyof UserEligibilityAnswers | 'custom';
  customQuestionId?: string;
  title: string;
  subtitle?: string;
  type: 'select' | 'number' | 'boolean' | 'text';
  options?: { value: string; label: string; description?: string }[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
  required?: boolean;
}

/**
 * Dynamically generates only the relevant questionnaire items for an opportunity.
 * Avoids asking irrelevant questions.
 */
export function generateDynamicQuestions(
  rules: EligibilityCriteria | undefined,
  opportunity: Opportunity,
  initialUser: UserProfile | null = null
): DynamicEligibilityQuestionItem[] {
  const criteria = rules || extractCriteriaFromOpportunity(opportunity);
  const questions: DynamicEligibilityQuestionItem[] = [];

  // 1. Country question (Always relevant if opportunity has geographic bounds or global)
  const isGlobal = criteria.eligibleCountries?.some(
    (c) => c.toLowerCase() === 'global' || c.toLowerCase() === 'all countries'
  );

  questions.push({
    id: 'question-country',
    field: 'country',
    title: 'What is your primary country of citizenship or organization registration?',
    subtitle: isGlobal 
      ? 'This opportunity is open globally, but provider tracking may record your regional origin.'
      : `Restricted to: ${criteria.eligibleCountries?.slice(0, 3).join(', ')}${criteria.eligibleCountries && criteria.eligibleCountries.length > 3 ? '...' : ''}`,
    type: 'select',
    options: [
      { value: 'Nigeria', label: 'Nigeria' },
      { value: 'United States', label: 'United States' },
      { value: 'United Kingdom', label: 'United Kingdom' },
      { value: 'Ghana', label: 'Ghana' },
      { value: 'Kenya', label: 'Kenya' },
      { value: 'South Africa', label: 'South Africa' },
      { value: 'Germany', label: 'Germany' },
      { value: 'France', label: 'France' },
      { value: 'Canada', label: 'Canada' },
      { value: 'India', label: 'India' },
      { value: 'Australia', label: 'Australia' },
      { value: 'Brazil', label: 'Brazil' },
      { value: 'Egypt', label: 'Egypt' },
      { value: 'United Arab Emirates', label: 'United Arab Emirates' },
      { value: 'Japan', label: 'Japan' },
      { value: 'Other / International', label: 'Other / International' },
    ],
    defaultValue: initialUser?.country || 'Nigeria',
    required: true,
  });

  // 2. Age question (Only if minAge or maxAge is defined)
  if (criteria.minimumAge !== undefined || criteria.maximumAge !== undefined) {
    const ageDesc = criteria.minimumAge && criteria.maximumAge
      ? `Applicant must be between ${criteria.minimumAge} and ${criteria.maximumAge} years old.`
      : criteria.minimumAge
      ? `Applicant must be at least ${criteria.minimumAge} years old.`
      : `Applicant must be under ${criteria.maximumAge} years old.`;

    questions.push({
      id: 'question-age',
      field: 'age',
      title: 'What is your current age (or lead founder age)?',
      subtitle: ageDesc,
      type: 'number',
      placeholder: 'e.g. 26',
      defaultValue: initialUser?.age || 26,
      required: true,
    });
  }

  // 3. Applicant Type (Only if applicantTypes defined)
  if (criteria.applicantTypes && criteria.applicantTypes.length > 0) {
    const standardOptions = [
      { value: 'Individual Innovator / Professional', label: 'Individual Innovator / Professional', description: 'Applying as a solo practitioner or independent leader' },
      { value: 'Current Student / Graduate', label: 'Current Student / Recent Graduate', description: 'Enrolled in university or graduated within last 2 years' },
      { value: 'Early-Stage Startup / Founder', label: 'Early-Stage Startup / Tech Founder', description: 'Registered or pre-registration commercial venture' },
      { value: 'Non-Profit / NGO / Community Group', label: 'Non-Profit / NGO / Grassroots Group', description: 'Civil society, charity, or social impact organization' },
      { value: 'Academic / Researcher / Faculty', label: 'Academic / Researcher / Faculty', description: 'Affiliated with university, institute, or research lab' },
      { value: 'Small & Medium Enterprise (SME)', label: 'Small & Medium Enterprise (SME)', description: 'Established commercial entity seeking scale' },
    ];

    // Filter or re-order based on opportunity requirements
    questions.push({
      id: 'question-applicant-type',
      field: 'applicantType',
      title: 'Which best describes your applicant entity or profile?',
      subtitle: `Targeted eligible categories: ${criteria.applicantTypes.join(', ')}`,
      type: 'select',
      options: standardOptions,
      defaultValue: initialUser?.applicantType || standardOptions[0].value,
      required: true,
    });
  }

  // 4. Education Level (Only if minEducationLevel is defined)
  if (criteria.minEducationLevel && criteria.minEducationLevel !== 'none') {
    questions.push({
      id: 'question-education-level',
      field: 'educationLevel',
      title: 'What is your highest completed level of education?',
      subtitle: `Minimum requirement: ${EDUCATION_LEVEL_LABELS[criteria.minEducationLevel]}`,
      type: 'select',
      options: [
        { value: 'high_school', label: 'High School / Secondary Diploma' },
        { value: 'bachelors', label: "Bachelor's Degree (Undergraduate)" },
        { value: 'masters', label: "Master's Degree (Postgraduate / MSc / MA)" },
        { value: 'phd', label: 'Doctorate / PhD' },
        { value: 'postdoc', label: 'Postdoctoral Fellowship' },
      ],
      defaultValue: initialUser?.educationLevel || 'bachelors',
      required: true,
    });
  }

  // 5. Experience Years (Only if minExperienceYears is defined)
  if (criteria.minExperienceYears !== undefined && criteria.minExperienceYears > 0) {
    questions.push({
      id: 'question-experience-years',
      field: 'experienceYears',
      title: 'How many years of relevant professional or field experience do you have?',
      subtitle: `Minimum threshold: ${criteria.minExperienceYears}+ years`,
      type: 'number',
      placeholder: 'e.g. 4',
      defaultValue: initialUser?.yearsOfExperience || 4,
      required: true,
    });
  }

  // 6. Additional Specific Custom Criteria Questions
  if (criteria.additionalRequirements && criteria.additionalRequirements.length > 0) {
    for (const addReq of criteria.additionalRequirements) {
      questions.push({
        id: `question-custom-${addReq.id}`,
        field: 'custom',
        customQuestionId: addReq.id,
        title: addReq.question,
        subtitle: addReq.helperText,
        type: addReq.type === 'boolean' ? 'boolean' : (addReq.type as any),
        options: addReq.options,
        defaultValue: addReq.type === 'boolean' ? true : (addReq.options?.[0]?.value || ''),
        required: addReq.weight !== 'preferred',
      });
    }
  }

  return questions;
}

/**
 * Storage helpers for local persistent eligibility records
 */
const STORAGE_KEY_ELIGIBILITY = 'fundora_eligibility_assessments';

export function saveEligibilityAssessment(assessment: EligibilityAssessmentResult): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ELIGIBILITY);
    const registry: Record<string, EligibilityAssessmentResult> = raw ? JSON.parse(raw) : {};
    registry[assessment.opportunityId] = assessment;
    localStorage.setItem(STORAGE_KEY_ELIGIBILITY, JSON.stringify(registry));
  } catch {}
}

export function getSavedEligibilityAssessment(opportunityId: string): EligibilityAssessmentResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ELIGIBILITY);
    if (!raw) return null;
    const registry: Record<string, EligibilityAssessmentResult> = JSON.parse(raw);
    return registry[opportunityId] || null;
  } catch {}
  return null;
}
