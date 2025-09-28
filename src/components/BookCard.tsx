import React, { useState } from 'react';
import { toggleFavorite } from '@/services/api';
import ImageWithFallback from './ImageWithFallback';
import getAvatarUrl from '../utils/getAvatarUrl';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImage?: string | null;
  averageRating: number;
  initialFavorited?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ id, title, author, coverImage, averageRating, initialFavorited }) => {
  const numericId = Number(id);
  const [favorited, setFavorited] = useState<boolean>(!!initialFavorited);
  const [pending, setPending] = useState(false);

  const onToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!numericId || pending) return;
    const next = !favorited;
    setFavorited(next);
    setPending(true);
    try {
      await toggleFavorite(numericId);
    } catch {
      // revert if failed
      setFavorited(!next);
    } finally {
      setPending(false);
    }
  };
  return (
    <article
      data-book-id={id}
      className="group flex items-stretch gap-4 p-4 bg-white/90 dark:bg-slate-800/70 backdrop-blur rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
    >
      {(() => {
        const dice = getAvatarUrl(title, { width: 240, height: 320, radius: 12, output: 'png' });
        const computed = coverImage || dice;
        return (
          <ImageWithFallback
            src={computed}
            alt={title}
            className="w-24 h-32 object-cover rounded-md flex-shrink-0 border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40"
          />
        );
      })()}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <header>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {title}
          </h3>
          <div className="text-xs mt-1 text-slate-600 dark:text-slate-300">by {author}</div>
        </header>
        <div className="pt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 font-semibold text-sm leading-none">{averageRating.toFixed(1)}</span>
            <span>/5</span>
          </div>
          <button
            onClick={onToggle}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={favorited}
            className={`ml-auto inline-flex items-center justify-center w-8 h-8 rounded-md border transition-colors text-sm ${favorited ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-500' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            disabled={pending}
          >
            <span className={`transition-transform ${pending ? 'scale-90 opacity-80' : ''}`}>{favorited ? '♥' : '♡'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default BookCard;
