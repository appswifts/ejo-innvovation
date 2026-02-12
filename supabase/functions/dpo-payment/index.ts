
import { createClient } from 'npm:@supabase/supabase-js@2'
import { XMLParser } from 'npm:fast-xml-parser';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Environment Check
        const DPO_COMPANY_TOKEN = Deno.env.get('DPO_COMPANY_TOKEN');
        const DPO_SERVICE_TYPE = Deno.env.get('DPO_SERVICE_TYPE');
        const DPO_BASE_URL = Deno.env.get('DPO_BASE_URL') || 'https://secure.3gdirectpay.com/API/v6/';
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!DPO_COMPANY_TOKEN || !DPO_SERVICE_TYPE || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Configuration Error: Missing Environment Variables", {
                has_dpo_token: !!DPO_COMPANY_TOKEN,
                has_dpo_service: !!DPO_SERVICE_TYPE,
                has_sb_url: !!SUPABASE_URL,
                has_sb_key: !!SUPABASE_SERVICE_ROLE_KEY
            });
            // Critical configuration error still 500
            return new Response(JSON.stringify({
                error: "Configuration Error: Missing Environment Variables"
            }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const env = { DPO_COMPANY_TOKEN, DPO_SERVICE_TYPE, DPO_BASE_URL };

        // 3. Routing
        const url = new URL(req.url);
        const parts = url.pathname.split('/').filter(Boolean);
        let action = parts[parts.length - 1];

        if (action === 'dpo-payment') {
            action = undefined;
        }

        // 4. Client Setup
        const supabaseClient = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        );

        // 5. Handle Webhook (URL-based)
        if (action === 'webhook') {
            return await handleWebhook(req, supabaseClient, env);
        }

        // 6. Parse Body & Determine Action
        let body: any = {};
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            try {
                body = await req.json();
                if (!action && body.action) {
                    action = body.action;
                }
            } catch (e) {
                console.error("Error parsing JSON body:", e);
                // JSON parse error is a client error, but return 200 with error to be safe? 
                // No, 400 is fine here as it's malformed request. But let's be consistent.
                return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
        }

        // 7. Dispatch Action
        if (action === 'initiate') {
            return await handleInitiate(body, supabaseClient, env);
        } else if (action === 'verify') {
            return await handleVerify(body, supabaseClient, env);
        }

        // 8. 404 Fallback
        console.warn("Unknown action requested:", action);
        return new Response(JSON.stringify({
            error: `Unknown action: ${action || 'undefined'}`,
            received_path: url.pathname,
            hint: "Use /initiate, /webhook, /verify or pass { action: 'initiate' } in body"
        }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Critical Uncaught Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
})

async function handleInitiate(body: any, supabase: any, env: any) {
    const { amount, currency, ref_id, ref_type, user_id, customer, redirect_url, back_url, metadata } = body;
    const { DPO_COMPANY_TOKEN, DPO_SERVICE_TYPE, DPO_BASE_URL } = env;

    if (!amount || !currency || !ref_id) {
        console.error("Validation Error: Missing required fields", { amount, currency, ref_id });
        // Return 200 so client reads the error message
        return new Response(JSON.stringify({ error: "Missing required fields: amount, currency, ref_id" }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // A. XML Construction
    const now = new Date();
    const date = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const custEmail = customer?.email || '';
    const custFirstName = customer?.firstName || '';
    const custLastName = customer?.lastName || '';
    const custPhone = customer?.phone || '';
    const custCountry = customer?.country || '';
    const custCity = customer?.city || '';
    const custAddress = customer?.address || '';
    const custZip = customer?.zip || '';

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
<CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
<Request>createToken</Request>
<Transaction>
<PaymentAmount>${amount}</PaymentAmount>
<PaymentCurrency>${currency}</PaymentCurrency>
<CompanyRef>${ref_id}</CompanyRef>
<RedirectURL>${redirect_url}</RedirectURL>
<BackURL>${back_url}</BackURL>
<CompanyRefUnique>0</CompanyRefUnique>
<PTL>5</PTL>
<customerEmail>${custEmail}</customerEmail>
<customerFirstName>${custFirstName}</customerFirstName>
<customerLastName>${custLastName}</customerLastName>
<customerPhone>${custPhone}</customerPhone>
<customerCountry>${custCountry}</customerCountry>
<customerCity>${custCity}</customerCity>
<customerAddress>${custAddress}</customerAddress>
<customerZip>${custZip}</customerZip>
</Transaction>
<Services>
  <Service>
    <ServiceType>${DPO_SERVICE_TYPE}</ServiceType>
    <ServiceDescription>${ref_type} - ${ref_id}</ServiceDescription>
    <ServiceDate>${date}</ServiceDate>
  </Service>
</Services>
<Additional>
  <BlockPayment>false</BlockPayment>
  <BlockPaymentMessage></BlockPaymentMessage>
</Additional>
</API3G>`;

    try {
        // B. DPO API Call
        console.log("Sending Request to DPO:", DPO_BASE_URL);
        const dpoResponse = await fetch(`${DPO_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
            },
            body: xml
        });

        const dpoXml = await dpoResponse.text();
        const parser = new XMLParser();
        const dpoData = parser.parse(dpoXml);

        const result = dpoData?.API3G?.Result;
        const transToken = dpoData?.API3G?.TransToken;
        const transRef = dpoData?.API3G?.TransRef;

        // DEBUG: If no result, it might be parsing error or new structure
        if (result === undefined) {
            console.error("DPO API Undefined Result:", { dpoXml, dpoData });
            return new Response(JSON.stringify({
                error: "DPO API Response Error: Result is undefined",
                raw_response: dpoXml,
                parsed_data: dpoData
            }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (result !== 0 && result !== '000') {
            console.error("DPO API Rejected Request:", { result, explanation: dpoData?.API3G?.ResultExplanation, full_response: dpoData });
            // Return 200 so client reads the error message
            return new Response(JSON.stringify({
                error: `DPO Error: ${dpoData?.API3G?.ResultExplanation} (${result})`,
                raw_response: dpoXml,
                parsed_data: dpoData
            }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // C. Database Insert
        const { error } = await supabase.from('dpo_transactions').insert({
            trans_token: transToken,
            trans_ref: transRef,
            user_id: user_id || null,
            ref_id,
            ref_type,
            metadata: metadata || {},
            amount,
            currency,
            status: 'created'
        });

        if (error) {
            console.error("Database Insert Error:", error);
            return new Response(JSON.stringify({ error: "Database Error: Failed to save transaction" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({
            trans_token: transToken,
            payment_url: `https://secure.3gdirectpay.com/payv2.php?ID=${transToken}`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (err) {
        console.error("Fetch/Processing Error:", err);
        return new Response(JSON.stringify({ error: `Processing Error: ${err.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}

async function handleWebhook(req: Request, supabase: any, env: any) {
    const { DPO_COMPANY_TOKEN } = env;
    try {
        const xml = await req.text();
        const parser = new XMLParser();
        const data = parser.parse(xml);
        const api3g = data?.API3G;

        const companyToken = api3g?.CompanyToken;
        const transToken = api3g?.TransactionToken;
        const result = api3g?.Result;

        if (companyToken !== DPO_COMPANY_TOKEN) {
            console.error("Webhook Error: Invalid Company Token");
            return new Response(JSON.stringify({ error: 'Invalid Company Token' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        let status = 'pending';
        if (result === 0 || result === '000') status = 'paid';
        else if (['900', '901', '902'].includes(String(result))) status = 'failed';
        else status = 'cancelled';

        const { error } = await supabase.from('dpo_transactions')
            .update({
                status: status,
                updated_at: new Date().toISOString(),
            })
            .eq('trans_token', transToken);

        if (error) console.error("Webhook DB Update Error:", error);

        const responseXml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
<Response>OK</Response>
</API3G>`;

        return new Response(responseXml, { headers: { 'Content-Type': 'application/xml' } });
    } catch (e) {
        console.error("Webhook Processing Error:", e);
        return new Response(JSON.stringify({ error: "Webhook Error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}

async function handleVerify(body: any, supabase: any, env: any) {
    const { trans_token } = body;
    const { DPO_COMPANY_TOKEN, DPO_BASE_URL } = env;

    if (!trans_token) {
        console.error("Verify Error: Missing trans_token");
        return new Response(JSON.stringify({ error: "Missing trans_token" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
<CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
<Request>verifyToken</Request>
<TransactionToken>${trans_token}</TransactionToken>
</API3G>`;

    try {
        const dpoResponse = await fetch(`${DPO_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
            },
            body: xml
        });

        const dpoXml = await dpoResponse.text();
        const parser = new XMLParser();
        const dpoData = parser.parse(dpoXml);
        const result = dpoData?.API3G?.Result;

        let status = 'pending';
        if (result === 0 || result === '000') status = 'paid';
        else if (result === 900 || result === '900') status = 'created';
        else status = 'failed';

        // Update DB
        await supabase.from('dpo_transactions')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('trans_token', trans_token);

        return new Response(JSON.stringify({
            status,
            dpo_result: result,
            dpo_explanation: dpoData?.API3G?.ResultExplanation
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e) {
        console.error("Verify Processing Error:", e);
        return new Response(JSON.stringify({ error: "Verify Error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}
