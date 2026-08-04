import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
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
    const [bookWidth, setBookWidth] = useState(700);

    useEffect(() => {
        const calcSize = () => {
            const w = window.innerWidth;
            if (w < 640) setBookWidth(Math.min(w - 16, 500));
            else if (w < 1024) setBookWidth(550);
            else setBookWidth(700);
        };
        calcSize();
        window.addEventListener('resize', calcSize);
        return () => window.removeEventListener('resize', calcSize);
    }, []);

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

            // 2. Check editor role for authenticated users (needed before any early return)
            let isUserEditor = false;
            if (user) {
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

                if (['super_admin', 'editor'].includes(role?.slug)) {
                    isUserEditor = true;
                    setIsEditor(true);
                }
            }

            // 3. Free books — grant access without authentication
            if (bookData.price <= 0) {
                setHasAccess(true);
                setLoading(false);
                return;
            }

            // Paid books require authentication
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

            if (isUserEditor || transaction || bookData.seller_id === user.id) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
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
        if (!book?.pdf_url) {
            alert('No PDF available for download.');
            return;
        }

        console.log("Book Download: original pdf_url =", book.pdf_url);

        try {
            let path = book.pdf_url;
            // Extract relative path if it's a full Supabase URL
            // Handles: public URLs, signed URLs, URLs with query params
            if (path.includes('supabase.co')) {
                const match = path.match(/\/library\/([^?#]+)/);
                if (match) {
                    path = match[1];
                    console.log("Book Download: extracted storage path =", path);
                } else {
                    console.warn("Book Download: could not extract path from URL:", path);
                }
            }

            // If the original URL looks like a direct public URL, use it
            if (book.pdf_url.includes('/object/public/')) {
                console.log("Book Download: using direct public URL");
                const link = document.createElement('a');
                link.href = book.pdf_url;
                link.target = '_blank';
                link.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }

            const { data, error } = await supabase.storage
                .from('library')
                .createSignedUrl(path, 300); // 5 minutes

            if (error) {
                console.error("Book Download: signed URL error:", error);
                throw error;
            }

            console.log("Book Download: signed URL created =", data.signedUrl);
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.target = '_blank';
            link.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err: any) {
            console.error('Book Download: fatal error:', err);
            // Fallback to direct link if signed URL fails
            console.log("Book Download: falling back to original URL");
            const link = document.createElement('a');
            link.href = book.pdf_url;
            link.target = '_blank';
            link.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Reader Controls */}
            <header className="h-[56px] sm:h-[70px] bg-slate-900/50 backdrop-blur-md border-b border-white/5 px-3 sm:px-6 flex items-center justify-between z-50 shrink-0">
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => navigate('/books')}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-primary hover:text-white transition-all shrink-0"
                    >
                        <span className="material-symbols-outlined text-lg sm:text-xl">arrow_back</span>
                    </button>
                    <div className="min-w-0 hidden sm:block">
                        <h1 className="text-white font-black text-sm tracking-tight truncate max-w-[200px] sm:max-w-[300px]">{book.title}</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Publication</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3">
                    {isEditor && (
                        <button
                            onClick={handleDownload}
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-primary hover:text-white transition-all"
                            title="Download PDF (Admin only)"
                        >
                            <span className="material-symbols-outlined text-lg sm:text-xl">download</span>
                        </button>
                    )}
                    <button
                        className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
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

            {/* Scrollable PDF Viewer */}
            <main className="flex-1 overflow-y-auto bg-slate-900 p-2 sm:p-4">
                <div className="max-w-[900px] mx-auto">
                    <Document
                        file={book.pdf_url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex items-center justify-center py-20 text-slate-500 font-bold">
                                Loading Document...
                            </div>
                        }
                    >
                        <div className="flex flex-col items-center gap-1">
                            {Array.from(new Array(numPages), (el, index) => (
                                <div key={`page_${index + 1}`} className="bg-white shadow-lg">
                                    <Page
                                        pageNumber={index + 1}
                                        width={Math.min(bookWidth, 900)}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </Document>
                    <div className="text-center py-6">
                        <p className="text-[11px] text-slate-500 font-medium">{numPages} pages</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookReader;
