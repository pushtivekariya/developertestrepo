import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getPageMetadata } from '@/lib/page-metadata';
import { getAllPolicies } from '@/lib/policy-categories';
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
  const pageMetadata = await getPageMetadata('policies', websiteData.location_id);
  const canonicalUrl = clientData?.client_website?.canonical_url || '';

  return {
    title: pageMetadata.meta_title || `Insurance Policies | ${locationName}`,
    description: pageMetadata.meta_description,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/policies`,
    },
  };
}

export default async function LocationPoliciesPage({ params }: PageProps) {
  const { slug } = await params;

  // Only show for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  const [websiteData] = await Promise.all([
    getWebsiteBySlug(slug),
  ]);

  if (!websiteData) {
    notFound();
  }

  const locationId = websiteData?.client_locations?.id;
  const [allPolicies, pageMetadata] = await Promise.all([
    getAllPolicies(locationId),
    getPageMetadata('policies', locationId),
  ]);

  return (
    <div>
      {/* Policies Page Hero */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
            {pageMetadata.hero_heading || "Our Policies"}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-center max-w-3xl mx-auto" style={{ color: 'var(--hero-text-secondary)' }}>
            {pageMetadata.hero_subheading || "Browse our insurance policies - auto, home, life, and business coverage. Compare options and get personalized quotes today."}
          </p>
        </div>
        <Divider position="bottom" />
      </section>

      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allPolicies.map((policy) => (
          <Link 
            key={policy.slug} 
            href={`/locations/${slug}/policies/${policy.slug}`} 
            className="block"
          >
            <div className="bg-card-bg rounded-xl p-8 text-center shadow-lg border border-card-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full">
              <div className="rounded-full bg-secondary/40 h-20 w-20 flex items-center justify-center mx-auto mb-4 shadow-md border border-card-border/20">
                {policy.icon_url ? (
                  <Image src={policy.icon_url} alt="" width={40} height={40} className="text-primary" />
                ) : (
                  <ShieldCheck size={24} className="text-primary" />
                )}
              </div>
              <h3 className="text-xl font-heading font-bold text-primary mb-2">
                {policy.title}
              </h3>
              <div className="h-1 w-12 bg-accent/60 rounded mx-auto mt-1 mb-4"></div>
              {policy.content_summary && (
                <p className="text-theme-body mb-6 min-h-[3rem] line-clamp-2">
                  {policy.content_summary}
                </p>
              )}
              <div className="flex justify-center">
                <span className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-6 rounded-full text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2">
                  <span>Learn More</span>
                  <ShieldCheck size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
}

export const revalidate = 3600;
