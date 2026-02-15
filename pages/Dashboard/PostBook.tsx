import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { BOOK_TYPES, BookType } from '../../types';

type Step = 'details' | 'files' | 'payment' | 'complete';

const BOOK_POSTING_FEE = 25.00;

const PostBook: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>('details');
    const [submitting, setSubmitting] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [createdBookId, setCreatedBookId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        author_name: '',
        description: '',
        type: BOOK_TYPES[0].value,
        price: 0,
        cover_url: '',
        pdf_url: '',
    });

    const canProceedToFiles = formData.title && formData.author_name && formData.type;
    const canProceedToPayment = formData.cover_url && formData.pdf_url;

    const handleCoverUpload = async (file: File) => {
        try {
            setUploadingCover(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            const { error } = await supabase.storage
                .from('book_covers')
                .upload(filePath, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('book_covers')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, cover_url: publicUrl }));
        } catch (error: any) {
            alert('Cover upload failed: ' + error.message);
        } finally {
            setUploadingCover(false);
        }
    };

    const handlePdfUpload = async (file: File) => {
        try {
            setUploadingPdf(true);
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.pdf`;
            const filePath = `pdfs/${fileName}`;

            const { error } = await supabase.storage
                .from('book_covers')
                .upload(filePath, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('book_covers')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, pdf_url: publicUrl }));
        } catch (error: any) {
            alert('PDF upload failed: ' + error.message);
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleMockPayment = async () => {
        if (!user) return;
        try {
            setProcessingPayment(true);

            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Insert book into database
            const { data, error } = await supabase.from('books').insert({
                title: formData.title,
                author_name: formData.author_name,
                description: formData.description,
                type: formData.type,
                price: formData.price,
                cover_url: formData.cover_url,
                pdf_url: formData.pdf_url,
                seller_id: user.id,
                status: 'pending',
            }).select().single();

            if (error) throw error;

            // Record mock transaction
            await supabase.from('transactions').insert({
                user_id: user.id,
                amount: BOOK_POSTING_FEE,
                currency: 'USD',
                type: 'book_purchase',
                status: 'completed',
                payment_method: 'mock_payment',
                description: `Book posting fee for "${formData.title}"`,
            });

            setCreatedBookId(data?.id || null);
            setStep('complete');
        } catch (error: any) {
            console.error('Error posting book:', error);
            alert('Failed to post book: ' + error.message);
        } finally {
            setProcessingPayment(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => navigate('/dashboard/books')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-4 transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to My Books
                    </button>
                    <h1 className="text-3xl font-extrabold text-slate-900">Post Your Book</h1>
                    <p className="text-slate-500 mt-1">Submit your book for publication on Nkiza Center.</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-0 mb-10">
                    {[
                        { key: 'details', label: 'Book Details', icon: 'edit_note' },
                        { key: 'files', label: 'Upload Files', icon: 'cloud_upload' },
                        { key: 'payment', label: 'Payment', icon: 'payments' },
                        { key: 'complete', label: 'Complete', icon: 'check_circle' },
                    ].map((s, i) => {
                        const steps: Step[] = ['details', 'files', 'payment', 'complete'];
                        const currentIndex = steps.indexOf(step);
                        const stepIndex = steps.indexOf(s.key as Step);
                        const isActive = stepIndex === currentIndex;
                        const isComplete = stepIndex < currentIndex;
                        return (
                            <React.Fragment key={s.key}>
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-primary text-white shadow-md' :
                                    isComplete ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-slate-100 text-slate-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-lg">{isComplete ? 'check_circle' : s.icon}</span>
                                    <span className="text-xs font-bold hidden sm:block">{s.label}</span>
                                </div>
                                {i < 3 && <div className={`flex-1 h-0.5 mx-1 ${isComplete ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Step 1: Book Details */}
                {step === 'details' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-in">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit_note</span>
                            Book Information
                        </h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                                    placeholder="Enter your book title"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Author Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.author_name}
                                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                    placeholder="Full name of the author"
                                />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Book Type <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as BookType })}
                                        className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none"
                                    >
                                        {BOOK_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selling Price (USD)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                    placeholder="Brief description of your book..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => setStep('files')}
                                disabled={!canProceedToFiles}
                                className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Upload Files */}
                {step === 'files' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-in">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">cloud_upload</span>
                            Upload Files
                        </h2>
                        <div className="space-y-8">
                            {/* Cover Image */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Cover Image <span className="text-red-500">*</span></label>
                                {formData.cover_url ? (
                                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                        <img src={formData.cover_url} alt="Cover" className="w-16 h-20 object-cover rounded-lg border" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">check_circle</span> Cover uploaded
                                            </p>
                                            <button onClick={() => setFormData({ ...formData, cover_url: '' })} className="text-xs text-emerald-600 hover:underline mt-1">Change</button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploadingCover ? 'border-primary/40 bg-primary/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary/30'}`}>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} disabled={uploadingCover} />
                                        <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">{uploadingCover ? 'sync' : 'image'}</span>
                                        <span className="text-sm font-bold text-slate-600">{uploadingCover ? 'Uploading...' : 'Click to upload cover image'}</span>
                                        <span className="text-xs text-slate-400 mt-1">JPG, PNG, or WebP (max 5MB)</span>
                                    </label>
                                )}
                            </div>

                            {/* PDF File */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Book PDF <span className="text-red-500">*</span></label>
                                {formData.pdf_url ? (
                                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                        <div className="w-12 h-14 bg-red-100 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-red-600">picture_as_pdf</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">check_circle</span> PDF uploaded
                                            </p>
                                            <button onClick={() => setFormData({ ...formData, pdf_url: '' })} className="text-xs text-emerald-600 hover:underline mt-1">Change</button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploadingPdf ? 'border-primary/40 bg-primary/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary/30'}`}>
                                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])} disabled={uploadingPdf} />
                                        <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">{uploadingPdf ? 'sync' : 'picture_as_pdf'}</span>
                                        <span className="text-sm font-bold text-slate-600">{uploadingPdf ? 'Uploading...' : 'Click to upload book PDF'}</span>
                                        <span className="text-xs text-slate-400 mt-1">PDF format only (max 50MB)</span>
                                    </label>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep('details')} className="px-6 py-3 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                            </button>
                            <button
                                onClick={() => setStep('payment')}
                                disabled={!canProceedToPayment}
                                className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                Continue to Payment <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {step === 'payment' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-in">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">payments</span>
                            Payment
                        </h2>

                        {/* Order Summary */}
                        <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Order Summary</h3>
                            <div className="flex items-center gap-4 mb-4">
                                {formData.cover_url && <img src={formData.cover_url} alt="" className="w-14 h-18 object-cover rounded-lg border" />}
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900">{formData.title}</p>
                                    <p className="text-sm text-slate-500">by {formData.author_name}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${formData.type === 'scholarly' ? 'bg-indigo-100 text-indigo-700' :
                                        formData.type === 'creative_content' ? 'bg-pink-100 text-pink-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {BOOK_TYPES.find(t => t.value === formData.type)?.label || formData.type}
                                    </span>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Book posting fee</span>
                                    <span className="font-bold text-slate-900">${BOOK_POSTING_FEE.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Platform commission</span>
                                    <span className="font-bold text-slate-900">Included</span>
                                </div>
                                <div className="flex justify-between text-base border-t border-slate-200 pt-3 mt-3">
                                    <span className="font-bold text-slate-900">Total</span>
                                    <span className="font-extrabold text-primary text-lg">${BOOK_POSTING_FEE.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mock Payment Notice */}
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6 flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-600 mt-0.5">info</span>
                            <div>
                                <p className="text-sm font-bold text-amber-800">Demo Payment Mode</p>
                                <p className="text-xs text-amber-600 mt-1">Payment processing is in demo mode. No real charges will be made. Your book will be submitted for review upon clicking "Pay & Submit".</p>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button onClick={() => setStep('files')} className="px-6 py-3 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                            </button>
                            <button
                                onClick={handleMockPayment}
                                disabled={processingPayment}
                                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {processingPayment ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">lock</span>
                                        Pay ${BOOK_POSTING_FEE.toFixed(2)} & Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Complete */}
                {step === 'complete' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center animate-in">
                        <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Book Submitted Successfully!</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            Your book "{formData.title}" has been submitted and is now pending review by our editorial team. You'll be notified once it's approved.
                        </p>

                        <div className="bg-slate-50 rounded-xl p-4 max-w-sm mx-auto mb-8 text-left space-y-2 border border-slate-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Status</span>
                                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase">Pending Review</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Payment</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">Paid</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Amount</span>
                                <span className="font-bold text-slate-900">${BOOK_POSTING_FEE.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard/books')}
                                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">library_books</span> My Books
                            </button>
                            <button
                                onClick={() => {
                                    setStep('details');
                                    setFormData({ title: '', author_name: '', description: '', type: BOOK_TYPES[0].value, price: 0, cover_url: '', pdf_url: '' });
                                }}
                                className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Post Another Book
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostBook;
