/******************************************************************
 * generate_policy_pages_2-v2.ts — Simplified Assistant Architecture
 * ---------------------------------------------------------------
 * CHANGES FROM PREVIOUS VERSION:
 * • Fetches location data (city, state, service_areas) from client_locations
 * • Sends location_city, location_state, service_areas to AI
 * • AI returns simplified content (no LD-JSON)
 * • System builds LD-JSON structure after receiving AI response
 * • Combines database data + AI content into final output
 ******************************************************************/
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_ASSISTANT_ID = 'asst_Sn9n1KaTY5ghDVPLIRfWKUIq';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const BATCH_SIZE = 4;

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================================
// SUPABASE HELPER
// ============================================================
async function sb(path: string, options: RequestInit = {}) {
  const url = Deno.env.get('SUPABASE_URL')!;
  const role = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  console.log(`[Supabase] ${options.method || 'GET'} ${path}`);
  return fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': role,
      'Authorization': `Bearer ${role}`,
      'Content-Type': 'application/json',
      ...options.headers ?? {}
    }
  });
}

// ============================================================
// STRING REPLACEMENT HELPER
// ============================================================
function deepReplace(obj: any, repl: Record<string, string>): any {
  if (typeof obj === 'string') {
    return Object.entries(repl).reduce((t, [k, v]) => t.split(k).join(v), obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((x) => deepReplace(x, repl));
  }
  if (obj && typeof obj === 'object') {
    const o: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      o[k] = deepReplace(v, repl);
    }
    return o;
  }
  return obj;
}

// ============================================================
// OPENAI ASSISTANT RUNNER
// ============================================================
async function runAssistant(key: string, assistantId: string, payload: any) {
  const hdr = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
  };
  
  const tr = await fetch(`${OPENAI_BASE_URL}/threads`, {
    method: 'POST',
    headers: hdr,
    body: '{}'
  });
  console.log('[Thread]', tr.status);
  if (!tr.ok) throw new Error('Thread ' + tr.status);
  const { id: thread } = await tr.json();
  
  const mr = await fetch(`${OPENAI_BASE_URL}/threads/${thread}/messages`, {
    method: 'POST',
    headers: hdr,
    body: JSON.stringify({
      role: 'user',
      content: [{ type: 'text', text: JSON.stringify(payload) }]
    })
  });
  console.log('[Message]', mr.status);
  if (!mr.ok) throw new Error('Msg ' + mr.status);
  
  const rr = await fetch(`${OPENAI_BASE_URL}/threads/${thread}/runs`, {
    method: 'POST',
    headers: hdr,
    body: JSON.stringify({ assistant_id: assistantId })
  });
  if (!rr.ok) throw new Error('Run ' + rr.status);
  const { id: runId } = await rr.json();
  
  for (let i = 0; i < 120; i++) {
    const stat = await fetch(`${OPENAI_BASE_URL}/threads/${thread}/runs/${runId}`, {
      headers: hdr
    }).then((r) => r.json());
    console.log('[Run]', stat.status, 'loop', i);
    
    if (stat.status === 'completed') {
      const msgs = await fetch(`${OPENAI_BASE_URL}/threads/${thread}/messages`, {
        headers: hdr
      }).then((r) => r.json());
      
      const assistantMessage = msgs.data.find((m: any) => m.role === 'assistant');
      if (!assistantMessage?.content?.[0]) {
        throw new Error('No assistant response found');
      }
      
      const raw = assistantMessage.content[0].text?.value || '';
      if (!raw.trim()) throw new Error('Empty response from assistant');
      
      let cleaned = raw.trim();
      cleaned = cleaned.replace(/^```(?:json|javascript|js)?\s*/gim, '');
      cleaned = cleaned.replace(/```\s*$/gim, '');
      cleaned = cleaned.trim();
      
      try {
        return JSON.parse(cleaned);
      } catch (parseError) {
        console.error('[Parse Error]', (parseError as Error).message);
        throw new Error(`Failed to parse JSON: ${(parseError as Error).message}`);
      }
    }
    
    if (['failed', 'cancelled'].includes(stat.status)) {
      throw new Error('Assistant ' + stat.status);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Timeout');
}

// ============================================================
// URL BUILDER - Handles single vs multi-location
// ============================================================
function buildContentUrl(
  canonicalUrl: string,
  isMultiLocation: boolean,
  locationSlug: string | null,
  policyType: string,
  pageSlug: string
): string {
  const base = canonicalUrl.replace(/\/$/, '');
  
  if (isMultiLocation && locationSlug) {
    return `${base}/locations/${locationSlug}/policies/${policyType}/${pageSlug}`;
  }
  
  return `${base}/policies/${policyType}/${pageSlug}`;
}

// ============================================================
// LD-JSON BUILDER - System builds schema from AI content + DB data
// ============================================================
function buildLdJson(
  aiContent: any,
  locationData: LocationData,
  clientData: ClientData,
  pageUrl: string
): any {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'InsuranceAgency',
        'name': clientData.agency_name,
        'url': clientData.canonical_url,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': locationData.city,
          'addressRegion': locationData.state
        },
        'areaServed': locationData.service_areas.map(city => ({
          '@type': 'City',
          'name': city
        }))
      },
      {
        '@type': 'Service',
        'serviceType': aiContent.policy_type || 'Insurance',
        'name': aiContent.title,
        'description': aiContent.description || aiContent.content_summary,
        'url': pageUrl,
        'provider': {
          '@type': 'InsuranceAgency',
          'name': clientData.agency_name
        },
        'areaServed': locationData.service_areas.map(city => ({
          '@type': 'City',
          'name': city
        }))
      },
      {
        '@type': 'FAQPage',
        'mainEntity': (aiContent.faqs || []).map((faq: any) => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      }
    ]
  };
}

