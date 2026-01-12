import HeaderBar from 'components/layout/HeaderBar';
import { getClientData } from '@/lib/client';
import { getFeatures, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getThemeSettings } from '@/lib/theme';

interface HeaderShellProps {
	locationPrefix?: string;
}

export default async function HeaderShell({ locationPrefix }: HeaderShellProps) {
	// Extract slug from locationPrefix (e.g., "/locations/houston" -> "houston")
	const slug = locationPrefix?.startsWith('/locations/') 
		? locationPrefix.replace('/locations/', '') 
		: undefined;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [clientData, features, theme, isMultiLoc, locations] = await Promise.all([
		getClientData(),
		getFeatures(slug),
		getThemeSettings(),
		isMultiLocation(),
		getAllWebsites()
	]);

	// Get website name from client_website or clients table
	const websiteName = clientData?.agency_name;

	// Merge isMultiLoc into features so HeaderBar gets the correct multi-location state
	const mergedFeatures = features 
		? { ...features, multi_location: isMultiLoc }
		: { multi_location: isMultiLoc };

	return (
		<HeaderBar
			websiteName={websiteName}
			phone={clientData?.phone}
			locationPrefix={locationPrefix}
			logoUrl={theme?.fav_icon_url}
			showSiteName={theme?.show_client_site_name ?? true}
			features={mergedFeatures}
			navbarSettings={theme?.navbar_settings}
			ctaSettings={theme?.cta_settings}
			locations={isMultiLoc ? locations : undefined}
		/>
	);
}
