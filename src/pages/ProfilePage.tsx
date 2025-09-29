import React, { useEffect, useState } from 'react';
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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'reviews' | 'stats'>('favorites');
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const loadUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load favorites
      if (activeTab === 'favorites') {
        const favRes = await api.get('/profile/favorites');
        setFavorites(Array.isArray(favRes.data) ? favRes.data : []);
      }
      
      // Load reviews
      if (activeTab === 'reviews') {
        const reviewRes = await api.get('/profile/reviews');
        setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [activeTab]);

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

  const getUserStats = () => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    const totalFavorites = favorites.length;

    return { totalReviews, averageRating, totalFavorites };
  };

  const stats = getUserStats();

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
          {error && (
            <div className="mb-6 p-4 bg-error-container text-error-on-container rounded-lg border border-error">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {loading ? (
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
          ) : (
            <>
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
