import { Opportunity, UserProfile } from '../../types';

export type EligibilityStatus = 'Eligible' | 'Likely Eligible' | 'Needs Verification' | 'Not Eligible';

export interface MatchResult {
  matchScore: number;
  eligibilityStatus: EligibilityStatus;
  matchedCriteria: string[];
  unmetCriteria: string[];
  reasons: string[];
  warnings: string[];
}

export function calculateOpportunityMatch(
  userProfile: Partial<UserProfile> | null | undefined,
  opportunity: Opportunity
): MatchResult {
  if (!userProfile) {
    return {
      matchScore: 0,
      eligibilityStatus: 'Needs Verification',
      matchedCriteria: [],
      unmetCriteria: [],
      reasons: ["Log in and complete your profile to see your match."],
      warnings: []
    };
  }

  let matchScore = 0;
  let maxScore = 0;
  
  const matchedCriteria: string[] = [];
  const unmetCriteria: string[] = [];
  const reasons: string[] = [];
  const warnings: string[] = [];
  
  let hasHardConflict = false;
  let hasUnknownRequirements = false;
  
  const criteria = opportunity.eligibilityCriteria;
  
  if (!criteria) {
    return {
      matchScore: 50,
      eligibilityStatus: 'Needs Verification',
      matchedCriteria,
      unmetCriteria,
      reasons: ["Opportunity has incomplete structured eligibility requirements."],
      warnings: ["Unable to verify eligibility directly."]
    };
  }

  // Country (HARD)
  if (criteria.excludedCountries?.length) {
    if (userProfile.country && criteria.excludedCountries.includes(userProfile.country)) {
      hasHardConflict = true;
      unmetCriteria.push('country');
      warnings.push(`The opportunity explicitly excludes your country (${userProfile.country}).`);
      reasons.push("Your country is excluded.");
    }
  }
  
  if (criteria.eligibleCountries?.length && !criteria.eligibleCountries.includes('Global')) {
    maxScore += 20;
    if (userProfile.country) {
      if (criteria.eligibleCountries.includes(userProfile.country)) {
        matchScore += 20;
        matchedCriteria.push('country');
        reasons.push("Your country is eligible.");
      } else {
        hasHardConflict = true;
        unmetCriteria.push('country');
        warnings.push(`This opportunity is restricted to specific countries.`);
        reasons.push("Your country is not in the eligible list.");
      }
    } else {
      hasUnknownRequirements = true;
      reasons.push("Country requirement could not be verified (missing in profile).");
    }
  } else {
     // Global or not specified, slight bump
     maxScore += 5;
     matchScore += 5;
     if (criteria.eligibleCountries?.includes('Global')) {
         matchedCriteria.push('country');
     }
  }

  // Organization Type (HARD/SOFT)
  const eligibleOrgTypes = criteria.eligibleOrganizationTypes || criteria.applicantTypes;
  if (eligibleOrgTypes?.length) {
    maxScore += 15;
    if (userProfile.organizationType || userProfile.applicantType) {
      const userType = userProfile.organizationType || userProfile.applicantType;
      if (userType && eligibleOrgTypes.includes(userType)) {
        matchScore += 15;
        matchedCriteria.push('organizationType');
        reasons.push("Your organization type matches the stated eligibility.");
      } else {
        hasHardConflict = true;
        unmetCriteria.push('organizationType');
        warnings.push("Your organization type is not listed as eligible.");
      }
    } else {
      hasUnknownRequirements = true;
      reasons.push("Organization type requirement could not be verified.");
    }
  }

  // Funding Type (SOFT)
  const oppFundingType = opportunity.type || opportunity.fundingType;
  if (oppFundingType) {
    maxScore += 15;
    const userFunding = userProfile.fundingTypes || userProfile.preferredFundingTypes;
    if (userFunding?.length) {
      if (userFunding.includes(oppFundingType as any)) {
        matchScore += 15;
        matchedCriteria.push('fundingType');
        reasons.push("This funding type matches your interests.");
      } else {
        unmetCriteria.push('fundingType');
      }
    }
  }

  // Industry/Interests (SOFT)
  const eligibleInd = criteria.eligibleIndustries || criteria.eligibleCategories || (opportunity.category ? [opportunity.category] : []);
  if (eligibleInd && Array.isArray(eligibleInd) && eligibleInd.length > 0) {
    maxScore += 20;
    const userInds = [userProfile.industry, ...(userProfile.interests || [])].filter(Boolean) as string[];
    if (userInds.length) {
      const hasOverlap = eligibleInd.some(i => userInds.includes(i));
      if (hasOverlap) {
        matchScore += 20;
        matchedCriteria.push('industry');
        reasons.push("This opportunity appears relevant to your industry or interests.");
      } else {
        unmetCriteria.push('industry');
      }
    }
  }

  // Age (HARD)
  const minA = criteria.eligibleAgeRange?.min || criteria.minimumAge;
  const maxA = criteria.eligibleAgeRange?.max || criteria.maximumAge;
  if (minA !== undefined || maxA !== undefined) {
    if (userProfile.age !== undefined) {
      if ((minA !== undefined && userProfile.age < minA) || (maxA !== undefined && userProfile.age > maxA)) {
         hasHardConflict = true;
         unmetCriteria.push('age');
         warnings.push(`Your age (${userProfile.age}) is outside the required range.`);
      } else {
         matchedCriteria.push('age');
         maxScore += 10;
         matchScore += 10;
      }
    } else {
       hasUnknownRequirements = true;
       reasons.push("Age requirement could not be verified.");
    }
  }
  
  // Gender (HARD)
  if (criteria.eligibleGenders?.length) {
    if (userProfile.gender) {
      if (criteria.eligibleGenders.includes(userProfile.gender)) {
        matchedCriteria.push('gender');
        maxScore += 10;
        matchScore += 10;
      } else {
        hasHardConflict = true;
        unmetCriteria.push('gender');
        warnings.push("The opportunity has specific gender restrictions that do not match your profile.");
      }
    } else {
       hasUnknownRequirements = true;
       reasons.push("Gender requirement could not be verified.");
    }
  }
  
  // Education (HARD/SOFT)
  const eduReqs = criteria.eligibleEducationLevels || criteria.educationRequirements;
  if (eduReqs?.length) {
     if (userProfile.educationLevel) {
       if (eduReqs.includes(userProfile.educationLevel)) {
         matchedCriteria.push('education');
         maxScore += 10;
         matchScore += 10;
       } else {
         hasHardConflict = true;
         unmetCriteria.push('education');
         warnings.push("Your education level does not match the requirements.");
       }
     } else {
       hasUnknownRequirements = true;
       reasons.push("Education requirement could not be verified.");
     }
  }
  
  // Business Stage (SOFT)
  const bStages = criteria.eligibleBusinessStages || criteria.businessStageRequirements;
  if (bStages?.length) {
     maxScore += 10;
     if (userProfile.businessStage) {
        if (bStages.includes(userProfile.businessStage)) {
           matchedCriteria.push('businessStage');
           matchScore += 10;
           reasons.push("Your business stage matches the preferred criteria.");
        } else {
           unmetCriteria.push('businessStage');
        }
     } else {
        hasUnknownRequirements = true;
     }
  }

  // Calculate final score
  let finalScore = maxScore > 0 ? Math.round((matchScore / maxScore) * 100) : 50;
  
  let status: EligibilityStatus = 'Needs Verification';
  
  if (hasHardConflict) {
     status = 'Not Eligible';
     finalScore = Math.min(finalScore, 40); // cap score for hard conflicts
  } else if (hasUnknownRequirements) {
     status = 'Needs Verification';
  } else if (finalScore >= 80) {
     status = 'Eligible';
  } else if (finalScore >= 60) {
     status = 'Likely Eligible';
  } else {
     status = 'Needs Verification';
  }

  if (reasons.length === 0 && !hasHardConflict && !hasUnknownRequirements) {
     reasons.push("We recommend verifying specific details in the full description.");
  }

  return {
    matchScore: finalScore,
    eligibilityStatus: status,
    matchedCriteria,
    unmetCriteria,
    reasons,
    warnings
  };
}
