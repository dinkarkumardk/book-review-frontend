import { useState } from 'react';

interface ReviewFormProps {
  bookId: string;
  onSubmit: (review: { rating: number; comment: string }) => void;
  loading?: boolean;
  error?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ bookId, onSubmit, loading = false, error = '' }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-gray-100">Add a Review</h3>
      {error && <div className="mb-2 text-red-500">{error}</div>}
      <div className="mb-3">
        <label htmlFor={`rating-${bookId}`} className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Rating</label>
        <select
          id={`rating-${bookId}`}
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          required
        >
          <option value={0}>Select rating</option>
          {[1,2,3,4,5].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor={`comment-${bookId}`} className="block mb-1 text-sm text-slate-700 dark:text-slate-300">Comment</label>
        <textarea
          id={`comment-${bookId}`}
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          rows={4}
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md shadow-sm"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
