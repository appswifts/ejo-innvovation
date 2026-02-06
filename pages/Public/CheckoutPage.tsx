import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface ItemDetails {
    title: string;
    price: number;
    currency: string;
    description?: string;
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

    useEffect(() => {
        if (!type || !id) {
            navigate('/');
            return;
        }
        fetchItemDetails();
    }, [type, id, packageId]);

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
                setItem({ ...data, currency: 'USD' });
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
                }
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!user || !item) return;

        try {
            setProcessing(true);

            const transactionData: any = {
                user_id: user.id,
                amount: item.price,
                currency: item.currency,
                type: type === 'book' ? 'purchase' : 'apc_payment',
                status: 'pending',
                description: `Order for ${item.title}`,
            };

            if (type === 'book') transactionData.book_id = id;
            if (type === 'manuscript') {
                transactionData.manuscript_id = id;
                transactionData.package_id = packageId;
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl font-bold">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Order Received!</h2>
                    <p className="text-slate-500 mb-8">Your order is now <strong>PENDING</strong>. Please proceed with the payment via Bank Transfer and send the proof to our finance team.</p>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left mb-8">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Payment Instructions</p>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold text-slate-400">Bank Name</p>
                                <p className="text-sm font-bold text-slate-900">National Bank of Rwanda</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400">Account Number</p>
                                <p className="text-sm font-bold text-slate-900">000123-456789-01</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400">Account Name</p>
                                <p className="text-sm font-bold text-slate-900">Nkiza Academic Journals Ltd</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                    >
                        Go to Dashboard
                    </button>
                    <p className="mt-4 text-xs text-slate-400">Your content will be activated once payment is verified by an Admin.</p>
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
                            <span className="text-2xl font-black text-slate-900">{item?.currency} {item?.price.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                        <span className="material-symbols-outlined text-amber-600">info</span>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            <strong>Note:</strong> We currently only support manual bank transfers. After confirming your order, you will receive our bank details. Your purchase will be activated after our finance team verifies the transfer.
                        </p>
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
