import { supabase } from './supabaseClient';

export interface DpoCheckoutResponse {
    checkout_url: string;
    transaction_id: string;
    trans_token: string;
    message?: string;
}

export const createDpoCheckout = async (
    amount: number,
    currency: string,
    email: string,
    refId: string,
    refType: string,
    metadata?: Record<string, any>
): Promise<DpoCheckoutResponse> => {
    const { data, error } = await supabase.functions.invoke('dpo-checkout', {
        body: {
            amount,
            currency: (currency || 'RWF').toUpperCase(),
            ref_id: refId,
            ref_type: refType,
            user_id: metadata?.userId,
            customer_email: email,
            customer_name: metadata?.customerName,
            customer_phone: metadata?.customerPhone,
            success_url: `${window.location.origin}/checkout?payment=success`,
            cancel_url: `${window.location.origin}/checkout?payment=cancelled`,
            metadata
        },
    });

    if (error) {
        console.error("DPO Checkout Invoke Error:", error);
        throw new Error(`Payment Failed: ${error.message || JSON.stringify(error)}`);
    }

    if (data?.error) {
        console.error("DPO Checkout Logic Error:", data.error);
        throw new Error(`Payment Failed: ${data.error}`);
    }

    return {
        checkout_url: data.checkout_url,
        transaction_id: data.transaction_id,
        trans_token: data.trans_token,
        message: data.message
    };
};

export const verifyDpoPayment = async (transToken: string): Promise<{ status: string; is_paid: boolean }> => {
    const { data, error } = await supabase.functions.invoke('dpo-callback', {
        body: {
            trans_token: transToken
        },
    });

    if (error) {
        console.error("DPO Verification Error:", error);
        throw new Error(`Verification Failed: ${error.message || JSON.stringify(error)}`);
    }

    return {
        status: data?.status || 'unknown',
        is_paid: data?.is_paid || false
    };
};
