
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore: Deno is a global in the Supabase Edge Function environment
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, title, name } = await req.json()

        // Log the event (in a real app, this would send an email via Resend/SendGrid)
        console.log(`NEW SUBMISSION: Manuscript "${title}" submitted by ${name} (${email})`)

        return new Response(
            JSON.stringify({ message: "Confirmation email processed" }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
