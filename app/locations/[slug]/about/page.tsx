import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getSchemaDefaults, buildPageUrl } from '@/lib/structured-data';
import { getPageMetadata } from '@/lib/page-metadata';
import { Divider } from '@/components/ui/Divider';
import { getBusinessInfo } from '@/lib/business-info';
import { getLocationIdBySlug } from '@/lib/utils';

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

  const agencyName = clientData?.agency_name || '';
  const locationName = websiteData.client_locations?.location_name || '';
  const locationId = websiteData.client_locations?.location_id;
  const pageMetadata = await getPageMetadata('about', locationId);
  const canonicalUrl = clientData?.client_website?.canonical_url || '';

  return {
    title: pageMetadata.meta_title || `About Us | ${agencyName}`,
    description: pageMetadata.meta_description || `Learn more about ${agencyName} at ${locationName}.`,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/about`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: pageMetadata.meta_title || `About Us | ${agencyName}`,
      description: pageMetadata.meta_description || `Learn more about ${agencyName} at ${locationName}.`,
      url: `/locations/${slug}/about`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageMetadata.meta_title || `About Us | ${agencyName}`,
      description: pageMetadata.meta_description || `Learn more about ${agencyName} at ${locationName}.`,
    },
  };
}

const buildLdJsonSchema = (clientData: any, businessInfo: any, websiteData: any, slug: string) => {
  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);
  const location = websiteData?.client_locations;
  const city = location?.city || clientData?.city || '';
  const state = location?.state || clientData?.state || '';

  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${agencyName}`,
    description:
      businessInfo?.about_short ||
      `Learn more about ${agencyName} in ${city}, ${state}.`,
    url: buildPageUrl(canonicalUrl, `/locations/${slug}/about`),
    mainEntity: {
      '@type': 'Organization',
      name: agencyName,
      url: buildPageUrl(canonicalUrl, `/locations/${slug}`),
      foundingDate: businessInfo?.founding_year?.toString() || undefined,
      foundingLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: city,
          addressRegion: state,
          addressCountry: 'US',
        },
      },
      slogan: businessInfo?.slogan || undefined,
    },
  };
};

interface HeroHeading {
  tag: string;
  type: string;
  content: string;
}

interface HeroSubheading {
  type: string;
  content: string;
}

interface HeroSection {
  heading: HeroHeading;
  subheading: HeroSubheading;
}

interface IconBlock {
  url: string;
  type: string;
}

interface ImageBlock {
  alt: string;
  url: string;
  type: string;
}

interface ParagraphBlock {
  type: string;
  content: string;
}

interface IntroDescription {
  type: string;
  paragraphs: {
    paragraph_1?: ParagraphBlock;
    paragraph_2?: ParagraphBlock;
    paragraph_3?: ParagraphBlock;
    [key: string]: ParagraphBlock | undefined;
  };
}

interface IntroSection {
  icon: IconBlock;
  image: ImageBlock;
  heading: HeroHeading;
  description: IntroDescription;
}

interface LegacySection {
  icon: IconBlock;
  heading: HeroHeading;
  description: IntroDescription;
}

interface InsuranceTypeItem {
  link: string;
  name: string;
}

interface InsuranceTypes {
  type: string;
  items: InsuranceTypeItem[];
}

interface PoliciesSection {
  heading: HeroHeading;
  description: ParagraphBlock;
  insurance_note: ParagraphBlock;
  insurance_types: InsuranceTypes;
  introductory_line: ParagraphBlock;
}

interface CommunitySection {
  icon: IconBlock;
  heading: HeroHeading;
  description: IntroDescription;
}

interface ReasonItem {
  icon: string;
  heading: string;
  description: string;
}

interface Reasons {
  type: string;
  items: ReasonItem[];
}

interface LocalKnowledgeSection {
  heading: HeroHeading;
  reasons: Reasons;
  description: IntroDescription;
}

interface ApproachItem {
  text: string;
}

interface Approaches {
  type: string;
  items: ApproachItem[];
}

interface PersonalApproachSection {
  icon: IconBlock;
  note: ParagraphBlock;
  heading: HeroHeading;
  approaches: Approaches;
  description: IntroDescription;
  introductory_line: ParagraphBlock;
}

interface ThankYouSection {
  icon: IconBlock;
  heading: HeroHeading;
  description: IntroDescription;
}

interface CtaBlock {
  url: string;
  type: string;
  content: string;
}

interface CtaSection {
  cta: CtaBlock;
}

interface ClientAboutPageData {
  hero_section?: HeroSection;
  intro_section?: IntroSection;
  legacy_section?: LegacySection;
  policies_section?: PoliciesSection;
  community_section?: CommunitySection;
  local_knowledge_section?: LocalKnowledgeSection;
  personal_approach_section?: PersonalApproachSection;
  thank_you_section?: ThankYouSection;
  cta_section?: CtaSection;
}

