/******************************************************************
 * generate-static-blog-v2.ts — Simplified Assistant Architecture
 * ---------------------------------------------------------------
 * CHANGES FROM PREVIOUS VERSION:
 * • Fetches location data (city, state, service_areas) from client_locations
 * • Sends location_city, location_state, service_areas to AI
 * • AI returns simplified content (no LD-JSON)
 * • System builds LD-JSON structure after receiving AI response
 * • Combines database data + AI content into final output
 ******************************************************************/
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const STATIC_BLOG_ASSISTANT_ID = 'asst_vqO8wInX5gcJE7FvZMnP9XVN';
const IMAGE_PROMPT_ASSISTANT_ID = 'asst_BTbGEXBb0siPs2i4Yezmfew5'; // Keep existing image assistant

// ============================================================
// OPENAI ASSISTANT RUNNER
// ============================================================
async function runOpenAIAssistant(assistantId: string, content: any): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
  };

  // Create thread
  const threadRes = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers,
    body: '{}'
  });
  if (!threadRes.ok) throw new Error(`Thread creation failed: ${threadRes.status}`);
  const thread = await threadRes.json();

  // Add message
  await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ role: 'user', content: JSON.stringify(content) })
  });

  // Start run
  const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ assistant_id: assistantId })
  });
  const run = await runRes.json();

  // Poll for completion
  let runStatus = await checkRunStatus(thread.id, run.id, OPENAI_API_KEY);
  while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
    await new Promise(r => setTimeout(r, 2000));
    runStatus = await checkRunStatus(thread.id, run.id, OPENAI_API_KEY);
    console.log(`Run status: ${runStatus.status}`);
    if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
      throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown'}`);
    }
  }

  // Get response
  const msgsRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, { headers });
  const msgs = await msgsRes.json();
  const assistantMsg = msgs.data.find((m: any) => m.role === 'assistant');
  
  if (!assistantMsg?.content?.[0]?.text?.value) {
    throw new Error('No assistant response found');
  }
  
  return assistantMsg.content[0].text.value;
}

async function checkRunStatus(threadId: string, runId: string, apiKey: string) {
  const res = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    }
  });
  return res.json();
}

// ============================================================
// IMAGE UPLOAD
// ============================================================
async function uploadBlogImageToSupabase(
  imageUrl: string,
  clientId: string,
  blogSlug: string
): Promise<string> {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error('Failed to download image');
  
  const arrayBuffer = await imageResponse.arrayBuffer();
  const fileName = `${blogSlug.replace(/[^a-zA-Z0-9-_]/g, '_')}.png`;
  const storagePath = `client_blogs/${clientId}/${fileName}`;
  
  const { error } = await supabaseAdmin.storage
    .from('blog-images')
    .upload(storagePath, new Uint8Array(arrayBuffer), {
      contentType: 'image/png',
      upsert: true
    });
  
  if (error) throw new Error(`Upload error: ${error.message}`);
  
  const { data } = supabaseAdmin.storage.from('blog-images').getPublicUrl(storagePath);
  return data.publicUrl;
}

// ============================================================
// SLUG SANITIZER
// ============================================================
function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================
// URL BUILDER - Handles single vs multi-location
// ============================================================
function buildBlogUrl(
  canonicalUrl: string,
  isMultiLocation: boolean,
  locationSlug: string | null,
  topicSlug: string,
  postSlug: string
): string {
  const base = canonicalUrl.replace(/\/$/, '');
  
  if (isMultiLocation && locationSlug) {
    return `${base}/locations/${locationSlug}/blog/${topicSlug}/${postSlug}`;
  }
  
  return `${base}/blog/${topicSlug}/${postSlug}`;
}

// ============================================================
// LD-JSON BUILDER - System builds schema from AI content + DB data
// ============================================================
function buildLdJson(
  aiContent: any,
  clientData: any,
  pageUrl: string
): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': aiContent.title,
    'url': pageUrl,
    'datePublished': new Date().toISOString().split('T')[0],
    'author': {
      '@type': 'Organization',
      'name': clientData.agency_name
    },
    'publisher': {
      '@type': 'Organization',
      'name': clientData.agency_name,
      'url': clientData.canonical_url
    }
  };
}

// ============================================================
// LOCATION DATA FETCHER
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
    location_slug: data.location_slug,
    service_areas: data.service_areas || []
  };
}

