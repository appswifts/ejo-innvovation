// @ts-nocheck - Supabase Deno Edge function for Whop payment webhooks
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const WHOP_WEBHOOK_SECRET = Deno.env.get('WHOP_WEBHOOK_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing Supabase config' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.text();

    if (WHOP_WEBHOOK_SECRET) {
      const signature =
        req.headers.get('whop-signature') ||
        req.headers.get('x-whop-signature') ||
        '';
      if (!signature) {
        console.warn('Whop webhook received without signature header');
      }
      // For production, verify HMAC signature here using WHOP_WEBHOOK_SECRET and rawBody.
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type || event.event;

    console.log('Whop Webhook Event:', eventType, JSON.stringify(event).substring(0, 500));

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    if (eventType === 'payment.succeeded') {
      const payment = event.data;
      const metadata = payment.metadata || {};

      const userId = metadata.userId || metadata.user_id;
      const refId = metadata.itemId || metadata.ref_id;
      const refType = metadata.type || metadata.ref_type;
      const packageId = metadata.packageId || metadata.package_id;

      if (userId && refId) {
        const gatewayId = payment.id;

        const { data: existing } = await supabaseClient
          .from('transactions')
          .select('id')
          .eq('gateway_transaction_id', gatewayId)
          .maybeSingle();

        if (!existing) {
          const amount = payment.amount;
          const currency = (payment.currency || 'USD').toUpperCase();

          const transactionData: any = {
            user_id: userId,
            amount,
            currency,
            status: 'completed',
            payment_gateway: 'whop',
            gateway_transaction_id: gatewayId,
            description: `Purchased via Whop: ${refType} (${refId})`,
            type:
              refType === 'subscription'
                ? 'journal_subscription'
                : refType === 'book' || refType === 'article'
                ? 'purchase'
                : 'apc_payment',
          };

          if (refType === 'book') transactionData.book_id = refId;
          if (refType === 'manuscript' || refType === 'article') transactionData.manuscript_id = refId;
          if (packageId) transactionData.package_id = packageId;

          const { error: insertError } = await supabaseClient
            .from('transactions')
            .insert([transactionData]);

          if (insertError) {
            console.error('Whop webhook transaction insert error:', insertError);
          } else {
            console.log('Whop payment synced to transactions:', gatewayId);
          }
        }
      }
    } else if (eventType === 'payment.refunded') {
      const payment = event.data;
      const gatewayId = payment.id;

      await supabaseClient
        .from('transactions')
        .update({ status: 'refunded' })
        .eq('gateway_transaction_id', gatewayId);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Whop webhook processing error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

