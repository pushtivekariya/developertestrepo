import { Metadata } from 'next';
import { interpolateTemplate, buildTemplateContext } from '@/lib/template-variables';

interface GlossaryTerm {
  id: string;
  slug: string;
  term: string;
  head: string;
  body: string | null;
  links: string | null;
  created_at: string;
  updated_at: string;
  related_policy_pages: string[] | string | null;
}

interface ClientData {
  agency_name?: string;
  city?: string;
  state?: string;
  phone?: string;
  contact_email?: string;
  address?: string;
  zip?: string;
  client_website?: {
    canonical_url?: string;
  };
}

export function injectClientData(text: string | null, clientData: ClientData | null): string {
  if (!text) return '';
  if (!clientData) return text;

  const context = buildTemplateContext(clientData);
  return interpolateTemplate(text, context);
}

export function generateGlossaryMetadata(term: GlossaryTerm | null, clientData: ClientData | null): Metadata {
  if (!term) {
    return {
      title: 'Term Not Found | Insurance Glossary',
      description: 'The requested insurance term could not be found.',
    };
  }

  const injectedHead = injectClientData(term.head, clientData);
  const plainTextDescription = (injectedHead || term.term || 'Insurance term definition').replace(/\n/g, ' ').substring(0, 160);
  const agencyName = clientData?.agency_name || "";
  const canonicalUrl = clientData?.client_website?.canonical_url || '';

  const title = `${term.term} | Insurance Agency Terms`;

  return {
    title,
    description: plainTextDescription,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/glossary/${term.slug}`
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title,
      description: plainTextDescription,
      url: `/glossary/${term.slug}`,
      siteName: agencyName || "",
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: plainTextDescription,
    }
  };
}
