/**
 * Template Variables System
 * Phase 4.6: Centralized template variable interpolation
 * 
 * Supports variables like {agencyName}, {city}, {state} in metadata and content
 */

export interface TemplateContext {
  agencyName?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  address?: string;
  zip?: string;
  categoryName?: string;
  policyTitle?: string;
  locationName?: string;
  topicName?: string;
  year?: string;
  yearsInBusiness?: string;
  regionalDescriptor?: string;
  foundingYear?: string;
}

/**
 * Replace template variables in a string
 * Variables are in format {variableName}
 */
export function interpolateTemplate(
  template: string | null | undefined,
  context: TemplateContext
): string {
  if (!template) return '';

  let result = template;

  // Replace all known variables
  result = result.replace(/\{agencyName\}/g, context.agencyName || '');
  result = result.replace(/\{city\}/g, context.city || '');
  result = result.replace(/\{state\}/g, context.state || '');
  result = result.replace(/\{phone\}/g, context.phone || '');
  result = result.replace(/\{email\}/g, context.email || '');
  result = result.replace(/\{address\}/g, context.address || '');
  result = result.replace(/\{zip\}/g, context.zip || '');
  result = result.replace(/\{categoryName\}/g, context.categoryName || '');
  result = result.replace(/\{policyTitle\}/g, context.policyTitle || '');
  result = result.replace(/\{locationName\}/g, context.locationName || '');
  result = result.replace(/\{topicName\}/g, context.topicName || '');
  result = result.replace(/\{year\}/g, context.year || new Date().getFullYear().toString());
  result = result.replace(/\{yearsInBusiness\}/g, context.yearsInBusiness || '');
  result = result.replace(/\{regionalDescriptor\}/g, context.regionalDescriptor || '');
  result = result.replace(/\{foundingYear\}/g, context.foundingYear || '');

  // Clean up any double spaces that might result from empty variables
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

/**
 * Build template context from client data
 */
export function buildTemplateContext(
  clientData: any,
  websiteData?: any,
  locationData?: any,
  extras?: Partial<TemplateContext>
): TemplateContext {
  // Prefer location data, then website data, then client data
  const city = locationData?.city || websiteData?.client_locations?.city || clientData?.city || '';
  const state = locationData?.state || websiteData?.client_locations?.state || clientData?.state || '';

  return {
    agencyName: clientData?.agency_name || '',
    city: city ? city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() : '',
    state: state ? state.toUpperCase() : '',
    phone: websiteData?.phone || clientData?.phone || '',
    email: websiteData?.email || clientData?.contact_email || '',
    address: clientData?.address || '',
    zip: clientData?.zip || '',
    locationName: locationData?.location_name || websiteData?.client_locations?.location_name || '',
    year: new Date().getFullYear().toString(),
    yearsInBusiness: extras?.yearsInBusiness || '',
    regionalDescriptor: extras?.regionalDescriptor || '',
    foundingYear: extras?.foundingYear || '',
    ...extras,
  };
}

/**
 * Build template context with category info
 */
export function buildCategoryContext(
  clientData: any,
  websiteData?: any,
  category?: { display_name?: string }
): TemplateContext {
  return buildTemplateContext(clientData, websiteData, null, {
    categoryName: category?.display_name || '',
  });
}

/**
 * Build template context with policy info
 */
export function buildPolicyContext(
  clientData: any,
  websiteData?: any,
  policy?: { title?: string },
  category?: { display_name?: string }
): TemplateContext {
  return buildTemplateContext(clientData, websiteData, null, {
    categoryName: category?.display_name || '',
    policyTitle: policy?.title || '',
  });
}

/**
 * Build template context with topic info
 */
export function buildTopicContext(
  clientData: any,
  websiteData?: any,
  topic?: { name?: string }
): TemplateContext {
  return buildTemplateContext(clientData, websiteData, null, {
    topicName: topic?.name || '',
  });
}
