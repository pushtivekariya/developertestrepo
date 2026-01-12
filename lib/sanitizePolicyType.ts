// Utility to sanitize policy_type for all policy links
export function sanitizePolicyType(policyType: string | null | undefined): string {
  if (typeof policyType !== 'string' || !policyType) {
    return 'personal-insurance';
  }
  
  // If it already contains a slash (like "personal-insurance/something"), return as-is
  if (policyType.includes('/')) {
    return policyType;
  }
  
  return policyType.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
}
