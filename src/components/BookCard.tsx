import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toggleFavorite } from '@/services/api';
import { invalidateBookCache } from '@/services/bookCatalog';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverImage?: string | null;
  averageRating?: number;
  reviewCount?: number;
  genres?: string[];
  description?: string;
  initialFavorited?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ 
  id, 
  title, 
  author, 
  coverUrl, 
  coverImage,
  averageRating, 
  reviewCount = 0,
  genres = [],
  description,
  initialFavorited = false
}) => {
  const [favorited, setFavorited] = useState<boolean>(initialFavorited);
  const [pending, setPending] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (pending) return;
    
    const previousState = favorited;
    setFavorited(!favorited);
    setPending(true);
    
    try {
      await toggleFavorite(Number(id));
      invalidateBookCache();
    } catch (error) {
      setFavorited(previousState);
    } finally {
      setPending(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <Link to={`/books/${id}`} className="group block h-full">
      <div className="card-elevated p-6 h-full hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
        
        <div className="relative mb-4 overflow-hidden rounded-2xl">
          <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-blue-100">
            {(coverUrl || coverImage) && !imageError ? (
              <img
                src={coverUrl || coverImage || ''}
                alt={`${title} cover`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200">
                <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                </svg>
              </div>
            )}
          </div>
          
          <button
            onClick={handleFavoriteToggle}
            disabled={pending}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              favorited 
                ? 'bg-red-50 text-red-500 shadow-lg' 
                : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-500'
            } ${pending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d={favorited 
                ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                : "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
              } />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="title-large font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-purple-700 transition-colors">
              {title}
            </h3>
            <p className="body-medium text-gray-600">{author}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(Math.round(averageRating || 0))}
            </div>
            <span className="body-small text-gray-500 font-medium">
              {(averageRating || 0).toFixed(1)}
            </span>
            <span className="body-small text-gray-400">
              ({reviewCount || 0} reviews)
            </span>
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full body-small font-medium"
                >
                  {genre}
                </span>
              ))}
              {genres.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full body-small">
                  +{genres.length - 3}
                </span>
              )}
            </div>
          )}

          {description && (
            <p className="body-small text-gray-600 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="body-small text-purple-600 font-medium group-hover:text-purple-700 transition-colors">
            View Details
          </span>
          <svg className="w-4 h-4 text-purple-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
