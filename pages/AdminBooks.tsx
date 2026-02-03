import React, { useState } from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Plus, Book, Edit, Archive, RotateCcw, X, Trash2 } from 'lucide-react';
import { useAdminBooks } from '../src/hooks';
import type { Venue, Imprint } from '../src/types/database';

type BookVenue = Venue & { imprints: Imprint | null };

const AdminBooks: React.FC = () => {
    // Shared state
    const { books, loading, refetch, createBook, updateBook, archiveBook, restoreBook } = useAdminBooks();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<BookVenue | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        publisher: '',
        isbn_prefix: ''
    });

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            publisher: '',
            isbn_prefix: ''
        });
        setSelectedBook(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (book: BookVenue) => {
        setSelectedBook(book);
        setFormData({
            name: book.name,
            slug: book.slug,
            description: book.description || '',
            publisher: book.imprints?.publisher || '',
            isbn_prefix: book.imprints?.isbn_prefix || ''
        });
        setIsEditModalOpen(true);
    };

    const handleSubmitCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        const result = await createBook(formData);
        if (result.success) {
            await refetch();
            setIsCreateModalOpen(false);
            resetForm();
        }
        setIsActionLoading(false);
    };

    const handleSubmitUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBook) return;
        setIsActionLoading(true);
        const result = await updateBook(selectedBook.id, formData);
        if (result.success) {
            await refetch();
            setIsEditModalOpen(false);
            resetForm();
        }
        setIsActionLoading(false);
    };

    const handleArchive = async (id: string, currentStatus: boolean | null) => {
        if (!confirm(currentStatus ? 'Are you sure you want to archive this book imprint?' : 'Are you sure you want to restore this book imprint?')) return;

        setIsActionLoading(true);
        const action = currentStatus ? archiveBook : restoreBook;
        const result = await action(id);
        if (result.success) {
            await refetch();
        }
        setIsActionLoading(false);
    };

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Books Management</h1>
                        <p className="text-muted-foreground mt-1">Manage book imprints/series, publishers, and configuration.</p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition"
                    >
                        <Plus className="size-5" />
                        <span>Add Imprint</span>
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-card border border-border rounded-xl shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : books.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                        <div className="size-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Book className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">No Book Imprints Found</h3>
                        <p>Get started by creating your first book imprint or series.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book) => (
                            <div key={book.id} className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 ${!book.is_active ? 'opacity-75 grayscale' : ''}`}>
                                <div className={`h-2 w-full ${book.is_active ? 'bg-indigo-500' : 'bg-muted-foreground'}`}></div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="size-12 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-xl text-indigo-700">
                                            {book.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${book.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {book.is_active ? 'Active' : 'Archived'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {book.name}
                                    </h3>

                                    <div className="space-y-1 mb-4">
                                        {book.imprints?.publisher && (
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">Publisher: </span>
                                                <span className="font-medium">{book.imprints.publisher}</span>
                                            </p>
                                        )}
                                        {book.imprints?.isbn_prefix && (
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">ISBN Prefix: </span>
                                                <span className="font-mono bg-secondary px-1 rounded">{book.imprints.isbn_prefix}</span>
                                            </p>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                                        {book.description || 'No description provided.'}
                                    </p>

                                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">

                                        <button
                                            onClick={() => handleOpenEdit(book)}
                                            className="p-1.5 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                            title="Edit Book Imprint"
                                        >
                                            <Edit className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleArchive(book.id, book.is_active)}
                                            className={`p-1.5 rounded-md transition-colors ${book.is_active ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-green-600 hover:bg-green-100'}`}
                                            title={book.is_active ? "Archive" : "Restore"}
                                        >
                                            {book.is_active ? <Trash2 className="size-4" /> : <RotateCcw className="size-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
                            <h2 className="text-xl font-bold">{isCreateModalOpen ? 'Create Book Imprint' : 'Edit Book Imprint'}</h2>
                            <button
                                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={isCreateModalOpen ? handleSubmitCreate : handleSubmitUpdate} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Imprint Name <span className="text-destructive">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. Nkiza Academic Press"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Slug <span className="text-destructive">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. nkiza-press"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Publisher</label>
                                    <input
                                        type="text"
                                        value={formData.publisher}
                                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. University of Nairobi"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ISBN Prefix</label>
                                    <input
                                        type="text"
                                        value={formData.isbn_prefix}
                                        onChange={(e) => setFormData({ ...formData, isbn_prefix: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                        placeholder="e.g. 978-3-16"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        placeholder="Brief description of this imprint/series..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                                    className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isActionLoading && <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
                                    {isCreateModalOpen ? 'Create Imprint' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminBooks;
