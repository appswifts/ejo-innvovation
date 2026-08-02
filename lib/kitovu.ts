import { supabase } from './supabaseClient';

export interface KitovuCheckoutRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
  senderName?: string;
  description?: string;
  paymentRail?: 'mtn';
  userId?: string;
  refType?: string;
  refId?: string;
}

export interface KitovuCheckoutResponse {
  success: boolean;
  reference?: string;
  kitovuReference?: string;
  message?: string;
  transactionStatus?: string;
  fallback?: boolean;
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
): Promise<{ status: string; amount?: number; currency?: string } | null> => {
  const { data, error } = await supabase.functions.invoke('kitovu-status', {
    body: { merchantReference },
  });

  if (error) {
    throw new Error('Failed to check payment status');
  }

  return data?.transaction ?? null;
};
