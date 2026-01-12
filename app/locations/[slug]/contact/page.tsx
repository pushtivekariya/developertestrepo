import React from 'react';
import { Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites, getFeatures } from '@/lib/website';
import { getPageMetadata } from '@/lib/page-metadata';
import { formatPhoneNumber } from '@/lib/utils';
import { getSchemaDefaults } from '@/lib/structured-data';
import { Divider } from '@/components/ui/Divider';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return [];

  const websites = await getAllWebsites();
  return (websites || [])
    .filter((website) => website?.location_slug && typeof website.location_slug === 'string')
    .map((website) => ({ slug: website.location_slug }));
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
  const locationId = websiteData.client_locations?.location_id;
  const pageMetadata = await getPageMetadata('contact', locationId);
  const canonicalUrl = clientData?.client_website?.canonical_url || '';

  return {
    title: pageMetadata.meta_title || `Contact Us | ${agencyName}`,
    description: pageMetadata.meta_description || `Contact ${agencyName} at ${locationName} for all your insurance needs.`,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/contact`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: pageMetadata.meta_title || `Contact Us | ${agencyName}`,
      description: pageMetadata.meta_description || `Contact ${agencyName} at ${locationName} for all your insurance needs.`,
      url: `/locations/${slug}/contact`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageMetadata.meta_title || `Contact Us | ${agencyName}`,
      description: pageMetadata.meta_description || `Contact ${agencyName} at ${locationName} for all your insurance needs.`,
    },
  };
}

// Helper function to generate structured data
function generateLdJsonSchema(clientData: any, websiteData: any, locationData: any) {
  const { agencyName } = getSchemaDefaults(clientData);
  const location = locationData?.client_locations;

  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "name": agencyName,
    "description": `Contact ${agencyName} for all your insurance needs.`,
    "url": `/locations/${locationData?.client_locations?.location_slug || ''}/contact`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": location?.address_line_1 || '',
      "addressLocality": location?.city || '',
      "addressRegion": location?.state || '',
      "postalCode": location?.zip || '',
      "addressCountry": "US"
    },
    "telephone": websiteData?.phone || clientData?.phone,
    "openingHours": "Mo-Fr 08:00-17:00",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": websiteData?.phone || clientData?.phone,
      "email": websiteData?.email || clientData?.contact_email,
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };
}

export default async function LocationContactPage({ params }: PageProps) {
  const { slug } = await params;

  // Only show for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  const [websiteData, clientData, features] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
    getFeatures(),
  ]);

  if (!websiteData) {
    notFound();
  }

  // Note: pageMetadata available via getPageMetadata if needed for title/description

  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const location = websiteData.client_locations;
  const phone = location?.phone || websiteData?.phone || clientData?.phone;
  const formattedPhone = formatPhoneNumber(phone);
  const smsPhone = location?.sms_phone || websiteData?.sms_phone;
  const smsMessage = location?.sms_default_message || websiteData?.sms_default_message || "Hi! I'd like to get an insurance quote. Please contact me.";
  const showBusinessHours = features?.show_business_hours ?? false;
  const businessHours = location?.business_hours || websiteData?.business_hours;

  const mapAddressParts = [
    location?.address_line_1,
    location?.city,
    location?.state,
    location?.zip,
  ].filter(Boolean);

  const fallbackLocation = [
    clientData?.agency_name,
    location?.city,
    location?.state,
  ]
    .filter(Boolean)
    .join(', ');

  const mapQuery = mapAddressParts.length ? mapAddressParts.join(', ') : fallbackLocation;
  const mapSrc = `https://maps.google.com/maps?width=600&height=400&hl=en&q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=B&output=embed`;
  const mapTitle = clientData?.agency_name
    ? `Map of ${clientData.agency_name} in ${location?.city || ''}, ${location?.state || ''}`
    : 'Map location';

  return (
    <main className="flex-grow">
      {/* Contact Page Hero */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
            Contact Us
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-center max-w-3xl mx-auto" style={{ color: 'var(--hero-text-secondary)' }}>
            We&apos;re here to answer your questions and provide the support you need
          </p>
        </div>
        <Divider position="bottom" />
      </section>

      {/* Quick Text for Quote CTA */}
      {formattedPhone && (
        <section className="py-12 bg-theme-bg-alt relative">
          <div className="container mx-auto px-4 max-w-screen-xl text-center">
            <div className="bg-card-bg rounded-xl p-8 max-w-2xl mx-auto shadow-md border border-card-border">
              <MessageSquare className="text-primary h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4">
                Get a Quick Quote via Text!
              </h2>
              <p className="text-theme-body text-lg mb-6">
                For the fastest service, text us your insurance questions. We&apos;ll respond quickly with personalized quotes and answers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <a
                  href={`sms:${smsPhone || phone}?body=${encodeURIComponent(smsMessage)}`}
                  className="bg-accent hover:bg-accent/80 text-accent-foreground font-bold py-4 px-8 rounded-full transition duration-300 flex items-center gap-3 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <MessageSquare className="h-6 w-6" />
                  Text Us: {formattedPhone}
                </a>
                <span className="text-theme-body font-medium">Most convenient option!</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Form and Information */}
      <section className="py-16 bg-white relative">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm clientId={clientId} locationId={location?.id} />

            {/* Contact Information */}
            <div className="bg-card-bg p-8 rounded-lg shadow-md border border-card-border">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-8">Our Contact Information</h2>
              <div className="space-y-10">
                <div className="flex items-start">
                  <div className="mt-1 mr-6">
                    <MapPin className="text-primary h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-primary mb-3">Office Location</h3>
                    <p className="text-theme-body text-lg">{location?.address_line_1 || ''}</p>
                    {location?.address_line_2 && (
                      <p className="text-theme-body text-lg">{location.address_line_2}</p>
                    )}
                    <p className="text-theme-body text-lg">
                      {location?.city || ''}, {location?.state || ''} {location?.zip || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 mr-6">
                    <Phone className="text-primary h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-primary mb-3">Phone Number</h3>
                    <p className="text-theme-body text-xl font-medium">{formattedPhone || ''}</p>
                  </div>
                </div>
                {showBusinessHours && businessHours && (
                  <div className="flex items-start">
                    <div className="mt-1 mr-6">
                      <Clock className="text-primary h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-heading font-bold text-primary mb-3">Business Hours</h3>
                      <div className="grid grid-cols-2 gap-x-2 text-lg">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const hours = (businessHours as any)[day];
                          if (!hours) return null;
                          return (
                            <React.Fragment key={day}>
                              <p className="text-theme-body font-medium capitalize">{day}:</p>
                              <p className="text-theme-body">
                                {hours.closed ? 'Closed' : `${hours.open}-${hours.close}`}
                              </p>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-secondary/40 relative">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-8 text-center">Find Us on the Map</h2>
          <div className="h-[400px] bg-card-bg rounded-lg shadow-md border border-card-border relative overflow-hidden">
            {/* Updated Google Maps embed with location-specific address */}
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={mapTitle}
              ></iframe>
            </div>
          </div>
        </div>
        <Divider position="bottom" />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateLdJsonSchema(clientData, websiteData, websiteData)) }}
      />
    </main>
  );
}

export const revalidate = 3600;
