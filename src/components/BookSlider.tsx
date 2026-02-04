import React from 'react';
import { Link } from 'react-router-dom';
import { useSubmissions } from '../hooks/useSubmissions';
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
    // We'll filter for "Book" type in the component for now, 
    // assuming 'book' or 'ebook' is part of the type key or label using client-side filtering if hook doesn't support generic filtering yet.
    // Actually, useSubmissions returns submission_type relation, so we can filter.
    const { submissions, loading, error } = useSubmissions({ limit: 10, status: 'PUBLISHED', publicFetch: true });

    // Filter for books (checking type key or label)
    const books = submissions.filter(s =>
        s.submission_type?.key?.toLowerCase().includes('book') ||
        s.submission_type?.label?.toLowerCase().includes('book')
    );

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
                        to={`/books/${book.id}`}
                        className="snap-start shrink-0 w-[160px] md:w-[180px] flex-none"
                    >
                        <BookCover
                            url={
                                // Find value where key is 'cover_image' or 'featured_image'
                                book.field_values?.find((v: any) => v.field.key === 'cover_image' || v.field.key === 'featured_image')?.value_text ||
                                book.field_values?.find((v: any) => v.field.key === 'cover_image' || v.field.key === 'featured_image')?.value_file // assuming file path might be stored here? 
                                // Actually, file type stores path in value_text usually, or value_json if multiple?
                                // Database schema says value_text for string.
                            }
                            title={book.title}
                        />
                        <h3 className="mt-3 font-bold text-sm leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors">
                            {book.title}
                        </h3>
                        {/* If we had author info easily accessible here, we'd show it */}
                        <p className="text-xs text-muted-foreground mt-1">
                            {book.venue?.name || 'Independent'}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};
