import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HelpCircle, Phone } from 'lucide-react';
import FAQSearch from 'components/faq/FAQSearch';
import FAQItems from 'components/faq/FAQItems';
import BackToTop from 'components/ui/BackToTop';
import { Divider } from '@/components/ui/Divider';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getPageMetadata } from '@/lib/page-metadata';
import { interpolateTemplate, buildTemplateContext } from '@/lib/template-variables';
import { getBusinessInfo } from '@/lib/business-info';
import { normalizePhoneNumber, getLocationIdBySlug } from '@/lib/utils';
import { getAggregatedFAQs } from '@/lib/faq';

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

  const [websiteData, clientData, pageMetadata] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
    getPageMetadata('faq'),
  ]);

  if (!websiteData) return {};

  const locationName = websiteData.client_locations?.location_name || '';
  const agencyName = clientData?.agency_name || '';
  const canonicalUrl = clientData?.client_website?.canonical_url || '';

  return {
    title: pageMetadata.meta_title || `FAQ | ${locationName}`,
    description: pageMetadata.meta_description,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/faq`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: pageMetadata.meta_title || `FAQ | ${locationName}`,
      description: pageMetadata.meta_description,
      url: `/locations/${slug}/faq`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageMetadata.meta_title || `FAQ | ${locationName}`,
      description: pageMetadata.meta_description,
    },
  };
}

function generateLdJsonSchema(faqPolicies: any[], clientData: any, websiteData: any, slug: string) {
  const agencyName = clientData?.agency_name || '';
  const location = websiteData?.client_locations;
  const city = location?.city || clientData?.city || '';
  const state = location?.state || clientData?.state || '';
  const locationName = location?.location_name || city;

  // Build name with 60 char limit for SEO
  const fullName = `FAQ | ${locationName} | ${agencyName}`;
  const name = fullName.length > 60 ? fullName.substring(0, 57) + '...' : fullName;

  // Build description with 155 char limit for SEO
  const fullDescription = `Answers to common insurance questions for ${city}, ${state} residents. Learn about coverage, claims, and services.`;
  const description = fullDescription.length > 155 ? fullDescription.substring(0, 152) + '...' : fullDescription;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name,
    description,
    url: `/locations/${slug}/faq`,
    mainEntity: faqPolicies.flatMap((policy) =>
      policy.faqs.map((faq: any) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      }))
    ),
  };
}

export default async function LocationFAQPage({ params }: PageProps) {
  const { slug } = await params;

  // Only show for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  // Get locationId from slug for location-specific FAQs
  const locationId = await getLocationIdBySlug(slug);

  if (!locationId) {
    notFound();
  }

  const [websiteData, clientData, aggregatedFAQs, businessInfo] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
    getAggregatedFAQs(locationId),
    getBusinessInfo(),
  ]);

  if (!websiteData) {
    notFound();
  }

  const locationName = websiteData.client_locations?.location_name || '';

  // Transform policy links to include location prefix
  const transformPolicyLinks = (html: string): string => {
    // First, handle full path patterns like /policies/all/[slug] or /policies/[category]/[slug]
    // Strip the category since routes are now /locations/[slug]/policies/[policy]
    let transformed = html.replace(
      /href="\/policies\/(all|[^"\/\s]+)\/([^"\s]+)"/g,
      (match, category, policySlug) => {
        return `href="/locations/${slug}/policies/${policySlug}"`;
      }
    );
    
    // Then, handle simple relative links like href="umbrella-insurance" (no path, just slug)
    // These are policy slugs without any path prefix
    transformed = transformed.replace(
      /href="([a-z][a-z0-9-]*-insurance[^"]*)"/gi,
      (match, policySlug) => {
        // Skip if already transformed (starts with /)
        if (policySlug.startsWith('/')) return match;
        return `href="/locations/${slug}/policies/${policySlug}"`;
      }
    );
    
    return transformed;
  };

  // Build template context for variable interpolation
  const context = buildTemplateContext(clientData, websiteData, null, {
    yearsInBusiness: businessInfo?.years_in_business_text || '',
    regionalDescriptor: businessInfo?.regional_descriptor || '',
    foundingYear: businessInfo?.founding_year?.toString() || '',
  });

  // Process aggregated FAQs with template interpolation and link transformation
  const faqPolicies = aggregatedFAQs.map(policy => ({
    id: policy.id,
    name: policy.name,
    icon: <HelpCircle className="h-5 w-5 text-primary" />,
    faqs: policy.faqs.map(faq => ({
      question: interpolateTemplate(faq.question, context),
      answer: transformPolicyLinks(interpolateTemplate(faq.answer, context)),
    })),
  }));

  const phone = websiteData?.phone || clientData?.phone || '';
  const phoneTel = normalizePhoneNumber(phone);

  return (
    <main>
      {/* Hero Section */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-center max-w-3xl mx-auto" style={{ color: 'var(--hero-text-secondary)' }}>
            Find answers to common questions about insurance coverage, claims, and our services at{' '}
            {locationName}.
          </p>
        </div>
        <Divider position="bottom" />
      </section>

      <FAQSearch items={faqPolicies} />

      <FAQItems items={faqPolicies} />

      {/* Insurance Resources Section */}
      <section className="py-16 bg-secondary/10 relative">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4 text-center">
            Insurance Resources
          </h2>
          <p className="text-theme-body text-lg text-center max-w-2xl mx-auto mb-12">
            Explore our helpful resources to better understand your insurance options and how we can assist you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href={`/locations/${slug}/contact`}
              className="bg-card-bg p-8 rounded-xl shadow-sm border border-card-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center"
            >
              <h3 className="text-xl font-heading font-bold text-primary mb-3">
                Understanding Insurance Terms
              </h3>
              <p className="text-theme-body">
                Insurance terminology can be confusing. Contact us for help understanding the language of insurance.
              </p>
            </Link>

            <Link
              href={`/locations/${slug}/contact`}
              className="bg-card-bg p-8 rounded-xl shadow-sm border border-card-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center"
            >
              <h3 className="text-xl font-heading font-bold text-primary mb-3">
                Policy Review
              </h3>
              <p className="text-theme-body">
                Not sure if your current policy meets your needs? Schedule a free policy review with our team.
              </p>
            </Link>

            <Link
              href={`/locations/${slug}/contact`}
              className="bg-card-bg p-8 rounded-xl shadow-sm border border-card-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center"
            >
              <h3 className="text-xl font-heading font-bold text-primary mb-3">
                Claims Process
              </h3>
              <p className="text-theme-body">
                Learn about our simple claims process and how we support you when you need us most.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-12 bg-accent text-accent-foreground relative">
        <Divider position="top" />
        <div className="container mx-auto px-4 max-w-screen-xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-6">Still Have Questions?</h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto text-lg mb-8">
            Our team at {locationName} is here to help. Contact us directly for personalized assistance with your insurance needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/locations/${slug}/contact`}
              className="bg-white text-primary py-3 px-8 rounded-full font-medium hover:bg-theme-bg transition-colors inline-block"
            >
              Contact Us
            </Link>
            {phone && (
              <Link
                href={phoneTel ? `tel:${phoneTel}` : '#'}
                className="bg-white/20 text-primary-foreground py-3 px-8 rounded-full font-medium hover:bg-white/30 transition-colors inline-flex items-center"
              >
                <Phone size={18} className="mr-2" />
                {phone}
              </Link>
            )}
          </div>
        </div>
        <Divider position="bottom" />
      </section>

      <BackToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLdJsonSchema(faqPolicies, clientData, websiteData, slug)),
        }}
      />
    </main>
  );
}

export const revalidate = 3600;
