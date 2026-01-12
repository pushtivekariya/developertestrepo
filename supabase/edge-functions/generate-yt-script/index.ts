/******************************************************************
 * generate-yt-script-v2.ts — Simplified Assistant Architecture
 * ---------------------------------------------------------------
 * CHANGES FROM PREVIOUS VERSION:
 * • Fetches location data (city, state, service_areas) from client_locations
 * • Sends location_city, location_state, service_areas to AI
 * • Uses location-specific data instead of client-level data
 ******************************************************************/
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// ============================================================
// LOCATION DATA FETCHER
// ============================================================
interface LocationData {
  id: string;
  city: string;
  state: string;
  service_areas: string[];
}

async function getLocationData(
  supabase: any,
  locationId: string
): Promise<LocationData | null> {
  const { data, error } = await supabase
    .from('client_locations')
    .select('id, city, state, service_areas')
    .eq('id', locationId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    city: data.city,
    state: data.state,
    service_areas: data.service_areas || []
  };
}

// ============================================================
// MAIN HANDLER
// ============================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { policy_slug, client, user_id, policy_page_id, location_id: provided_location_id } = await req.json();
    
    // ============================================================
    // Resolve location_id if not provided
    // ============================================================
    let location_id = provided_location_id;
    if (!location_id) {
      const { data: locationData } = await supabaseAdmin
        .from('client_locations')
        .select('id')
        .eq('client_id', client.id)
        .eq('is_active', true)
        .limit(1)
        .single();
      location_id = locationData?.id || null;
    }
    
    // ============================================================
    // KEY CHANGE: Fetch location data from client_locations
    // ============================================================
    let locationData: LocationData | null = null;
    
    if (location_id) {
      locationData = await getLocationData(supabaseAdmin, location_id);
    }
    
    if (!locationData) {
      throw new Error('No location data available');
    }
    
    console.log('Processing for client:', client.id);
    console.log('Location:', locationData.city, locationData.state);
    console.log('Service areas:', locationData.service_areas.join(', '));
    
    const assistantId = Deno.env.get('OPENAI_YOUTUBE_SCRIPT_GENERATOR');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!assistantId || !openaiApiKey) {
      throw new Error('OpenAI Assistant ID or API key not configured');
    }
    
    // Create thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + openaiApiKey,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });
    if (!threadResponse.ok) {
      const error = await threadResponse.json();
      throw new Error('Failed to create thread: ' + JSON.stringify(error));
    }
    const thread = await threadResponse.json();
    
    // ============================================================
    // KEY CHANGE: Send location-specific data to AI
    // ============================================================
    const messageResponse = await fetch('https://api.openai.com/v1/threads/' + thread.id + '/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + openaiApiKey,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: JSON.stringify({
          policy_slug: policy_slug,
          policy_type: policy_slug.replace(/-/g, ' '),
          agency_name: client.agency_name,
          location_city: locationData.city,      // From client_locations
          location_state: locationData.state,    // From client_locations
          service_areas: locationData.service_areas,  // From client_locations
          current_date: new Date().toISOString()
        })
      })
    });
    if (!messageResponse.ok) {
      const error = await messageResponse.json();
      throw new Error('Failed to add message: ' + JSON.stringify(error));
    }
    
    // Start run
    const runResponse = await fetch('https://api.openai.com/v1/threads/' + thread.id + '/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + openaiApiKey,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({ assistant_id: assistantId })
    });
    if (!runResponse.ok) {
      const error = await runResponse.json();
      throw new Error('Failed to run assistant: ' + JSON.stringify(error));
    }
    const run = await runResponse.json();
    
    // Poll for completion
    let runStatus = run.status;
    let pollAttempts = 0;
    const maxAttempts = 8;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      if (pollAttempts >= maxAttempts) {
        throw new Error('Assistant run timed out after 2 minutes');
      }
      await new Promise((resolve) => setTimeout(resolve, 15000));
      const statusResponse = await fetch('https://api.openai.com/v1/threads/' + thread.id + '/runs/' + run.id, {
        headers: {
          'Authorization': 'Bearer ' + openaiApiKey,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      if (!statusResponse.ok) {
        throw new Error('Failed to check run status');
      }
      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      pollAttempts++;
      if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
        throw new Error('Assistant run ' + runStatus + ': ' + (statusData.last_error?.message || 'Unknown error'));
      }
      if (runStatus === 'requires_action') {
        throw new Error('Assistant requires action - function calling not implemented');
      }
    }
    
    // Get response
    const messagesResponse = await fetch('https://api.openai.com/v1/threads/' + thread.id + '/messages?limit=1', {
      headers: {
        'Authorization': 'Bearer ' + openaiApiKey,
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    if (!messagesResponse.ok) {
      throw new Error('Failed to retrieve assistant response');
    }
    const messages = await messagesResponse.json();
    const generatedScript = messages.data[0]?.content[0]?.text?.value;
    if (!generatedScript) {
      throw new Error('No script was generated');
    }
    
    // Save to database
    const { data: scriptData, error } = await supabaseClient.from('client_policy_scripts').insert({
      user_id,
      parent_slug: policy_slug,
      script: generatedScript,
      agency_name: client.agency_name,
      policy_page_id,
      client_id: client.id,
      location_id: location_id
    }).select().single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify({
      success: true,
      policy_page_id,
      ...scriptData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
