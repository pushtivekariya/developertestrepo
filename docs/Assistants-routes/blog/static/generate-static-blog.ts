import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
async function runOpenAIAssistant(assistantId, content) {
  console.log('[runOpenAIAssistant] called', {
    assistantId,
    content
  });
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  let threadResponse;
  try {
    threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });
  } catch (err) {
    console.error('[runOpenAIAssistant] Error creating thread:', err);
    throw err;
  }
  let thread;
  try {
    thread = await threadResponse.json();
  } catch (err) {
    console.error('[runOpenAIAssistant] Error parsing thread response:', err, {
      threadResponse
    });
    throw err;
  }
  try {
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: JSON.stringify(content)
      })
    });
  } catch (err) {
    console.error('[runOpenAIAssistant] Error posting message:', err);
    throw err;
  }
  let runResponse;
  try {
    runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });
  } catch (err) {
    console.error('[runOpenAIAssistant] Error creating run:', err);
    throw err;
  }
  let run;
  try {
    run = await runResponse.json();
  } catch (err) {
    console.error('[runOpenAIAssistant] Error parsing run response:', err, {
      runResponse
    });
    throw err;
  }
  let runStatus;
  try {
    runStatus = await checkRunStatus(thread.id, run.id, OPENAI_API_KEY);
  } catch (err) {
    console.error('[runOpenAIAssistant] Error checking initial run status:', err);
    throw err;
  }
  while(runStatus && (runStatus.status === 'queued' || runStatus.status === 'in_progress')){
    await new Promise((resolve)=>setTimeout(resolve, 2000));
    try {
      runStatus = await checkRunStatus(thread.id, run.id, OPENAI_API_KEY);
    } catch (err) {
      console.error('[runOpenAIAssistant] Error polling run status:', err);
      throw err;
    }
    console.log(`Run status: ${runStatus.status}`);
    if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
      console.error('[runOpenAIAssistant] Run failed/cancelled:', runStatus);
      throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
    }
  }
  let messagesResponse;
  try {
    messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });
  } catch (err) {
    console.error('[runOpenAIAssistant] Error fetching messages:', err);
    throw err;
  }
  let messages;
  try {
    messages = await messagesResponse.json();
  } catch (err) {
    console.error('[runOpenAIAssistant] Error parsing messages response:', err, {
      messagesResponse
    });
    throw err;
  }
  try {
    const assistantMsg = messages.data.find((m)=>m.role === 'assistant');
    if (!assistantMsg || !assistantMsg.content || !assistantMsg.content[0] || !assistantMsg.content[0].text || !assistantMsg.content[0].text.value) {
      console.error('[runOpenAIAssistant] Assistant message malformed:', {
        messages
      });
      throw new Error('Assistant message missing or malformed');
    }
    return assistantMsg.content[0].text.value;
  } catch (err) {
    console.error('[runOpenAIAssistant] Error extracting assistant message:', err, {
      messages
    });
    throw err;
  }
}
async function checkRunStatus(threadId, runId, apiKey) {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    }
  });
  return await response.json();
}
async function uploadBlogImageToSupabase(imageUrl, clientId, blogSlug, supabase) {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error('Failed to download image from OpenAI');
  const arrayBuffer = await imageResponse.arrayBuffer();
  const fileName = `${blogSlug.replace(/[^a-zA-Z0-9-_]/g, "_")}.png`;
  const storagePath = `client_blogs/${clientId}/${fileName}`;
  const { error } = await supabase.storage.from('blog-images').upload(storagePath, new Uint8Array(arrayBuffer), {
    contentType: 'image/png',
    upsert: true
  });
  if (error) throw new Error(`Supabase upload error: ${error.message}`);
  const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(storagePath);
  return publicUrlData.publicUrl;
}
const STATIC_BLOG_ASSISTANT_ID = 'asst_vqO8wInX5gcJE7FvZMnP9XVN';
const IMAGE_PROMPT_ASSISTANT_ID = 'asst_BTbGEXBb0siPs2i4Yezmfew5';

// Server-side slug sanitization (safety net for AI output)
function sanitizeSlug(text) {
  return text
    .toLowerCase()
    .replace(/&/g, '')                    // Remove ampersands
    .replace(/[^a-z0-9\s-]/g, '')         // Remove special chars (apostrophes, ?, !, etc.)
    .replace(/\s+/g, '-')                 // Spaces to hyphens
    .replace(/-+/g, '-')                  // Collapse multiple hyphens
    .replace(/^-|-$/g, '');               // Trim leading/trailing hyphens
}

