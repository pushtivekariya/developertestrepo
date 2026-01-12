import Footer from 'components/layout/Footer';
import { getClientData } from '@/lib/client';
import { getWebsiteData, getWebsiteBySlug, getBadges, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getThemeSettings } from '@/lib/theme';
import { getSocialLinksForLocationSlug, getAllLocationsSocialLinks } from '@/lib/social-links';

interface FooterShellProps {
	locationPrefix?: string;
	locationSlug?: string;
}

export default async function FooterShell({ locationPrefix, locationSlug }: FooterShellProps) {
	const [client, websiteData, badges, isMultipleLocation, theme, allLocations] = await Promise.all([
		getClientData(),
		getWebsiteData(),
		getBadges(),
		isMultiLocation(),
		getThemeSettings(),
		getAllWebsites()
	]);

	// Fetch social links based on context
	// If locationSlug is provided, fetch for that location only
	// Otherwise, fetch for all locations (home page)
	const socialLinksModalData = locationSlug
		? await getSocialLinksForLocationSlug(locationSlug)
		: await getAllLocationsSocialLinks();

	// If locationSlug is provided, fetch location-specific data
	let locationData = null;
	if (locationSlug) {
		locationData = await getWebsiteBySlug(locationSlug);
	}

	// Use location-specific data if available, otherwise fall back to global data
	const addressLine1 = locationData?.client_locations?.address_line_1 || '';
	const addressLine2 = locationData?.client_locations?.address_line_2 || '';
	const address = addressLine1 
		? (addressLine2 ? `${addressLine1}, ${addressLine2}` : addressLine1)
		: (client?.address || '');
	const city = locationData?.client_locations?.city || client?.city || '';
	const state = locationData?.client_locations?.state || client?.state || '';
	const postalCode = locationData?.client_locations?.zip || client?.zip || '';
	const locationName = locationData?.client_locations?.location_name || '';
	// Phone priority: location-specific website phone > global website phone > global client phone
	// locationData contains websiteData spread at top level, so locationData?.phone is the location-specific phone
	const phone = locationData?.client_locations?.phone || websiteData?.phone || client?.phone;

	return (
		<Footer 
			agencyName={client?.agency_name} 
			city={city} 
			state={state} 
			postalCode={postalCode} 
			phone={phone}
			address={address}
			locationName={locationName}
			socialLinks={websiteData?.social_links}
			badges={badges}
			tagline={websiteData?.tagline}
			locationPrefix={locationPrefix}
			isMultiLocation={isMultipleLocation}
			footerLogoUrl={theme?.website_logo_url}
			allLocations={allLocations || []}
			socialLinksModalData={socialLinksModalData || { locations: [] }}
		/>
	);
}
