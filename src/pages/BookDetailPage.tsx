import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { toggleFavorite, fetchUserFavorites } from '@/services/api';
import { invalidateBookCache } from '@/services/bookCatalog';
import { useAuth } from '@/context/AuthContext';

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
  isFavorite?: boolean;
}

interface Review {
  id: string;
  rating: number;
  text?: string;    // Backend returns 'text'
  comment?: string; // Frontend compatibility
  userId: string;
  userName?: string;
  createdAt: string;
}

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [favPending, setFavPending] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const { user } = useAuth();

  const loadBook = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const res = await api.get(`/books/${id}`);
      setBook(res.data);
      if (typeof res.data?.isFavorite === 'boolean') {
        setFavorited(res.data.isFavorite);
      }
      setError('');
    } catch (err) {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!id) return;
    
    try {
      setReviewsLoading(true);
      const res = await api.get(`/books/${id}/reviews`);
      setReviews(res.data || []);
    } catch (err) {
      console.log('Reviews not available');
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user || !book) return;
    try {
      const favs = await fetchUserFavorites();
      setFavorited(favs.some(f => f.id === Number(book.id)));
    } catch (err) {
      console.log('Failed to load favorites');
    }
  };

  const handleToggleFavorite = async () => {
    if (!book || favPending) return;
    
    setFavPending(true);
    const nextFavorited = !favorited;
    setFavorited(nextFavorited);
    
    try {
      await toggleFavorite(Number(book.id));
      invalidateBookCache();
    } catch {
      setFavorited(!nextFavorited); // Revert on error
    } finally {
      setFavPending(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newReview.comment.trim()) return;

    try {
      const res = await api.post(`/books/${id}/reviews`, {
        rating: newReview.rating,
        text: newReview.comment.trim(),
      });
      
      setReviews(prev => [res.data, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`text-xl transition-colors ${
              star <= rating 
                ? 'text-amber-400' 
                : 'text-surface-variant'
            } ${interactive ? 'hover:text-amber-300 cursor-pointer' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    loadBook();
    loadReviews();
  }, [id]);

  useEffect(() => {
    if (book && user) {
      if (typeof book.isFavorite === 'boolean') {
        setFavorited(book.isFavorite);
      } else {
        loadFavorites();
      }
    }
  }, [book, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-64 h-96 bg-surface-variant rounded-lg mx-auto lg:mx-0"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-surface-variant rounded w-3/4"></div>
                <div className="h-6 bg-surface-variant rounded w-1/2"></div>
                <div className="h-4 bg-surface-variant rounded w-full"></div>
                <div className="h-4 bg-surface-variant rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-error mb-2">Oops! Something went wrong</h2>
            <p className="text-on-surface-variant mb-6">{error}</p>
            <Link to="/" className="btn-filled">
              Back to Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-on-surface mb-2">Book not found</h2>
            <p className="text-on-surface-variant mb-6">The book you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="btn-filled">
              Back to Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Navigation */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Books
        </Link>

        {/* Book Details */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Book Cover */}
            <div className="w-64 mx-auto lg:mx-0 shrink-0">
              <div className="relative">
                <img
                  src={(book.coverUrl || book.coverImageURL) || `https://via.placeholder.com/300x450/e5e7eb/9ca3af?text=${encodeURIComponent(book.title)}`}
                  alt={book.title}
                  className="w-full h-96 object-cover rounded-lg shadow-lg card-elevated"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/300x450/e5e7eb/9ca3af?text=${encodeURIComponent(book.title)}`;
                  }}
                />
                
                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  disabled={favPending}
                  className={`absolute top-4 right-4 w-12 h-12 rounded-full glass-card flex items-center justify-center text-xl transition-all duration-200 ${
                    favorited 
                      ? 'text-error bg-error/10 shadow-lg' 
                      : 'text-on-surface-variant hover:text-error hover:bg-error/10'
                  } ${favPending ? 'scale-90 opacity-70' : ''}`}
                >
                  {favorited ? '♥' : '♡'}
                </button>
              </div>
            </div>

            {/* Book Information */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-on-surface">
                  {book.title}
                </h1>
                <p className="text-xl text-on-surface-variant">by {book.author}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                {renderStars((book.avgRating || book.averageRating) || 0)}
                <span className="text-on-surface-variant">
                  {((book.avgRating || book.averageRating) || 0).toFixed(1)} ({book.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Genres */}
              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {book.genres.map(genre => (
                    <span 
                      key={genre}
                      className="px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {book.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-on-surface">Description</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn-filled"
                >
                  Write a Review
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-heading text-on-surface">
              Reviews ({reviews.length})
            </h2>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8 p-6 bg-surface rounded-lg border border-outline">
              <h3 className="text-lg font-semibold text-on-surface mb-4">Write Your Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Rating
                  </label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Comment
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your thoughts about this book..."
                    rows={4}
                    className="w-full px-4 py-3 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-on-surface placeholder-on-surface-variant"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button type="submit" className="btn-filled">
                    Submit Review
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="btn-outlined"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-surface rounded-lg animate-pulse">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-surface-variant rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-surface-variant rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-surface-variant rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-surface-variant rounded w-full mb-2"></div>
                  <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">No reviews yet</h3>
              <p className="text-on-surface-variant">Be the first to share your thoughts about this book!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="p-6 bg-surface rounded-lg border border-outline">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-lg">
                      {review.userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-on-surface">
                          {review.userName || 'Anonymous User'}
                        </span>
                        {renderStars(review.rating)}
                        <span className="text-sm text-on-surface-variant">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-on-surface-variant leading-relaxed">
                        {(review as any).text || (review as any).comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
