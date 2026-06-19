import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import TopNav from '../../components/TopNav';
import { ViewState } from '../../types';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Book {
    id: string;
    title: string;
    pdf_url: string | null;
    seller_id: string | null;
    price: number;
}

const BookReader: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [isEditor, setIsEditor] = useState(false);
    const [numPages, setNumPages] = useState<number>(0);
    const flipBookRef = useRef<any>(null);

    useEffect(() => {
        if (id) {
            checkAccessAndFetchBook();
        }
    }, [id, user]);

    const checkAccessAndFetchBook = async () => {
        try {
            setLoading(true);

            // 1. Fetch Book Details
            const { data: bookData, error: bookError } = await supabase
                .from('books')
                .select('id, title, pdf_url, seller_id, price')
                .eq('id', id)
                .single();

            if (bookError || !bookData) throw new Error('Book not found');
            setBook(bookData);

            // 2. Check Purchase Status (unless it's free, but here we assume all need purchase or are restricted)
            // For now, we check if there's a successful transaction for this book_id by this user
            if (!user) {
                setHasAccess(false);
                setLoading(false);
                return;
            }

            const { data: transaction, error: transError } = await supabase
                .from('transactions')
                .select('id')
                .eq('user_id', user.id)
                .eq('book_id', id)
                .eq('status', 'completed')
                .maybeSingle();

            // If user is super_admin, they always have access
            // (This logic might be expanded if we have a proper usePermissions hook)
            const { data: profile } = await supabase
                .from('profiles')
                .select('role_id')
                .eq('id', user.id)
                .single();

            const { data: role } = await supabase
                .from('roles')
                .select('slug')
                .eq('id', profile?.role_id)
                .single();

            const isUserEditor = ['super_admin', 'editor'].includes(role?.slug);
            if (isUserEditor) {
                setIsEditor(true);
            }

            if (isUserEditor || transaction || bookData.seller_id === user.id) {
                setHasAccess(true);
            } else {
                // 3. Whop Direct Check Fallback
                try {
                    const { data: whopCheck, error: whopError } = await supabase.functions.invoke('whop-check', {
                        body: { email: user.email, refId: id }
                    });

                    if (!whopError && whopCheck?.hasAccess) {
                        setHasAccess(true);
                        // Pro-actively sync to local transactions
                        await supabase.from('transactions').insert({
                            user_id: user.id,
                            amount: bookData.price || 0,
                            currency: 'RWF',
                            type: 'purchase',
                            status: 'completed',
                            payment_gateway: 'whop',
                            description: `Direct check recovery: ${bookData.title}`,
                            book_id: id
                        });
                    } else {
                        setHasAccess(false);
                    }
                } catch (err) {
                    console.error("Whop fallback check failed", err);
                    setHasAccess(false);
                }
            }

        } catch (err) {
            console.error('Reader Error:', err);
            navigate('/books');
        } finally {
            setLoading(false);
        }
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Initializing Reader...</p>
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10">
                    <span className="material-symbols-outlined text-6xl text-primary mb-6">lock</span>
                    <h2 className="text-2xl font-black text-white mb-4">Access Restricted</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">You haven't purchased this title yet. Please complete the payment to unlock the full digital experience.</p>
                    <button
                        onClick={() => navigate('/books')}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    if (!book?.pdf_url) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10">
                    <span className="material-symbols-outlined text-6xl text-slate-500 mb-6">cloud_off</span>
                    <h2 className="text-2xl font-black text-white mb-4">Content Unavailable</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">The digital source for this book has not been uploaded yet. Please contact support.</p>
                    <button
                        onClick={() => navigate('/books')}
                        className="w-full bg-white/10 text-white py-4 rounded-2xl font-black hover:bg-white/20 transition-all"
                    >
                        Return to Store
                    </button>
                </div>
            </div>
        );
    }

    const handleDownload = async () => {
        if (!book?.pdf_url) return;

        try {
            let path = book.pdf_url;
            // Extract relative path if it's a full Supabase URL
            // Handles: public URLs, signed URLs, URLs with query params
            if (path.includes('supabase.co')) {
                const match = path.match(/\/library\/([^?#]+)/);
                if (match) path = match[1];
            }

            // If the original URL looks like a direct public URL, try it first
            if (book.pdf_url.includes('/object/public/')) {
                window.open(book.pdf_url, '_blank');
                return;
            }

            const { data, error } = await supabase.storage
                .from('library')
                .createSignedUrl(path, 300); // 5 minutes

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err) {
            console.error('Download error:', err);
            // Fallback to direct link if signed URL fails
            window.open(book.pdf_url, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
            {/* Reader Controls */}
            <header className="h-[70px] bg-slate-900/50 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/books')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-primary hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-white font-black text-sm tracking-tight truncate max-w-[300px]">{book.title}</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Publication</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-full border border-white/5">
                    <button
                        onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className="px-4 text-[11px] font-black text-white tabular-nums border-x border-white/10">
                        SCANNING PAGES
                    </div>
                    <button
                        onClick={() => flipBookRef.current?.pageFlip().flipNext()}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-primary hover:text-white transition-all"
                        title="Download PDF"
                    >
                        <span className="material-symbols-outlined">download</span>
                    </button>
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
                        onClick={() => {
                            if (!document.fullscreenElement) {
                                document.documentElement.requestFullscreen();
                            } else {
                                if (document.exitFullscreen) {
                                    document.exitFullscreen();
                                }
                            }
                        }}
                    >
                        <span className="material-symbols-outlined">fullscreen</span>
                    </button>
                </div>
            </header>

            {/* Flipbook Container */}
            <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                <div className="w-full max-w-[1400px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                    <Document
                        file={book.pdf_url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="text-center text-slate-500 font-bold">
                                Loading Document...
                            </div>
                        }
                    >
                        <HTMLFlipBook
                            width={700}
                            height={980}
                            size="stretch"
                            minWidth={315}
                            maxWidth={1400}
                            minHeight={400}
                            maxHeight={1960}
                            maxShadowOpacity={0.5}
                            showCover={true}
                            mobileScrollSupport={true}
                            className="mx-auto"
                            ref={flipBookRef}
                            style={{}}
                            startPage={0}
                            drawShadow={true}
                            flippingTime={1000}
                            usePortrait={false}
                            startZIndex={0}
                            autoSize={true}
                            clickEventForward={true}
                            useMouseEvents={true}
                            swipeDistance={30}
                            showPageCorners={true}
                            disableFlipByClick={false}
                            onFlip={() => {
                                // Sound removed for better UX
                            }}
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <div key={`page_${index + 1}`} className="bg-white shadow-inner">
                                    <Page
                                        pageNumber={index + 1}
                                        width={700}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                </div>
                            ))}
                        </HTMLFlipBook>
                    </Document>
                </div>

                {/* Navigation Info */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    <div className="bg-primary/10 border border-primary/20 px-6 py-2 rounded-full backdrop-blur-md">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Interactive Flipbook Experience</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">Use arrow keys or click page corners to flip</p>
                </div>
            </main>
        </div>
    );
};

export default BookReader;
