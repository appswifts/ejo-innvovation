// @ts-nocheck - This file runs on Supabase's Deno Edge Runtime, not in the Vite/React app
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const POLAR_WEBHOOK_SECRET = Deno.env.get('POLAR_WEBHOOK_SECRET');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return new Response(JSON.stringify({ error: "Missing Supabase config" }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Verify webhook signature if secret is configured
        const rawBody = await req.text();

        if (POLAR_WEBHOOK_SECRET) {
            const signature = req.headers.get('webhook-signature') || req.headers.get('x-polar-signature') || '';
            // Polar uses standard webhook signatures
            // For production, implement HMAC-SHA256 verification:
            // const expectedSig = await computeHmac(POLAR_WEBHOOK_SECRET, rawBody);
            // if (signature !== expectedSig) { return 403 }
            if (!signature) {
                console.warn("Webhook received without signature header");
            }
        }

        const event = JSON.parse(rawBody);
        const eventType = event.type || event.event;

        console.log("Polar Webhook Event:", eventType, JSON.stringify(event).substring(0, 500));

        const supabaseClient = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        );

        // Handle different event types
        if (eventType === 'checkout.updated' || eventType === 'checkout.confirmed') {
            const checkout = event.data;
            const checkoutId = checkout.id;
            const checkoutStatus = checkout.status; // 'confirmed', 'failed', 'expired'

            let status = 'pending';
            if (checkoutStatus === 'confirmed' || checkoutStatus === 'succeeded') {
                status = 'paid';
            } else if (checkoutStatus === 'failed') {
                status = 'failed';
            } else if (checkoutStatus === 'expired') {
                status = 'cancelled';
            }

            const { error } = await supabaseClient.from('polar_transactions')
                .update({
                    status,
                    polar_order_id: checkout.order_id || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('checkout_id', checkoutId);

            if (error) {
                console.error("Webhook DB Update Error (checkout):", error);
            }
        } else if (eventType === 'order.created') {
            const order = event.data;
            const checkoutId = order.checkout_id;

            if (checkoutId) {
                const { error } = await supabaseClient.from('polar_transactions')
                    .update({
                        status: 'paid',
                        polar_order_id: order.id,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('checkout_id', checkoutId);

                if (error) {
                    console.error("Webhook DB Update Error (order):", error);
                }
            }
        } else if (eventType === 'order.refunded') {
            const order = event.data;
            const checkoutId = order.checkout_id;

            if (checkoutId) {
                const { error } = await supabaseClient.from('polar_transactions')
                    .update({
                        status: 'refunded',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('checkout_id', checkoutId);

                if (error) {
                    console.error("Webhook DB Update Error (refund):", error);
                }
            }
        }

        // Always return 200 to acknowledge the webhook
        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Webhook Processing Error:", error);
        return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
})