// ============================================================
// CLIENT DATA FETCHER
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
    .select('id, agency_name, website_url, number_of_locations')
    .eq('id', clientId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    agency_name: data.agency_name,
    canonical_url: data.website_url,
    number_of_locations: data.number_of_locations || '1'
  };
}

// ============================================================
// DETERMINE NEXT POST
// ============================================================
async function determineNextPost(clientId: string, locationId: string | null) {
  let query = supabaseAdmin
    .from('client_blogs_content')
    .select('topic_number, subtopic_number')
    .eq('client_id', clientId);
  
  if (locationId) {
    query = query.eq('location_id', locationId);
  }
  
  const { data: existingBlogs } = await query;
  const existingCombos = new Set(
    existingBlogs?.map(b => `${b.topic_number}-${b.subtopic_number}`) || []
  );
  
  for (let topic = 1; topic <= 10; topic++) {
    for (let subtopic = 1; subtopic <= 10; subtopic++) {
      if (!existingCombos.has(`${topic}-${subtopic}`)) {
        return { topic, subtopic };
      }
    }
  }
  
  return null;
}

// ============================================================
// MAIN BLOG GENERATION
// ============================================================
export async function generateStaticBlog(
  client_id: string,
  location_id: string | null = null,
  overrideTopic: number | null = null,
  overrideSubtopic: number | null = null
) {
  console.log('[generateStaticBlog] Starting', { client_id, location_id });

  // 1. Get client data
  const clientData = await getClientData(client_id);
  if (!clientData) throw new Error('Client not found');
  
  const isMultiLocation = parseInt(clientData.number_of_locations) > 1;
  console.log(`[Client] ${clientData.agency_name}, Multi-location: ${isMultiLocation}`);

  // 2. Resolve location_id
  let resolvedLocationId = location_id;
  if (!resolvedLocationId) {
    const { data: locData } = await supabaseAdmin
      .from('client_locations')
      .select('id')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .limit(1)
      .single();
    resolvedLocationId = locData?.id || null;
  }

  // 3. Get location data
  let locationData: LocationData | null = null;
  if (resolvedLocationId) {
    locationData = await getLocationData(resolvedLocationId);
  }
  
  if (!locationData) {
    throw new Error('No location data available');
  }
  
  console.log(`[Location] ${locationData.city}, ${locationData.state}`);
  console.log(`[Service Areas] ${locationData.service_areas.join(', ')}`);

  // 4. Determine topic/subtopic
  const nextPost = overrideTopic && overrideSubtopic
    ? { topic: overrideTopic, subtopic: overrideSubtopic }
    : await determineNextPost(client_id, resolvedLocationId);
  
  if (!nextPost) {
    return { message: 'All 100 blogs already created for this client' };
  }

  // 5. Fetch template
  const { data: blogTemplate, error: templateError } = await supabaseAdmin
    .from('client_static_blog_list')
    .select('topic_name, subtopic_name, related_links')
    .eq('topic_number', nextPost.topic)
    .eq('subtopic_number', nextPost.subtopic)
    .single();
  
  if (templateError) throw new Error(`Template error: ${templateError.message}`);

  // 6. Process template tokens with LOCATION data (not client data)
  const processedTopicName = blogTemplate.topic_name
    .replace('{client_name}', clientData.agency_name)
    .replace('{client_city}', locationData.city)
    .replace('{client_state}', locationData.state);
  
  const processedSubtopicName = blogTemplate.subtopic_name
    .replace('{client_name}', clientData.agency_name)
    .replace('{client_city}', locationData.city)
    .replace('{client_state}', locationData.state);
  
  const processedRelatedLinks = blogTemplate.related_links.map((link: string) =>
    link
      .replace('{client_name}', clientData.agency_name)
      .replace('{client_city}', locationData.city)
      .replace('{client_state}', locationData.state)
  );

  // ============================================================
  // KEY CHANGE: Send location-specific data to AI
  // ============================================================
  console.log('[AI] Sending to assistant with location data');
  
  const aiPayload = {
    agency_name: clientData.agency_name,
    location_city: locationData.city,
    location_state: locationData.state,
    service_areas: locationData.service_areas,
    topic_name: processedTopicName,
    subtopic_name: processedSubtopicName,
    related_links: processedRelatedLinks
  };

  const rawContent = await runOpenAIAssistant(STATIC_BLOG_ASSISTANT_ID, aiPayload);
  
  // Parse AI response
  let aiContent: any;
  try {
    let cleaned = rawContent.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/gim, '');
    cleaned = cleaned.replace(/```\s*$/gim, '');
    aiContent = JSON.parse(cleaned.trim());
    console.log('[AI] Response parsed successfully');
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${(err as Error).message}`);
  }

  // 7. Generate image
  console.log('[Image] Generating image prompt');
  const imagePrompt = await runOpenAIAssistant(IMAGE_PROMPT_ASSISTANT_ID, {
    blog_title: aiContent.title,
    blog_content: aiContent.content_sections
  });

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
  const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024'
    })
  });
  
  const imageResult = await imageResponse.json();
  if (!imageResult?.data?.[0]?.url) {
    throw new Error('Image generation failed');
  }

  // 8. Upload image
  const supabaseImageUrl = await uploadBlogImageToSupabase(
    imageResult.data[0].url,
    client_id,
    aiContent.slug
  );

  // ============================================================
  // KEY CHANGE: System builds URL and LD-JSON
  // ============================================================
  const sanitizedSlug = sanitizeSlug(aiContent.slug);
  const topicSlug = sanitizeSlug(processedTopicName);
  
  const pageUrl = buildBlogUrl(
    clientData.canonical_url,
    isMultiLocation,
    locationData.location_slug,
    topicSlug,
    sanitizedSlug
  );
  console.log(`[URL] Built: ${pageUrl}`);

  const ldJson = buildLdJson(aiContent, clientData, pageUrl);
  console.log('[Schema] LD-JSON built by system');

  // 9. Save to database
  const { data: savedBlog, error: saveError } = await supabaseAdmin
    .from('client_blogs_content')
    .insert({
      client_id,
      location_id: resolvedLocationId,
      title: aiContent.title,
      slug: sanitizedSlug,
      topic_number: nextPost.topic,
      subtopic_number: nextPost.subtopic,
      published: true,
      image_url: supabaseImageUrl,
      blog_category: aiContent.blog_category,
      content_summary: aiContent.content_summary,
      meta_title: aiContent.meta_title,
      meta_description: aiContent.meta_description,
      hero_section: aiContent.hero_section,
      content_sections: aiContent.content_sections,
      related_links: processedRelatedLinks,
      ld_json: ldJson  // System-built, not AI-generated
    })
    .select()
    .single();

  if (saveError) throw new Error(`Save error: ${saveError.message}`);

  console.log(`✅ Blog created: ${aiContent.title}`);
  return {
    success: true,
    blog: savedBlog,
    message: `Blog "${aiContent.title}" created successfully`
  };
}

