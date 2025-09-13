import { useEffect, useState } from 'react';
import ImageWithFallback from '../components/ImageWithFallback';
import getAvatarUrl from '../utils/getAvatarUrl';
import getCoverFromBook from '../utils/getCoverFromBook';
import { useParams } from 'react-router-dom';
import api from '../services/api';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
}

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/books/${id}`)
      .then(res => setBook(res.data))
  .catch(_err => setError('Failed to load book details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!book) return <div className="py-8 text-center">Book not found</div>;
  const cover = getCoverFromBook(book) || null;

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <article className="prose dark:prose-invert">
        <div className="flex items-start gap-6 mb-6">
          <ImageWithFallback
            src={cover || getAvatarUrl(book.title, { width: 288, height: 384, radius: 12, output: 'png' })}
            alt={book.title}
            className="w-36 h-48 object-cover rounded-md flex-shrink-0 border border-gray-100 dark:border-slate-700"
          />
          <div>
            <h1 className="text-3xl font-semibold mb-2">{book.title}</h1>
            <div className="text-lg text-gray-700 dark:text-slate-300">by {book.author}</div>
          </div>
        </div>
        <p className="mb-6">{book.description}</p>
      </article>
    </main>
  );
};

export default BookDetailPage;
