/******************************************************************
 * generate_policy_pages-v2.ts — Simplified Assistant Architecture
 * ---------------------------------------------------------------
 * CHANGES FROM PREVIOUS VERSION:
 * • Fetches location data (city, state, service_areas) from client_locations
 * • Sends location_city, location_state, service_areas to AI
 * • AI returns simplified content (no LD-JSON)
 * • System builds LD-JSON structure after receiving AI response
 * • Combines database data + AI content into final output
 ******************************************************************/
const OPENAI_ASSISTANT_ID = 'asst_Sn9n1KaTY5ghDVPLIRfWKUIq';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const BATCH_SIZE = 4;

// ============================================================
// SUPABASE HELPER
// ============================================================
async function sb(path: string, options: RequestInit = {}) {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  console.log(`[Supabase] ${options.method || 'GET'} ${path}`);
  return fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
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
async function runAssistant(apiKey: string, assistantId: string, payload: any) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
  };

  // Create thread
  const threadRes = await fetch(`${OPENAI_BASE_URL}/threads`, {
    method: 'POST',
    headers,
    body: '{}'
  });
  if (!threadRes.ok) throw new Error(`Thread creation failed: ${threadRes.status}`);
  const { id: threadId } = await threadRes.json();

  // Add message
  const msgRes = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      role: 'user',
      content: [{ type: 'text', text: JSON.stringify(payload) }]
    })
  });
  if (!msgRes.ok) throw new Error(`Message creation failed: ${msgRes.status}`);

  // Start run
  const runRes = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}/runs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ assistant_id: assistantId })
  });
  if (!runRes.ok) throw new Error(`Run creation failed: ${runRes.status}`);
  const { id: runId } = await runRes.json();

  // Poll for completion
  for (let i = 0; i < 120; i++) {
    const statusRes = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}/runs/${runId}`, { headers });
    const status = await statusRes.json();
    
    if (status.status === 'completed') {
      const msgsRes = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}/messages`, { headers });
      const msgs = await msgsRes.json();
      const assistantMsg = msgs.data.find((m: any) => m.role === 'assistant');
      
      if (!assistantMsg?.content?.[0]?.text?.value) {
        throw new Error('No assistant response found');
      }
      
      let raw = assistantMsg.content[0].text.value.trim();
      raw = raw.replace(/^```(?:json|javascript|js)?\s*/gim, '');
      raw = raw.replace(/```\s*$/gim, '');
      
      return JSON.parse(raw.trim());
    }
    
    if (['failed', 'cancelled'].includes(status.status)) {
      throw new Error(`Assistant run ${status.status}`);
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Assistant timeout');
}

// ============================================================
// URL BUILDER - Handles single vs multi-location
// ============================================================
function buildContentUrl(
  canonicalUrl: string,
  isMultiLocation: boolean,
  locationSlug: string | null,
  policyType: string,
  slug: string
): string {
  const base = canonicalUrl.replace(/\/$/, '');
  
  if (isMultiLocation && locationSlug) {
    return `${base}/locations/${locationSlug}/policies/${policyType}/${slug}`;
  }
  
  return `${base}/policies/${policyType}/${slug}`;
}

// ============================================================
// LD-JSON BUILDER - System builds schema from AI content + DB data
// ============================================================
function buildLdJson(
  aiContent: any,
  locationData: any,
  clientData: any,
  pageUrl: string
): any {
  // Strip HTML from FAQ answers for schema
  const stripHtml = (text: string) => text.replace(/<[^>]*>/g, '');
  
  // Build FAQ mainEntity array
  const faqEntities = (aiContent.faqs || []).map((faq: any) => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': stripHtml(faq.answer)
    }
  }));
  
  // Build about entities from AI's about_topics
  const aboutEntities = (aiContent.about_topics || []).map((topic: string) => ({
    '@type': 'Thing',
    'name': topic
  }));
  
  // Build areaServed from database service_areas
  const areaServed = (locationData.service_areas || []).map((city: string) => ({
    '@type': 'City',
    'name': city,
    'containedInPlace': {
      '@type': 'State',
      'name': locationData.state
    }
  }));
  
  // Add the primary city if not in service_areas
  if (!areaServed.find((a: any) => a.name === locationData.city)) {
    areaServed.unshift({
      '@type': 'City',
      'name': locationData.city,
      'containedInPlace': {
        '@type': 'State',
        'name': locationData.state
      }
    });
  }
  
  return {
    '@context': 'https://schema.org',
    '@graph': [{
      '@type': 'Service',
      '@id': '#service',
      'name': aiContent.title,
      'description': aiContent.description,
      'serviceType': 'Insurance',
      'keywords': (aiContent.keywords || []).join(', '),
      'url': pageUrl,
      'provider': {
        '@type': 'InsuranceAgency',
        'name': clientData.agency_name,
        'url': clientData.canonical_url,
        'telephone': locationData.phone || clientData.phone,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': locationData.address,
          'addressLocality': locationData.city,
          'addressRegion': locationData.state,
          'postalCode': locationData.zip,
          'addressCountry': 'US'
        }
      },
      'areaServed': areaServed,
      'about': aboutEntities,
      'mainEntity': faqEntities
    }]
  };
}

