import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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
    axios.get(`/api/books/${id}`)
      .then(res => setBook(res.data))
      .catch(err => setError('Failed to load book details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!book) return <div className="py-8 text-center">Book not found</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
      <div className="text-lg text-gray-700 mb-4">by {book.author}</div>
      <p className="mb-6">{book.description}</p>
    </div>
  );
};

export default BookDetailPage;
