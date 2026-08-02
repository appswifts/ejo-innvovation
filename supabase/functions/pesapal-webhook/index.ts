const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const baseUrl = () => Deno.env.get('PESAPAL_API_URL') || 'https://pay.pesapal.com/v3';

const getToken = async (): Promise<string> => {
  const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY') || '';
  const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET') || '';

  const res = await fetch(`${baseUrl()}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(`PesaPal auth failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data.token;
};

const fetchTransactionStatus = async (token: string, orderTrackingId: string) => {
  const res = await fetch(
    `${baseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    }
  );
  return res.json();
};

const mapStatus = (statusCode: number | null, statusDescription: string | null): string => {
  const desc = (statusDescription || '').toUpperCase();
  if (statusCode === 1 || desc === 'COMPLETED') return 'completed';
  if (statusCode === 2 || desc === 'FAILED' || desc === 'INVALID') return 'failed';
  if (statusCode === 3 || desc === 'REVERSED') return 'reversed';
  return 'pending';
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let orderTrackingId = url.searchParams.get('OrderTrackingId') || '';
    let orderMerchantReference = url.searchParams.get('OrderMerchantReference') || '';

    if (!orderTrackingId && req.method === 'POST') {
      const payload = await req.json().catch(() => ({}));
      orderTrackingId = payload.OrderTrackingId || '';
      orderMerchantReference = payload.OrderMerchantReference || '';
    }

    if (!orderTrackingId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing OrderTrackingId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const token = await getToken();
    const statusData = await fetchTransactionStatus(token, orderTrackingId);

    const statusCode = statusData.status_code ?? null;
    const statusDescription = statusData.payment_status_description || statusData.payment_status_code || null;
    const status = mapStatus(statusCode, statusDescription);

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: existing } = await supabase
      .from('pesapal_transactions')
      .select('*')
      .eq('order_tracking_id', orderTrackingId)
      .maybeSingle();

    const { error: upsertError } = await supabase.from('pesapal_transactions').upsert({
      order_tracking_id: orderTrackingId,
      merchant_reference: orderMerchantReference || existing?.merchant_reference || '',
      user_id: existing?.user_id || null,
      ref_id: existing?.ref_id || null,
      ref_type: existing?.ref_type || null,
      metadata: existing?.metadata || {},
      amount: statusData.amount ?? existing?.amount ?? 0,
      currency: statusData.currency || existing?.currency || 'RWF',
      phone_number: statusData.payment_account || null,
      payment_method: statusData.payment_method || null,
      status,
      status_code: statusCode,
      confirmation_code: statusData.confirmation_code || null,
      payment_account: statusData.payment_account || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'order_tracking_id' });

    if (upsertError) {
      console.error('Error saving pesapal transaction:', upsertError);
    }

    if (status === 'completed') {
      const refType = existing?.ref_type || '';
      const refId = existing?.ref_id || '';

      const typeMap: Record<string, string> = {
        subscription: 'journal_subscription',
        apc: 'apc_payment',
        book: 'book_purchase',
        article: 'purchase',
      };

      const transactionData: any = {
        amount: statusData.amount ?? existing?.amount ?? 0,
        currency: statusData.currency || existing?.currency || 'RWF',
        status: 'completed',
        type: typeMap[refType] || 'purchase',
        description: `PesaPal:${orderTrackingId}`,
        payment_gateway: 'pesapal',
      };

      if (refType === 'apc' || refType === 'article') transactionData.manuscript_id = refId;
      if (refType === 'book') transactionData.book_id = refId;

      const { data: dup } = await supabase
        .from('transactions')
        .select('id')
        .eq('payment_gateway', 'pesapal')
        .eq('description', `PesaPal:${orderTrackingId}`)
        .maybeSingle();

      if (!dup) {
        const { error: txError } = await supabase.from('transactions').insert(transactionData);
        if (txError) {
          console.error('Error syncing transaction:', txError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        orderNotificationType: 'IPNCHANGE',
        orderTrackingId,
        orderMerchantReference: orderMerchantReference || existing?.merchant_reference || '',
        status: 200,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('PesaPal webhook error:', error.message);

    return new Response(
      JSON.stringify({
        orderNotificationType: 'IPNCHANGE',
        orderTrackingId: '',
        orderMerchantReference: '',
        status: 500,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
