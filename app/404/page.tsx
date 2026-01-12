import Link from 'next/link';
import { Metadata } from 'next';
import { Home, Mail } from 'lucide-react';
import { getClientData } from '@/lib/client';
import { getSchemaDefaults, buildPageUrl } from '@/lib/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const clientData = await getClientData();
  const agencyName = clientData?.agency_name || "";
  const url = clientData?.client_website?.canonical_url || "";

  return {
    title: `Page Not Found | ${agencyName}`,
    description: `The page you are looking for does not exist. Please navigate back to our homepage.`,
    metadataBase: new URL(url),
    alternates: {
      canonical: '/404'
    },
    robots: {
      index: false,
      follow: false,
      nocache: true
    },
    openGraph: {
      title: `Page Not Found | ${agencyName}`,
      description: "The page you are looking for does not exist. Please navigate back to our homepage.",
      url: "/404",  // relative since we have metadataBase
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      title: `Page Not Found | ${agencyName}`,
      description: `The page you are looking for does not exist. Please navigate back to our homepage.`,
    }
  };
}

function buildLdJsonSchema(clientData: any) {
  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Page Not Found | ${agencyName}`,
    "description": "The page you are looking for does not exist. Please navigate back to our homepage.",
    "url": buildPageUrl(canonicalUrl, '/404'),
    "isPartOf": {
      "@type": "WebSite",
      "name": agencyName,
      "url": canonicalUrl
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": canonicalUrl
      }, {
        "@type": "ListItem",
        "position": 2,
        "name": "Error 404",
        "item": buildPageUrl(canonicalUrl, '/404')
      }]
    }
  };
}

export default async function NotFound() {
  const clientData = await getClientData();
  const ldJsonSchema = buildLdJsonSchema(clientData);
  return (
    <main className="flex-grow flex items-center justify-center py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-6xl md:text-8xl font-heading font-bold text-primary mb-6">404</h1>
        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-theme-body mb-8">
          Page Not Found
        </h2>
        <p className="text-lg text-theme-body max-w-xl mx-auto mb-10">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="bg-accent hover:bg-accent/80 text-accent-foreground font-bold py-3 px-8 rounded-full transition duration-300 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Homepage
          </Link>
          <Link
            href="/contact"
            className="bg-transparent border-2 border-primary text-primary hover:bg-accent/10 font-bold py-3 px-8 rounded-full transition duration-300 flex items-center justify-center"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Us
          </Link>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonSchema) }}
      />
    </main>
  );
};