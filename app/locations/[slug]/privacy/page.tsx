import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getSchemaDefaults, buildPageUrl } from '@/lib/structured-data';
import { Divider } from '@/components/ui/Divider';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return [];

  const websites = await getAllWebsites();
  return websites.map((website) => ({ slug: website.location_slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return {};

  const [websiteData, clientData] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
  ]);

  if (!websiteData) return {};

  const locationName = websiteData.client_locations?.location_name || '';
  const agencyName = clientData?.agency_name || '';
  const canonicalUrl = clientData?.client_website?.canonical_url || '';

  return {
    title: `Privacy Policy | ${locationName}`,
    description: `Privacy Policy for ${agencyName} - ${locationName}. Learn how we collect, use, and protect your personal information.`,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/privacy`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: `Privacy Policy | ${locationName}`,
      description: `Privacy Policy for ${agencyName} - ${locationName}. Learn how we collect, use, and protect your personal information.`,
      url: `/locations/${slug}/privacy`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function LocationPrivacyPage({ params }: PageProps) {
  const { slug } = await params;

  // Only show for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  const [websiteData, clientData] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
  ]);

  if (!websiteData) {
    notFound();
  }

  const locationName = websiteData.client_locations?.location_name || '';
  const agencyName = clientData?.agency_name || 'Our Agency';
  const email = websiteData?.email || clientData?.contact_email || '';
  const phone = websiteData?.phone || clientData?.phone || '';
  const address = websiteData.client_locations?.address_line_1 || clientData?.address || '';
  const city = websiteData.client_locations?.city || clientData?.city || '';
  const state = websiteData.client_locations?.state || clientData?.state || '';
  const zip = websiteData.client_locations?.zip || clientData?.zip || '';

  const { canonicalUrl } = getSchemaDefaults(clientData);

  const ldJsonSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Privacy Policy | ${locationName}`,
    description: `Privacy Policy for ${agencyName} - ${locationName}. Learn how we collect, use, and protect your personal information.`,
    url: buildPageUrl(canonicalUrl, `/locations/${slug}/privacy`),
    publisher: {
      '@type': 'Organization',
      name: agencyName,
      url: buildPageUrl(canonicalUrl, `/locations/${slug}`),
    },
  };

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
            Privacy Policy
          </h1>
          <p className="text-theme-body text-lg md:text-xl text-center max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect
            your information at {locationName}.
          </p>
        </div>
        <Divider position="bottom" />
      </section>

      {/* Content Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="prose prose-lg max-w-none text-theme-body">
              <p className="text-sm text-primary/60 mb-8">
                Last Updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>

              <h2 className="text-2xl font-heading font-bold text-primary mt-8 mb-4">
                Information We Collect
              </h2>
              <p>
                {agencyName} collects information you provide directly to us, such as when you
                request a quote, fill out a contact form, or communicate with us. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Name and contact information (email address, phone number, mailing address)</li>
                <li>Insurance-related information necessary to provide quotes and services</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h2 className="text-2xl font-heading font-bold text-primary mt-8 mb-4">
                How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Provide, maintain, and improve our insurance services</li>
                <li>Process and complete transactions and send related information</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>

              <h2 className="text-2xl font-heading font-bold text-primary mt-8 mb-4">
                Information Sharing
              </h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to outside
                parties except as necessary to provide our insurance services (such as sharing with
                insurance carriers to obtain quotes), comply with the law, or protect our rights.
              </p>

              <h2 className="text-2xl font-heading font-bold text-primary mt-8 mb-4">
                Data Security
              </h2>
              <p>
                We implement appropriate security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no
                method of transmission over the Internet or electronic storage is 100% secure.
              </p>

              <h2 className="text-2xl font-heading font-bold text-primary mt-8 mb-4">
                Cookies and Tracking
              </h2>
              <p>
                Our website may use cookies and similar tracking technologies to enhance your
                experience. You can set your browser to refuse cookies, but some features of our
                site may not function properly.
              </p>

              <h2 className="text-2xl font-heading font-bold text-primary mt-8 mb-4">
                Third-Party Links
              </h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for
                the privacy practices or content of these external sites. We encourage you to read
                the privacy policies of any third-party sites you visit.
              </p>

              <h2 className="text-2xl font-heading font-bold text-primary mt-8 mb-4">
                Your Rights
              </h2>
              <p>
                You may request access to, correction of, or deletion of your personal information
                by contacting us. We will respond to your request within a reasonable timeframe.
              </p>

              <h2 className="text-2xl font-heading font-bold text-primary mt-8 mb-4">
                Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any
                changes by posting the new policy on this page with an updated revision date.
              </p>

              <h2 className="text-2xl font-heading font-bold text-primary mt-8 mb-4">Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <div className="bg-theme-bg-alt rounded-lg p-6 mt-4">
                <p className="font-bold text-primary mb-2">{locationName}</p>
                {address && <p>{address}</p>}
                {(city || state || zip) && (
                  <p>
                    {city}
                    {city && state ? ', ' : ''}
                    {state} {zip}
                  </p>
                )}
                {email && (
                  <p>
                    Email:{' '}
                    <a
                      href={`mailto:${email}`}
                      className="text-secondary hover:text-accent transition-colors"
                    >
                      {email}
                    </a>
                  </p>
                )}
                {phone && (
                  <p>
                    Phone:{' '}
                    <a
                      href={`tel:${phone.replace(/\D/g, '')}`}
                      className="text-secondary hover:text-accent transition-colors"
                    >
                      {phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonSchema) }}
      />
    </main>
  );
}

export const revalidate = 3600;
