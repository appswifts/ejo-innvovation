// @ts-nocheck - Supabase Deno Edge function for DPO payment callbacks
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Supabase Edge Functions use different env var names depending on version
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_PROJECT_SERVICE_ROLE_KEY');
    const DPO_COMPANY_TOKEN = Deno.env.get('DPO_COMPANY_TOKEN');
    const DPO_SERVICE_URL = Deno.env.get('DPO_SERVICE_URL') || 'https://secure.3gdirectpay.com/API/v6/';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase config. Available env:", {
        url: !!SUPABASE_URL,
        key: !!SUPABASE_SERVICE_ROLE_KEY,
        dpo_token: !!DPO_COMPANY_TOKEN
      });
      return new Response(JSON.stringify({ error: 'Missing Supabase config. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { trans_token, status } = body;

    if (!trans_token) {
      return new Response(JSON.stringify({ error: 'Missing trans_token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    // Find the transaction record
    const { data: txRecord, error: txError } = await supabaseClient
      .from('dpo_transactions')
      .select('*')
      .eq('trans_token', trans_token)
      .single();

    if (txError || !txRecord) {
      console.error('DPO callback: Transaction not found', trans_token);
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let paymentStatus = status || 'pending';
    let isPaid = false;

    // If DPO is configured, verify the transaction status with DPO
    if (DPO_COMPANY_TOKEN && !status) {
      const verifyXml = `<?xml version="1.0" encoding="utf-8"?>
        <API3G>
          <CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
          <Request>verifyToken</Request>
          <TransactionToken>${trans_token}</TransactionToken>
        </API3G>`;

      try {
        const verifyResponse = await fetch(DPO_SERVICE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml',
          },
          body: verifyXml,
        });

        const verifyXmlText = await verifyResponse.text();
        const resultMatch = verifyXmlText.match(/<Result>([^<]+)<\/Result>/);
        const result = resultMatch ? resultMatch[1] : '000';
        const resultExplanationMatch = verifyXmlText.match(/<ResultExplanation>([^<]+)<\/ResultExplanation>/);
        const resultExplanation = resultExplanationMatch ? resultExplanationMatch[1] : '';

        if (result === '000') {
          paymentStatus = 'paid';
          isPaid = true;
        } else {
          paymentStatus = 'failed';
        }

        console.log(`DPO verification result: ${result} - ${resultExplanation}`);
      } catch (verifyError) {
        console.error('DPO verification error:', verifyError);
      }
    } else if (status === 'completed' || status === 'paid') {
      isPaid = true;
      paymentStatus = 'paid';
    }

    // Update dpo_transactions status
    const { error: updateError } = await supabaseClient
      .from('dpo_transactions')
      .update({
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('trans_token', trans_token);

    if (updateError) {
      console.error('DPO callback update error:', updateError);
    }

    // If paid, sync to main transactions table to grant access
    if (isPaid && txRecord.user_id && txRecord.ref_id) {
      const { data: existing } = await supabaseClient
        .from('transactions')
        .select('id')
        .eq('gateway_transaction_id', trans_token)
        .maybeSingle();

      if (!existing) {
        const transactionData: any = {
          user_id: txRecord.user_id,
          amount: txRecord.amount,
          currency: txRecord.currency,
          status: 'completed',
          payment_gateway: 'dpo',
          gateway_transaction_id: trans_token,
          description: `Purchased via DPO/MoMo: ${txRecord.ref_type} (${txRecord.ref_id})`,
          type:
            txRecord.ref_type === 'subscription'
              ? 'journal_subscription'
              : txRecord.ref_type === 'book' || txRecord.ref_type === 'article'
              ? 'purchase'
              : 'apc_payment',
        };

        if (txRecord.ref_type === 'book') transactionData.book_id = txRecord.ref_id;
        if (txRecord.ref_type === 'manuscript' || txRecord.ref_type === 'article')
          transactionData.manuscript_id = txRecord.ref_id;
        if (txRecord.metadata?.packageId) transactionData.package_id = txRecord.metadata.packageId;

        const { error: syncError } = await supabaseClient
          .from('transactions')
          .insert([transactionData]);

        if (syncError) {
          console.error('DPO callback transaction sync error:', syncError);
        } else {
          console.log('DPO payment synced to transactions:', trans_token);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
        is_paid: isPaid,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('DPO callback processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Callback processing failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
