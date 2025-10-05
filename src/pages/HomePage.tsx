import SearchBar from '../components/SearchBar';
import getCoverFromBook from '../utils/getCoverFromBook';
import { useEffect, useState } from 'react';
import { fetchBooksPage } from '@/services/bookCatalog';
import BookCard from '../components/BookCard';

interface Book {
  id: string | number;
  title: string;
  author: string;
  coverImageURL?: string;
  coverImage?: string;
  avgRating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
}

const HomePage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const PAGE_SIZE = 10;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const search = searchTerm.trim();

    fetchBooksPage({ page, limit: PAGE_SIZE, search: search || undefined, sort: 'title', order: 'asc' })
      .then(result => {
        if (!active) return;
        setBooks(result.books);
        setTotal(Math.max(result.total, result.books.length));
        const nextTotalPages = Math.max(1, result.totalPages || 1);
        setTotalPages(nextTotalPages);
        setPage(prev => {
          const next = Math.min(prev, nextTotalPages);
          return next === prev ? prev : next;
        });
      })
      .catch(() => {
        if (!active) return;
        setError('Failed to load books');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, searchTerm]);

  const handleSearch = (query: string) => {
    const normalized = query.trim();
    setPage(1);
    setSearchTerm(normalized);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Discover Books</h1>
          <p className="text-sm text-slate-500">Browse and explore community-rated titles ({total} books)</p>
        </div>
        <div className="text-xs text-slate-500">Page {page} of {totalPages}</div>
      </header>

      {loading && <div className="py-10 text-center text-sm text-slate-500">Loading books...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="pt-2"><SearchBar onSearch={handleSearch} /></div>

      <ul className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
  {books.map(book => {
          const cover = getCoverFromBook(book) || null;
          return (
            <li key={book.id}>
              <BookCard
                id={String(book.id)}
                title={book.title}
                author={book.author}
                coverImage={cover}
                averageRating={book.avgRating ?? 0}
                reviewCount={book.reviewCount ?? 0}
                initialFavorited={book.isFavorite || false}
              />
            </li>
          );
        })}
      </ul>

      <div className="flex justify-center items-center pt-4 gap-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 rounded-md disabled:opacity-50"
        >Prev</button>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 rounded-md disabled:opacity-50"
        >Next</button>
      </div>
    </main>
  );
}

export default HomePage;
