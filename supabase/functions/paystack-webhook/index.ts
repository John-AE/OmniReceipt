import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

serve(async (req) => {
  try {
    // Verify Paystack signature (CRITICAL SECURITY)
    const signature = req.headers.get('x-paystack-signature');
    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!signature || !secretKey) {
      console.error('Missing signature or secret key');
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.text();
    const hash = createHmac('sha512', secretKey)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid signature - potential fraud attempt');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);
    
    // Only process successful charges
    if (event.event !== 'charge.success') {
      console.log('Event ignored:', event.event);
      return new Response('Event ignored', { status: 200 });
    }

    const { reference, amount, status, metadata } = event.data;
    const planType = metadata?.plan_type;
    const userId = metadata?.user_id;

    if (status !== 'success' || !planType || !userId) {
      console.error('Invalid event data:', { status, planType, userId });
      return new Response('Invalid event data', { status: 400 });
    }

    console.log('Processing payment:', { reference, planType, userId, amount });

    // Initialize Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify amount matches plan (AMOUNT VALIDATION)
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('amount, duration_days')
      .eq('plan_type', planType)
      .single();

    if (planError || !plan) {
      console.error('Invalid plan type:', planType, planError);
      return new Response('Invalid plan type', { status: 400 });
    }

    const paidAmount = amount / 100; // Convert from kobo to naira
    if (paidAmount !== plan.amount) {
      console.error('Amount mismatch', { expected: plan.amount, paid: paidAmount });
      return new Response('Amount mismatch', { status: 400 });
    }

    // Check if reference already processed (DUPLICATE PREVENTION)
    const { data: existingTx } = await supabase
      .from('payment_transactions')
      .select('id')
      .eq('reference', reference)
      .eq('status', 'success')
      .maybeSingle();

    if (existingTx) {
      console.log('Payment already processed:', reference);
      return new Response('Already processed', { status: 200 });
    }

    // Calculate subscription expiry
    const subscriptionExpiry = new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    // Record transaction (atomic operation)
    const { error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        reference,
        amount: paidAmount,
        currency: 'NGN',
        plan_type: planType,
        status: 'success',
        paystack_response: event.data,
        verified_at: new Date().toISOString()
      });

    if (txError) {
      console.error('Failed to record transaction:', txError);
      throw txError;
    }

    // Update subscription
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_type: planType,
        subscription_expires: subscriptionExpiry,
        payment_verified: true,
        last_payment_reference: reference,
        last_payment_date: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      throw updateError;
    }

    console.log('Payment processed successfully:', reference);
    return new Response('Processed', { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal error', { status: 500 });
  }
});


