import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface ItemDetails {
    title: string;
    price: number;
    currency: string;
    description?: string;
    whop_product_id?: string | null;
}

const CheckoutPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const packageId = searchParams.get('package_id');

    const [item, setItem] = useState<ItemDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'manual' | 'polar' | 'whop'>('manual');
    const [paymentSettings, setPaymentSettings] = useState<Record<string, string>>({});

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
        fetchPaymentSettings();
    }, [type, id, packageId, user]);

    const fetchItemDetails = async () => {
        try {
            setLoading(true);
            if (type === 'book') {
                const { data, error } = await supabase
                    .from('books')
                    .select('title, price, whop_product_id')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                setItem({ ...data, currency: 'USD' });
            } else if (type === 'manuscript') {
                const { data: manuscript, error: manError } = await supabase
                    .from('manuscripts')
                    .select('title, whop_product_id')
                    .eq('id', id)
                    .single();
                if (manError) throw manError;

                if (packageId) {
                    const { data: pkg, error: pkgError } = await supabase
                        .from('publication_packages')
                        .select('name, price, currency, whop_product_id')
                        .eq('id', packageId)
                        .single();
                    if (pkgError) throw pkgError;
                    setItem({
                        title: `APC Fee: ${manuscript.title}`,
                        price: parseFloat(pkg.price),
                        currency: pkg.currency,
                        description: `Package: ${pkg.name}`,
                        whop_product_id: pkg.whop_product_id || manuscript.whop_product_id
                    });
                }
            } else if (type === 'article') {
                const { data, error } = await supabase
                    .from('manuscripts')
                    .select('title, price, currency, whop_product_id')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                setItem({
                    title: `Article Access: ${data.title}`,
                    price: data.price || 0,
                    currency: data.currency || 'USD',
                    description: 'Full text access (PDF download)',
                    whop_product_id: data.whop_product_id
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
                    .select('name, price, currency, whop_product_id')
                    .eq('id', journal.subscription_package_id)
                    .single();
                if (pkgError) throw pkgError;

                setItem({
                    title: `Subscription: ${journal.title}`,
                    price: parseFloat(pkg.price),
                    currency: pkg.currency,
                    description: `Package: ${pkg.name} (Access to all articles)`,
                    whop_product_id: pkg.whop_product_id
                });
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentSettings = async () => {
        const { data } = await supabase
            .from('site_settings')
            .select('key, value')
            .eq('category', 'payment');
        if (data) {
            const map: Record<string, string> = {};
            data.forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
            setPaymentSettings(map);
        }
    };

    // Helper to interpret boolean flags from settings (stored as strings)
    const isEnabled = (key: string, defaultValue: boolean) => {
        const raw = paymentSettings[key];
        if (raw === undefined) return defaultValue;
        const normalized = raw.toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
        if (['false', '0', 'no', 'off'].includes(normalized)) return false;
        return defaultValue;
    };

    const itemWhopProductId = (item as any)?.whop_product_id;

    const whopUrl = itemWhopProductId
        ? `https://whop.com/checkout/${itemWhopProductId}`
        : (type === 'subscription' && paymentSettings.whop_subscription_checkout_url) ||
        (type === 'article' && paymentSettings.whop_article_checkout_url) ||
        (type === 'book' && paymentSettings.whop_book_checkout_url) ||
        // Check if whop_checkout_url is just a product ID or a full URL
        (paymentSettings.whop_checkout_url?.startsWith('http')
            ? paymentSettings.whop_checkout_url
            : `https://whop.com/checkout/${paymentSettings.whop_checkout_url}`);

    const isWhopEnabled = false;
    const isPolarEnabled = false;
    const isManualEnabled = true;

    // Default to manual
    useEffect(() => {
        if (!item) return;
        setPaymentMethod('manual');
    }, [item]);

    const handleConfirmOrder = async () => {
        if (!user || !item) return;

        try {
            setProcessing(true);

            // Free item — auto-complete without payment
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

            // Guard against selecting a disabled method
            if (paymentMethod === 'whop' && !isWhopEnabled) {
                alert('Whop payments are currently disabled. Please choose another payment method.');
                setProcessing(false);
                return;
            }
            if (paymentMethod === 'polar' && !isPolarEnabled) {
                alert('Polar payments are currently disabled. Please choose another payment method.');
                setProcessing(false);
                return;
            }
            if (paymentMethod === 'manual' && !isManualEnabled) {
                alert('Manual bank transfers are currently disabled. Please choose another payment method.');
                setProcessing(false);
                return;
            }

            if (paymentMethod === 'whop') {
                // Whop checkout via dynamic API checkout session
                const whopProductId = paymentSettings.whop_checkout_url || 'prod_PiiwGSfXpchGv';

                if (!whopProductId) {
                    alert('Whop is not configured. Please contact the site administrator.');
                    setProcessing(false);
                    return;
                }

                try {
                    const { data: result, error: fnError } = await supabase.functions.invoke('whop-checkout', {
                        body: {
                            productId: whopProductId,
                            price: item?.price || 0,
                            currency: item?.currency || 'usd',
                            itemName: item?.title || '',
                            email: user.email || '',
                            userId: user.id,
                            itemId: id || '',
                            itemType: type || '',
                            packageId: packageId || '',
                            returnUrl: window.location.origin + '/dashboard',
                        },
                    });

                    if (fnError || !result?.checkoutUrl) {
                        console.error('Whop checkout error:', fnError || result);
                        alert('Failed to create Whop checkout. Please try again or choose another payment method.');
                        setProcessing(false);
                        return;
                    }

                    window.location.href = result.checkoutUrl;
                } catch (whopError) {
                    console.error('Whop checkout error:', whopError);
                    alert('Failed to create checkout session. Please try again.');
                    setProcessing(false);
                }
                return;
            }

            if (paymentMethod === 'polar') {
                // Polar Payment Flow
                try {
                    const { createCheckoutSession } = await import('../../lib/polar');

                    // Build metadata, resolving packageId for subscriptions
                    let resolvedPackageId: string | undefined = undefined;
                    if (type === 'subscription') {
                        const { data: journal } = await supabase
                            .from('journals')
                            .select('subscription_package_id')
                            .eq('id', id)
                            .single();
                        resolvedPackageId = journal?.subscription_package_id || undefined;
                    } else if (type === 'manuscript') {
                        resolvedPackageId = packageId || undefined;
                    }

                    const response = await createCheckoutSession(
                        item.price,
                        item.currency,
                        user.email || '',
                        {
                            userId: user.id,
                            type: type || 'general',
                            itemId: id || 'unknown',
                            ...(resolvedPackageId ? { packageId: resolvedPackageId } : {})
                        }
                    );

                    // Redirect to Polar Checkout Page
                    if (response?.url) {
                        window.location.href = response.url;
                        return;
                    } else {
                        throw new Error("No checkout URL returned from payment provider.");
                    }
                } catch (polarError: any) {
                    console.error("Polar Flow Error:", polarError);
                    alert("Payment Error: " + (polarError.message || "Failed to initialize checkout session. Please try again or use bank transfer."));
                    setProcessing(false);
                    return;
                }
            }

            // Manual Bank Transfer Flow
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
                // For subscriptions, we need the package_id linked to the journal
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

    if (orderSuccess) {
        const isFree = item && item.price <= 0;
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl font-bold">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">{isFree ? 'Access Granted!' : 'Order Received!'}</h2>
                    <p className="text-slate-500 mb-8">
                        {isFree
                            ? 'This item is free. You now have full access — enjoy!'
                            : <>Your order is now <strong>PENDING</strong>. Please proceed with the payment via Bank Transfer and send the proof to our finance team.</>}
                    </p>

                    {!isFree && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left mb-8">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Payment Instructions</p>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">Account number: 100166537511</p>
                                    <p className="text-sm font-bold text-slate-900">Bank name: Bank of Kigali</p>
                                    <p className="text-sm font-bold text-slate-900">Account name: Nkiza ltd</p>
                                </div>
                                <div className="h-px bg-slate-200 my-4"></div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">Mtn momo code: *182*8*1*912672#</p>
                                    <p className="text-sm font-bold text-slate-900">Names: Parfai</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => navigate(isFree ? -1 as any : '/dashboard')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                    >
                        {isFree ? 'Go Back' : 'Go to Dashboard'}
                    </button>
                    {!isFree && <p className="mt-4 text-xs text-slate-400">Your content will be activated once payment is verified by an Admin.</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Item Info */}
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
                            <span className="text-2xl font-black text-slate-900">{item && item.price <= 0 ? 'Free' : `${item?.currency} ${item?.price.toFixed(2)}`}</span>
                        </div>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                        <span className="material-symbols-outlined text-amber-600">info</span>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            <strong>Note:</strong> We currently only support manual payments (Bank Transfer and MTN Mobile Money). Your content will be activated once payment is verified.
                        </p>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 underline decoration-primary decoration-4 underline-offset-8">Payment Method</p>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                                    </div>
                                    <span className="font-bold text-slate-900">Manual Payment (Bank / MTN Momo)</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Offline</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Summary & Action */}
                <div className="lg:pt-24">
                    <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl sticky top-8">
                        <h2 className="text-xl font-bold mb-8">Summary</h2>
                        <div className="space-y-4 mb-10 text-slate-400 font-medium">
                            <div className="flex justify-between items-center">
                                <span>Subtotal</span>
                                <span className="text-white">{item?.currency} {item?.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Tax (0%)</span>
                                <span className="text-white">$0.00</span>
                            </div>
                            <div className="h-px bg-slate-800 my-2"></div>
                            <div className="flex justify-between items-center text-white text-lg font-bold">
                                <span>Total to Pay</span>
                                <span className="text-2xl font-black">{item?.currency} {item?.price.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmOrder}
                            disabled={processing}
                            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/40 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Confirm Order'}
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
