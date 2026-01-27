import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Missing payment reference' }), 
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

    console.log('Verifying payment for user:', user.id, 'reference:', reference);

    // DUPLICATE PREVENTION: Check if already processed
    const { data: existingTx } = await supabaseClient
      .from('payment_transactions')
      .select('plan_type, verified_at')
      .eq('reference', reference)
      .eq('user_id', user.id)
      .eq('status', 'success')
      .maybeSingle();

    if (existingTx) {
      console.log('Payment already processed:', reference);
      return new Response(
        JSON.stringify({
          status: true,
          data: {
            planType: existingTx.plan_type,
            subscriptionExpiry: existingTx.verified_at,
            verified: true,
            already_processed: true
          }
        }), 
        { 
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

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const verificationData = await response.json();
    
    console.log('Paystack verification response status:', verificationData.status);

    if (!response.ok || !verificationData.status || verificationData.data.status !== 'success') {
      throw new Error(verificationData.message || 'Payment verification failed');
    }

    const planType = verificationData.data.metadata?.plan_type;
    const paidAmount = verificationData.data.amount / 100; // Convert from kobo to naira

    if (!planType) {
      throw new Error('Invalid payment metadata');
    }

    // AMOUNT VALIDATION: Verify paid amount matches plan cost
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('amount, duration_days')
      .eq('plan_type', planType)
      .single();

    if (planError || !plan) {
      console.error('Invalid plan type:', planType, planError);
      throw new Error('Invalid plan type');
    }

    if (paidAmount !== plan.amount) {
      console.error('Amount mismatch - potential fraud', { 
        expected: plan.amount, 
        paid: paidAmount,
        reference 
      });
      throw new Error(`Amount mismatch: expected ₦${plan.amount}, got ₦${paidAmount}`);
    }

    // Calculate subscription expiry
    const subscriptionExpiry = new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    // Use service role for atomic transaction (prevents race conditions)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Record transaction (UNIQUE constraint prevents duplicate usage)
    const { error: txError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        reference,
        amount: paidAmount,
        currency: 'NGN',
        plan_type: planType,
        status: 'success',
        paystack_response: verificationData.data,
        verified_at: new Date().toISOString()
      });

    if (txError) {
      // Duplicate reference will fail here due to UNIQUE constraint
      if (txError.code === '23505') {
        console.error('Duplicate payment reference detected:', reference);
        throw new Error('Payment reference already used');
      }
      console.error('Transaction insert error:', txError);
      throw txError;
    }

    // Update subscription
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_type: planType,
        subscription_expires: subscriptionExpiry,
        payment_verified: true,
        last_payment_reference: reference,
        last_payment_date: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      throw new Error('Failed to update subscription');
    }

    console.log('Payment verified successfully:', reference);

    return new Response(
      JSON.stringify({
        status: true,
        data: {
          planType,
          subscriptionExpiry,
          verified: true
        }
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ 
        status: false,
        error: error instanceof Error ? error.message : 'Payment verification failed' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

