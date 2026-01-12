/******************************************************************
 * generate-about-page/index.ts — About Page Content Generator
 * ---------------------------------------------------------------
 * OVERVIEW:
 * • Triggered when generate_about_page column on client_websites is set to true
 * • Fetches location data (city, state, service_areas) from client_locations
 * • Fetches business info (founding_year, years_in_business_text, regional_descriptor) from client_business_info
 * • Sends payload to OpenAI Assistant to generate About page content
 * • AI returns simplified content (no LD-JSON, no policy links)
 * • System builds LD-JSON structure after receiving AI response
 * • Upserts content to client_about_page table
 ******************************************************************/
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_ASSISTANT_ID = 'asst_fWCVBgbZVyRE0bEFeHvMar7Y';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

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
      'Prefer': 'return=representation',
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
        console.error('[Raw Response]', cleaned.substring(0, 500));
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
// DATA INTERFACES
// ============================================================
interface LocationData {
  id: string;
  city: string;
  state: string;
  location_slug: string;
  service_areas: string[];
}

interface ClientData {
  id: string;
  agency_name: string;
  canonical_url: string;
  number_of_locations: string;
}

interface BusinessInfo {
  founding_year: number;
  years_in_business_text: string;
  regional_descriptor: string;
  slogan?: string;
  tagline?: string;
  about_short?: string;
  about_long?: string;
}

interface PolicyCategory {
  name: string;
  slug: string;
}

// ============================================================
// DATA FETCHERS
// ============================================================
async function getLocationData(locationId: string): Promise<LocationData | null> {
  const { data, error } = await supabaseAdmin
    .from('client_locations')
    .select('id, city, state, location_slug, service_areas')
    .eq('id', locationId)
    .single();
  
  if (error || !data) {
    console.error('[Location] Error:', error?.message);
    return null;
  }
  
  return {
    id: data.id,
    city: data.city,
    state: data.state,
    location_slug: data.location_slug || '',
    service_areas: data.service_areas || []
  };
}

async function getClientData(clientId: string): Promise<ClientData | null> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('id, agency_name')
    .eq('id', clientId)
    .single();
  
  if (error || !data) {
    console.error('[Client] Error:', error?.message);
    return null;
  }
  
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

async function getBusinessInfo(clientId: string): Promise<BusinessInfo | null> {
  const { data, error } = await supabaseAdmin
    .from('client_business_info')
    .select('founding_year, years_in_business_text, regional_descriptor, slogan, tagline, about_short, about_long')
    .eq('client_id', clientId)
    .single();
  
  if (error || !data) {
    console.error('[BusinessInfo] Error:', error?.message);
    return null;
  }
  
  // Validate required fields
  if (!data.founding_year || !data.years_in_business_text || !data.regional_descriptor) {
    console.error('[BusinessInfo] Missing required fields');
    return null;
  }
  
  return {
    founding_year: data.founding_year,
    years_in_business_text: data.years_in_business_text,
    regional_descriptor: data.regional_descriptor,
    slogan: data.slogan || undefined,
    tagline: data.tagline || undefined,
    about_short: data.about_short || undefined,
    about_long: data.about_long || undefined
  };
}

async function getPolicyCategories(clientId: string): Promise<PolicyCategory[]> {
  const { data, error } = await supabaseAdmin
    .from('client_policy_categories')
    .select('name, slug')
    .eq('client_id', clientId)
    .eq('published', true);
  
  if (error || !data) {
    console.error('[PolicyCategories] Error:', error?.message);
    return [];
  }
  
  return data.map(cat => ({
    name: cat.name,
    slug: cat.slug
  }));
}

async function checkExistingAboutPage(clientId: string, locationId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('client_about_page')
    .select('id')
    .eq('client_id', clientId)
    .eq('location_id', locationId)
    .single();
  
  return !!data;
}

