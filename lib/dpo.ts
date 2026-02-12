
import { supabase } from './supabaseClient';

export interface PaymentIntentResponse {
    orderId: string;
    url: string;
    transactionToken: string;
}

export const createPaymentIntent = async (
    amount: number,
    currency: string,
    email: string,
    metadata: any
): Promise<PaymentIntentResponse> => {
    // Extract details from metadata
    const ref_id = metadata?.itemId || 'unknown';
    const ref_type = metadata?.type || 'general';
    const user_id = metadata?.userId;

    const { data, error } = await supabase.functions.invoke('dpo-payment', {
        body: {
            action: 'initiate',
            amount,
            currency,
            ref_id,
            ref_type,
            user_id,
            customer: {
                email
            },
            // Redirects - adjust paths as needed
            redirect_url: `${window.location.origin}/dashboard?payment=success`,
            back_url: `${window.location.origin}/checkout?payment=cancelled`,
            metadata
        },
    });

    if (error) {
        console.error("DPO Payment Invoke Error:", error);
        throw new Error(`Payment Failed: ${error.message || JSON.stringify(error)}`);
    }

    if (data?.error) {
        console.error("DPO Payment Logic Error:", data.error);
        throw new Error(`Payment Failed: ${data.error}`);
    }

    return {
        orderId: data.trans_token,
        transactionToken: data.trans_token,
        url: data.payment_url
    };
};
