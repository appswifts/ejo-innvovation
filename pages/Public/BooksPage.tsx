import React, { useState, useEffect } from 'react';
import { ViewState } from '../../types';
import TopNav from '../../components/TopNav';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Book {
  id: string;
  title: string;
  author_name: string | null;
  cover_url: string | null;
  description: string | null;
  type: string | null;
  price: number;
  pdf_url: string | null;
}

const BooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [purchasedBookIds, setPurchasedBookIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      if (!user) setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('book_id')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (error) throw error;
      setPurchasedBookIds(new Set(data?.map(t => t.book_id).filter(Boolean) as string[]));
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesFilter = filter === 'all' || book.type?.toLowerCase() === filter.toLowerCase();
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.author_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePurchase = (book: Book) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout?type=book&id=${book.id}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNav active={ViewState.BOOKS_PAGE} />

      <main className="flex flex-1 w-full max-w-[1440px] mx-auto flex-col md:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-100 p-8 space-y-8 bg-slate-50/30 md:sticky md:top-[65px] md:h-[calc(100vh-65px)] overflow-y-auto">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Library</h1>
            <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed">Discover peer-reviewed monographs and scholarly textbooks from our contributors.</p>

            <div className="relative mb-10">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-white rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-semibold shadow-sm shadow-slate-200/50"
              />
            </div>

            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-5 pl-1">Categories</h3>
            <div className="space-y-1.5">
              {[
                { label: 'All Publications', value: 'all', icon: 'auto_stories' },
                { label: 'Monographs', value: 'monograph', icon: 'menu_book' },
                { label: 'Textbooks', value: 'textbook', icon: 'school' },
                { label: 'Anthologies', value: 'anthology', icon: 'library_books' }
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFilter(cat.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${filter === cat.value ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-slate-600 hover:bg-white hover:shadow-md hover:shadow-slate-200/50'}`}
                >
                  <span className={`material-symbols-outlined text-lg ${filter === cat.value ? 'text-white' : 'text-slate-400'}`}>{cat.icon}</span>
                  <span className="text-sm font-bold">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <section className="flex-1 p-8 md:p-12">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">{filteredBooks.length}</span>
              <span className="text-sm font-bold text-slate-400">Items matching search</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
              <select className="bg-transparent border-none text-sm font-black text-slate-900 focus:ring-0 cursor-pointer hover:text-primary transition-colors">
                <option>New Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-32">
              <div className="w-12 h-12 border-[5px] border-slate-100 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
              {filteredBooks.map((book) => {
                const isPurchased = purchasedBookIds.has(book.id);
                return (
                  <div key={book.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-200">
                          <span className="material-symbols-outlined text-6xl mb-2">auto_stories</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">No Cover Available</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-xl border border-white/20 uppercase tracking-wider">
                          {book.type}
                        </span>
                      </div>
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                        <button
                          onClick={() => isPurchased ? navigate(`/book/read/${book.id}`) : handlePurchase(book)}
                          className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 hover:bg-primary hover:text-white transition-colors"
                        >
                          {isPurchased ? 'Read Now' : 'Unlock Access'} <span className="material-symbols-outlined text-sm">{isPurchased ? 'menu_book' : 'payments'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-black text-slate-900 line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors cursor-pointer">
                        {book.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {book.author_name || 'Academic Board'}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
                        <div>
                          <span className="text-[10px] font-black text-slate-300 block uppercase tracking-[0.15em] mb-0.5">Price</span>
                          <span className="text-xl font-black text-slate-900 tracking-tight">${book.price}</span>
                        </div>
                        {isPurchased ? (
                          <button
                            onClick={() => navigate(`/book/read/${book.id}`)}
                            className="h-12 px-4 bg-emerald-500 text-white rounded-2xl flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-90"
                          >
                            <span className="material-symbols-outlined text-lg">verified</span>
                            <span className="text-xs font-black uppercase">Owned</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchase(book)}
                            className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-xl shadow-slate-900/10 active:scale-90 group-hover:rotate-6"
                          >
                            <span className="material-symbols-outlined text-2xl font-bold">add_shopping_cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredBooks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                <span className="material-symbols-outlined text-5xl text-slate-200">menu_book</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Catalog entry not found</h2>
              <p className="text-slate-500 max-w-sm mt-3 font-medium leading-relaxed">We couldn't find any books matching your criteria. Try adjusting your category or search keywords.</p>
              <button
                onClick={() => { setFilter('all'); setSearchTerm(''); }}
                className="mt-8 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 hover:bg-primary transition-all active:scale-95"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BooksPage;