async function getAboutPageData(locationId: string | null): Promise<{
  heroSection: HeroSection | null;
  introSection: IntroSection | null;
  legacySection: LegacySection | null;
  policiesSection: PoliciesSection | null;
  communitySection: CommunitySection | null;
  localKnowledgeSection: LocalKnowledgeSection | null;
  personalApproachSection: PersonalApproachSection | null;
  thankYouSection: ThankYouSection | null;
  ctaSection: CtaSection | null;
}> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!clientId) {
    console.error('NEXT_PUBLIC_CLIENT_ID is not set');
    return {
      heroSection: null,
      introSection: null,
      legacySection: null,
      policiesSection: null,
      communitySection: null,
      localKnowledgeSection: null,
      personalApproachSection: null,
      thankYouSection: null,
      ctaSection: null,
    };
  }
  const { data, error } = await supabase
    .from('client_about_page')
    .select('hero_section, intro_section, legacy_section, policies_section, community_section, local_knowledge_section, personal_approach_section, thank_you_section, cta_section')
    .eq('client_id', clientId)
    .eq('location_id', locationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching about page data:', error);
    return {
      heroSection: null,
      introSection: null,
      legacySection: null,
      policiesSection: null,
      communitySection: null,
      localKnowledgeSection: null,
      personalApproachSection: null,
      thankYouSection: null,
      ctaSection: null,
    };
  }

  const pageData = data as ClientAboutPageData | null;

  const heroSection = pageData?.hero_section || null;
  const legacySection = pageData?.legacy_section || null;
  const introSection = pageData?.intro_section || null;
  const policiesSection = pageData?.policies_section || null;
  const communitySection = pageData?.community_section || null;
  const localKnowledgeSection = pageData?.local_knowledge_section || null;
  const personalApproachSection = pageData?.personal_approach_section || null;
  const thankYouSection = pageData?.thank_you_section || null;
  const ctaSection = pageData?.cta_section || null;

  return {
    heroSection,
    introSection,
    legacySection,
    policiesSection,
    communitySection,
    localKnowledgeSection,
    personalApproachSection,
    thankYouSection,
    ctaSection,
  };
}

