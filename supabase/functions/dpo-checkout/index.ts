// @ts-nocheck - This file runs on Supabase's Deno Edge Runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const DPO_COMPANY_TOKEN = Deno.env.get('DPO_COMPANY_TOKEN');
        const DPO_SERVICE_URL = Deno.env.get('DPO_SERVICE_URL') || 'https://secure.3gdirectpay.com/API/v6/';
        // Supabase Edge Functions use different env var names depending on version
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_PROJECT_SERVICE_ROLE_KEY');

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing Supabase config. Available env:", {
                url: !!SUPABASE_URL,
                key: !!SUPABASE_SERVICE_ROLE_KEY,
                dpo_token: !!DPO_COMPANY_TOKEN
            });
            return new Response(JSON.stringify({
                error: "Configuration Error: Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const body = await req.json();
        const {
            amount,
            currency,
            ref_id,
            ref_type,
            user_id,
            customer_email,
            customer_name,
            customer_phone,
            success_url,
            cancel_url,
            metadata
        } = body;

        if (!amount || !ref_id) {
            return new Response(JSON.stringify({
                error: "Missing required fields: amount, ref_id"
            }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const supabaseClient = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        );

        // If DPO is not configured, return a simulated checkout for manual payment
        if (!DPO_COMPANY_TOKEN) {
            console.log("DPO not configured, creating manual transaction record");
            
            const { data: txRecord, error: txError } = await supabaseClient
                .from('dpo_transactions')
                .insert({
                    trans_token: `manual-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    user_id: user_id || null,
                    ref_id,
                    ref_type,
                    metadata: metadata || {},
                    amount,
                    currency: (currency || 'RWF').toUpperCase(),
                    status: 'created'
                })
                .select()
                .single();

            if (txError) {
                console.error("DPO manual insert error:", txError);
                return new Response(JSON.stringify({ error: txError.message }), {
                    status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // Return a checkout URL that goes to the manual payment instructions
            return new Response(JSON.stringify({
                checkout_url: `${success_url || cancel_url || '/checkout'}?payment=manual&transaction_id=${txRecord.id}`,
                transaction_id: txRecord.id,
                trans_token: txRecord.trans_token,
                message: "DPO payment gateway not configured. Using manual payment flow."
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Build DPO XML request
        const transToken = `DPO-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const paymentAmount = parseFloat(amount).toFixed(2);
        const paymentCurrency = (currency || 'RWF').toUpperCase();
        const backURL = success_url || cancel_url || 'https://nkizacenter.com/checkout';

        const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
        <API3G>
            <CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
            <Request>createToken</Request>
            <Transaction>
                <PaymentAmount>${paymentAmount}</PaymentAmount>
                <PaymentCurrency>${paymentCurrency}</PaymentCurrency>
                <CompanyRef>${ref_id}</CompanyRef>
                <RedirectURL>${backURL}</RedirectURL>
                <BackURL>${backURL}</BackURL>
                <CompanyRefUnique>1</CompanyRefUnique>
                <PTL>5</PTL>
                <customerEmail>${customer_email || ''}</customerEmail>
                <customerFirstName>${customer_name || ''}</customerFirstName>
                <customerPhone>${customer_phone || ''}</customerPhone>
            </Transaction>
            <Services>
                <Service>
                    <ServiceType>5525</ServiceType>
                    <ServiceDescription>${ref_type || 'Purchase'} - ${ref_id}</ServiceDescription>
                    <ServiceDate>${new Date().toISOString().split('T')[0]}</ServiceDate>
                </Service>
            </Services>
        </API3G>`;

        console.log("Creating DPO transaction token...");

        // Call DPO API
        const dpoResponse = await fetch(`${DPO_SERVICE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml'
            },
            body: xmlRequest
        });

        const dpoXmlText = await dpoResponse.text();
        console.log("DPO Response:", dpoXmlText.substring(0, 500));

        // Parse XML response (simple parsing)
        const resultMatch = dpoXmlText.match(/<Result>([^<]+)<\/Result>/);
        const result = resultMatch ? resultMatch[1] : '000';
        const resultExplanationMatch = dpoXmlText.match(/<ResultExplanation>([^<]+)<\/ResultExplanation>/);
        const resultExplanation = resultExplanationMatch ? resultExplanationMatch[1] : 'Unknown error';
        const transTokenMatch = dpoXmlText.match(/<TransToken>([^<]+)<\/TransToken>/);
        const transRefMatch = dpoXmlText.match(/<TransRef>([^<]+)<\/TransRef>/);

        if (result !== '000' || !transTokenMatch) {
            console.error("DPO Error:", result, resultExplanation);
            return new Response(JSON.stringify({
                error: `DPO Payment Error: ${resultExplanation}`,
                dpo_code: result,
                dpo_response: dpoXmlText.substring(0, 1000)
            }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const dpoTransToken = transTokenMatch[1];
        const dpoTransRef = transRefMatch ? transRefMatch[1] : null;

        // Save to dpo_transactions table
        const { data: txRecord, error: dbError } = await supabaseClient
            .from('dpo_transactions')
            .insert({
                trans_token: dpoTransToken,
                trans_ref: dpoTransRef,
                user_id: user_id || null,
                ref_id,
                ref_type,
                metadata: {
                    ...metadata,
                    customer_email,
                    customer_name,
                    customer_phone
                },
                amount: parseFloat(paymentAmount),
                currency: paymentCurrency,
                status: 'created'
            })
            .select()
            .single();

        if (dbError) {
            console.error("DPO Database Error:", dbError);
        }

        // Build checkout URL
        const checkoutUrl = `https://secure.3gdirectpay.com/payv2.php?ID=${dpoTransToken}`;

        return new Response(JSON.stringify({
            checkout_url: checkoutUrl,
            trans_token: dpoTransToken,
            trans_ref: dpoTransRef,
            transaction_id: txRecord?.id
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("DPO Checkout Critical Error:", error);
        return new Response(JSON.stringify({
            error: error.message || "Payment processing failed"
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
