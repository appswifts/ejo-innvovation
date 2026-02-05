import React from 'react';
import { Search, Filter, BookOpen, Loader2 } from 'lucide-react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Link } from 'react-router-dom';
import { useBooks } from '../src/hooks';

const Books: React.FC = () => {
    const { books, loading, error } = useBooks();

    return (
        <DashboardLayout>
            <div className="px-6 py-8 max-w-[1400px] mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-foreground">Nkiza Books</h1>
                        <p className="text-muted-foreground text-lg mt-2">Access high-quality academic eBooks and monographs.</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by title, author, or keyword..."
                            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl bg-card hover:bg-accent transition font-medium shadow-sm">
                        <Filter className="size-5" />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                        <p className="text-destructive">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && books.length === 0 && (
                    <div className="bg-secondary/30 rounded-2xl p-12 text-center border border-border border-dashed">
                        <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-bold">No Books Available</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Check back later for new publications.
                        </p>
                    </div>
                )}

                {/* Book Grid */}
                {!loading && !error && books.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {books.map((book) => (
                            <Link to={`/books/${book.slug}`} key={book.id} className="group flex flex-col gap-3">
                                <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden relative shadow-md group-hover:shadow-xl transition-all duration-300">
                                    <img
                                        src={book.cover_image_url || 'https://placehold.co/300x450/e2e8f0/1e293b?text=Book+Cover'}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    {book.access_type === 'open_access' && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                            OPEN ACCESS
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{book.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {book.authors && book.authors.length > 0
                                            ? book.authors.map(a => a.name).join(', ')
                                            : 'Unknown Author'}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded">
                                            {book.imprint?.publisher || 'E-Book'}
                                        </span>
                                        <span className={`font-bold ${book.access_type === 'open_access' ? 'text-green-600' : 'text-primary'}`}>
                                            {book.access_type === 'open_access'
                                                ? 'Open Access'
                                                : book.price_usd
                                                    ? `$${book.price_usd.toFixed(2)}`
                                                    : 'Free'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Books;
