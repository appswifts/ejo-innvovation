const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  reference: string;
  email?: string;
  description?: string;
}

const KITOVU_API_URL = 'https://sandbox.kitovupay.com/api/v1';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: CheckoutRequest = await req.json();

    const apiKey = Deno.env.get('KITOVU_API_KEY') || '';
    const clientSecret = Deno.env.get('KITOVU_CLIENT_SECRET') || '';
    const merchantId = Deno.env.get('KITOVU_MERCHANT_ID') || '';
    const apiSecret = Deno.env.get('KITOVU_API_SECRET') || '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'KitovuPay not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const kitovuResponse = await fetch(`${KITOVU_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-merchant-id': merchantId,
        'x-api-key': apiKey,
        'x-client-secret': clientSecret,
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: body.currency || 'RWF',
        phone_number: body.phoneNumber,
        reference: body.reference,
        description: body.description || 'Payment',
      }),
    });

    const kitovuData = await kitovuResponse.json();

    if (!kitovuResponse.ok) {
      console.error('KitovuPay API error:', kitovuResponse.status, kitovuData);
      return new Response(
        JSON.stringify({
          success: true,
          reference: body.reference,
          message: 'Payment request received. Our team will contact you.',
          fallback: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference: body.reference,
        kitovuReference: kitovuData.id || kitovuData.reference || kitovuData.transaction_id,
        message: 'Payment initiated. Check your phone for the payment prompt.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Kitovu checkout error:', error);

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
