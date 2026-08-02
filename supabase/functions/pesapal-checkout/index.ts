const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  amount: number;
  currency?: string;
  reference: string;
  description?: string;
  callbackUrl: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  userId?: string;
  refType?: string;
  refId?: string;
}

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

const ensureIpn = async (token: string): Promise<string> => {
  const webhookUrl = `${Deno.env.get('SUPABASE_URL')?.replace(/\/$/, '')}/pesapal-webhook`;

  const listRes = await fetch(`${baseUrl()}/api/URLSetup/GetIpnList`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  if (listRes.ok) {
    const list = await listRes.json();
    const existing = Array.isArray(list)
      ? list.find((ipn: any) => ipn.url === webhookUrl)
      : null;
    if (existing?.ipn_id) return existing.ipn_id;
  }

  const regRes = await fetch(`${baseUrl()}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: webhookUrl, ipn_notification_type: 'POST' }),
  });

  const regData = await regRes.json();
  if (!regRes.ok || !regData.ipn_id) {
    throw new Error(`PesaPal IPN registration failed: ${regRes.status} ${JSON.stringify(regData)}`);
  }
  return regData.ipn_id;
};

const sanitizeReference = (ref: string): string => {
  const cleaned = ref.replace(/[^a-zA-Z0-9\-_.:]/g, '').slice(0, 50);
  return cleaned || `pay_${Date.now()}`;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: CheckoutRequest = await req.json();
    const {
      amount, currency, reference, description, callbackUrl,
      firstName, lastName, email, phoneNumber, userId, refType, refId,
    } = body;

    if (!amount || !reference || !callbackUrl) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const token = await getToken();
    const notificationId = await ensureIpn(token);

    const id = sanitizeReference(reference);

    const orderBody: any = {
      id,
      currency: currency || 'RWF',
      amount: Number(amount),
      description: (description || 'Payment').slice(0, 100),
      callback_url: callbackUrl,
      redirect_mode: 'TOP_WINDOW',
      notification_id: notificationId,
      billing_address: {
        email_address: email || '',
        phone_number: phoneNumber || '',
        country_code: 'RW',
        first_name: firstName || '',
        last_name: lastName || '',
      },
    };

    const orderRes = await fetch(`${baseUrl()}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderBody),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.redirect_url) {
      throw new Error(`PesaPal submit order failed: ${orderRes.status} ${JSON.stringify(orderData)}`);
    }

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { error: insertError } = await supabase.from('pesapal_transactions').upsert({
      order_tracking_id: orderData.order_tracking_id,
      merchant_reference: id,
      user_id: userId || null,
      ref_id: refId || null,
      ref_type: refType || null,
      metadata: { reference: id, description: description || 'Payment' },
      amount: Number(amount),
      currency: currency || 'RWF',
      status: 'pending',
    }, { onConflict: 'order_tracking_id' });

    if (insertError) {
      console.error('Error saving pesapal transaction:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl: orderData.redirect_url,
        orderTrackingId: orderData.order_tracking_id,
        merchantReference: id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('PesaPal checkout error:', error.message);

    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
