import { supabase } from './supabaseClient';

export interface PesapalCheckoutRequest {
  amount: number;
  currency?: string;
  reference: string;
  description?: string;
  callbackUrl: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  userId?: string;
  refType?: string;
  refId?: string;
}

export interface PesapalCheckoutResponse {
  success: boolean;
  redirectUrl?: string;
  orderTrackingId?: string;
  merchantReference?: string;
  message?: string;
}

export const createPesapalCheckout = async (
  params: PesapalCheckoutRequest
): Promise<PesapalCheckoutResponse> => {
  const { data, error } = await supabase.functions.invoke('pesapal-checkout', {
    body: params,
  });

  if (error) {
    throw new Error(error.message || 'Failed to initiate payment');
  }

  return data;
};

export const checkPesapalStatus = async (
  orderTrackingId: string
): Promise<{
  status: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
} | null> => {
  const { data, error } = await supabase
    .from('pesapal_transactions')
    .select('status, amount, currency, payment_method')
    .eq('order_tracking_id', orderTrackingId)
    .maybeSingle();

  if (error) {
    throw new Error('Failed to check payment status');
  }

  return data;
};

export const generatePesapalReference = (prefix: string, id: string): string => {
  const shortId = (id || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  return `${prefix}_${shortId}_${Date.now()}`.slice(0, 50);
};
