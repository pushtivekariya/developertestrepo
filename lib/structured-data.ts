import { ClientData } from './client';
import { BusinessHours } from './types/website';
import { getSupabaseClient } from './supabase/server';

export interface SchemaDefaults {
  agencyName: string;
  canonicalUrl: string;
  city: string;
  state: string;
  address: string;
  zip: string;
  phone: string;
  email: string;
}

/**
 * Get schema defaults from client data
 * Throws error if required data is missing - no silent fallbacks
 */
export function getSchemaDefaults(clientData: ClientData | null): SchemaDefaults {
  if (!clientData) {
    throw new Error('Client data is required for schema defaults');
  }

  const agencyName = clientData.agency_name?.trim();
  const canonicalUrl = clientData.client_website?.canonical_url?.trim()?.replace(/\/+$/, '') || clientData.canonical_url?.trim()?.replace(/\/+$/, '');
  const city = clientData.city?.trim();
  const state = clientData.state?.trim();
  const address = clientData.address?.trim();
  const zip = clientData.zip?.trim();
  const phone = clientData.phone?.trim();
  const email = clientData.contact_email?.trim();

  // Validate required fields
  if (!agencyName) throw new Error('Missing agency_name in client data');
  if (!canonicalUrl) throw new Error('Missing canonical_url in client data');
  if (!city) throw new Error('Missing city in client data');
  if (!state) throw new Error('Missing state in client data');

  return {
    agencyName,
    canonicalUrl,
    city,
    state,
    address: address || '',
    zip: zip || '',
    phone: phone || '',
    email: email || '',
  };
}

export function buildPageUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Get distinct published policy titles for hasOfferCatalog LD-JSON
 * Returns array of policy titles that are published for the client
 */
export async function getClientServiceOfferings(): Promise<{ title: string; description: string }[]> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) {
    console.warn('NEXT_PUBLIC_CLIENT_ID not set, returning empty service offerings');
    return [];
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('client_policy_pages')
    .select('title, content_summary')
    .eq('client_id', clientId)
    .eq('published', true)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching service offerings:', error);
    return [];
  }

  return data?.map(p => ({
    title: p.title || '',
    description: p.content_summary || ''
  })) || [];
}

/**
 * Build openingHoursSpecification array from BusinessHours JSONB
 * Returns LD-JSON compatible opening hours specification
 */
export function buildOpeningHoursSpec(businessHours: BusinessHours | undefined | null): object[] {
  if (!businessHours) return [];

  const dayMap: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const specs: object[] = [];

  for (const [day, hours] of Object.entries(businessHours)) {
    if (!hours) continue;
    
    // Skip closed days
    if ('closed' in hours && hours.closed) continue;
    
    // Add open days
    if ('open' in hours && 'close' in hours) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": dayMap[day],
        "opens": hours.open,
        "closes": hours.close
      });
    }
  }

  return specs;
}

/**
 * Build hasOfferCatalog from service offerings
 * Returns LD-JSON compatible offer catalog
 */
export function buildOfferCatalog(services: { title: string; description?: string }[]): object {
  return {
    "@type": "OfferCatalog",
    "name": "Insurance Services",
    "itemListElement": services.map(service => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service.title
      }
    }))
  };
}

/**
 * Build makesOffer array from policies
 * Returns LD-JSON compatible service offerings
 */
export function buildMakesOffer(policies: { title: string; content_summary?: string }[]): object[] {
  return policies.map(policy => ({
    "@type": "Service",
    "name": policy.title,
    "description": policy.content_summary || ''
  }));
}
