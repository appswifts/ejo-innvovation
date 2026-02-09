
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
    try {
        // DPO sends XML or JSON mostly. Need to parse properly.
        const payload = await req.text(); // or req.json() depending on DPO config

        // TODO: Verify DPO signature/token

        // TODO: Update transaction status in DB based on callback

        return new Response(
            JSON.stringify({ message: 'Webhook received' }),
            { headers: { 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
    }
})
