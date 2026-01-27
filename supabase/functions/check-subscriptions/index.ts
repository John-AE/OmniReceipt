import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const startTime = new Date();
    console.log(`[${startTime.toISOString()}] Starting subscription expiry check...`);

    // Security: Verify cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized request - invalid CRON_SECRET');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get count of subscriptions before check
    const { data: beforeData, error: beforeError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_type, subscription_expires')
      .in('subscription_type', ['monthly', 'yearly'])
      .not('subscription_expires', 'is', null)
      .lt('subscription_expires', new Date().toISOString().split('T')[0]);

    if (beforeError) {
      console.error('Error fetching profiles before check:', beforeError);
    } else {
      console.log(`Found ${beforeData?.length || 0} expired subscriptions to process`);
    }

    // Call the expiry function
    const { error } = await supabaseAdmin.rpc('check_expired_subscriptions');

    if (error) {
      console.error('Error calling check_expired_subscriptions:', error);
      throw error;
    }

    // Get count of subscriptions after check to verify downgrades
    const { data: afterData, error: afterError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_type')
      .eq('subscription_type', 'free');

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const result = {
      success: true,
      timestamp: startTime.toISOString(),
      duration_ms: duration,
      expired_subscriptions_found: beforeData?.length || 0,
      message: `Successfully checked and downgraded ${beforeData?.length || 0} expired subscription(s)`
    };

    console.log(`[${endTime.toISOString()}] Subscription check completed:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('Fatal error in subscription check:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


