import SearchBar from '../components/SearchBar';
import getCoverFromBook from '../utils/getCoverFromBook';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserFavorites } from '@/services/api';
import api from '../services/api';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImageURL?: string;
  coverImage?: string;
  avgRating?: number;
  reviewCount?: number;
}

const HomePage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/books', { params: { page } })
      .then(res => {
        const data = res.data.data || res.data.books || res.data;
        setBooks(data);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => setError('Failed to load books'))
      .finally(() => setLoading(false));
  }, [page]);

  // Load favorites once user is known
  useEffect(() => {
    if (!user) { setFavoriteIds(new Set()); return; }
    fetchUserFavorites().then(favs => {
      setFavoriteIds(new Set(favs.map(f => f.id)));
    }).catch(() => {});
  }, [user]);

  const handleSearch = (query: string) => {
    // Perform server-side search to leverage indexed queries
    setLoading(true);
    api.get('/books', { params: { page: 1, search: query } })
      .then(res => {
        const data = res.data.data || res.data.books || res.data;
        setPage(1);
        setBooks(data);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => setError('Search failed'))
      .finally(() => setLoading(false));
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
          <p className="text-sm text-slate-500">Browse and explore community-rated titles</p>
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
              <Link to={`/books/${book.id}`}>
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  coverImage={cover}
                  averageRating={book.avgRating ?? 0}
                  initialFavorited={favoriteIds.has(Number(book.id))}
                />
              </Link>
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
