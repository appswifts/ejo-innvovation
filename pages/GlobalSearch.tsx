import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useGlobalSearch } from '../src/hooks';
import { Search as SearchIcon, BookOpen, FileText, User, ArrowRight } from 'lucide-react';

const GlobalSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const { results, loading } = useGlobalSearch(searchTerm);

  // Sync input with valid URL param initially
  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-grow">
        {/* Search Header */}
        <div className="bg-muted py-12 border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-foreground text-center">Search Platform</h1>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search journals, articles, authors..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg"
                autoFocus
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-6" />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 max-w-4xl py-12">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-card rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {searchTerm && results.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <SearchIcon className="size-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-medium text-foreground">No results found</h3>
                  <p>Try adjusting your search terms.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.url}
                      className="block bg-card hover:bg-muted/50 border border-border rounded-xl p-6 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="size-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          {result.type === 'journal' && <BookOpen className="size-6 text-primary" />}
                          {result.type === 'article' && <FileText className="size-6 text-blue-500" />}
                          {result.type === 'author' && <User className="size-6 text-purple-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded
                                                            ${result.type === 'journal' ? 'bg-green-100 text-green-700' : ''}
                                                            ${result.type === 'article' ? 'bg-blue-100 text-blue-700' : ''}
                                                            ${result.type === 'author' ? 'bg-purple-100 text-purple-700' : ''}
                                                        `}>
                              {result.type}
                            </span>
                            {result.date && (
                              <span className="text-xs text-muted-foreground">
                                • {new Date(result.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {result.title}
                          </h3>
                          {result.subtitle && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="size-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GlobalSearch;