// ============================================================
// MAIN HANDLER
// ============================================================
Deno.serve(async (req) => {
  try {
    const { client_id, location_id, topic, subtopic } = await req.json();
    
    if (!client_id || !topic || !subtopic) {
      return new Response(JSON.stringify({
        error: 'client_id, topic, and subtopic are required'
      }), { status: 400 });
    }

    console.log('[Handler] Request received', { client_id, location_id, topic, subtopic });

    const blogResult = await generateStaticBlog(client_id, location_id, topic, subtopic);
    
    if (!blogResult.success) {
      return new Response(JSON.stringify(blogResult), { status: 400 });
    }

    // Calculate next progression
    let nextTopic = topic;
    let nextSubtopic = subtopic;
    nextTopic++;
    if (nextTopic > 10) {
      nextTopic = 1;
      nextSubtopic++;
    }

    // Update settings
    let updateQuery = supabaseAdmin
      .from('client_blog_settings')
      .update({
        ready: false,
        next_topic: nextSubtopic <= 10 ? nextTopic : 10,
        next_subtopic: nextSubtopic <= 10 ? nextSubtopic : 10
      })
      .eq('client_id', client_id);

    if (location_id) {
      updateQuery = updateQuery.eq('location_id', location_id);
    }

    const { error: updateError } = await updateQuery;
    if (updateError) {
      return new Response(JSON.stringify({
        error: `Settings update failed: ${updateError.message}`
      }), { status: 500 });
    }

    return new Response(JSON.stringify({
      success: true,
      blog: blogResult.blog,
      next_topic: nextSubtopic <= 10 ? nextTopic : 10,
      next_subtopic: nextSubtopic <= 10 ? nextSubtopic : 10,
      message: blogResult.message
    }), { status: 200 });

  } catch (error) {
    console.error('[Handler] Error:', (error as Error).stack || error);
    return new Response(JSON.stringify({
      error: (error as Error).message || String(error)
    }), { status: 500 });
  }
});
