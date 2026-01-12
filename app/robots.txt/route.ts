import { NextResponse } from 'next/server';
import { getClientData } from '@/lib/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientData = await getClientData();
  const canonicalUrl = clientData?.client_website?.canonical_url;

  if (!canonicalUrl) {
    console.error('Missing canonical_url for robots.txt');
    return new NextResponse('User-agent: *\nDisallow: /', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const robotsTxt = `User-agent: *
Allow: /

# Sitemap location
Sitemap: ${canonicalUrl}/sitemap.xml

# Crawl delay to reduce server load
Crawl-delay: 10

# Disallow admin or private areas
Disallow: /api/
Disallow: /debug`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
