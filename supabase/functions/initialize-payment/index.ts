import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, amount, planType } = await req.json();

    if (!email || !amount || !planType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, amount, planType' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get authenticated user (SECURITY: Verify user identity)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment configuration error' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate cryptographically secure reference (SECURITY: Unpredictable references)
    const reference = `ref_${planType}_${Date.now()}_${crypto.randomUUID().replace(/-/g, '')}`;
    
    console.log('Initializing payment:', { email, amount, planType, reference, userId: user.id });

    // Initialize transaction with Paystack
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        currency: 'NGN',
        reference,
        callback_url: `${req.headers.get('origin') || 'https://your-domain.com'}/payment-callback`,
        metadata: {
          plan_type: planType,
          user_id: user.id  // SECURITY: Link payment to specific user
        }
      }),
    });

    const data = await response.json();
    
    console.log('Paystack response status:', response.status);
    console.log('Paystack response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    if (data.status && data.data.authorization_url) {
      return new Response(
        JSON.stringify({
          status: true,
          data: {
            authorization_url: data.data.authorization_url,
            reference: data.data.reference
          }
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      throw new Error(data.message || 'Invalid response from payment provider');
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Payment initialization failed' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});


