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
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-lg font-bold mb-2">Add a Review</h3>
      {error && <div className="mb-2 text-red-500">{error}</div>}
      <div className="mb-2">
        <label className="block mb-1">Rating</label>
        <select
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="w-full px-2 py-1 border rounded"
          required
        >
          <option value={0}>Select rating</option>
          {[1,2,3,4,5].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block mb-1">Comment</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full px-2 py-1 border rounded"
          rows={3}
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
