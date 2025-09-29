import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import BookCard from '@/components/BookCard';

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverImageURL?: string;
  avgRating?: number;
  averageRating?: number;
  reviewCount?: number;
  genres?: string[];
  description?: string;
}

interface FetchState {
  loading: boolean;
  error: string | null;
}

export const BookListPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [fetchState, setFetchState] = useState<FetchState>({ loading: true, error: null });

  // Get unique genres from books
  const genres = ['all', ...new Set(books.flatMap(book => book.genres || []))];

  // Load books on component mount
  useEffect(() => {
    let active = true;
    setFetchState({ loading: true, error: null });
    
    api.get('/books?limit=50')
      .then(res => {
        if (!active) return;
        const booksData = res.data.books || res.data || [];
        setBooks(Array.isArray(booksData) ? booksData : []);
        setFetchState({ loading: false, error: null });
      })
      .catch(err => {
        if (!active) return;
        setFetchState({ loading: false, error: err?.response?.data?.message || 'Failed to load books' });
      });
    
    return () => { active = false; };
  }, []);

  // Filter and sort books based on search and filters
  useEffect(() => {
    let filtered = [...books];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        (book.genres || []).some(genre => genre.toLowerCase().includes(query))
      );
    }

    // Apply genre filter
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => 
        (book.genres || []).includes(selectedGenre)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    setFilteredBooks(filtered);
  }, [books, searchQuery, selectedGenre, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold font-heading bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-700 bg-clip-text text-transparent">
                Discover Books
              </h1>
              <p className="text-on-surface-variant text-lg">
                Explore our collection of {books.length} amazing books
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="w-full lg:w-96">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search books, authors, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-on-surface placeholder-on-surface-variant transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant font-medium">Genre:</span>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="rating">Rating</option>
                <option value="reviews">Reviews</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-on-surface-variant ml-auto">
              {filteredBooks.length} of {books.length} books
            </div>
          </div>
        </div>

        {/* Content Section */}
        {fetchState.loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="card-elevated p-4 space-y-4 animate-pulse">
                <div className="w-full h-64 bg-surface-variant rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                  <div className="h-3 bg-surface-variant rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : fetchState.error ? (
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-error mb-2">Oops! Something went wrong</h3>
            <p className="text-on-surface-variant">{fetchState.error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-filled mt-4"
            >
              Try Again
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-8xl mb-6">📚</div>
            <h3 className="text-2xl font-semibold text-on-surface mb-2">No books found</h3>
            <p className="text-on-surface-variant mb-6">
              {searchQuery || selectedGenre !== 'all' 
                ? "Try adjusting your search filters or browse all books." 
                : "It looks like there are no books available right now."
              }
            </p>
            {(searchQuery || selectedGenre !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('all');
                }}
                className="btn-outlined"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredBooks.map(book => (
              <BookCard 
                key={book.id} 
                id={book.id}
                title={book.title}
                author={book.author}
                coverUrl={book.coverUrl || book.coverImageURL}
                averageRating={book.avgRating || book.averageRating || 0}
                reviewCount={book.reviewCount || 0}
                genres={book.genres}
                description={book.description}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookListPage;
