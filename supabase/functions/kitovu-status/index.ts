const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const mapStatus = (value: unknown) => {
  const status = String(value || '').toUpperCase();
  if (['APPROVED', 'SUCCESSFUL', 'COMPLETED', 'SUCCESS', 'SUCCEEDED'].includes(status)) return 'completed';
  if (['REJECTED', 'FAILED', 'FAIL', 'CANCELLED', 'CANCELED', 'DECLINED', 'EXPIRED', 'TIMEOUT'].includes(status)) return 'failed';
  return 'pending';
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { merchantReference } = await req.json();
    if (!merchantReference || typeof merchantReference !== 'string') {
      return new Response(JSON.stringify({ success: false, message: 'merchantReference is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const apiKey = Deno.env.get('KITOVU_API_KEY') || '';
    const baseUrl = (Deno.env.get('KITOVU_API_URL') || 'https://gateway.uat.kitovupay.com').replace(/\/$/, '');

    if (!supabaseUrl || !supabaseKey || !apiKey) throw new Error('KitovuPay status service is not configured');

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: tracked, error: trackedError } = await supabase
      .from('kitovu_transactions')
      .select('id, status, amount, currency, metadata')
      .eq('merchant_reference', merchantReference)
      .maybeSingle();

    if (trackedError) throw trackedError;
    if (!tracked) {
      return new Response(JSON.stringify({ success: true, transaction: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const externalId = tracked.metadata?.external_id;
    if (!externalId || tracked.status !== 'pending') {
      return new Response(JSON.stringify({ success: true, transaction: tracked }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const gatewayResponse = await fetch(
      `${baseUrl}/merchant-transaction/payment/${encodeURIComponent(externalId)}`,
      { headers: { 'x-api-key': apiKey } },
    );

    if (!gatewayResponse.ok) {
      console.error('KitovuPay status error:', gatewayResponse.status, await gatewayResponse.text());
      return new Response(JSON.stringify({ success: true, transaction: tracked }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const gatewayData = await gatewayResponse.json();
    const status = mapStatus(gatewayData.status);
    const { error: updateError } = await supabase
      .from('kitovu_transactions')
      .update({
        status,
        metadata: { ...tracked.metadata, gateway_status: gatewayData.status, reason: gatewayData.reason ?? null },
        updated_at: new Date().toISOString(),
      })
      .eq('id', tracked.id);
    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      transaction: { status, amount: tracked.amount, currency: tracked.currency },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Kitovu status error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message || 'Unable to check payment status' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
