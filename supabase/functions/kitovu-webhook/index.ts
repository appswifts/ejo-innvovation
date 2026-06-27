const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KitovuWebhookPayload {
  event: string;
  reference: string;
  merchant_reference: string;
  amount: number;
  currency: string;
  phone_number?: string;
  status: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: KitovuWebhookPayload = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const webhookSecret = Deno.env.get('KITOVU_WEBHOOK_SECRET') || '';

    // Verify webhook signature if configured
    const signature = req.headers.get('x-kitovu-signature');
    if (webhookSecret && signature) {
      const encoder = new TextEncoder();
      const key = encoder.encode(webhookSecret);
      const message = encoder.encode(JSON.stringify(payload));
      const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      const expectedSig = await crypto.subtle.sign('HMAC', cryptoKey, message);
      const expectedHex = Array.from(new Uint8Array(expectedSig)).map(b => b.toString(16).padStart(2, '0')).join('');

      if (signature !== expectedHex) {
        return new Response('Invalid signature', { status: 401 });
      }
    }

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine transaction status
    let status = 'pending';
    if (payload.status === 'completed' || payload.status === 'success') {
      status = 'completed';
    } else if (payload.status === 'failed' || payload.status === 'cancelled') {
      status = 'failed';
    }

    // Upsert kitovu_transactions record
    const { error: kitovuError } = await supabase.from('kitovu_transactions').upsert({
      kitovu_reference: payload.reference,
      merchant_reference: payload.merchant_reference,
      amount: payload.amount,
      currency: payload.currency || 'RWF',
      phone_number: payload.phone_number,
      status,
      metadata: payload.metadata || {},
      updated_at: new Date().toISOString(),
    }, { onConflict: 'kitovu_reference' });

    if (kitovuError) {
      console.error('Error saving kitovu transaction:', kitovuError);
    }

    // Sync to main transactions table on completion
    if (status === 'completed') {
      const merchantRef = payload.merchant_reference;
      const parts = merchantRef.split('_');
      const refType = parts[0];
      const refId = parts.slice(1).join('_');

      const transactionData: any = {
        user_id: payload.metadata?.user_id || null,
        amount: payload.amount,
        currency: payload.currency || 'RWF',
        status: 'completed',
        type: refType === 'subscription' ? 'journal_subscription'
          : refType === 'apc' ? 'apc_payment'
          : refType === 'book' ? 'book_purchase'
          : 'purchase',
        description: 'KitovuPay payment',
        payment_gateway: 'kitovu',
        manuscript_id: refType === 'apc' || refType === 'article' ? refId : null,
        book_id: refType === 'book' ? refId : null,
        package_id: payload.metadata?.package_id || null,
      };

      if (payload.metadata?.user_id) {
        transactionData.user_id = payload.metadata.user_id;
      }

      // Check for duplicate
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('payment_gateway', 'kitovu')
        .eq('description', `KitovuPay:${payload.reference}`)
        .maybeSingle();

      if (!existing) {
        transactionData.description = `KitovuPay:${payload.reference}`;

        const { error: txError } = await supabase.from('transactions').insert(transactionData);
        if (txError) {
          console.error('Error syncing transaction:', txError);
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