export default async function LocationAboutPage({ params }: PageProps) {
  const { slug } = await params;

  // Only show for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  const [websiteData, clientData, businessInfo] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
    getBusinessInfo(),
  ]);

  if (!websiteData) {
    notFound();
  }

  const locationId = await getLocationIdBySlug(slug);
  const {
    heroSection,
    introSection,
    legacySection,
    policiesSection,
    communitySection,
    localKnowledgeSection,
    personalApproachSection,
    thankYouSection,
    ctaSection,
  } = await getAboutPageData(locationId);

  const ldJsonSchema = buildLdJsonSchema(clientData, businessInfo, websiteData, slug);

  const hasAnySection = introSection || legacySection || policiesSection || communitySection || localKnowledgeSection || personalApproachSection || thankYouSection || ctaSection;
  return (
    <main className="flex-grow">
      {/* About Page Hero */}
      {heroSection && (
        <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
          <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
              {heroSection?.heading?.content || ''}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-center max-w-3xl mx-auto" style={{ color: 'var(--hero-text-secondary)' }}>
              {heroSection?.subheading?.content || ''}
            </p>
          </div>
          <Divider position="bottom" />
        </section>
      )}

      {/* Main Content Area */}
      {hasAnySection && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 max-w-screen-xl">
            <div className="prose prose-lg max-w-none">
              <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
                {/* Icon Header */}
                {introSection && (
                  <>
                    {introSection?.icon?.url && (
                      <div className="flex items-center justify-center mb-8">
                        <div className="rounded-full bg-theme-bg-alt p-6 shadow-md">
                          <Image
                            src={introSection.icon.url || ''}
                            alt=""
                            width={56}
                            height={56}
                            className="text-primary m-0"
                          />
                        </div>
                      </div>
                    )}

                    {/* Intro Section */}
                    {introSection?.heading && (
                      <h2 className="text-3xl font-heading font-bold text-primary mb-4 text-center">
                        {introSection.heading?.content || ''}
                        <div className="h-1 w-24 bg-accent/60 rounded mx-auto mt-3"></div>
                      </h2>
                    )}

                    <div className={introSection?.image?.url ? "grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-12" : "mb-12"}>
                      <div>
                        <div className="text-theme-body">
                          {introSection?.description?.paragraphs ? Object.keys(introSection.description.paragraphs)
                            .sort()
                            .map((key) => {
                              const paragraph = introSection.description.paragraphs[key];
                              return paragraph ? (
                                <p key={key} className="mb-4 last:mb-0">
                                  {paragraph?.content || ''}
                                </p>
                              ) : null;
                            }) : null}
                        </div>
                      </div>
                      {introSection?.image?.url && (
                        <div className="rounded-lg overflow-hidden shadow-xl border-4 border-secondary h-[400px] relative">
                          <Image
                            src={introSection.image.url || ''}
                            alt={introSection.image?.alt || ''}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Legacy Section */}
                {legacySection && (
                  <div className="bg-theme-bg/30 rounded-lg p-8 mb-12">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      {legacySection?.icon?.url && (
                        <div className="rounded-full bg-primary/20 p-3 flex-shrink-0">
                          <Image
                            src={legacySection.icon.url || ''}
                            alt=""
                            width={32}
                            height={32}
                            className="text-primary m-0"
                          />
                        </div>
                      )}
                      <div>
                        {legacySection?.heading && (
                          <h3 className="text-2xl font-heading font-bold text-primary mb-3">
                            {legacySection.heading?.content || ''}
                          </h3>
                        )}
                        <div className="text-theme-body">
                          {legacySection?.description?.paragraphs ? Object.keys(legacySection.description.paragraphs)
                            .sort()
                            .map((key) => {
                              const paragraph = legacySection.description.paragraphs[key];
                              return paragraph ? (
                                <p key={key} className="mb-4 last:mb-0">
                                  {paragraph?.content || ''}
                                </p>
                              ) : null;
                            }) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Policies Section */}
                {policiesSection && (
                  <>
                    {policiesSection?.heading && (
                      <h3 className="text-2xl font-heading font-bold text-primary mb-6 text-center">
                        {policiesSection.heading?.content || ''}
                        <div className="h-1 w-24 bg-accent/60 rounded mx-auto mt-3"></div>
                      </h3>
                    )}
                    <div className="text-theme-body mb-8 text-center max-w-3xl mx-auto">
                      {policiesSection?.description && (
                        <p>
                          {policiesSection.description?.content || ''}
                        </p>
                      )}
                      {policiesSection?.introductory_line && (
                        <p>
                          {policiesSection.introductory_line?.content || ''}
                        </p>
                      )}
                    </div>
                    {policiesSection?.insurance_types?.items && policiesSection.insurance_types.items.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                        {policiesSection.insurance_types.items.map((item, index) => (
                          <Link key={index} href={`/locations/${slug}/policies/${item?.link || ''}`} className="block">
                            <div className="bg-theme-bg/30 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-secondary/40 hover:border-secondary">
                              <h3 className="text-xl font-heading font-bold text-primary mb-2">{item?.name || ''}</h3>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {policiesSection?.insurance_note && (
                      <div className="text-theme-body mb-12 text-center max-w-3xl mx-auto">
                        <p>
                          {policiesSection.insurance_note?.content || ''}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Community Section */}
                {communitySection && (
                  <div className="bg-primary/10 rounded-lg p-8 border border-primary/20 mb-12">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      {communitySection?.icon?.url && (
                        <div className="rounded-full bg-primary/20 p-3 flex-shrink-0">
                          <Image
                            src={communitySection.icon.url || ''}
                            alt=""
                            width={32}
                            height={32}
                            className="text-primary m-0"
                          />
                        </div>
                      )}
                      <div>
                        {communitySection?.heading && (
                          <h3 className="text-2xl font-heading font-bold text-primary mb-3">
                            {communitySection.heading?.content || ''}
                          </h3>
                        )}
                        <div className="text-theme-body">
                          {communitySection?.description?.paragraphs ? Object.keys(communitySection.description.paragraphs)
                            .sort()
                            .map((key) => {
                              const paragraph = communitySection.description.paragraphs[key];
                              return paragraph ? (
                                <p key={key} className="mb-4 last:mb-0">
                                  {paragraph?.content || ''}
                                </p>
                              ) : null;
                            }) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Local Knowledge Section */}
                {localKnowledgeSection && (
                  <>
                    {localKnowledgeSection?.heading && (
                      <h3 className="text-2xl font-heading font-bold text-primary mb-4 text-center">
                        {localKnowledgeSection.heading?.content || ''}
                        <div className="h-1 w-24 bg-accent/60 rounded mx-auto mt-3"></div>
                      </h3>
                    )}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                      <div className="text-theme-body">
                        {localKnowledgeSection?.description?.paragraphs ? Object.keys(localKnowledgeSection.description.paragraphs)
                          .sort()
                          .slice(0, 2)
                          .map((key) => {
                            const paragraph = localKnowledgeSection.description.paragraphs[key];
                            return paragraph ? (
                              <p key={key} className="mb-4 last:mb-0">
                                {paragraph?.content || ''}
                              </p>
                            ) : null;
                          }) : null}
                      </div>
                      <div className="flex flex-col space-y-4">
                        {localKnowledgeSection?.reasons?.items && localKnowledgeSection.reasons.items.length > 0 ? localKnowledgeSection.reasons.items.map((reason, index) => (
                          <div key={index} className="flex items-start gap-3 bg-theme-bg-alt p-4 rounded-lg border border-theme-bg hover:shadow-md transition-all duration-300">
                            {reason?.icon && (
                              <div className="rounded-full bg-accent/20 p-1.5 mt-0.5">
                                <Image
                                  src={reason.icon || ''}
                                  alt=""
                                  width={18}
                                  height={18}
                                  className="text-primary m-0"
                                />
                              </div>
                            )}
                            <div>
                              <span className="text-primary font-medium">{reason?.heading || ''}</span>
                              <p className="text-sm text-theme-body mt-1">{reason?.description || ''}</p>
                            </div>
                          </div>
                        )) : null}
                      </div>
                    </div>
                    {localKnowledgeSection?.description?.paragraphs && (
                      <div className="text-theme-body mb-12">
                        {Object.keys(localKnowledgeSection.description.paragraphs)
                          .sort()
                          .slice(2)
                          .map((key) => {
                            const paragraph = localKnowledgeSection.description.paragraphs[key];
                            return paragraph ? (
                              <p key={key} className="mb-4 last:mb-0">
                                {paragraph?.content || ''}
                              </p>
                            ) : null;
                          })}
                      </div>
                    )}
                  </>
                )}

                {/* Personal Approach Section */}
                {personalApproachSection && (
                  <div className="bg-theme-bg/30 rounded-lg p-8 mb-12">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      {personalApproachSection?.icon?.url && (
                        <div className="rounded-full bg-primary/20 p-3 flex-shrink-0">

                          <Image
                            src={personalApproachSection.icon.url || ''}
                            alt=""
                            width={32}
                            height={32}
                            className="text-primary m-0"
                          />
                        </div>
                      )}
                      <div>
                        {personalApproachSection?.heading && (
                          <h3 className="text-2xl font-heading font-bold text-primary mb-3">
                            {personalApproachSection.heading?.content || ''}
                          </h3>
                        )}
                        <div className="text-theme-body">
                          {personalApproachSection?.description?.paragraphs ? Object.keys(personalApproachSection.description.paragraphs)
                            .sort()
                            .map((key) => {
                              const paragraph = personalApproachSection.description.paragraphs[key];
                              return paragraph ? (
                                <p key={key} className="mb-4 last:mb-0">
                                  {paragraph?.content || ''}
                                </p>
                              ) : null;
                            }) : null}
                          {personalApproachSection?.introductory_line && (
                            <p>
                              {personalApproachSection.introductory_line?.content || ''}
                            </p>
                          )}
                          {personalApproachSection?.approaches?.items && personalApproachSection.approaches.items.length > 0 && (
                            <div className="grid md:grid-cols-3 gap-4 my-6">
                              {personalApproachSection.approaches.items.map((approach, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 shadow-sm text-center border border-secondary/30">
                                  <div className="text-primary font-bold mb-1">{approach?.text || ''}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {personalApproachSection?.note && (
                            <p>
                              {personalApproachSection.note?.content || ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thank You Section */}
                {thankYouSection && (
                  <div className="bg-primary/5 rounded-lg p-8 border border-primary/10 mb-12">
                    <div className="flex flex-col items-center text-center">
                      {thankYouSection?.icon?.url && (
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                          <Image
                            src={thankYouSection.icon.url || ''}
                            alt=""
                            width={32}
                            height={32}
                            className="text-primary m-0"
                          />
                        </div>
                      )}
                      {thankYouSection?.heading && (
                        <h3 className="text-2xl font-heading font-bold text-primary mb-3">
                          {thankYouSection.heading?.content || ''}
                        </h3>
                      )}
                      <div className="text-theme-body max-w-3xl mx-auto">
                        {thankYouSection?.description?.paragraphs ? Object.keys(thankYouSection.description.paragraphs)
                          .sort()
                          .map((key) => {
                            const paragraph = thankYouSection.description.paragraphs[key];
                            return paragraph ? (
                              <p key={key} className="mb-4 last:mb-0">
                                {paragraph?.content || ''}
                              </p>
                            ) : null;
                          }) : null}
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                {ctaSection?.cta && (
                  <div className="text-center mt-8">
                    <Link href={
                      ctaSection.cta?.url?.includes('/locations/')
                        ? ctaSection.cta.url
                        : ctaSection.cta?.url?.startsWith('/')
                          ? `/locations/${slug}${ctaSection.cta.url}`
                          : ctaSection.cta?.url?.startsWith('http')
                            ? ctaSection.cta.url
                            : `/locations/${slug}/contact`
                    }>
                      <button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        {ctaSection.cta?.content || 'Contact Us Today'}
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonSchema) }}
      />
    </main>
  );
}

export const revalidate = 3600;