// ============================================================
// LOCATION DATA INTERFACE & FETCHER
// ============================================================
interface LocationData {
  id: string;
  city: string;
  state: string;
  location_slug: string;
  service_areas: string[];
}

async function getLocationData(locationId: string): Promise<LocationData | null> {
  const { data, error } = await supabaseAdmin
    .from('client_locations')
    .select('id, city, state, location_slug, service_areas')
    .eq('id', locationId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    city: data.city,
    state: data.state,
    location_slug: data.location_slug || '',
    service_areas: data.service_areas || []
  };
}

// ============================================================
// CLIENT DATA INTERFACE & FETCHER
// ============================================================
interface ClientData {
  id: string;
  agency_name: string;
  canonical_url: string;
  number_of_locations: string;
}

async function getClientData(clientId: string): Promise<ClientData | null> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('id, agency_name')
    .eq('id', clientId)
    .single();
  
  if (error || !data) return null;
  
  const { data: website } = await supabaseAdmin
    .from('client_websites')
    .select('canonical_url, number_of_locations')
    .eq('client_id', clientId)
    .single();
  
  return {
    id: data.id,
    agency_name: data.agency_name,
    canonical_url: website?.canonical_url || '',
    number_of_locations: website?.number_of_locations || '1'
  };
}

// ============================================================
// POLICY SELECTION INTERFACE & FETCHER
// ============================================================
interface PolicySelection {
  policy_list_id: number;
  location_id: string | null;
}

async function getIncompletePolicySelections(clientId: string): Promise<PolicySelection[]> {
  console.log(`[Check] Incomplete policies for client: ${clientId}`);
  const selectionsResponse = await sb(`client_policy_selections?client_id=eq.${clientId}&is_generated=eq.false&select=policy_list_id,location_id`);
  const selectionsData = await selectionsResponse.json();
  
  if (!selectionsData || selectionsData.length === 0) return [];
  
  const incompleteSelections = selectionsData
    .filter((s: any) => s.policy_list_id !== null && s.policy_list_id !== undefined)
    .map((s: any) => ({ policy_list_id: s.policy_list_id, location_id: s.location_id }));
  
  console.log(`[Check] ${incompleteSelections.length} incomplete policies found`);
  return incompleteSelections;
}

