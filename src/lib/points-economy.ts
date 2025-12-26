// ... existing code ...

export function calculateProfileCompletionPercentage(user: {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  title?: string;
  location?: string;
  profilePictureAttachmentId?: string;
  skills?: string[];
  userType?: string;
  college?: string;
  company?: string;
  yoe?: number;
}): number {
  // Required fields (must have all of these to reach 100%)
  const requiredFields = [
    { key: 'firstName', weight: 10 },
    { key: 'lastName', weight: 10 },
    { key: 'email', weight: 10 },
    { key: 'bio', weight: 15 },
    { key: 'title', weight: 10 },
    { key: 'location', weight: 10 },
    { key: 'skills', weight: 15, isArray: true, minLength: 1 }, // Skills are required
    { key: 'userType', weight: 10 },
  ];

  // Optional fields (bonus points)
  const optionalFields = [
    { key: 'profilePictureAttachmentId', weight: 5 }, // Optional bonus
  ];

  let totalScore = 0;
  let maxScore = 0;

  // Calculate required fields (must total 100%)
  for (const field of requiredFields) {
    maxScore += field.weight;
    const value = user[field.key as keyof typeof user];
    
    if (field.isArray) {
      if (Array.isArray(value) && value.length >= (field.minLength || 1)) {
        totalScore += field.weight;
      }
    } else if (value && String(value).trim().length > 0) {
      totalScore += field.weight;
    }
  }

  // Add optional fields (bonus, can exceed 100%)
  for (const field of optionalFields) {
    const value = user[field.key as keyof typeof user];
    if (value && String(value).trim().length > 0) {
      totalScore += field.weight;
      maxScore += field.weight;
    }
  }

  // If all required fields are complete, return 100% immediately
  const allRequiredComplete = requiredFields.every(field => {
    const value = user[field.key as keyof typeof user];
    if (field.isArray) {
      return Array.isArray(value) && value.length >= (field.minLength || 1);
    }
    return value && String(value).trim().length > 0;
  });

  if (allRequiredComplete) {
    return 100; // Return 100% when all required fields are complete
  }

  return Math.round((totalScore / maxScore) * 100);
}

// ... existing code ...
