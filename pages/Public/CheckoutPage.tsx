import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { createKitovuCheckout, checkKitovuStatus } from '../../lib/kitovu';
import { createPesapalCheckout, checkPesapalStatus, generatePesapalReference } from '../../lib/pesapal';

interface ItemDetails {
    title: string;
    price: number;
    currency: string;
    description?: string;
}

type PaymentMethod = 'pesapal' | 'kitovu' | 'manual';

const CheckoutPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const packageId = searchParams.get('package_id');
    const paymentStatus = searchParams.get('payment');
    const callbackTrackingId = searchParams.get('OrderTrackingId');

    const [item, setItem] = useState<ItemDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const mobileNetwork = 'mtn' as const;
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pesapal');
    const [kitovuFailed, setKitovuFailed] = useState(false);
    const [pesapalFailed, setPesapalFailed] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [kitovuPending, setKitovuPending] = useState(false);
    const [kitovuReference, setKitovuReference] = useState('');
    const [kitovuPaid, setKitovuPaid] = useState(false);

    useEffect(() => {
        if (paymentStatus === 'cancelled') {
            alert('Payment was cancelled. You can try again.');
        }
    }, [paymentStatus]);

    useEffect(() => {
        if (!loading && !user) {
            const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
            navigate(`/login?redirect=${currentUrl}`);
            return;
        }

        if (!type || !id) {
            navigate('/');
            return;
        }
        fetchItemDetails();
    }, [type, id, packageId, user]);

    useEffect(() => {
        if (callbackTrackingId) {
            setVerifying(true);
            const poll = setInterval(async () => {
                try {
                    const result = await checkPesapalStatus(callbackTrackingId);
                    if (result && result.status !== 'pending') {
                        clearInterval(poll);
                        setVerifying(false);
                        if (result.status === 'completed') {
                            setOrderSuccess(true);
                        } else {
                            alert(`Payment ${result.status}. Please try again or contact support.`);
                        }
                    }
                } catch (error) {
                    console.error('Status check error:', error);
                }
            }, 4000);

            setTimeout(() => clearInterval(poll), 120000);

            return () => clearInterval(poll);
        }
    }, [callbackTrackingId]);

    useEffect(() => {
        if (!kitovuPending || !kitovuReference) return;

        const deadline = Date.now() + 180000;

        const poll = setInterval(async () => {
            try {
                const status = await checkKitovuStatus(kitovuReference);
                if (!status) return;

                if (status.status === 'completed') {
                    clearInterval(poll);
                    setKitovuPending(false);
                    setKitovuPaid(true);
                    setOrderSuccess(true);
                } else if (status.status === 'failed') {
                    clearInterval(poll);
                    setKitovuPending(false);
                    setKitovuFailed(true);
                    setPaymentMethod('manual');
                    alert('Payment failed. Please try again or use Bank Transfer.');
                } else if (Date.now() > deadline) {
                    clearInterval(poll);
                    setKitovuPending(false);
                    setKitovuFailed(true);
                    setPaymentMethod('manual');
                    alert('Payment confirmation timed out. If you paid, contact support with your reference.');
                }
            } catch (error) {
                console.error('Kitovu status check error:', error);
            }
        }, 4000);

        return () => clearInterval(poll);
    }, [kitovuPending, kitovuReference]);

    const fetchItemDetails = async () => {
        try {
            setLoading(true);
            if (type === 'book') {
                const { data, error } = await supabase
                    .from('books')
                    .select('title, price')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                setItem({ ...data, currency: 'RWF' });
            } else if (type === 'manuscript') {
                const { data: manuscript, error: manError } = await supabase
                    .from('manuscripts')
                    .select('title')
                    .eq('id', id)
                    .single();
                if (manError) throw manError;

                if (packageId) {
                    const { data: pkg, error: pkgError } = await supabase
                        .from('publication_packages')
                        .select('name, price, currency')
                        .eq('id', packageId)
                        .single();
                    if (pkgError) throw pkgError;
                    setItem({
                        title: `APC Fee: ${manuscript.title}`,
                        price: parseFloat(pkg.price),
                        currency: pkg.currency,
                        description: `Package: ${pkg.name}`
                    });
                } else {
                    setItem({
                        title: `APC Fee: ${manuscript.title}`,
                        price: 0,
                        currency: 'RWF',
                        description: 'Manuscript processing fee'
                    });
                }
            } else if (type === 'article') {
                const { data, error } = await supabase
                    .from('manuscripts')
                    .select('title, price, currency')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                setItem({
                    title: `Article Access: ${data.title}`,
                    price: data.price || 0,
                    currency: data.currency || 'RWF',
                    description: 'Full text access (PDF download)'
                });
            } else if (type === 'subscription') {
                const { data: journal, error: journalError } = await supabase
                    .from('journals')
                    .select('title, subscription_package_id')
                    .eq('id', id)
                    .single();
                if (journalError) throw journalError;

                if (!journal.subscription_package_id) throw new Error('Journal has no subscription package');

                const { data: pkg, error: pkgError } = await supabase
                    .from('publication_packages')
                    .select('name, price, currency')
                    .eq('id', journal.subscription_package_id)
                    .single();
                if (pkgError) throw pkgError;

                setItem({
                    title: `Subscription: ${journal.title}`,
                    price: parseFloat(pkg.price),
                    currency: pkg.currency,
                    description: `Package: ${pkg.name} (Access to all articles)`
                });
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const generateReference = () => {
        const prefix = type === 'subscription' ? 'subscription' :
            type === 'manuscript' ? 'apc' :
                type === 'book' ? 'book' : 'article';
        return `${prefix}_${id}_${Date.now()}`;
    };

    const handleConfirmOrder = async () => {
        if (!user || !item) return;

        try {
            setProcessing(true);

            if (item.price <= 0) {
                const transactionData: any = {
                    user_id: user.id,
                    amount: 0,
                    currency: item.currency,
                    type: type === 'subscription' ? 'journal_subscription' :
                        (type === 'book' || type === 'article') ? 'purchase' : 'apc_payment',
                    status: 'completed',
                    description: `Free access: ${item.title}`,
                    payment_gateway: 'free'
                };

                if (type === 'book') transactionData.book_id = id;
                if (type === 'manuscript') {
                    transactionData.manuscript_id = id;
                    transactionData.package_id = packageId;
                }
                if (type === 'article') transactionData.manuscript_id = id;
                if (type === 'subscription') {
                    const { data: journal } = await supabase
                        .from('journals')
                        .select('subscription_package_id')
                        .eq('id', id)
                        .single();
                    transactionData.package_id = journal?.subscription_package_id;
                }

                const { error } = await supabase.from('transactions').insert([transactionData]);
                if (error) throw error;

                setOrderSuccess(true);
                setProcessing(false);
                return;
            }

            if (paymentMethod === 'pesapal' && !pesapalFailed) {
                const reference = generatePesapalReference(
                    type === 'subscription' ? 'subscription' :
                        type === 'manuscript' ? 'apc' :
                            type === 'book' ? 'book' : 'article',
                    id || ''
                );

                const callbackUrl = `${window.location.origin}/checkout?type=${type}&id=${id}${packageId ? `&package_id=${packageId}` : ''}`;

                const result = await createPesapalCheckout({
                    amount: item.price,
                    currency: item.currency,
                    reference,
                    description: `Payment for ${item.title}`,
                    callbackUrl,
                    firstName: user.user_metadata?.full_name || '',
                    email: user.email || '',
                    phoneNumber: phoneNumber || '',
                    userId: user.id,
                    refType: type || '',
                    refId: id || '',
                });

                if (!result.success || !result.redirectUrl) {
                    console.error('PesaPal checkout failed:', result.message);
                    setPesapalFailed(true);
                    setPaymentMethod('kitovu');
                    setProcessing(false);
                    alert('Online payment is temporarily unavailable. Please use Mobile Money instead.');
                    return;
                }

                window.location.href = result.redirectUrl;
                return;
            }

            if (paymentMethod === 'kitovu' && !kitovuFailed) {
                const reference = generateReference();

                const result = await createKitovuCheckout({
                    amount: item.price,
                    phoneNumber: phoneNumber,
                    reference,
                    senderName: user.user_metadata?.full_name || user.email || 'Customer',
                    description: `Payment for ${item.title}`,
                    paymentRail: mobileNetwork,
                    userId: user.id,
                    refType: type === 'subscription' ? 'subscription' :
                        type === 'manuscript' ? 'apc' :
                            type === 'book' ? 'book' : 'article',
                    refId: id || '',
                });

                const transactionData: any = {
                    user_id: user.id,
                    amount: item.price,
                    currency: item.currency,
                    type: type === 'subscription' ? 'journal_subscription' :
                        (type === 'book' || type === 'article') ? 'purchase' : 'apc_payment',
                    status: result.fallback ? 'pending' : 'pending',
                    description: result.fallback
                        ? `Order for ${item.title}`
                        : `KitovuPay:${reference}`,
                    payment_gateway: result.fallback ? 'manual' : 'kitovu'
                };

                if (type === 'book') transactionData.book_id = id;
                if (type === 'manuscript') {
                    transactionData.manuscript_id = id;
                    transactionData.package_id = packageId;
                }
                if (type === 'article') {
                    transactionData.manuscript_id = id;
                }
                if (type === 'subscription') {
                    const { data: journal } = await supabase
                        .from('journals')
                        .select('subscription_package_id')
                        .eq('id', id)
                        .single();
                    transactionData.package_id = journal?.subscription_package_id;
                }

                const { error } = await supabase
                    .from('transactions')
                    .insert([transactionData]);

                if (error) throw error;

                if (result.fallback) {
                    setKitovuFailed(true);
                    setPaymentMethod('manual');
                    setProcessing(false);
                    return;
                }

                setKitovuReference(reference);
                setKitovuPending(true);
                setProcessing(false);
                return;
            }

            const transactionData: any = {
                user_id: user.id,
                amount: item.price,
                currency: item.currency,
                type: type === 'subscription' ? 'journal_subscription' :
                    (type === 'book' || type === 'article') ? 'purchase' : 'apc_payment',
                status: 'pending',
                description: `Order for ${item.title}`,
                payment_gateway: 'manual'
            };

            if (type === 'book') transactionData.book_id = id;
            if (type === 'manuscript') {
                transactionData.manuscript_id = id;
                transactionData.package_id = packageId;
            }
            if (type === 'article') {
                transactionData.manuscript_id = id;
            }
            if (type === 'subscription') {
                const { data: journal } = await supabase
                    .from('journals')
                    .select('subscription_package_id')
                    .eq('id', id)
                    .single();
                transactionData.package_id = journal?.subscription_package_id;
            }

            const { error } = await supabase
                .from('transactions')
                .insert([transactionData]);

            if (error) throw error;

            setOrderSuccess(true);
        } catch (error: any) {
            console.error('Order error:', error);
            alert('Failed to place order: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl font-bold animate-spin">autorenew</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Verifying Payment</h2>
                    <p className="text-slate-500 mb-8">
                        Please wait while we confirm your payment with PesaPal. This may take a few seconds...
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (kitovuPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl font-bold animate-spin">autorenew</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Confirm Payment on Your Phone</h2>
                    <p className="text-slate-500 mb-8">
                        A payment request has been sent to <strong className="text-slate-900">{phoneNumber}</strong> via Mobile Money.
                        Please check your phone and enter your PIN to approve the payment.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Waiting for confirmation...</p>
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-700">
                            <span className="material-symbols-outlined animate-pulse text-primary">smartphone</span>
                            Approve on your phone
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (orderSuccess) {
        const isFree = item && item.price <= 0;
        const viaKitovu = !isFree && paymentMethod === 'kitovu' && !kitovuFailed;
        const viaPesapal = !isFree && paymentMethod === 'pesapal' && !pesapalFailed;
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl font-bold">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        {isFree ? 'Access Granted!' : viaKitovu ? 'Payment Successful!' : viaPesapal ? 'Payment Successful!' : 'Order Received!'}
                    </h2>
                    <p className="text-slate-500 mb-8">
                        {isFree
                            ? 'This item is free. You now have full access — enjoy!'
                            : viaKitovu
                                ? <>Your payment of <strong className="text-slate-900">{(item?.price || 0).toLocaleString()} RWF</strong> was confirmed. Your content has been activated.</>
                                : viaPesapal
                                    ? <>Your payment was processed successfully via <strong className="text-slate-900">PesaPal</strong>. Your content has been activated.</>
                                    : <>Your order is now <strong>PENDING</strong>. Please proceed with the payment via Bank Transfer and send the proof to our finance team.</>}
                    </p>

                    {!isFree && !viaPesapal && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left mb-8">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">
                                {viaKitovu ? 'Transaction Details' : 'Payment Instructions'}
                            </p>
                            {viaKitovu ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-slate-700">Amount: <strong className="text-slate-900">{(item?.price || 0).toLocaleString()} RWF</strong></p>
                                    <p className="text-sm text-slate-700">Mobile Money: <strong className="text-slate-900">{phoneNumber}</strong></p>
                                    <p className="text-sm text-slate-700">Reference: <strong className="text-slate-900">{kitovuReference.slice(0, 20)}</strong></p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">Account number: 100166537511</p>
                                        <p className="text-sm font-bold text-slate-900">Bank name: Bank of Kigali</p>
                                        <p className="text-sm font-bold text-slate-900">Account name: Nkiza ltd</p>
                                    </div>
                                    <div className="h-px bg-slate-200 my-4"></div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">MTN MoMo: *182*8*1*912672#</p>
                                        <p className="text-sm font-bold text-slate-900">Names: Parfai</p>
                                        <p className="text-sm font-bold text-slate-900">Airtel Money: *182*8*1*912672#</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => navigate(isFree ? -1 as any : '/dashboard')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                    >
                        {isFree ? 'Go Back' : 'Go to Dashboard'}
                    </button>
                    {!isFree && !viaPesapal && <p className="mt-4 text-xs text-slate-400">Your content will be activated once payment is verified.</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-6 font-bold text-sm">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Checkout</h1>
                        <p className="text-slate-500 mt-2">Complete your purchase to gain access.</p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 underline decoration-primary decoration-4 underline-offset-8">Order Details</p>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <span className="material-symbols-outlined text-2xl">{type === 'book' ? 'auto_stories' : 'description'}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{item?.title}</h3>
                                {item?.description && <p className="text-sm text-slate-500">{item.description}</p>}
                                <p className="text-xs text-slate-400 mt-1 capitalize">Item Type: {type}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center">
                            <span className="text-slate-500 font-bold">Price</span>
                            <span className="text-2xl font-black text-slate-900">{item && item.price <= 0 ? 'Free' : `${(item?.price || 0).toLocaleString()} RWF`}</span>
                        </div>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                        <span className="material-symbols-outlined text-amber-600">info</span>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            <strong>Note:</strong> Your content will be activated once payment is verified.{' '}
                            After paying, please call or text us on WhatsApp at <strong>+250 732 752 616</strong> so we can approve your payment as fast as possible.
                        </p>
                    </div>
                </div>

                <div className="lg:pt-24">
                    <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl sticky top-8">
                        <h2 className="text-xl font-bold mb-8">Summary</h2>
                        <div className="space-y-4 mb-10 text-slate-400 font-medium">
                            <div className="flex justify-between items-center">
                                <span>Subtotal</span>
                                <span className="text-white">{(item?.price || 0).toLocaleString()} RWF</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Tax (0%)</span>
                                <span className="text-white">0 RWF</span>
                            </div>
                            <div className="h-px bg-slate-800 my-2"></div>
                            <div className="flex justify-between items-center text-white text-lg font-bold">
                                <span>Total to Pay</span>
                                <span className="text-2xl font-black">{(item?.price || 0).toLocaleString()} RWF</span>
                            </div>
                        </div>

                        {item && item.price > 0 && (
                            <div className="space-y-4 mb-6">
                                <div className="bg-slate-800 rounded-xl p-1">
                                    <button
                                        onClick={() => { setPaymentMethod('pesapal'); setPesapalFailed(false); }}
                                        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'pesapal' && !pesapalFailed
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg align-middle mr-2">credit_card</span>
                                        Card Payment (Visa / Mastercard)
                                    </button>
                                    <button
                                        onClick={() => { setPaymentMethod('kitovu'); setKitovuFailed(false); }}
                                        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'kitovu' && !kitovuFailed
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg align-middle mr-2">smartphone</span>
                                        Mobile Money (MTN MoMo)
                                    </button>
                                </div>

                                {paymentMethod === 'pesapal' && !pesapalFailed && (
                                    <div className="p-4 bg-slate-800 rounded-xl flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">credit_card</span>
                                        <div>
                                            <p className="text-sm font-bold text-white">Secure Card Payment</p>
                                            <p className="text-[11px] text-slate-400">Visa / Mastercard via PesaPal. You will be redirected to complete payment.</p>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'kitovu' && (
                                    <div>
                                        <p className="text-xs font-bold text-yellow-400 mb-3">MTN MoMo</p>
                                        <label className="block text-xs text-slate-400 font-bold mb-2">
                                            Mobile Money Number <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="e.g. 0788123456"
                                            className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                                        />
                                        <p className="text-[10px] text-slate-500 mt-2">Select your network, then enter your phone number. You will receive a payment request — enter your MoMo PIN to confirm.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleConfirmOrder}
                            disabled={processing || (paymentMethod === 'kitovu' && !kitovuFailed && !phoneNumber && (item?.price || 0) > 0)}
                            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/40 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' :
                                paymentMethod === 'kitovu' && !kitovuFailed && (item?.price || 0) > 0
                                    ? `Pay ${(item?.price || 0).toLocaleString()} RWF`
                                    : 'Continue to Payment'}
                        </button>

                        <div className="flex items-center justify-center gap-2 mt-8 opacity-50">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Order Processing</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
