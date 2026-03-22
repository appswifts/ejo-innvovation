// @ts-nocheck - Supabase Deno Edge function for Whop dynamic checkout
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        console.log('--- STARTING WHOP CHECKOUT ---');
        const WHOP_API_KEY = Deno.env.get('WHOP_API_KEY');
        if (!WHOP_API_KEY) {
            console.error('Missing WHOP_API_KEY environment variable');
            return new Response(JSON.stringify({ error: 'WHOP_API_KEY not configured' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log('Parsing request body...');
        const bodyText = await req.text();
        console.log('Raw body:', bodyText);
        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (e) {
            console.error('Failed to parse JSON body:', e);
            throw new Error('Invalid JSON body');
        }

        const {
            productId,
            price,
            currency,
            itemName,
            email,
            userId,
            itemId,
            itemType,
            packageId,
            returnUrl,
        } = body;

        console.log('Parsed inputs:', { productId, price, currency, email, userId });

        if (!productId || price === undefined || price === null) {
            console.error('Missing required fields string:', `productId=${productId}, price=${price}`);
            return new Response(JSON.stringify({ error: 'Missing required fields: productId, price' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Step 1: Create a Plan with dynamic pricing under the product
        // Whop API expects price in dollars/decimal (e.g., 10.00), not cents.
        const finalPrice = Number(price);
        console.log(`Calculated final price: ${finalPrice}`);

        const planPayload: Record<string, any> = {
            product_id: productId,
            plan_type: "one_time",
            initial_price: finalPrice,
            currency: (currency || 'usd').toLowerCase(),
            visibility: "visible",
            stock: 1000,
            billing_period: null,
            internal_notes: `Dynamic plan for ${itemType}: ${itemName || itemId}`,
        };

        console.log('Creating Whop plan with payload:', JSON.stringify(planPayload));

        let planResponse;
        try {
            planResponse = await fetch('https://api.whop.com/api/v2/plans', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHOP_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(planPayload),
            });
        } catch (fetchErr) {
            console.error('Network error during fetch to Whop API:', fetchErr);
            throw fetchErr;
        }

        console.log(`Whop API response status: ${planResponse.status} ${planResponse.statusText}`);

        if (!planResponse.ok) {
            const errorText = await planResponse.text();
            console.error('Whop Plan creation failed with body:', errorText);
            return new Response(JSON.stringify({
                error: 'Failed to create Whop plan',
                details: errorText,
                status: planResponse.status
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const planData = await planResponse.json();
        const planId = planData.id;

        console.log('Successfully created Whop plan ID:', planId);

        // Step 2: Build the checkout URL with metadata
        const checkoutUrl = new URL(`https://whop.com/checkout/${productId}`);
        checkoutUrl.searchParams.set('plan', planId);

        if (email) checkoutUrl.searchParams.set('email', email);
        if (userId) checkoutUrl.searchParams.set('metadata[userId]', userId);
        if (itemId) checkoutUrl.searchParams.set('metadata[itemId]', itemId);
        if (itemType) checkoutUrl.searchParams.set('metadata[type]', itemType);
        if (packageId) checkoutUrl.searchParams.set('metadata[packageId]', packageId);
        if (returnUrl) checkoutUrl.searchParams.set('returnUrl', returnUrl);

        console.log('Generated Checkout URL:', checkoutUrl.toString());

        return new Response(JSON.stringify({
            checkoutUrl: checkoutUrl.toString(),
            planId: planId,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Unhandled Whop checkout session error:', error.message, error.stack);
        return new Response(JSON.stringify({ error: 'Failed to create checkout session', message: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