// Generate correct LD-JSON URL server-side (safety net)
function generateCorrectLdJsonUrl(canonicalUrl, topicName, postSlug) {
  const topicSlug = sanitizeSlug(topicName);
  const cleanPostSlug = postSlug.replace(/\?$/, ''); // Remove trailing ?
  return `${canonicalUrl}/blog/${topicSlug}/${cleanPostSlug}`;
}
export async function generateStaticBlog(client_id, location_id = null, overrideTopic = null, overrideSubtopic = null) {
  // 1. Fetch client info
  console.log('[generateStaticBlog] Fetching client info', {
    client_id,
    location_id
  });
  const { data: client, error: clientError } = await supabaseAdmin.from("clients").select("id, agency_name, address, city, state, phone, website_url").eq("id", client_id).single();
  if (clientError) {
    console.error('[generateStaticBlog] Client fetch error:', clientError);
    throw new Error(`Client fetch error: ${clientError.message}`);
  }
  
  // Fetch location_id if not provided
  let resolvedLocationId = location_id;
  if (!resolvedLocationId) {
    const { data: locationData } = await supabaseAdmin
      .from('client_locations')
      .select('id')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .limit(1)
      .single();
    resolvedLocationId = locationData?.id || null;
    console.log('[generateStaticBlog] Resolved location_id:', resolvedLocationId);
  }
  
  // 3. Determine topic/subtopic
  let nextPost;
  try {
    nextPost = overrideTopic && overrideSubtopic ? {
      topic: overrideTopic,
      subtopic: overrideSubtopic
    } : await determineNextPost(supabaseAdmin, client_id, resolvedLocationId);
  } catch (err) {
    console.error('[generateStaticBlog] Error determining next post:', err);
    throw err;
  }
  if (!nextPost) {
    console.log('[generateStaticBlog] All 100 blogs already created for this client', {
      client_id
    });
    return {
      message: "All 100 blogs already created for this client"
    };
  }
  // 4. Fetch template
  let blogTemplate, templateError;
  try {
    const result = await supabaseAdmin.from("client_static_blog_list").select("topic_name, subtopic_name, related_links").eq("topic_number", nextPost.topic).eq("subtopic_number", nextPost.subtopic).single();
    blogTemplate = result.data;
    templateError = result.error;
  } catch (err) {
    console.error('[generateStaticBlog] Error fetching template:', err);
    throw err;
  }
  if (templateError) {
    console.error('[generateStaticBlog] Template fetch error:', templateError);
    throw new Error(`Template fetch error: ${templateError.message}`);
  }
  // 5. Replace client tokens in links
  let processedTopicName, processedSubtopicName, processedRelatedLinks;
  try {
    processedTopicName = blogTemplate.topic_name.replace('{client_name}', client.agency_name).replace('{client_city}', client.city).replace('{client_state}', client.state);
    processedSubtopicName = blogTemplate.subtopic_name.replace('{client_name}', client.agency_name).replace('{client_city}', client.city).replace('{client_state}', client.state);
    processedRelatedLinks = blogTemplate.related_links.map((link)=>link.replace('{client_name}', client.agency_name).replace('{client_city}', client.city).replace('{client_state}', client.state));
  } catch (err) {
    console.error('[generateStaticBlog] Error processing blog template tokens:', err, {
      blogTemplate,
      client
    });
    throw err;
  }
  // 6. Generate blog content using OpenAI Assistant
  let blog;
  try {
    blog = await generateContent(client, processedTopicName, processedSubtopicName, processedRelatedLinks);
  } catch (err) {
    console.error('[generateStaticBlog] Error generating blog content:', err);
    throw err;
  }
  // 7. Generate image prompt and image AFTER blog is written, NO image size passed
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  let imagePrompt;
  try {
    imagePrompt = await runOpenAIAssistant(IMAGE_PROMPT_ASSISTANT_ID, {
      blog_title: blog.title,
      blog_content: blog.content_sections
    });
  } catch (err) {
    console.error('[generateStaticBlog] Error generating image prompt:', err);
    throw err;
  }
  let imageResponse, imageResult, imageUrl;
  try {
    imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
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
    imageResult = await imageResponse.json();
    if (!imageResult || !Array.isArray(imageResult.data) || !imageResult.data[0] || !imageResult.data[0].url) {
      console.error('[generateStaticBlog] Malformed imageResult from OpenAI:', imageResult);
      throw new Error('Malformed OpenAI image API response: ' + JSON.stringify(imageResult));
    }
    imageUrl = imageResult.data[0].url;
  } catch (err) {
    console.error('[generateStaticBlog] Error generating image:', err);
    throw err;
  }
  // 8. Upload image to Supabase storage
  let supabaseImageUrl;
  try {
    supabaseImageUrl = await uploadBlogImageToSupabase(imageUrl, client_id, blog.slug, supabaseAdmin);
  } catch (err) {
    console.error('[generateStaticBlog] Error uploading image to Supabase:', err);
    throw err;
  }
  // 9. Save blog to database
  let savedBlog, saveError;
  try {
    // Sanitize slug and correct LD-JSON URL server-side (safety net)
    const sanitizedSlug = sanitizeSlug(blog.slug);
    const correctedLdJson = {
      ...blog.ld_json,
      url: generateCorrectLdJsonUrl(client.website_url, processedTopicName, sanitizedSlug),
      datePublished: new Date().toISOString().split('T')[0] // Use current date
    };
    
    const result = await supabaseAdmin.from("client_blogs_content").insert({
      client_id,
      location_id: resolvedLocationId,
      title: blog.title,
      slug: sanitizedSlug,
      topic_number: nextPost.topic,
      subtopic_number: nextPost.subtopic,
      published: true,
      image_url: supabaseImageUrl,
      blog_category: blog.blog_category,
      content_summary: blog.content_summary,
      meta_title: blog.meta_title,
      meta_description: blog.meta_description,
      hero_section: blog.hero_section,
      content_sections: blog.content_sections,
      related_links: processedRelatedLinks,
      ld_json: correctedLdJson
    }).select().single();
    savedBlog = result.data;
    saveError = result.error;
  } catch (err) {
    console.error('[generateStaticBlog] Error saving blog to database:', err);
    throw err;
  }
  if (saveError) {
    console.error('[generateStaticBlog] Save error:', saveError);
    throw new Error(`Save error: ${saveError.message}`);
  }
  console.log(`✅ Blog created: ${blog.title}`);
  return {
    success: true,
    blog: savedBlog,
    message: `Blog "${blog.title}" created successfully`
  };
}
async function determineNextPost(supabase, clientId, locationId) {
  let query = supabase.from("client_blogs_content").select("topic_number, subtopic_number").eq("client_id", clientId);
  
  // Filter by location_id if provided
  if (locationId) {
    query = query.eq("location_id", locationId);
  }
  
  const { data: existingBlogs } = await query;
  const existingCombos = new Set(existingBlogs?.map((b)=>`${b.topic_number}-${b.subtopic_number}`) || []);
  for(let topic = 1; topic <= 10; topic++){
    for(let subtopic = 1; subtopic <= 10; subtopic++){
      const combo = `${topic}-${subtopic}`;
      if (!existingCombos.has(combo)) {
        return {
          topic,
          subtopic
        };
      }
    }
  }
  return null;
}
async function generateContent(client, topicName, subtopicName, relatedLinks) {
  const content = await runOpenAIAssistant(STATIC_BLOG_ASSISTANT_ID, {
    agency_name: client.agency_name ?? null,
    agency_city: client.city ?? null,
    agency_state: client.state ?? null,
    agency_address: client.address ?? null,
    agency_phone: client.phone ?? null,
    agency_canonical_url: client.website_url ?? null,
    topic_name: topicName ?? null,
    subtopic_name: subtopicName ?? null,
    related_links: relatedLinks ?? []
  });
  console.log('[generateContent] Raw OpenAI response:', content);
  let parsed;
  try {
    parsed = JSON.parse(content);
    console.log('[generateContent] Parsed OpenAI response:', parsed);
    return parsed;
  } catch (err) {
    console.error('[generateContent] Error parsing OpenAI response:', err, {
      content
    });
    throw err;
  }
}
// Main Deno.serve handler
Deno.serve(async (req)=>{
  try {
    const { client_id, location_id, topic, subtopic } = await req.json();
    if (!client_id || !topic || !subtopic) {
      return new Response(JSON.stringify({
        error: "client_id, topic, and subtopic are required"
      }), {
        status: 400
      });
    }
    
    console.log('[Deno.serve] Received request:', { client_id, location_id, topic, subtopic });
    
    // Generate blog using provided topic/subtopic
    const blogResult = await generateStaticBlog(client_id, location_id, topic, subtopic);
    if (!blogResult.success) {
      return new Response(JSON.stringify(blogResult), {
        status: 400
      });
    }
    // Calculate next topic/subtopic progression
    let nextTopic = topic;
    let nextSubtopic = subtopic;
    nextTopic++;
    if (nextTopic > 10) {
      nextTopic = 1;
      nextSubtopic++;
    }
    
    // Build update query with location_id filter if provided
    let updateQuery = supabaseAdmin.from('client_blog_settings').update({
      ready: false,
      next_topic: nextSubtopic <= 10 ? nextTopic : 10,
      next_subtopic: nextSubtopic <= 10 ? nextSubtopic : 10
    }).eq('client_id', client_id);
    
    if (location_id) {
      updateQuery = updateQuery.eq('location_id', location_id);
    }
    
    const { error: updateError } = await updateQuery;
    if (updateError) {
      return new Response(JSON.stringify({
        error: `Failed to update client settings: ${updateError.message}`
      }), {
        status: 500
      });
    }
    return new Response(JSON.stringify({
      success: true,
      blog: blogResult.blog,
      next_topic: nextSubtopic <= 10 ? nextTopic : 10,
      next_subtopic: nextSubtopic <= 10 ? nextSubtopic : 10,
      message: blogResult.message
    }), {
      status: 200
    });
  } catch (error) {
    console.error('[Deno.serve] Top-level error:', error && error.stack ? error.stack : error);
    return new Response(JSON.stringify({
      error: error && error.message ? error.message : String(error)
    }), {
      status: 500
    });
  }
});
