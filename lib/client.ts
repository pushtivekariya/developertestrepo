import { cache } from 'react';
import { getSupabaseClient } from './supabase/server';
import type { WebsiteData } from './types/website';
import { getClientPrimaryLocation, getLocationIdBySlug } from './utils';
// Re-export WebsiteData for backwards compatibility
export type { WebsiteData } from './types/website';

export interface ClientWebsitePartial {
	website_name?: string;
	canonical_url?: string;
}

export interface ClientData {
	agency_name: string;
	city?: string;
	state?: string;
	zip?: string;
	client_website?: ClientWebsitePartial | null;
	phone?: string;
	address?: string;
	contact_email?: string;
	canonical_url?: string;
}

export const getClientData = cache(async (locationSlug?: string): Promise<ClientData | null> => {
	const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
	if (!clientId) {
		return null;
	}
	const supabase = await getSupabaseClient();
	const primaryLocationId = locationSlug ? await getLocationIdBySlug(locationSlug) : (await getClientPrimaryLocation())?.id;

	// Fetch client data including website_url for canonical URL
	const { data: clientData, error: clientError } = await supabase
		.from('clients')
		.select(`
			agency_name,
			city,
			state,
			zip,
			phone,
			address,
			contact_email,
			website_url
		`)
		.eq('id', clientId)
		.single();

	if (clientError || !clientData) {
		return null;
	}

	// Use website_url from clients table as the canonical URL
	const canonicalUrl = clientData.website_url;

	// First, try to fetch website name matching the primary location ID
	if (primaryLocationId) {
		const { data, error } = await supabase
			.from('client_websites')
			.select('website_name')
			.eq('client_id', clientId)
			.eq('location_id', primaryLocationId)
			.maybeSingle();

		if (data && !error) {
			return { ...clientData, client_website: { website_name: data.website_name, canonical_url: canonicalUrl } };
		}
	}

	// If no data found for primary location, try location_id null
	const { data: websiteData, error: websiteError } = await supabase
		.from('client_websites')
		.select('website_name')
		.eq('client_id', clientId)
		.is('location_id', null)
		.maybeSingle();

	if (websiteError || !websiteData) {
		console.error('Error fetching website data: No website found for primary location or location_id null', websiteError);
		return { ...clientData, client_website: { canonical_url: canonicalUrl } };
	}

	return { ...clientData, client_website: { website_name: websiteData.website_name, canonical_url: canonicalUrl } };
});

export const getWebsiteName = cache(async (): Promise<WebsiteData | null> => {
	const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
	if (!clientId) {
		return null;
	}
	const supabase = await getSupabaseClient();

	const { data, error } = await supabase
		.from('client_websites')
		.select('website_name')
		.eq('client_id', clientId)
		.single();

	if (error || !data) {
		return null;
	}

	return data as WebsiteData;
});