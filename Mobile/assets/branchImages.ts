const branchImages: Record<string, any> = {
  'branch-hq': require('./images/HQ.webp'),
  // Add additional branch-id mappings here as you add more images
};

export const getBranchImage = (branchId?: string | number | null, branchName?: string | null) => {
  // 1. Direct ID mapping in branchImages dictionary
  if (branchId) {
    const key = String(branchId).trim();
    if (branchImages[key]) {
      return branchImages[key];
    }
  }

  // 2. Fallback on Branch Name keywords
  if (branchName) {
    const lowerName = String(branchName).toLowerCase();
    if (lowerName.includes('hq')) {
      return require('./images/HQ.webp');
    }
  }

  // 3. Default fallback image
  return require('./images/default-branch.png');
};
