export const resolveBackendDecision = (riskScore) => {
  if (riskScore > 85) {
    return "BLOCK";
  }

  if (riskScore >= 60) {
    return "REVIEW";
  }

  return "ALLOW";
};

export const getRiskLevelFromScore = (riskScore) => {
  if (riskScore > 85) {
    return "CRITICAL";
  }

  if (riskScore >= 60) {
    return "HIGH";
  }

  if (riskScore >= 35) {
    return "MEDIUM";
  }

  return "LOW";
};

export const encodeDeviceType = (deviceType) => {
  const dictionary = {
    desktop: 0,
    mobile: 1,
    tablet: 2
  };

  return dictionary[deviceType?.toLowerCase()] ?? 0;
};

export const normalizeReviewStatus = (action) => {
  if (action === "APPROVE") {
    return "APPROVED";
  }

  if (action === "REJECT") {
    return "REJECTED";
  }

  return null;
};
