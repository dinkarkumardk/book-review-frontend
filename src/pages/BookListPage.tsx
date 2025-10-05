import React, { useEffect, useMemo, useState } from 'react';
import BookCard from '@/components/BookCard';
import { fetchBooksPage, type SortKey } from '@/services/bookCatalog';

interface Book {
  id: number | string;
  title: string;
  author: string;
  coverUrl?: string;
  coverImageURL?: string;
  avgRating?: number;
  averageRating?: number;
  reviewCount?: number;
  genres?: string[];
  description?: string;
  isFavorite?: boolean;
}

interface FetchState {
  loading: boolean;
  error: string | null;
}

const SORT_OPTIONS: SortKey[] = ['title', 'author', 'rating', 'reviews'];
const SEARCH_DEBOUNCE_MS = 600;

export const BookListPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [fetchState, setFetchState] = useState<FetchState>({ loading: true, error: null });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);

  const PAGE_SIZE = 10;

  // Debounce search input to avoid flooding the API
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const effectiveGenre = selectedGenre === 'all' ? undefined : selectedGenre;
  const resolvedSort: SortKey = SORT_OPTIONS.includes(sortBy as SortKey) ? (sortBy as SortKey) : 'title';
  const sortOrder = useMemo(() => (resolvedSort === 'rating' || resolvedSort === 'reviews' ? 'desc' : 'asc'), [resolvedSort]);

  const genres = useMemo(() => {
    const unique = new Set<string>(availableGenres.filter(Boolean));
    return ['all', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [availableGenres]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, effectiveGenre, resolvedSort]);

  // Fetch paginated books from API with caching
  useEffect(() => {
    let active = true;
    setFetchState({ loading: true, error: null });

    fetchBooksPage({
      page: currentPage,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      genre: effectiveGenre,
      sort: resolvedSort,
      order: sortOrder,
    })
      .then(result => {
        if (!active) return;
        setBooks(result.books);
        setTotal(Math.max(result.total, result.books.length));
        const nextTotalPages = Math.max(1, result.totalPages || 1);
        setTotalPages(nextTotalPages);
        setCurrentPage(prev => {
          const next = Math.min(prev, nextTotalPages);
          return next === prev ? prev : next;
        });
        setPageSize(result.pageSize);
        if (!debouncedSearch && result.availableGenres.length) {
          setAvailableGenres(result.availableGenres);
        }
        setFetchState({ loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          (err as any)?.response?.data?.error ||
          (err as Error)?.message ||
          'Failed to load books';
        setFetchState({ loading: false, error: message });
      });

    return () => {
      active = false;
    };
  }, [currentPage, debouncedSearch, effectiveGenre, resolvedSort, sortOrder]);

  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = total === 0 ? 0 : Math.min(currentPage * pageSize, total);
  const noResults = !fetchState.loading && !fetchState.error && books.length === 0;

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
                Explore our collection of {total} amazing books
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
              {total === 0
                ? '0 books'
                : `Showing ${startIndex}-${endIndex} of ${total} books`}
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
        ) : noResults ? (
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
            {books.map(book => (
              <BookCard 
                key={book.id} 
                id={String(book.id)}
                title={book.title}
                author={book.author}
                coverUrl={book.coverUrl || book.coverImageURL}
                averageRating={book.avgRating || book.averageRating || 0}
                reviewCount={book.reviewCount || 0}
                genres={book.genres}
                description={book.description}
                initialFavorited={book.isFavorite ?? false}
              />
            ))}
          </div>
        )}

    {!fetchState.loading && !fetchState.error && books.length > 0 && (
          <div className="glass-card p-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`btn-outlined px-4 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Previous
            </button>
            <div className="text-on-surface-variant font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`btn-filled px-4 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          </div>
  )}
      </div>
    </div>
  );
};

export default BookListPage;
