import fs from 'fs';
let code = fs.readFileSync('src/services/firebase/firestoreService.ts', 'utf8');

const replacement = `const eligibilityCriteria = {
      applicantTypes: formData.applicantTypes || [],
      minimumAge: formData.minimumAge || null,
      maximumAge: formData.maximumAge || null,
      eligibleCountries,
    };
    
    if (isEdit) {
      // Check if doc exists to maintain createdAt
      const existingSnap = await getDoc(docRef);
      const updatePayload: Record<string, any> = {
        title: formData.title.trim(),
        provider: provider.trim(),
        description: formData.description.trim(),
        category: formData.category,
        fundingType,
        amount: amountVal,
        currency,
        country,
        eligibleCountries,
        eligibility: eligibilityText,
        eligibilityCriteria,
        deadline: formData.deadline,
        applicationUrl: formData.applicationUrl.trim(),
        imageUrl: formData.imageUrl ? formData.imageUrl.trim() : '',
        status: statusVal,
        tags: Array.isArray(formData.tags) ? formData.tags : ['Funding'],
        featured: isFeatured,
        verified: isVerified,
        updatedAt: now,
      };`;

code = code.replace(
  /if \(isEdit\) \{\n\s*\/\/ Check if doc exists to maintain createdAt\n\s*const existingSnap = await getDoc\(docRef\);\n\s*const updatePayload: Record<string, any> = \{[\s\S]*?updatedAt: now,\n\s*\};/,
  replacement
);

const replacement2 = `const newDoc: FirestoreFundingOpportunityDoc = {
        id: docId,
        title: formData.title.trim(),
        provider: provider.trim(),
        description: formData.description.trim(),
        category: formData.category,
        fundingType,
        amount: amountVal,
        currency,
        country,
        eligibleCountries,
        eligibility: eligibilityText,
        eligibilityCriteria,
        deadline: formData.deadline,
        applicationUrl: formData.applicationUrl.trim(),
        imageUrl: formData.imageUrl ? formData.imageUrl.trim() : '',
        status: statusVal,
        tags: Array.isArray(formData.tags) && formData.tags.length > 0 ? formData.tags : ['Funding', 'Verified'],
        featured: isFeatured,
        verified: isVerified,
        createdAt: now,
        updatedAt: now,
      };`;

code = code.replace(
  /const newDoc: FirestoreFundingOpportunityDoc = \{[\s\S]*?updatedAt: now,\n\s*\};/,
  replacement2
);

fs.writeFileSync('src/services/firebase/firestoreService.ts', code);
