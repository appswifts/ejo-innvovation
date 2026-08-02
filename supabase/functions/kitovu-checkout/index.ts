const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
  senderName?: string;
  description?: string;
  paymentRail?: 'mtn' | 'airtel';
  userId?: string;
  refType?: string;
  refId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: CheckoutRequest = await req.json();
    const { amount, phoneNumber, reference, senderName, description, paymentRail, userId, refType, refId } = body;

    const apiKey = Deno.env.get('KITOVU_API_KEY') || '';
    const apiSecret = Deno.env.get('KITOVU_CLIENT_SECRET') || '';
    const baseUrl = Deno.env.get('KITOVU_API_URL') || 'https://gateway.uat.kitovupay.com';
    const webhookBase = Deno.env.get('SUPABASE_URL')?.replace(/\/$/, '') || 'https://ypvwkynsfhdecccnljcd.functions.supabase.co';

    if (!apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ success: false, message: 'KitovuPay not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('250')
      ? cleanPhone
      : cleanPhone.startsWith('0')
        ? '250' + cleanPhone.slice(1)
        : '250' + cleanPhone;

    const isAirtel = formattedPhone.startsWith('25078') || formattedPhone.startsWith('25079');
    const detectedRail = isAirtel ? 'airtel' : 'mtn';
    const paymentRailToUse = paymentRail === 'mtn' || paymentRail === 'airtel' ? paymentRail : detectedRail;

    const path = '/merchant-transaction/merchant/collection/mobile_money';
    const callbackUrl = `${webhookBase}/kitovu-webhook?reference=${encodeURIComponent(reference)}`;

    const requestBody = {
      amount,
      payment_rail: paymentRailToUse,
      sender_account_issuer: paymentRailToUse,
      sender_account_name: senderName || 'Customer',
      sender_account_number: formattedPhone,
      description: description || 'Payment',
      callbackUrl,
      externalId: reference,
    };

    const bodyJson = JSON.stringify(requestBody);
    const timestamp = Date.now().toString();

    const signingPayload = JSON.stringify({
      method: 'POST',
      path,
      body: requestBody,
    });

    const encoder = new TextEncoder();
    const keyData = encoder.encode(apiSecret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signingPayload));
    const sigHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const kitovuResponse = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-api-timestamp': timestamp,
        'x-api-signature': sigHex,
      },
      body: bodyJson,
    });

    const kitovuData = await kitovuResponse.json();

    if (!kitovuResponse.ok) {
      console.error('KitovuPay API error:', kitovuResponse.status, JSON.stringify(kitovuData));
      return new Response(
        JSON.stringify({
          success: true,
          reference,
          message: 'Payment request received. Our team will contact you.',
          fallback: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const kitovuReference = kitovuData.transactionId || kitovuData.data?.transactionId || '';

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (supabaseUrl && supabaseKey && kitovuReference) {
      const { createClient } = await import('npm:@supabase/supabase-js@2');
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error: trackError } = await supabase.from('kitovu_transactions').upsert({
        kitovu_reference: kitovuReference,
        merchant_reference: reference,
        user_id: userId || null,
        ref_id: refId || null,
        ref_type: refType || null,
        amount,
        currency: 'RWF',
        phone_number: formattedPhone,
        status: 'pending',
        metadata: { payment_rail: paymentRailToUse },
      }, { onConflict: 'kitovu_reference' });

      if (trackError) {
        console.error('Error tracking kitovu transaction:', trackError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference,
        kitovuReference,
        message: 'Payment initiated. Check your phone for the payment prompt.',
        transactionStatus: kitovuData.status || kitovuData.data?.status || 'pending',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Kitovu checkout error:', error.message);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment request received. Our team will contact you.',
        fallback: true,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
