import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/server';
import { getAllWebsites } from '@/lib/website';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) {
    return new NextResponse('Client ID not configured', { status: 500 });
  }

  const supabase = await getSupabaseClient();

  // Fetch base llms_txt content from clients table
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('llms_txt')
    .eq('id', clientId)
    .single();

  if (clientError || !clientData?.llms_txt) {
    return new NextResponse('LLMs.txt content not available', { status: 404 });
  }

  // Fetch all locations for this client
  const locations = await getAllWebsites();

  // Fetch published policies grouped by location
  const { data: policies } = await supabase
    .from('client_policy_pages')
    .select('title, location_id')
    .eq('client_id', clientId)
    .eq('published', true)
    .order('title');

  // Build services section grouped by location
  let servicesSection = '\n## Services\n';

  if (locations && locations.length > 0 && policies && policies.length > 0) {
    for (const location of locations) {
      const locationPolicies = policies.filter(p => p.location_id === location.id);
      if (locationPolicies.length > 0) {
        servicesSection += `\n### ${location.city}, ${location.state}\n`;
        for (const policy of locationPolicies) {
          servicesSection += `- ${policy.title}\n`;
        }
      }
    }
  } else if (policies && policies.length > 0) {
    // Fallback: list all policies without location grouping
    for (const policy of policies) {
      servicesSection += `- ${policy.title}\n`;
    }
  }

  // Combine base content with dynamic services section
  const fullContent = `${clientData.llms_txt}\n${servicesSection}`;

  return new NextResponse(fullContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