// ============================================================
// MAIN HANDLER
// ============================================================
Deno.serve(async (req) => {
  console.log('=== EDGE FUNCTION 2 V2 STARTED ===');
  
  if (req.method !== 'POST') {
    return new Response('405', { status: 405 });
  }
  
  const requestBody = await req.json();
  console.log('[Request]', requestBody);
  const { client_id, old_policy_pages, new_policy_pages, batch_offset } = requestBody;
  
  if (!client_id || new_policy_pages !== true || old_policy_pages === true) {
    console.log('[Skip] Conditions not met');
    return new Response('Skip', { status: 200 });
  }
  
  // ============================================================
  // Get client data
  // ============================================================
  const clientData = await getClientData(client_id);
  if (!clientData) {
    return new Response('Client not found', { status: 404 });
  }
  
  const isMultiLocation = parseInt(clientData.number_of_locations) > 1;
  console.log(`[Client] ${clientData.agency_name}, Multi-location: ${isMultiLocation}`);
  
  // Check site status
  const siteResponse = await sb(`client_websites?client_id=eq.${client_id}&select=status&limit=1`);
  const siteData = await siteResponse.json();
  const [site = {}] = siteData;
  if (site.status !== 'active') {
    return new Response('Inactive', { status: 200 });
  }
  
  // Get incomplete policy selections
  const incompleteSelections = await getIncompletePolicySelections(client_id);
  if (incompleteSelections.length === 0) {
    return new Response('All selected policies already generated', { status: 200 });
  }
  
  const offset = batch_offset || 0;
  const batchSelections = incompleteSelections.slice(offset, offset + BATCH_SIZE);
  if (batchSelections.length === 0) {
    return new Response('All remaining templates processed', { status: 200 });
  }
  
  // Create location map
  const locationMap = new Map<number, string | null>();
  batchSelections.forEach(s => locationMap.set(s.policy_list_id, s.location_id));
  
  const batchIds = batchSelections.map(s => s.policy_list_id);
  const policyIdFilter = batchIds.map((id) => `id.eq.${id}`).join(',');
  
  const templatesResponse = await sb(`client_policy_pages_list?select=*&or=(${policyIdFilter})`);
  const templates = await templatesResponse.json();
  if (templates.length === 0) {
    return new Response('No templates to process', { status: 200 });
  }
  
  // Inject location_id into each template
  const templatesWithLocation = templates.map((tpl: any) => ({
    ...tpl,
    location_id: locationMap.get(tpl.id) || null
  }));
  
  const key = Deno.env.get('OPEN_AI_POLICY_PAGE_WRITER');
  if (!key) {
    return new Response('No key', { status: 500 });
  }
  
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const tpl of templatesWithLocation) {
    const locationId = tpl.location_id;
    console.log(`[Process] ${tpl.slug} for location ${locationId}`);
    
    try {
      // Check if already exists
      const existResponse = await sb(`client_policy_pages?client_id=eq.${client_id}&slug=eq.${tpl.slug}&select=id&limit=1`);
      const exist = await existResponse.json();
      if (exist.length) {
        await sb(`client_policy_selections?client_id=eq.${client_id}&policy_list_id=eq.${tpl.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_generated: true, updated_at: new Date().toISOString() })
        });
        skipped++;
        continue;
      }
      
      // ============================================================
      // KEY CHANGE: Fetch location data from client_locations
      // ============================================================
      let locationData: LocationData | null = null;
      if (locationId) {
        locationData = await getLocationData(locationId);
      }
      
      if (!locationData) {
        console.error(`[Error] No location data for ${tpl.slug}`);
        errors++;
        continue;
      }
      
      console.log(`[Location] ${locationData.city}, ${locationData.state}`);
      console.log(`[Service Areas] ${locationData.service_areas.join(', ')}`);
      
      // ============================================================
      // KEY CHANGE: Build prompt with location-specific data
      // ============================================================
      const prompt = deepReplace({ ...tpl }, {
        '{client_city}': locationData.city,
        '{client_state}': locationData.state,
        '{agency_name}': clientData.agency_name,
        '{location_city}': locationData.city,
        '{location_state}': locationData.state
      });
      
      // Add location data to payload
      const aiPayload = {
        ...prompt,
        agency_name: clientData.agency_name,
        location_city: locationData.city,
        location_state: locationData.state,
        service_areas: locationData.service_areas
      };
      
      const aiContent = await runAssistant(key, OPENAI_ASSISTANT_ID, aiPayload);
      
      // Validate required fields
      const requiredFields = ['slug', 'title'];
      const missingFields = requiredFields.filter((field) => !(field in aiContent) || !aiContent[field]);
      if (missingFields.length > 0) {
        console.error(`[Error] Missing fields: ${missingFields.join(', ')}`);
        errors++;
        continue;
      }
      
      // ============================================================
      // LD-JSON is now built at render time by frontend
      // URL is derived from current multi-location status
      // ============================================================
      
      // Prepare insert data (no ld_json - built at render time)
      const insertData = {
        client_id,
        location_id: locationId,
        title: aiContent.title,
        slug: aiContent.slug,
        policy_type: aiContent.policy_type || null,
        content_summary: aiContent.description || null,
        published: true,
        meta_title: aiContent.meta_title || null,
        meta_description: aiContent.meta_description || null,
        hero_section: aiContent.hero_section || null,
        content_sections: aiContent.content_sections || null,
        faqs: aiContent.faqs || null,
        related_policies: aiContent.related_policies || null,
        service: 'Insurance'
      };
      
      console.log(`[Insert] ${tpl.slug} with location_id: ${locationId}`);
      const insertResponse = await sb('client_policy_pages', {
        method: 'POST',
        body: JSON.stringify(insertData)
      });
      
      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error(`[Error] Insert failed: ${errorText}`);
        errors++;
        continue;
      }
      
      // Mark as generated
      await sb(`client_policy_selections?client_id=eq.${client_id}&policy_list_id=eq.${tpl.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_generated: true, updated_at: new Date().toISOString() })
      });
      
      processed++;
      
    } catch (err) {
      console.error(`[Error] ${tpl.slug}:`, (err as Error).message);
      errors++;
      continue;
    }
  }
  
  const batchSummary = `Batch complete! Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`;
  console.log(batchSummary);
  
  // Check if more to process - call self recursively
  const updatedIncompleteSelections = await getIncompletePolicySelections(client_id);
  if (updatedIncompleteSelections?.length > 0) {
    console.log(`[Continue] ${updatedIncompleteSelections.length} more policies to process`);
    try {
      const jwt = Deno.env.get('SERVICE_CALLER_JWT');
      await fetch('https://bxpxxyxctdsyucqpwxrz.supabase.co/functions/v1/generate_policy_pages_2_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          client_id,
          old_policy_pages: false,
          new_policy_pages: true,
          batch_offset: 0
        })
      });
    } catch (error) {
      console.error('[Error] Failed to call next batch:', error);
    }
  }
  
  return new Response(batchSummary, { status: 200 });
});
