import { supabase } from './supabaseClient';

export interface KitovuCheckoutRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  reference: string;
  email?: string;
  description?: string;
}

export interface KitovuCheckoutResponse {
  success: boolean;
  reference?: string;
  kitovuReference?: string;
  message?: string;
}

export const createKitovuCheckout = async (
  params: KitovuCheckoutRequest
): Promise<KitovuCheckoutResponse> => {
  const { data, error } = await supabase.functions.invoke('kitovu-checkout', {
    body: params,
  });

  if (error) {
    throw new Error(error.message || 'Failed to initiate payment');
  }

  return data;
};

export const checkKitovuStatus = async (
  merchantReference: string
): Promise<{ status: string; amount?: number; currency?: string }> => {
  const { data, error } = await supabase
    .from('kitovu_transactions')
    .select('status, amount, currency')
    .eq('merchant_reference', merchantReference)
    .single();

  if (error) {
    throw new Error('Failed to check payment status');
  }

  return data;
};
