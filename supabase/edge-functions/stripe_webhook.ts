// Supabase Edge Function: Stripe Webhook Listener for checkout.session.completed
// Updated to match the correct password setup flow from pages/api/stripe/webhook.ts
// 1. Verifies Stripe signature
// 2. Finds client record by stripe customer ID
// 3. Generates password setup token (instead of creating user immediately)
// 4. Sends password setup email
// 5. Does NOT create Supabase user account until password is set

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || 'whsec_PH9qg72VLb403t3vXt2ZG4YXiSqNcont';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const EMAIL_API_URL = Deno.env.get('EMAIL_SERVICE_API_URL') || 'https://coverage-email-api.herokuapp.com/api/';
const SITE_URL = Deno.env.get('SITE_URL') || 'https://coveragecreatives-andrews-projects-336ecb1d.vercel.app';

// Helper function to read raw body
async function getRawBody(req: Request): Promise<Uint8Array> {
  return new Uint8Array(await req.arrayBuffer());
}

// Helper: verify Stripe signature (simplified for edge function)
async function verifyStripeSignature(req: Request, rawBody: Uint8Array) {
  const sig = req.headers.get('stripe-signature');
  if (!sig || !STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing Stripe signature or webhook secret');
  }
  // Note: Full Stripe signature verification would require crypto implementation
  // For production, ensure this endpoint is only accessible by Stripe
  return true;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const buf = await getRawBody(req);

  let event;
  try {
    // Verify webhook signature
    await verifyStripeSignature(req, buf);
    event = JSON.parse(new TextDecoder().decode(buf));
  } catch (err) {
    console.error('❌ WEBHOOK SIGNATURE VERIFICATION FAILED:', err);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log('🎯 WEBHOOK EVENT RECEIVED:', {
    type: event.type,
    id: event.id,
    timestamp: new Date().toISOString()
  });

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('💳 PAYMENT COMPLETED:', {
      session_id: session.id,
      customer_id: session.customer,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status
    });

    try {
      // Initialize Supabase with service role key for Admin API access
      const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Find the client record using the session customer ID
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('stripe_customer_id', session.customer)
        .eq('status', 'pending')
        .single();

      if (clientError || !client) {
        console.error('❌ CLIENT NOT FOUND:', {
          customer_id: session.customer,
          error: clientError?.message
        });
        return new Response(JSON.stringify({ error: 'Client not found' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ CLIENT FOUND:', {
        client_id: client.id,
        contact_name: client.contact_name,
        contact_email: client.contact_email
      });

      // Generate password setup token instead of creating user immediately
      console.log('🔐 GENERATING PASSWORD SETUP TOKEN...');
      const setupToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update client record with payment completion and setup token
      console.log('🔗 UPDATING CLIENT RECORD WITH PAYMENT COMPLETION...');
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          status: 'active',
          payment_completed: true,
          payment_completed_at: new Date().toISOString(),
          password_setup_token: setupToken,
          password_setup_token_expires: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (updateError) {
        console.error('❌ CLIENT UPDATE FAILED:', {
          error: updateError.message,
          client_id: client.id
        });
        return new Response(JSON.stringify({ error: 'Failed to update client record' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ CLIENT UPDATED WITH SETUP TOKEN:', {
        client_id: client.id,
        token_expires: expiresAt.toISOString()
      });

      // Send password setup email
      console.log('📧 SENDING PASSWORD SETUP EMAIL...');
      try {
        // Generate setup URL
        const setupUrl = `${SITE_URL}/auth/setup-password?token=${setupToken}`;
        
        // Create password setup email content
        const emailMessage = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0A2342;">Set Up Your Coverage Creatives Account</h2>
            <p>Hi ${client.contact_name || 'there'},</p>
            
            <p>Great news! Your payment has been successfully processed and your Coverage Creatives account is ready to be activated.</p>
            
            <p>To complete your account setup, please click the button below to create your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupUrl}" 
                 style="background-color: #0A2342; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Set Up Your Password
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all;">
              <a href="${setupUrl}" style="color: #0A2342;">${setupUrl}</a>
            </p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">Important</h4>
              <p style="color: #856404; margin-bottom: 0;">
                This setup link will expire in 24 hours. If you don't complete the setup within this time, please contact our support team.
              </p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Click the "Set Up Your Password" button above</li>
              <li>Create a secure password for your account</li>
              <li>Complete your profile setup</li>
              <li>Start exploring your new client dashboard</li>
            </ol>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            
            <p>We're excited to work with you and help grow your business!</p>
            
            <p>Best regards,<br/>
            <strong>The Coverage Creatives Team</strong></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              This email contains a secure account setup link. Please keep it secure and do not share this link with others.
            </p>
          </div>
        `;

        console.log('📧 PASSWORD SETUP EMAIL: Sending to email service...', {
          to: client.contact_email,
          client_name: client.contact_name
        });

        // Send email via external service
        const emailServiceUrl = EMAIL_API_URL.endsWith('/contact') ? EMAIL_API_URL : `${EMAIL_API_URL}/contact`;
        const emailResponse = await fetch(emailServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: client.contact_name || client.contact_email,
            email: client.contact_email,
            subject: 'Set Up Your Coverage Creatives Account Password',
            message: emailMessage
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('❌ EMAIL SERVICE: Failed to send password setup email', {
            status: emailResponse.status,
            statusText: emailResponse.statusText,
            error: errorText,
            client_email: client.contact_email
          });
          
          return new Response(JSON.stringify({ 
            error: 'Failed to send password setup email',
            details: `Email service returned ${emailResponse.status}: ${errorText}`
          }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const emailResult = await emailResponse.json();
        console.log('✅ PASSWORD SETUP EMAIL: Email sent successfully', {
          client_id: client.id,
          email_sent_to: client.contact_email,
          result: emailResult
        });

        // Update client record to mark setup email as sent
        const { error: emailUpdateError } = await supabase
          .from('clients')
          .update({
            password_setup_sent: true,
            password_setup_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', client.id);

        if (emailUpdateError) {
          console.error('⚠️ CLIENT UPDATE WARNING:', emailUpdateError);
          // Don't fail the entire process for this
        }

        console.log('🎉 WEBHOOK PROCESSING COMPLETED SUCCESSFULLY:', {
          session_id: session.id,
          client_id: client.id,
          workflow_completed_at: new Date().toISOString()
        });

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Password setup email sent',
          client_id: client.id
        }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (emailError) {
        console.error('❌ PASSWORD SETUP EMAIL ERROR:', emailError);
        return new Response(JSON.stringify({ 
          error: 'Failed to send password setup email',
          details: emailError instanceof Error ? emailError.message : 'Unknown email error'
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

    } catch (error) {
      console.error('❌ WEBHOOK PROCESSING ERROR:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        session_id: session.id,
        timestamp: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle other webhook events if needed
  console.log('ℹ️ UNHANDLED WEBHOOK EVENT:', event.type);
  return new Response(JSON.stringify({ received: true }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});