// ============================================================
// LD-JSON BUILDER - System builds schema from AI content + DB data
// ============================================================
function buildAboutPageLdJson(
  clientData: ClientData,
  locationData: LocationData,
  businessInfo: BusinessInfo
): any {
  const agencyName = clientData.agency_name;
  const city = locationData.city;
  const state = locationData.state;
  
  // Name with 60 char limit
  const fullName = `About ${agencyName}`;
  const name = fullName.length > 60 ? fullName.substring(0, 57) + '...' : fullName;
  
  // Description with 155 char limit
  const fullDesc = `Discover ${agencyName} in ${city}, ${state}—providing personalized insurance with trusted local service.`;
  const description = fullDesc.length > 155 ? fullDesc.substring(0, 152) + '...' : fullDesc;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name,
    description,
    url: '/about',
    mainEntity: {
      '@type': 'Organization',
      name: agencyName,
      foundingDate: businessInfo.founding_year?.toString(),
      foundingLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: city,
          addressRegion: state,
          addressCountry: 'US'
        }
      },
      areaServed: locationData.service_areas.map(area => ({
        '@type': 'City',
        name: area
      })),
      slogan: businessInfo.slogan || `Serving ${city}, ${state} with Trusted Insurance Solutions`
    }
  };
}

// ============================================================
// RESET TRIGGER HELPER
// ============================================================
async function resetTrigger(clientId: string, locationId: string) {
  console.log('[Reset] Resetting generate_about_page trigger');
  await sb(`client_websites?client_id=eq.${clientId}&location_id=eq.${locationId}`, {
    method: 'PATCH',
    body: JSON.stringify({ generate_about_page: false })
  });
}

