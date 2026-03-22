// @ts-nocheck - Supabase Deno Edge function for direct Whop payment verification
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, refId } = await req.json();

        if (!email || !refId) {
            return new Response(JSON.stringify({ error: 'Missing email or refId' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const WHOP_API_KEY = Deno.env.get('WHOP_API_KEY');
        if (!WHOP_API_KEY) {
            console.error('WHOP_API_KEY is not configured');
            return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Call Whop API to list memberships for this email
        // GET https://api.whop.com/v1/memberships?user_email=...&status=active
        const response = await fetch(`https://api.whop.com/v1/memberships?user_email=${encodeURIComponent(email)}&status=active`, {
            headers: {
                'Authorization': `Bearer ${WHOP_API_KEY}`,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Whop API Error:', errorText);
            return new Response(JSON.stringify({ hasAccess: false, debug: 'API call failed' }), {
                status: 200, // Still return 200 to avoiding crashing frontend logic
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { data: memberships } = await response.json();

        // Check if any active membership corresponds to the refId
        // Whop metadata in webhooks uses itemId, ref_id, book_id etc.
        // We check for membership.metadata.itemId == refId OR membership.metadata.ref_id == refId
        const hasAccess = memberships?.some(membership => {
            const meta = membership.metadata || {};
            return meta.itemId === refId || meta.ref_id === refId || meta.book_id === refId || meta.id === refId;
        });

        console.log(`Whop check for ${email} / ${refId}: ${hasAccess ? 'ACCESS GRANTED' : 'ACCESS DENIED'}`);

        return new Response(JSON.stringify({ hasAccess }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Whop check error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
