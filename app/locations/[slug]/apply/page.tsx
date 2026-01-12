import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JobApplicationForm from 'components/apply/JobApplicationForm';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getJobApplicationSettings } from '@/lib/apply';
import { Divider } from '@/components/ui/Divider';
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/utils';

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
  const city = websiteData.client_locations?.city || '';
  const state = websiteData.client_locations?.state || '';

  return {
    title: `Careers - Join Our Team | ${locationName}`,
    description: `Join the ${agencyName} team in ${city}, ${state}. We're looking for passionate individuals to help serve our community. Apply now!`,
    keywords: [
      `insurance jobs ${city} ${state}`,
      'insurance agent careers',
      `insurance jobs ${state}`,
      `${agencyName} careers`,
      `insurance employment ${city}`,
    ],
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/apply`,
    },
    openGraph: {
      title: `Careers at ${locationName}`,
      description: `Join our team and build a rewarding career in insurance serving the ${city} community.`,
      url: `/locations/${slug}/apply`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function LocationApplyPage({ params }: PageProps) {
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

  const locationId = websiteData.client_locations?.id;
  const settings = await getJobApplicationSettings(locationId);

  const locationName = websiteData.client_locations?.location_name || '';
  const phone = websiteData?.phone || clientData?.phone;
  const formattedPhone = formatPhoneNumber(phone);
  const normalizedPhone = normalizePhoneNumber(phone);

  const { hero_section, form_section, form_fields, form_title, success_message, is_enabled } = settings;

  // If the application page is disabled
  if (!is_enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
            Applications Currently Closed
          </h1>
          <p className="text-lg text-gray-600">
            We are not accepting applications at this time. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
            {hero_section.title}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-center max-w-3xl mx-auto" style={{ color: 'var(--hero-text-secondary)' }}>
            {hero_section.description.split('\n').map((line: string, index: React.Key) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        </div>
        <Divider position="bottom" />
      </section>

      {/* Application Form Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
                {form_section.title}
              </h2>
              <p className="text-lg text-gray-600">{form_section.description}</p>
            </div>
            <JobApplicationForm
              formFields={form_fields}
              formTitle={form_title}
              successMessage={success_message}
              locationId={locationId}
            />
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4">
              Questions About Working With Us?
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;d love to hear from you! Feel free to reach out if you have any questions
              about career opportunities at {locationName}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${normalizedPhone}`}
                className="inline-flex items-center justify-center bg-accent hover:bg-accent/80 text-accent-foreground font-bold py-3 px-8 rounded-full transition duration-300"
              >
                Call {formattedPhone}
              </a>
              <a
                href={`/locations/${slug}/contact`}
                className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-primary font-bold py-3 px-8 rounded-full border-2 border-primary transition duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const revalidate = 3600;
