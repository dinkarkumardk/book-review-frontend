import { useEffect, useState } from 'react';
import ImageWithFallback from '@/components/ImageWithFallback';
import getAvatarUrl from '@/utils/getAvatarUrl';
import getCoverFromBook from '@/utils/getCoverFromBook';
import { useParams } from 'react-router-dom';
import api, { toggleFavorite } from '@/services/api';
import type { Book, Review } from '@/types/domain';
import { RatingStars } from '@/components/ui/RatingStars';
import RatingDistribution from '@/components/RatingDistribution';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [favPending, setFavPending] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  const loadReviews = () => {
    if (!id) return;
    setReviewsLoading(true);
    setReviewsError('');
    api.get(`/books/${id}/reviews`)
      .then(res => setReviews(res.data || []))
      .catch(err => {
        if (err?.response?.status === 404) {
          setReviewsError('No reviews endpoint found for this book.');
        } else {
          setReviewsError('Failed to load reviews');
        }
      })
      .finally(() => setReviewsLoading(false));
  };

  const handleReviewAdded = (newReview?: Review) => {
    if (newReview) {
      setReviews(prev => [newReview, ...prev]);
    } else {
      loadReviews();
    }
  };

  const handleReviewUpdated = (updated: Review) => {
    setReviews(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
  };

  const handleReviewDeleted = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/books/${id}`)
      .then(res => {
        setBook(res.data);
      })
      .catch(() => setError('Failed to load book details'))
      .finally(() => setLoading(false));
    loadReviews();
  }, [id]);

  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!book) return <div className="py-8 text-center">Book not found</div>;
  const cover = getCoverFromBook(book) || null;

  const avgRating = book?.averageRating ?? (reviews.length ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length) : 0);
  const ratingsCount = book?.ratingsCount ?? reviews.length;

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-10">
      <section className="flex flex-col md:flex-row items-start gap-6">
        <div className="w-40 md:w-48 shrink-0">
          <ImageWithFallback
            src={cover || getAvatarUrl(book.title, { width: 320, height: 480, radius: 12, output: 'png' })}
            alt={book.title}
            className="w-full aspect-[2/3] object-cover rounded-md border border-gray-100 dark:border-slate-700"
          />
          <div className="pt-2 border-t border-border/40">
            <RatingDistribution ratings={reviews.map(r => r.rating).filter(Boolean)} />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-semibold leading-tight mb-1">{book.title}</h1>
            <div className="text-base text-muted-foreground">by {book.author}</div>
          </div>
          <div className="flex items-center gap-3">
            <RatingStars value={avgRating} ratingCount={ratingsCount} />
            <button
              onClick={async () => {
                if (!book || favPending) return;
                setFavPending(true);
                const next = !favorited;
                setFavorited(next);
                try { await toggleFavorite(Number(book.id)); } catch { setFavorited(!next); }
                finally { setFavPending(false); }
              }}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={favorited}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-md border text-lg transition-colors ${favorited ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-500' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <span className={`${favPending ? 'opacity-70 scale-90 transition' : ''}`}>{favorited ? '♥' : '♡'}</span>
            </button>
          </div>
          {book.description && <p className="text-sm leading-relaxed max-w-prose">{book.description}</p>}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Reviews</h2>
          <ReviewForm bookId={book.id} onCreated={handleReviewAdded} />
        </div>
        {reviewsLoading && (
          <div className="text-sm text-muted-foreground">Loading reviews...</div>
        )}
        {!reviewsLoading && reviewsError && (
          <div className="text-sm text-red-500">{reviewsError}</div>
        )}
        {!reviewsLoading && !reviewsError && (
          <ReviewsList
            reviews={reviews}
            onReload={loadReviews}
            onUpdate={handleReviewUpdated}
            onDelete={handleReviewDeleted}
          />
        )}
      </section>
    </main>
  );
};

export default BookDetailPage;
