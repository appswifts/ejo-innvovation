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
        // Environment variables
        const POLAR_ACCESS_TOKEN = Deno.env.get('POLAR_ACCESS_TOKEN');
        const POLAR_PRODUCT_ID = Deno.env.get('POLAR_PRODUCT_ID');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!POLAR_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Configuration Error: Missing Environment Variables", {
                has_polar_token: !!POLAR_ACCESS_TOKEN,
                has_polar_product: !!POLAR_PRODUCT_ID,
                has_sb_url: !!SUPABASE_URL,
                has_sb_key: !!SUPABASE_SERVICE_ROLE_KEY
            });
            return new Response(JSON.stringify({
                error: "Configuration Error: Missing Environment Variables"
            }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Parse request body
        const body = await req.json();
        const {
            amount,
            currency,
            ref_id,
            ref_type,
            user_id,
            customer_email,
            success_url,
            cancel_url,
            metadata
        } = body;

        console.log("Processing ad-hoc checkout request:", { ref_id, ref_type, amount, currency });

        if (!amount || !currency || !ref_id) {
            return new Response(JSON.stringify({
                error: "Missing required fields: amount, currency, ref_id"
            }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (!POLAR_PRODUCT_ID) {
            console.error("POLAR_PRODUCT_ID is missing from environment variables.");
            return new Response(JSON.stringify({
                error: "Configuration Error: POLAR_PRODUCT_ID is missing. Please create a product in Polar and set its ID in Supabase secrets."
            }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Build Ad-hoc Pricing Payload
        // Smallest currency unit (cents)
        const amountCents = Math.round(amount * 100);
        const polarCurrency = currency.toLowerCase();

        const checkoutPayload = {
            products: [POLAR_PRODUCT_ID],
            customer_email: customer_email || undefined,
            success_url: success_url || undefined,
            cancel_url: cancel_url || undefined,
            // Ad-hoc Pricing Override
            prices: {
                [POLAR_PRODUCT_ID]: [
                    {
                        amount_type: 'fixed',
                        price_amount: amountCents,
                        price_currency: polarCurrency
                    }
                ]
            },
            metadata: {
                ref_id,
                ref_type,
                user_id: user_id || '',
                ...(metadata || {})
            }
        };

        console.log("Creating Polar Ad-hoc Checkout Session:", JSON.stringify(checkoutPayload));

        // Call Polar API
        const polarResponse = await fetch('https://api.polar.sh/v1/checkouts/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutPayload),
        });

        const polarData = await polarResponse.json();

        if (!polarResponse.ok) {
            console.error("Polar API Error Details:", JSON.stringify(polarData, null, 2));
            // Properly stringify the error for the client
            const errorMessage = typeof polarData === 'object'
                ? JSON.stringify(polarData)
                : String(polarData);

            return new Response(JSON.stringify({
                error: `Polar Error: ${errorMessage}`,
                details: polarData
            }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const checkoutId = polarData.id;
        const checkoutUrl = polarData.url;

        // Save to database
        const supabaseClient = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        );

        const { error: dbError } = await supabaseClient.from('polar_transactions').insert({
            checkout_id: checkoutId,
            user_id: user_id || null,
            ref_id,
            ref_type,
            metadata: metadata || {},
            amount,
            currency,
            status: 'created'
        });

        if (dbError) {
            console.error("Database Insert Error:", dbError);
        }

        return new Response(JSON.stringify({
            checkout_id: checkoutId,
            checkout_url: checkoutUrl,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Critical Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
})
