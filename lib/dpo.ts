
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
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
            amount,
            currency,
            email,
            metadata,
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};
