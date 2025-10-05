import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '@/services/api';

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
}

interface Review {
  id: string;
  rating: number;
  text?: string;    // Backend returns 'text'
  comment?: string; // Frontend compatibility
  bookId: string;
  bookTitle?: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout, initializing, refreshUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'reviews' | 'stats' | 'recs'>('favorites');
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Recommendations state
  const [recs, setRecs] = useState<Book[]>([]);
  const [recMode, setRecMode] = useState<'hybrid' | 'top' | 'llm'>('hybrid');
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recPage, setRecPage] = useState(1);
  const [recPagination, setRecPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const recCache = React.useRef<Record<string, Book[]>>({});
  const hasRefreshedUser = useRef(false);
  const lastEffectKey = useRef<string | null>(null);

  useEffect(() => {
    lastEffectKey.current = null;
  }, [user?.id]);

  const mapFavoriteEntry = useCallback((entry: any): Book => {
    const candidate = entry?.book ?? entry ?? {};
    const avgSource = candidate?.avgRating ?? candidate?.averageRating;
    const avgNumeric = typeof avgSource === 'number' ? avgSource : Number(avgSource ?? 0) || 0;
    const reviewCountSource = candidate?.reviewCount;

    return {
      id: String(candidate?.id ?? ''),
      title: candidate?.title ?? 'Untitled',
      author: candidate?.author ?? 'Unknown',
      coverUrl: candidate?.coverUrl ?? candidate?.coverImageURL,
      coverImageURL: candidate?.coverImageURL ?? candidate?.coverUrl,
      avgRating: avgNumeric,
      averageRating: avgNumeric,
      reviewCount: typeof reviewCountSource === 'number' ? reviewCountSource : Number(reviewCountSource ?? 0) || 0,
      genres: Array.isArray(candidate?.genres) ? candidate.genres : undefined,
    };
  }, []);

  const mapReviewEntry = useCallback((entry: any): Review => {
    const ratingSource = entry?.rating ?? entry?.score ?? entry?.value;
    const rating = typeof ratingSource === 'number' ? ratingSource : Number(ratingSource ?? 0) || 0;
    const book = entry?.book ?? {};
    const createdAtValue = entry?.createdAt ? new Date(entry.createdAt).toISOString() : new Date().toISOString();

    return {
      id: String(entry?.id ?? entry?._id ?? ''),
      rating,
      text: entry?.text ?? entry?.comment ?? undefined,
      comment: entry?.comment ?? entry?.text ?? undefined,
      bookId: String(book?.id ?? entry?.bookId ?? ''),
      bookTitle: book?.title ?? entry?.bookTitle ?? undefined,
      createdAt: createdAtValue,
    };
  }, []);

  const hydrateFromUserData = useCallback((payload: any) => {
    if (!payload) return;

    if (Array.isArray(payload.favorites)) {
      setFavorites(payload.favorites.map(mapFavoriteEntry));
    }

    if (Array.isArray(payload.reviews)) {
      setReviews(payload.reviews.map(mapReviewEntry));
    }
  }, [mapFavoriteEntry, mapReviewEntry]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="text-8xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-on-surface mb-4">Access Restricted</h2>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            You need to be logged in to view your profile and manage your book collection.
          </p>
          <Link to="/login" className="btn-filled">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const loadUserData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [favRes, reviewRes] = await Promise.all([
        api.get('/profile/favorites'),
        api.get('/profile/reviews'),
      ]);

      const favoriteData = Array.isArray(favRes.data)
        ? favRes.data.map(mapFavoriteEntry)
        : [];

      const reviewData = Array.isArray(reviewRes.data)
        ? reviewRes.data.map(mapReviewEntry)
        : [];

      setFavorites(favoriteData);
      setReviews(reviewData);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [mapFavoriteEntry, mapReviewEntry]);

  useEffect(() => {
    if (initializing || !token || hasRefreshedUser.current) return;

    hasRefreshedUser.current = true;
    const result = refreshUser();

    if (result && typeof (result as Promise<any>).then === 'function') {
      (result as Promise<any>)
        .then((payload) => {
          hydrateFromUserData(payload);
        })
        .catch(() => {
          hasRefreshedUser.current = false;
        });
    } else {
      hasRefreshedUser.current = false;
    }
  }, [initializing, token, refreshUser, hydrateFromUserData]);

  useEffect(() => {
    hydrateFromUserData(user);
  }, [user, hydrateFromUserData]);

  const loadRecommendations = useCallback(async (mode: typeof recMode, page = 1, append = false) => {
    if (!append) {
      setRecLoading(true);
    } else {
      setLoadingMore(true);
    }
    setRecError(null);
    try {
      // Serve from cache if present and page 1
      if (page === 1 && recCache.current[mode]) {
        setRecs(recCache.current[mode]);
        setRecLoading(false);
        setLoadingMore(false);
        return;
      }
      
      let response: any;
      // Dynamically import to avoid circular issues / tree shaking concerns
      const apiMod = await import('@/services/api');
      if (mode === 'hybrid') {
        response = await apiMod.fetchHybridRecommendations(page, 10);
      } else if (mode === 'top') {
        response = await apiMod.fetchTopRatedRecommendations(page, 10);
      } else {
        try {
          response = await apiMod.fetchLLMRecommendations(page, 10);
        } catch (e: any) {
          const msg = e?.response?.data?.error || e?.message || 'Failed to fetch LLM recommendations';
          setRecError(msg);
          response = { recommendations: [], pagination: null };
        }
      }
      
      const newBooks = response.recommendations || [];
      
      if (append) {
        setRecs(prev => [...prev, ...newBooks]);
      } else {
        setRecs(newBooks);
        if (page === 1) {
          recCache.current[mode] = newBooks;
        }
      }
      
      setRecPagination(response.pagination || null);
      setRecPage(page);
    } catch (e: any) {
      setRecError(e?.response?.data?.message || e?.message || 'Failed to load recommendations');
    } finally {
      setRecLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (initializing || !user) {
      return;
    }

    const effectKey = `${activeTab}:${recMode}`;
    if (lastEffectKey.current === effectKey) {
      return;
    }
    lastEffectKey.current = effectKey;

    if (activeTab === 'recs') {
      setRecPage(1); // Reset to page 1
      loadRecommendations(recMode, 1, false);
    } else {
      loadUserData();
    }
  }, [activeTab, initializing, user, recMode, loadRecommendations, loadUserData]);
  
  const handleLoadMore = () => {
    if (recPagination && recPage < recPagination.totalPages) {
      loadRecommendations(recMode, recPage + 1, true);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-amber-400' : 'text-surface-variant'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const stats = useMemo(() => {
    const userFavorites = Array.isArray((user as any)?.favorites) ? (user as any).favorites : [];
    const userReviews = Array.isArray((user as any)?.reviews) ? (user as any).reviews : [];

    const favoritesCount = favorites.length || userFavorites.length;

    const reviewSource: any[] = reviews.length ? reviews : userReviews;
    const totalReviews = reviewSource.length;
    const totalRating = reviewSource.reduce((sum, review) => {
      const rawRating = (review?.rating ?? (review as any)?.score ?? (review as any)?.value);
      const numeric = typeof rawRating === 'number' ? rawRating : Number(rawRating) || 0;
      return sum + numeric;
    }, 0);

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      totalReviews,
      averageRating,
      totalFavorites: favoritesCount,
    };
  }, [favorites, reviews, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* User Info */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold font-heading bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-700 bg-clip-text text-transparent">
                  {user.name}
                </h1>
                <p className="text-on-surface-variant text-lg">
                  {user.email}
                </p>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                  <span>📚 {stats.totalFavorites} favorites</span>
                  <span>✍️ {stats.totalReviews} reviews</span>
                  <span>⭐ {stats.averageRating.toFixed(1)} avg rating</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={logout}
                className="btn-outlined text-error border-error hover:bg-error hover:text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {stats.totalFavorites}
            </div>
            <div className="text-on-surface-variant">Favorite Books</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-secondary-600 mb-2">
              {stats.totalReviews}
            </div>
            <div className="text-on-surface-variant">Reviews Written</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-amber-500 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="text-on-surface-variant">Average Rating</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card p-2">
          <div className="flex gap-2">
            {[
              { id: 'favorites', label: 'Favorite Books', icon: '♥️' },
              { id: 'reviews', label: 'My Reviews', icon: '📝' },
              { id: 'recs', label: 'Recommendations', icon: '✨' },
              { id: 'stats', label: 'Reading Stats', icon: '📊' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-on-surface-variant hover:bg-surface hover:text-on-surface'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="glass-card p-6 md:p-8">
          {error && activeTab !== 'recs' && (
            <div className="mb-6 p-4 bg-error-container text-error-on-container rounded-lg border border-error">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                {error}
              </div>
            </div>
          )}
          {recError && activeTab === 'recs' && (
            <div className="mb-6 p-4 bg-error-container text-error-on-container rounded-lg border border-error">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                {recError}
              </div>
            </div>
          )}

          {(loading && activeTab !== 'recs') ? (
            <div className="space-y-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full h-48 bg-surface-variant rounded-lg mb-4"></div>
                    <div className="h-4 bg-surface-variant rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-surface-variant rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : recLoading && activeTab === 'recs' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-on-surface-variant"><span className="animate-spin">⏳</span> Loading recommendations...</div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full h-48 bg-surface-variant rounded-lg mb-4"></div>
                    <div className="h-4 bg-surface-variant rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-surface-variant rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Recommendations Tab */}
              {activeTab === 'recs' && (
                <div className="space-y-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-on-surface">Personalized Recommendations</h2>
                      <p className="text-on-surface-variant mt-1 text-sm">Based on community activity, ratings and heuristic relevance.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-on-surface-variant font-medium">Mode:</span>
                      {[
                        { id: 'hybrid', label: 'Hybrid', desc: 'Blend' },
                        { id: 'top', label: 'Top Rated', desc: 'Global' },
                        { id: 'llm', label: 'LLM', desc: 'Semantic' },
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setRecMode(m.id as typeof recMode)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            recMode === m.id
                              ? 'bg-primary-500 text-white border-primary-500 shadow'
                              : 'bg-surface border-surface-variant text-on-surface-variant hover:border-primary-300'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {recs.length === 0 && !recLoading && !recError && (
                    <div className="text-center py-16">
                      <div className="text-8xl mb-6">🧪</div>
                      <h3 className="text-xl font-semibold text-on-surface mb-2">No recommendations yet.</h3>
                      <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
                        Keep exploring and reviewing books—your personalized suggestions will improve as more data becomes available.
                      </p>
                      <Link to="/" className="btn-filled">Browse Catalog</Link>
                    </div>
                  )}

                  {recs.length > 0 && (
                    <>
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {recs.map(b => (
                          <Link key={b.id} to={`/books/${b.id}`} className="card-elevated p-5 group hover:shadow-xl transition-all">
                            <div className="aspect-[2/3] mb-4 overflow-hidden rounded-lg bg-surface-variant">
                              <img
                                src={(b as any).coverUrl || (b as any).coverImageURL || `https://via.placeholder.com/300x450/e5e7eb/9ca3af?text=${encodeURIComponent(b.title)}`}
                                alt={b.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x450/e5e7eb/9ca3af?text=${encodeURIComponent(b.title)}`;
                                }}
                              />
                            </div>
                            <h3 className="font-semibold text-on-surface mb-1 line-clamp-2">{b.title}</h3>
                            <p className="text-on-surface-variant text-sm mb-2">{(b as any).author}</p>
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
                              <span>⭐ {(b as any).avgRating?.toFixed?.(1) || (b as any).averageRating?.toFixed?.(1) || '0.0'}</span>
                              <span>• {(b as any).reviewCount || 0} reviews</span>
                            </div>
                            {(b as any).relevanceScore && (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-primary-600 font-medium">Relevance:</span>
                                <div className="flex-1 bg-surface-variant rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full transition-all"
                                    style={{ width: `${((b as any).relevanceScore * 100)}%` }}
                                  />
                                </div>
                                <span className="text-on-surface-variant">{((b as any).relevanceScore * 100).toFixed(0)}%</span>
                              </div>
                            )}
                            {recMode === 'llm' && (
                              <div className="mt-2 text-xs italic text-on-surface-variant/70">AI-powered semantic match</div>
                            )}
                          </Link>
                        ))}
                      </div>
                      
                      {/* Pagination Info & Load More */}
                      {recPagination && (
                        <div className="flex flex-col items-center gap-4 mt-8">
                          <div className="text-sm text-on-surface-variant">
                            Showing {recs.length} of {recPagination.total} recommendations
                            {recPagination.totalPages > 1 && ` (Page ${recPage} of ${recPagination.totalPages})`}
                          </div>
                          
                          {recPage < recPagination.totalPages && (
                            <button
                              onClick={handleLoadMore}
                              disabled={loadingMore}
                              className="btn-filled px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {loadingMore ? (
                                <>
                                  <span className="animate-spin">⏳</span>
                                  Loading more...
                                </>
                              ) : (
                                <>
                                  Load More
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-on-surface">
                      Favorite Books ({favorites.length})
                    </h2>
                  </div>

                  {favorites.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-8xl mb-6">💔</div>
                      <h3 className="text-xl font-semibold text-on-surface mb-2">No favorites yet</h3>
                      <p className="text-on-surface-variant mb-6">
                        Start building your collection by marking books as favorites!
                      </p>
                      <Link to="/" className="btn-filled">
                        Browse Books
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {favorites.map(book => (
                        <Link
                          key={book.id}
                          to={`/books/${book.id}`}
                          className="card-elevated p-4 hover:shadow-xl transition-all duration-300 group"
                        >
                          <div className="aspect-[2/3] mb-4 overflow-hidden rounded-lg bg-surface-variant">
                            <img
                              src={(book.coverUrl || book.coverImageURL) || `https://via.placeholder.com/300x450/e5e7eb/9ca3af?text=${encodeURIComponent(book.title)}`}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://via.placeholder.com/300x450/e5e7eb/9ca3af?text=${encodeURIComponent(book.title)}`;
                              }}
                            />
                          </div>
                          <h3 className="font-semibold text-on-surface mb-2 line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-on-surface-variant text-sm mb-3">
                            by {book.author}
                          </p>
                          <div className="flex items-center justify-between">
                            {renderStars((book.avgRating || book.averageRating) || 0)}
                            <span className="text-sm text-on-surface-variant">
                              {book.reviewCount || 0} reviews
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-on-surface">
                      My Reviews ({reviews.length})
                    </h2>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-8xl mb-6">📝</div>
                      <h3 className="text-xl font-semibold text-on-surface mb-2">No reviews yet</h3>
                      <p className="text-on-surface-variant mb-6">
                        Share your thoughts about the books you've read!
                      </p>
                      <Link to="/" className="btn-filled">
                        Find Books to Review
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="card-elevated p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-semibold text-on-surface">
                                  {review.bookTitle || `Book ${review.bookId}`}
                                </h3>
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
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-on-surface">Reading Statistics</h2>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Reading Progress */}
                    <div className="card-elevated p-6">
                      <h3 className="text-lg font-semibold text-on-surface mb-4">Reading Activity</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant">Books Favorited</span>
                          <span className="text-xl font-bold text-primary-600">{stats.totalFavorites}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant">Reviews Written</span>
                          <span className="text-xl font-bold text-secondary-600">{stats.totalReviews}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant">Average Rating Given</span>
                          <span className="text-xl font-bold text-amber-500">{stats.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card-elevated p-6">
                      <h3 className="text-lg font-semibold text-on-surface mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {reviews.length > 0 ? (
                          reviews.slice(0, 3).map(review => (
                            <div key={review.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface">
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                              <div className="flex-1">
                                <div className="text-sm text-on-surface">
                                  Reviewed "{review.bookTitle || 'a book'}"
                                </div>
                                <div className="text-xs text-on-surface-variant">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-on-surface-variant text-sm">No recent activity</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
