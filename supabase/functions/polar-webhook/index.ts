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
        if (eventType === 'checkout.updated' || eventType === 'checkout.confirmed' || eventType === 'order.created') {
            const data = event.data;
            const checkoutId = data.checkout_id || data.id;
            const checkoutStatus = data.status; // 'confirmed', 'succeeded', 'paid'
            const polarOrderId = data.order_id || (eventType === 'order.created' ? data.id : null);

            let isPaid = false;
            if (eventType === 'order.created' || checkoutStatus === 'confirmed' || checkoutStatus === 'succeeded' || checkoutStatus === 'paid') {
                isPaid = true;
            }

            // 1. Update polar_transactions log
            const { error: logError } = await supabaseClient.from('polar_transactions')
                .update({
                    status: isPaid ? 'paid' : (checkoutStatus === 'failed' ? 'failed' : 'pending'),
                    polar_order_id: polarOrderId,
                    updated_at: new Date().toISOString(),
                })
                .eq('checkout_id', checkoutId);

            if (logError) console.error("Webhook Log Update Error:", logError);

            // 2. If paid, sync to main transactions table to grant access
            if (isPaid) {
                const metadata = data.metadata || {};
                const userId = metadata.userId;
                const refId = metadata.itemId || metadata.ref_id;
                const refType = metadata.type || metadata.ref_type;
                const packageId = metadata.packageId;

                if (userId && refId) {
                    // Check for existing transaction to prevent duplicates
                    const { data: existing } = await supabaseClient
                        .from('transactions')
                        .select('id')
                        .eq('gateway_transaction_id', polarOrderId || checkoutId)
                        .maybeSingle();

                    if (!existing) {
                        const transactionData = {
                            user_id: userId,
                            amount: data.amount / 100, // Polar amounts are in cents
                            currency: data.currency?.toUpperCase() || 'USD',
                            status: 'completed',
                            payment_gateway: 'polar',
                            gateway_transaction_id: polarOrderId || checkoutId,
                            description: `Purchased via Polar: ${refType} (${refId})`,
                            type: refType === 'subscription' ? 'journal_subscription' :
                                (refType === 'book' || refType === 'article') ? 'purchase' : 'apc_payment',
                        };

                        if (refType === 'book') transactionData.book_id = refId;
                        if (refType === 'manuscript' || refType === 'article') transactionData.manuscript_id = refId;
                        if (packageId) transactionData.package_id = packageId;

                        const { error: syncError } = await supabaseClient
                            .from('transactions')
                            .insert([transactionData]);

                        if (syncError) console.error("Webhook Link Sync Error:", syncError);
                        else console.log("Successfully synced Polar payment to transactions table:", polarOrderId || checkoutId);
                    }
                }
            }
        } else if (eventType === 'order.refunded') {
            const order = event.data;
            const polarOrderId = order.id;

            // Update log
            await supabaseClient.from('polar_transactions')
                .update({ status: 'refunded', updated_at: new Date().toISOString() })
                .eq('polar_order_id', polarOrderId);

            // Update main transaction
            await supabaseClient.from('transactions')
                .update({ status: 'refunded' })
                .eq('gateway_transaction_id', polarOrderId);
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
