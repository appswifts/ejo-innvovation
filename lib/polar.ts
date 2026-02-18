
import { supabase } from './supabaseClient';

export interface CheckoutSessionResponse {
    checkoutId: string;
    url: string;
}

export const createCheckoutSession = async (
    amount: number,
    currency: string,
    email: string,
    metadata: any
): Promise<CheckoutSessionResponse> => {
    const ref_id = metadata?.itemId || 'unknown';
    const ref_type = metadata?.type || 'general';
    const user_id = metadata?.userId;

    // Sanitize metadata: strip null/undefined values (Polar rejects them)
    const sanitizedMetadata: Record<string, string | number | boolean> = {};
    if (metadata) {
        for (const [key, value] of Object.entries(metadata)) {
            if (value !== null && value !== undefined) {
                sanitizedMetadata[key] = value as string | number | boolean;
            }
        }
    }

    const { data, error } = await supabase.functions.invoke('polar-checkout', {
        body: {
            amount,
            currency,
            ref_id,
            ref_type,
            user_id,
            customer_email: email,
            success_url: `${window.location.origin}/dashboard?payment=success`,
            cancel_url: `${window.location.origin}/checkout?payment=cancelled`,
            metadata: sanitizedMetadata
        },
    });

    if (error) {
        console.error("Polar Checkout Invoke Error:", error);
        throw new Error(`Payment Failed: ${error.message || JSON.stringify(error)}`);
    }

    if (data?.error) {
        console.error("Polar Checkout Logic Error:", data.error);
        throw new Error(`Payment Failed: ${data.error}`);
    }

    return {
        checkoutId: data.checkout_id,
        url: data.checkout_url
    };
};