// ============================================================
// FETCH LOCATION DATA
// ============================================================
interface LocationData {
  id: string;
  city: string;
  state: string;
  address: string;
  phone: string | null;
  zip: string;
  location_slug: string;
  service_areas: string[];
}

async function getLocationData(locationId: string): Promise<LocationData | null> {
  const response = await sb(`client_locations?id=eq.${locationId}&select=id,city,state,address_line_1,phone,zip,location_slug,service_areas`);
  if (!response.ok) return null;
  
  const data = await response.json();
  if (!data || data.length === 0) return null;
  
  const loc = data[0];
  return {
    id: loc.id,
    city: loc.city,
    state: loc.state,
    address: loc.address_line_1,
    phone: loc.phone,
    zip: loc.zip,
    location_slug: loc.location_slug,
    service_areas: loc.service_areas || []
  };
}

// ============================================================
// FETCH CLIENT DATA
// ============================================================
interface ClientData {
  agency_name: string;
  canonical_url: string;
  phone: string;
  number_of_locations: string;
}

async function getClientData(clientId: string): Promise<ClientData | null> {
  const response = await sb(`clients?id=eq.${clientId}&select=agency_name,website_url,phone,number_of_locations`);
  if (!response.ok) return null;
  
  const data = await response.json();
  if (!data || data.length === 0) return null;
  
  const client = data[0];
  return {
    agency_name: client.agency_name,
    canonical_url: client.website_url,
    phone: client.phone,
    number_of_locations: client.number_of_locations || '1'
  };
}

// ============================================================
// GET INCOMPLETE POLICY SELECTIONS
// ============================================================
interface PolicySelection {
  policy_list_id: number;
  location_id: string | null;
}

async function getIncompletePolicySelections(clientId: string): Promise<PolicySelection[]> {
  console.log(`[Selections] Checking incomplete policies for client: ${clientId}`);
  const response = await sb(`client_policy_selections?client_id=eq.${clientId}&is_generated=eq.false&select=policy_list_id,location_id`);
  
  if (!response.ok) return [];
  
  const data = await response.json();
  if (!data || data.length === 0) return [];
  
  return data
    .filter((s: any) => s.policy_list_id != null)
    .map((s: any) => ({ policy_list_id: s.policy_list_id, location_id: s.location_id }));
}

