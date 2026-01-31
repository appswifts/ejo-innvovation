import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, ShoppingCart, BookOpen, User } from 'lucide-react';
import DashboardLayout from '../src/layouts/DashboardLayout';

const BookDetail: React.FC = () => {
    const { id } = useParams();

    // Mock Data - In a real app, fetch based on ID
    const book = {
        id: id,
        title: 'Sustainable Agriculture in East Africa',
        subtitle: 'Innovations for a Food-Secure Future',
        author: 'Dr. Jane Mukami',
        publicationDate: 'August 15, 2025',
        pages: 245,
        isbn: '978-3-16-148410-0',
        cover: 'https://placehold.co/400x600/e2e8f0/1e293b?text=Book+Cover',
        price: 25.00,
        currency: '$',
        isOpenAccess: false,
        description: `
            This comprehensive monograph explores the latest innovations in sustainable agriculture tailored for the East African context. 
            Dr. Mukami provides a critical analysis of current practices and proposes scalable solutions to enhance food security while preserving ecological balance.
            
            Key topics include:
            - Climate-smart farming techniques
            - Soil health management
            - Smallholder scaling strategies
            - Digital agriculture integration
        `,
        chapters: [
            'Introduction to Sustainable Frameworks',
            'Soil Health and Regeneration',
            'Water Management Systems',
            'The Role of Technology in Small Scale Farming',
            'Market Access and Value Chains',
            'Conclusion: The Path Forward'
        ]
    };

    return (
        <DashboardLayout>
            <div className="px-6 py-8 max-w-[1200px] mx-auto w-full">
                <Link to="/books" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to Books
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-8 lg:gap-12">
                    {/* Left Column: Cover & Actions */}
                    <div className="flex flex-col gap-6">
                        <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-xl border border-border bg-muted">
                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex flex-col gap-3">
                            {book.isOpenAccess ? (
                                <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all">
                                    <Download className="size-5" />
                                    Download PDF (Open Access)
                                </button>
                            ) : (
                                <button className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all">
                                    <ShoppingCart className="size-5" />
                                    Buy for {book.currency}{book.price.toFixed(2)}
                                </button>
                            )}
                            <button className="w-full py-3 px-4 bg-card border border-border hover:bg-accent text-foreground rounded-xl font-medium flex items-center justify-center gap-2 transition-all">
                                <Share2 className="size-5" />
                                Share Title
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary">Monograph</span>
                                {book.isOpenAccess && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">Open Access</span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">{book.title}</h1>
                            <p className="text-xl text-muted-foreground font-light">{book.subtitle}</p>

                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-secondary flex items-center justify-center">
                                        <User className="size-4 text-muted-foreground" />
                                    </div>
                                    <p className="font-medium text-foreground">{book.author}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-card border border-border rounded-xl">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Published</p>
                                <p className="font-medium">{book.publicationDate}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">ISBN</p>
                                <p className="font-medium">{book.isbn}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Pages</p>
                                <p className="font-medium">{book.pages}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Language</p>
                                <p className="font-medium">English</p>
                            </div>
                        </div>

                        <div className="prose prose-stone max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: book.description.replace(/\n/g, '<br />') }} />

                        {/* Table of Contents */}
                        <div>
                            <h3 className="font-bold text-xl text-foreground mb-4 flex items-center gap-2">
                                <BookOpen className="size-5" />
                                Table of Contents
                            </h3>
                            <ul className="space-y-0 border border-border rounded-xl divide-y divide-border overflow-hidden">
                                {book.chapters.map((chapter, index) => (
                                    <li key={index} className="flex gap-4 p-4 bg-card/50 hover:bg-accent transition-colors">
                                        <span className="font-mono text-muted-foreground text-sm min-w-[24px]">{(index + 1).toString().padStart(2, '0')}</span>
                                        <span className="font-medium text-foreground">{chapter}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BookDetail;
