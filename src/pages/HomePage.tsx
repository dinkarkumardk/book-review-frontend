import SearchBar from '../components/SearchBar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  averageRating?: number;
}

const HomePage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`/api/books?page=${page}`)
      .then(res => {
        const data = res.data.books || res.data;
        setBooks(data);
        setFilteredBooks(data);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => setError('Failed to load books'))
      .finally(() => setLoading(false));
  }, [page]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredBooks(books);
      return;
    }
    const lowerQuery = query.toLowerCase();
    setFilteredBooks(
      books.filter(book =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery)
      )
    );
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Book List</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <SearchBar onSearch={handleSearch} />
      <ul className="space-y-4">
        {filteredBooks.map(book => (
          <li key={book.id}>
            <Link to={`/books/${book.id}`}>
              <BookCard
                id={book.id}
                title={book.title}
                author={book.author}
                coverImage={book.coverImage || '/default-cover.png'}
                averageRating={book.averageRating || 0}
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >Next</button>
      </div>
    </div>
  );
}

export default HomePage;