// ============================================================
// MAIN HANDLER
// ============================================================
Deno.serve(async (req) => {
  console.log('=== EDGE FUNCTION V2 STARTED ===');
  
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  const { client_id, old_policy_pages, new_policy_pages, batch_offset } = await req.json();
  
  if (!client_id || new_policy_pages !== true || old_policy_pages === true) {
    return new Response('Skip - conditions not met', { status: 200 });
  }
  
  console.log(`[Main] Processing client: ${client_id}`);
  
  // Check site is active
  const siteResponse = await sb(`client_websites?client_id=eq.${client_id}&select=status&limit=1`);
  const siteData = await siteResponse.json();
  if (siteData[0]?.status !== 'active') {
    return new Response('Site not active', { status: 200 });
  }
  
  // Get client data
  const clientData = await getClientData(client_id);
  if (!clientData) {
    return new Response('Client not found', { status: 404 });
  }
  
  const isMultiLocation = parseInt(clientData.number_of_locations) > 1;
  console.log(`[Main] Client: ${clientData.agency_name}, Multi-location: ${isMultiLocation}`);
  
  // Get incomplete selections
  const incompleteSelections = await getIncompletePolicySelections(client_id);
  if (incompleteSelections.length === 0) {
    return new Response('All policies already generated', { status: 200 });
  }
  
  // Batch processing
  const offset = batch_offset || 0;
  const batchSelections = incompleteSelections.slice(offset, offset + BATCH_SIZE);
  
  if (batchSelections.length === 0) {
    return new Response('All remaining templates processed', { status: 200 });
  }
  
  // Create location map
  const locationMap = new Map<number, string | null>();
  batchSelections.forEach(s => locationMap.set(s.policy_list_id, s.location_id));
  
  // Get templates
  const batchIds = batchSelections.map(s => s.policy_list_id);
  const policyIdFilter = batchIds.map(id => `id.eq.${id}`).join(',');
  const templatesResponse = await sb(`client_policy_pages_list?select=*&or=(${policyIdFilter})`);
  const templates = await templatesResponse.json();
  
  if (templates.length === 0) {
    return new Response('No templates to process', { status: 200 });
  }
  
  const apiKey = Deno.env.get('OPEN_AI_POLICY_PAGE_WRITER');
  if (!apiKey) {
    return new Response('No API key', { status: 500 });
  }
  
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const tpl of templates) {
    const locationId = locationMap.get(tpl.id);
    console.log(`\n[Process] ${tpl.slug} (location: ${locationId})`);
    
    try {
      // Check if page exists
      const existResponse = await sb(`client_policy_pages?client_id=eq.${client_id}&slug=eq.${tpl.slug}&select=id&limit=1`);
      const exist = await existResponse.json();
      
      if (exist.length > 0) {
        console.log(`[Skip] Page exists: ${tpl.slug}`);
        await sb(`client_policy_selections?client_id=eq.${client_id}&policy_list_id=eq.${tpl.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_generated: true, updated_at: new Date().toISOString() })
        });
        skipped++;
        continue;
      }
      
      // ============================================================
      // KEY CHANGE: Get location data for this content
      // ============================================================
      let locationData: LocationData | null = null;
      
      if (locationId) {
        locationData = await getLocationData(locationId);
      }
      
      // Fallback to client-level data if no location
      if (!locationData) {
        // Get first active location as fallback
        const fallbackResponse = await sb(`client_locations?client_id=eq.${client_id}&is_active=eq.true&limit=1`);
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.length > 0) {
          const loc = fallbackData[0];
          locationData = {
            id: loc.id,
            city: loc.city,
            state: loc.state,
            address: loc.address_line_1,
            phone: loc.phone,
            zip: loc.zip,
            location_slug: loc.location_slug,
            service_areas: loc.service_areas || []
          };
        }
      }
      
      if (!locationData) {
        console.error(`[Error] No location data available for ${tpl.slug}`);
        errors++;
        continue;
      }
      
      // ============================================================
      // KEY CHANGE: Build AI payload with location-specific data
      // ============================================================
      const aiPayload = deepReplace({
        ...tpl,
        // Location-specific data (from client_locations)
        location_city: locationData.city,
        location_state: locationData.state,
        service_areas: locationData.service_areas,
        // Client data
        agency_name: clientData.agency_name
      }, {
        '{client_city}': locationData.city,
        '{client_state}': locationData.state,
        '{agency_name}': clientData.agency_name
      });
      
      console.log(`[AI] Sending to assistant with location: ${locationData.city}, ${locationData.state}`);
      console.log(`[AI] Service areas: ${locationData.service_areas.join(', ')}`);
      
      // ============================================================
      // Call AI - Returns simplified content (no LD-JSON)
      // ============================================================
      const aiContent = await runAssistant(apiKey, OPENAI_ASSISTANT_ID, aiPayload);
      console.log(`[AI] Response received. Keys: ${Object.keys(aiContent).join(', ')}`);
      
      // Validate required fields
      if (!aiContent.title || !aiContent.slug) {
        console.error(`[Error] Missing required fields for ${tpl.slug}`);
        errors++;
        continue;
      }
      
      // ============================================================
      // LD-JSON is now built at render time by frontend
      // URL is derived from current multi-location status
      // ============================================================
      
      // ============================================================
      // Prepare insert data (no ld_json - built at render time)
      // ============================================================
      const insertData = {
        client_id: client_id,
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
      
      // Insert
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
      
      console.log(`[Success] Created: ${tpl.slug}`);
      
      // Mark as generated
      await sb(`client_policy_selections?client_id=eq.${client_id}&policy_list_id=eq.${tpl.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_generated: true, updated_at: new Date().toISOString() })
      });
      
      processed++;
      
    } catch (err) {
      console.error(`[Error] ${tpl.slug}: ${(err as Error).message}`);
      errors++;
    }
  }
  
  const summary = `Batch complete! Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`;
  console.log(`\n${summary}`);
  
  // Check for more work
  const remaining = await getIncompletePolicySelections(client_id);
  if (remaining.length > 0) {
    console.log(`[Next] ${remaining.length} more policies to process`);
    const jwt = Deno.env.get('SERVICE_CALLER_JWT');
    await fetch('https://bxpxxyxctdsyucqpwxrz.supabase.co/functions/v1/generate_policy_pages_2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify({ client_id, old_policy_pages: false, new_policy_pages: true, batch_offset: 0 })
    });
  }
  
  return new Response(summary, { status: 200 });
});