// ============================================================
// MAIN HANDLER
// ============================================================
Deno.serve(async (req) => {
  console.log('=== GENERATE ABOUT PAGE STARTED ===');
  
  if (req.method !== 'POST') {
    return new Response('405 Method Not Allowed', { status: 405 });
  }
  
  let requestBody;
  try {
    requestBody = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
  
  console.log('[Request]', requestBody);
  const { client_id, location_id, generate_about_page } = requestBody;
  
  // Validate required fields
  if (!client_id || !location_id) {
    console.error('[Error] Missing client_id or location_id');
    return new Response('Missing client_id or location_id', { status: 400 });
  }
  
  // Check trigger condition
  if (generate_about_page !== true) {
    console.log('[Skip] generate_about_page is not true');
    return new Response('Skip - trigger not set', { status: 200 });
  }
  
  // ============================================================
  // Check if About Page already exists
  // ============================================================
  const exists = await checkExistingAboutPage(client_id, location_id);
  if (exists) {
    console.log('[Skip] About page already exists for this location');
    await resetTrigger(client_id, location_id);
    return new Response('About page already exists', { status: 200 });
  }
  
  // ============================================================
  // Fetch all required data
  // ============================================================
  const [clientData, locationData, businessInfo, policyCategories] = await Promise.all([
    getClientData(client_id),
    getLocationData(location_id),
    getBusinessInfo(client_id),
    getPolicyCategories(client_id)
  ]);
  
  // Validate client data
  if (!clientData) {
    console.error('[Error] Client not found');
    await resetTrigger(client_id, location_id);
    return new Response('Client not found', { status: 404 });
  }
  
  // Validate location data
  if (!locationData) {
    console.error('[Error] Location not found');
    await resetTrigger(client_id, location_id);
    return new Response('Location not found', { status: 404 });
  }
  
  // Validate business info
  if (!businessInfo) {
    console.error('[Error] Business info incomplete - cannot generate About page');
    await resetTrigger(client_id, location_id);
    return new Response('Business info incomplete (founding_year, years_in_business_text, regional_descriptor required)', { status: 400 });
  }
  
  console.log(`[Client] ${clientData.agency_name}`);
  console.log(`[Location] ${locationData.city}, ${locationData.state}`);
  console.log(`[Service Areas] ${locationData.service_areas.join(', ')}`);
  console.log(`[Business Info] Founded: ${businessInfo.founding_year}, ${businessInfo.years_in_business_text}`);
  console.log(`[Policy Categories] ${policyCategories.length} categories`);
  
  // ============================================================
  // Get OpenAI API Key
  // ============================================================
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('[Error] OPENAI_API_KEY not configured');
    await resetTrigger(client_id, location_id);
    return new Response('OpenAI API key not configured', { status: 500 });
  }
  
  // ============================================================
  // Build AI Payload
  // ============================================================
  const aiPayload = {
    // Location data
    location_city: locationData.city,
    location_state: locationData.state,
    service_areas: locationData.service_areas,
    
    // Client data
    agency_name: clientData.agency_name,
    
    // Business info
    founding_year: businessInfo.founding_year,
    years_in_business: businessInfo.years_in_business_text,
    regional_descriptor: businessInfo.regional_descriptor,
    slogan: businessInfo.slogan,
    tagline: businessInfo.tagline,
    about_short: businessInfo.about_short,
    about_long: businessInfo.about_long,
    
    // Policy categories (for context, NOT for link generation)
    policy_categories: policyCategories
  };
  
  console.log('[AI Payload]', JSON.stringify(aiPayload, null, 2));
  
  // ============================================================
  // Call OpenAI Assistant
  // ============================================================
  let aiContent;
  try {
    console.log('[AI] Calling assistant...');
    aiContent = await runAssistant(openaiKey, OPENAI_ASSISTANT_ID, aiPayload);
    console.log('[AI] Response received');
  } catch (error) {
    console.error('[AI Error]', (error as Error).message);
    await resetTrigger(client_id, location_id);
    return new Response(`AI generation failed: ${(error as Error).message}`, { status: 500 });
  }
  
  // ============================================================
  // Validate AI Response
  // ============================================================
  const requiredSections = [
    'hero_section',
    'intro_section',
    'legacy_section',
    'policies_section',
    'community_section',
    'local_knowledge_section',
    'personal_approach_section',
    'thank_you_section',
    'cta_section'
  ];
  
  const missingSections = requiredSections.filter(section => !aiContent[section]);
  if (missingSections.length > 0) {
    console.error('[Validation Error] Missing sections:', missingSections.join(', '));
    await resetTrigger(client_id, location_id);
    return new Response(`AI response missing sections: ${missingSections.join(', ')}`, { status: 500 });
  }
  
  // ============================================================
  // Apply template variable replacements
  // ============================================================
  const replacements = {
    '{agency_name}': clientData.agency_name,
    '{city}': locationData.city,
    '{state}': locationData.state,
    '{founding_year}': businessInfo.founding_year.toString(),
    '{years_in_business}': businessInfo.years_in_business_text,
    '{regional_descriptor}': businessInfo.regional_descriptor,
    '{image_url}': '', // Placeholder - frontend will handle
    '{icon_url}': ''   // Placeholder - frontend will handle
  };
  
  const processedContent = deepReplace(aiContent, replacements);
  
  // ============================================================
  // Build LD-JSON (System-generated, not AI)
  // ============================================================
  const ldJson = buildAboutPageLdJson(clientData, locationData, businessInfo);
  console.log('[Schema] LD-JSON built');
  
  // ============================================================
  // Prepare database insert
  // ============================================================
  const insertData = {
    client_id,
    location_id,
    hero_section: processedContent.hero_section,
    intro_section: processedContent.intro_section,
    legacy_section: processedContent.legacy_section,
    policies_section: processedContent.policies_section,
    community_section: processedContent.community_section,
    local_knowledge_section: processedContent.local_knowledge_section,
    personal_approach_section: processedContent.personal_approach_section,
    thank_you_section: processedContent.thank_you_section,
    cta_section: processedContent.cta_section,
    meta_title: processedContent.meta_title || `About ${clientData.agency_name} | Insurance in ${locationData.city}, ${locationData.state}`,
    meta_description: processedContent.meta_description || `Learn about ${clientData.agency_name}, serving ${locationData.city} families for ${businessInfo.years_in_business_text}. Local insurance expertise you can trust.`,
    ldjson: ldJson,
    updated_at: new Date().toISOString()
  };
  
  // ============================================================
  // Insert/Upsert to database
  // ============================================================
  console.log('[Insert] Saving to client_about_page');
  
  const insertResponse = await sb('client_about_page', {
    method: 'POST',
    headers: {
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(insertData)
  });
  
  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    console.error('[Error] Insert failed:', errorText);
    await resetTrigger(client_id, location_id);
    return new Response(`Database insert failed: ${errorText}`, { status: 500 });
  }
  
  console.log('[Success] About page content saved');
  
  // ============================================================
  // Reset trigger
  // ============================================================
  await resetTrigger(client_id, location_id);
  
  const summary = `About page generated successfully for ${clientData.agency_name} - ${locationData.city}, ${locationData.state}`;
  console.log(`[Complete] ${summary}`);
  
  return new Response(summary, { status: 200 });
});
