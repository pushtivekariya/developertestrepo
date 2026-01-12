// Dedicated sanitizer for glossary policy types
export function glossaryPolicyTypeSanitizer(policyType: unknown): string {
  let currentPolicyType = policyType;

  // Recursively process until we get a non-array/non-JSON string or a simple string
  while (Array.isArray(currentPolicyType) || (typeof currentPolicyType === 'string' && currentPolicyType.startsWith('['))) {
    if (Array.isArray(currentPolicyType)) {
      currentPolicyType = currentPolicyType.length > 0 ? currentPolicyType[0] : null;
    } else if (typeof currentPolicyType === 'string' && currentPolicyType.startsWith('[')) {
      try {
        const parsed = JSON.parse(currentPolicyType);
        currentPolicyType = parsed;
      } catch {
        // If parsing fails, it's not a valid JSON array string, so break the loop
        break;
      }
    }
  }

  if (typeof currentPolicyType === 'string' && currentPolicyType.length > 0) {
    return currentPolicyType.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
  }

  // Fallback for null, undefined, or other invalid types
  return 'personal-insurance';
}
