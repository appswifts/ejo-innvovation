import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { BookOpen, AlertCircle } from 'lucide-react';

const BookCover: React.FC<{ url?: string; title: string }> = ({ url, title }) => (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow group">
        {url ? (
            <img
                src={url}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground p-4 text-center">
                <div className="flex flex-col items-center gap-2">
                    <BookOpen className="h-8 w-8 opacity-50" />
                    <span className="text-xs font-medium line-clamp-3">{title}</span>
                </div>
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
);

export const BookSlider: React.FC = () => {
    const { books, loading, error } = useBooks();

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <p>Failed to load books</p>
            </div>
        );
    }

    if (books.length === 0) {
        return null; // Don't show section if no books
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="text-primary" />
                Featured Books
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {books.map((book) => (
                    <Link
                        key={book.id}
                        to={`/books/${book.slug}`}
                        className="snap-start shrink-0 w-[160px] md:w-[180px] flex-none"
                    >
                        <BookCover
                            url={book.cover_image_url || undefined}
                            title={book.title}
                        />
                        <h3 className="mt-3 font-bold text-sm leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors">
                            {book.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {book.authors && book.authors.length > 0
                                ? book.authors.map(a => a.name).slice(0, 2).join(', ')
                                : 'Unknown Author'}
                        </p>
                        <div className="mt-1">
                            {book.access_type === 'open_access' ? (
                                <span className="text-xs font-medium text-green-600">Open Access</span>
                            ) : book.price_usd ? (
                                <span className="text-xs font-medium text-primary">${book.price_usd.toFixed(2)}</span>
                            ) : (
                                <span className="text-xs font-medium text-muted-foreground">Free</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
