const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KitovuWebhookPayload {
  transactionId?: string;
  externalId: string;
  status: string;
  amount?: number;
  message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: KitovuWebhookPayload = await req.json();

    const url = new URL(req.url);
    const callbackReference = url.searchParams.get('reference') || '';
    const externalId = payload.externalId || callbackReference;
    const kitovuReference = payload.transactionId || externalId;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    let status = 'pending';
    const statusUpper = (payload.status || '').toUpperCase();
    if (['APPROVED', 'SUCCESSFUL', 'COMPLETED', 'SUCCESS', 'SUCCEEDED'].includes(statusUpper)) {
      status = 'completed';
    } else if (['REJECTED', 'FAILED', 'FAIL', 'CANCELLED', 'CANCELED', 'DECLINED', 'EXPIRED', 'TIMEOUT'].includes(statusUpper)) {
      status = 'failed';
    }

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const transactionUpdate: Record<string, unknown> = {
      currency: 'RWF',
      status,
      metadata: { status: payload.status, message: payload.message },
      updated_at: new Date().toISOString(),
    };

    if (typeof payload.amount === 'number' && payload.amount > 0) {
      transactionUpdate.amount = payload.amount;
    }

    if (payload.transactionId) {
      const { data: existingTracked } = await supabase
        .from('kitovu_transactions')
        .select('id, merchant_reference')
        .eq('kitovu_reference', payload.transactionId)
        .maybeSingle();

      if (existingTracked) {
        const { error: kitovuUpdateError } = await supabase
          .from('kitovu_transactions')
          .update({ ...transactionUpdate, ...(externalId ? { merchant_reference: externalId } : {}) })
          .eq('id', existingTracked.id);
        if (kitovuUpdateError) {
          console.error('Error updating kitovu transaction:', kitovuUpdateError);
        }
      } else {
        const { error: kitovuError } = await supabase.from('kitovu_transactions').insert({
          kitovu_reference: payload.transactionId,
          merchant_reference: externalId,
          amount: typeof payload.amount === 'number' && payload.amount > 0 ? payload.amount : 0,
          ...transactionUpdate,
        });
        if (kitovuError) {
          console.error('Error saving kitovu transaction:', kitovuError);
        }
      }
    } else if (externalId) {
      const { data: matched, error: matchError } = await supabase
        .from('kitovu_transactions')
        .select('id, kitovu_reference')
        .eq('merchant_reference', externalId)
        .limit(1);

      if (matchError) {
        console.error('Error finding kitovu transaction:', matchError);
      } else if (matched && matched.length > 0) {
        const { error: updateError } = await supabase
          .from('kitovu_transactions')
          .update(transactionUpdate)
          .eq('id', matched[0].id);
        if (updateError) {
          console.error('Error updating kitovu transaction:', updateError);
        }
      } else {
        const { error: insertError } = await supabase.from('kitovu_transactions').insert({
          kitovu_reference: externalId,
          merchant_reference: externalId,
          amount: typeof payload.amount === 'number' && payload.amount > 0 ? payload.amount : 0,
          ...transactionUpdate,
        });
        if (insertError) {
          console.error('Error inserting kitovu transaction:', insertError);
        }
      }
    } else {
      console.warn('Kitovu webhook received without transactionId/externalId/reference:', JSON.stringify(payload));
    }

    if (status === 'completed' && externalId) {
      const merchantRef = externalId;
      const description = `KitovuPay:${merchantRef}`;

      const { data: tracked } = await supabase
        .from('kitovu_transactions')
        .select('user_id, ref_type, ref_id')
        .eq('merchant_reference', merchantRef)
        .maybeSingle();

      const refType = tracked?.ref_type || '';
      const refId = tracked?.ref_id || '';

      const typeMap: Record<string, string> = {
        subscription: 'journal_subscription',
        apc: 'apc_payment',
        book: 'book_purchase',
        article: 'purchase',
      };

      const transactionData: any = {
        user_id: tracked?.user_id || null,
        amount: payload.amount || 0,
        currency: 'RWF',
        status: 'completed',
        type: typeMap[refType] || 'purchase',
        description,
        payment_gateway: 'kitovu',
      };

      if (refType === 'apc' || refType === 'article') transactionData.manuscript_id = refId;
      if (refType === 'book') transactionData.book_id = refId;

      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('description', description)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ status: 'completed', payment_gateway: 'kitovu' })
          .eq('id', existing.id);
        if (updateError) {
          console.error('Error updating transaction:', updateError);
        }
      } else {
        const { error: txError } = await supabase.from('transactions').insert(transactionData);
        if (txError) {
          console.error('Error syncing transaction:', txError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook received and processed', transactionId: kitovuReference }),
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
