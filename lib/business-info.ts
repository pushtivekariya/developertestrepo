import { cache } from 'react';
import { getSupabaseClient } from './supabase/server';
import { buildTemplateContext, interpolateTemplate } from './template-variables';
import { getClientData } from './client';
import { getWebsiteData } from './website';

export interface BusinessInfo {
  founding_year?: number;
  years_in_business_text?: string;
  slogan?: string;
  tagline?: string;
  regional_descriptor?: string;
  service_area_description?: string;
  about_short?: string;
  about_long?: string;
}

const interpolateBusinessField = (
  value: string | null | undefined,
  context: ReturnType<typeof buildTemplateContext>
): string => {
  if (!value) return '';
  return interpolateTemplate(value, context);
};

/**
 * Fetch business info for the current client with template interpolation
 */
export const getBusinessInfo = cache(async (): Promise<BusinessInfo> => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!clientId) {
    console.error('NEXT_PUBLIC_CLIENT_ID is not defined');
    return {};
  }

  const [clientData, websiteData] = await Promise.all([
    getClientData(),
    getWebsiteData(),
  ]);

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('client_business_info')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching business info:', error);
    }
    return {};
  }

  const context = buildTemplateContext(clientData, websiteData, null, {
    yearsInBusiness: data?.years_in_business_text || '',
    regionalDescriptor: data?.regional_descriptor || '',
    foundingYear: data?.founding_year?.toString() || '',
  });

  return {
    founding_year: data?.founding_year,
    years_in_business_text: data?.years_in_business_text,
    slogan: interpolateBusinessField(data?.slogan, context),
    tagline: interpolateBusinessField(data?.tagline, context),
    regional_descriptor: interpolateBusinessField(data?.regional_descriptor, context),
    service_area_description: interpolateBusinessField(data?.service_area_description, context),
    about_short: interpolateBusinessField(data?.about_short, context),
    about_long: interpolateBusinessField(data?.about_long, context),
  };
});
