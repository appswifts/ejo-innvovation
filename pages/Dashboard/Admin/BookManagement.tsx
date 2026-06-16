import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BOOK_TYPES, BookType } from '../../../types';

interface Book {
    id: string;
    title: string;
    author_name: string | null;
    cover_url: string | null;
    description: string | null;
    type: string | null;
    price: number;
    royalty_percentage: number;
    published_at: string | null;
    pdf_url: string | null;
    created_at: string;
    seller_id: string | null;
    status: 'pending' | 'approved' | 'rejected';
}

const BookManagement: React.FC = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingBookId, setEditingBookId] = useState<string | null>(null);
    const [pdfSource, setPdfSource] = useState<'url' | 'upload'>('url');
    const [uploading, setUploading] = useState(false);

    const isInternalUser = profile?.role?.slug === 'super_admin' || profile?.role?.slug === 'editor';

    // Form state
    const [coverSource, setCoverSource] = useState<'url' | 'upload'>('url');
    const [uploadingCover, setUploadingCover] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        author_name: '',
        type: BOOK_TYPES[0].value,
        price: 0,
        royalty_percentage: 70,
        description: '',
        cover_url: '',
        pdf_url: '',
        seller_id: user?.id || null,
        status: 'pending' as 'pending' | 'approved' | 'rejected'
    });

    useEffect(() => {
        fetchBooks();
    }, [user, profile]);

    const fetchBooks = async () => {
        if (!user) return;
        try {
            setLoading(true);
            let query = supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            // If not admin/editor, only show own books
            if (!isInternalUser) {
                query = query.eq('seller_id', user.id);
            }

            const { data, error } = await query;

            if (error) throw error;
            setBooks(data || []);
        } catch (error: any) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (book?: Book) => {
        if (book) {
            setEditingBookId(book.id);
            setFormData({
                title: book.title,
                author_name: book.author_name || '',
                type: (book.type || BOOK_TYPES[0].value) as BookType,
                price: book.price,
                royalty_percentage: book.royalty_percentage,
                description: book.description || '',
                cover_url: book.cover_url || '',
                pdf_url: book.pdf_url || '',
                seller_id: book.seller_id || user?.id || null,
                status: book.status
            });
        } else {
            setEditingBookId(null);
            setFormData({
                title: '',
                author_name: '',
                type: BOOK_TYPES[0].value,
                price: 0,
                royalty_percentage: 70,
                description: '',
                cover_url: '',
                pdf_url: '',
                seller_id: user?.id || null,
                status: 'pending'
            });
        }
        setPdfSource(book?.pdf_url?.includes('supabase.co/storage') ? 'upload' : 'url');
        setShowModal(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `books/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('library')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('library')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, pdf_url: publicUrl }));
            alert('PDF uploaded successfully!');
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);

            const payload = { ...formData };
            // Ensure seller_id is set if not admin override
            if (!isInternalUser) {
                payload.seller_id = user?.id || null;
            }

            if (editingBookId) {
                // Update
                const { error } = await supabase
                    .from('books')
                    .update(payload)
                    .eq('id', editingBookId);

                if (error) throw error;
                alert('Book updated successfully!');
            } else {
                // Insert
                const { error } = await supabase
                    .from('books')
                    .insert([payload]);

                if (error) throw error;
                alert('Book added successfully!');
            }

            setShowModal(false);
            setEditingBookId(null);
            fetchBooks();
        } catch (error: any) {
            console.error('Error saving book:', error);
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateStatus = async (bookId: string, newStatus: 'approved' | 'rejected') => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('books')
                .update({ status: newStatus })
                .eq('id', bookId);

            if (error) throw error;
            alert(`Book ${newStatus} successfully!`);
            fetchBooks();
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert('Error updating status: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBook = async (bookId: string) => {
        if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;

        try {
            setSaving(true);

            // Call the RPC to safely delete book and unlink transactions
            const { error } = await supabase.rpc('delete_book_safely', {
                p_book_id: bookId
            });

            if (error) throw error;
            alert('Book deleted successfully!');
            fetchBooks();
        } catch (error: any) {
            console.error('Error deleting book:', error);
            alert('Error deleting book: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.author_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
                <div>
                    <h1 className="text-2xl font-bold">{isInternalUser ? 'Global Books Management' : 'My Books'}</h1>
                    <p className="text-slate-500 mt-1">{isInternalUser ? 'Manage entire library catalog and publication types.' : 'Manage your book publications and sales.'}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add New Book
                </button>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search by title or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Book Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Royalty</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBooks.map(book => (
                                <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 bg-slate-100 rounded-md border border-slate-200 overflow-hidden flex-shrink-0">
                                                {book.cover_url ? (
                                                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <span className="material-symbols-outlined text-xl">auto_stories</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{book.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{book.author_name || 'Anonymous'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${book.type === 'scholarly' ? 'bg-indigo-100 text-indigo-700' :
                                            book.type === 'creative_content' ? 'bg-pink-100 text-pink-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {BOOK_TYPES.find(t => t.value === book.type)?.label || book.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${book.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            book.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {book.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {book.price.toLocaleString()} RWF
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {book.royalty_percentage}%
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <button
                                            onClick={() => navigate(`/book/read/${book.id}`)}
                                            className="text-slate-500 hover:text-slate-700 font-bold text-sm flex items-center gap-1"
                                            title="Preview Book"
                                        >
                                            <span className="material-symbols-outlined text-sm">visibility</span>
                                            Read
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(book)}
                                            className="text-primary hover:text-primary-dark font-bold text-sm"
                                        >
                                            Edit
                                        </button>
                                        {isInternalUser && (
                                            <button
                                                onClick={() => handleDeleteBook(book.id)}
                                                className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-1"
                                                title="Delete Book"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                Delete
                                            </button>
                                        )}
                                        {isInternalUser && book.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(book.id, 'approved')}
                                                    className="text-green-600 hover:text-green-700 font-bold text-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(book.id, 'rejected')}
                                                    className="text-red-600 hover:text-red-700 font-bold text-sm"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredBooks.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No books found in the system.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Book Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold">{editingBookId ? 'Edit Publication' : 'Add New Publication'}</h2>
                                <p className="text-sm text-slate-500 mt-0.5">{editingBookId ? 'Update book details in the catalog.' : 'Enter book details for the catalog.'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Book Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                        placeholder="Enter the full title..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Author Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                        placeholder="Full name or organization..."
                                        value={formData.author_name}
                                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Publication Type</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as BookType })}
                                    >
                                        {BOOK_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Price (RWF)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-8 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Royalty (%)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                        value={formData.royalty_percentage}
                                        onChange={(e) => setFormData({ ...formData, royalty_percentage: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cover Image</label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                                            <button
                                                type="button"
                                                onClick={() => setCoverSource('url')}
                                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${coverSource === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                                            >
                                                External URL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCoverSource('upload')}
                                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${coverSource === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                                            >
                                                Upload File
                                            </button>
                                        </div>
                                    </div>

                                    {coverSource === 'url' ? (
                                        <input
                                            type="url"
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                            placeholder="https://... (direct link to image)"
                                            value={formData.cover_url}
                                            onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                                        />
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    try {
                                                        setUploadingCover(true);
                                                        const fileExt = file.name.split('.').pop();
                                                        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                                                        const filePath = `covers/${fileName}`;

                                                        const { error: uploadError } = await supabase.storage
                                                            .from('book_covers')
                                                            .upload(filePath, file);

                                                        if (uploadError) throw uploadError;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('book_covers')
                                                            .getPublicUrl(filePath);

                                                        setFormData(prev => ({ ...prev, cover_url: publicUrl }));
                                                        alert('Cover uploaded successfully!');
                                                    } catch (error: any) {
                                                        console.error('Cover upload error:', error);
                                                        alert('Upload failed: ' + error.message);
                                                    } finally {
                                                        setUploadingCover(false);
                                                    }
                                                }}
                                                className="hidden"
                                                id="cover-upload"
                                                disabled={uploadingCover}
                                            />
                                            <label
                                                htmlFor="cover-upload"
                                                className={`w-full p-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all ${uploadingCover ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span className="material-symbols-outlined text-slate-400">
                                                    {uploadingCover ? 'sync' : 'image'}
                                                </span>
                                                <span className="text-sm font-bold text-slate-600">
                                                    {uploadingCover ? 'Uploading...' : formData.cover_url && formData.cover_url.includes('supabase.co') ? 'Cover Uploaded ✓ (Change)' : 'Choose Cover Image'}
                                                </span>
                                            </label>
                                            {formData.cover_url && (
                                                <div className="mt-3 flex items-center gap-3">
                                                    <img src={formData.cover_url} alt="Cover preview" className="w-16 h-20 object-cover rounded-lg border border-slate-200" />
                                                    <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        Cover image ready
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Book PDF Source</label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                                            <button
                                                type="button"
                                                onClick={() => setPdfSource('url')}
                                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${pdfSource === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                                            >
                                                External Link
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPdfSource('upload')}
                                                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${pdfSource === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                                            >
                                                Direct Upload
                                            </button>
                                        </div>
                                    </div>

                                    {pdfSource === 'url' ? (
                                        <input
                                            type="url"
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                            placeholder="https://... (direct link to PDF)"
                                            value={formData.pdf_url}
                                            onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                                        />
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                id="pdf-upload"
                                                disabled={uploading}
                                            />
                                            <label
                                                htmlFor="pdf-upload"
                                                className={`w-full p-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span className="material-symbols-outlined text-slate-400">
                                                    {uploading ? 'sync' : 'cloud_upload'}
                                                </span>
                                                <span className="text-sm font-bold text-slate-600">
                                                    {uploading ? 'Uploading PDF...' : formData.pdf_url && formData.pdf_url.includes('supabase.co') ? 'File Uploaded (Change)' : 'Choose PDF File'}
                                                </span>
                                            </label>
                                            {formData.pdf_url && formData.pdf_url.includes('supabase.co') && (
                                                <p className="mt-2 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    File ready for publication
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                        rows={4}
                                        placeholder="Write a brief overview of the book..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-full sm:flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full sm:flex-[2] px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : editingBookId ? 'Update Book' : 'Create Book Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookManagement;
