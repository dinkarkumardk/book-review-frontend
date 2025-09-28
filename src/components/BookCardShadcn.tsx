import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/ui/RatingStars';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { getCoverFromBook } from '@/utils/getCoverFromBook';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { Book } from '@/types/domain';

interface BookCardShadcnProps {
  book: Book;
  className?: string;
  onClick?: (book: Book) => void;
  showGenres?: boolean;
}

export const BookCardShadcn: React.FC<BookCardShadcnProps> = ({ book, className, onClick, showGenres = true }) => {
  const cover = getCoverFromBook(book as any);
  return (
    <Card className={cn('group flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200', className)} onClick={() => onClick?.(book)}>
      <Link to={`/books/${book.id}`} className="flex flex-col h-full">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          <ImageWithFallback
            src={cover || ''}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {book.averageRating && book.ratingsCount ? (
            <div className="absolute top-2 left-2 rounded-full bg-background/80 backdrop-blur px-2 py-1 shadow-sm">
              <RatingStars value={book.averageRating} ratingCount={book.ratingsCount} showValue size="sm" />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col flex-1 p-3 gap-2">
          <h3 className="font-medium leading-snug line-clamp-2 min-h-[2.5rem]">{book.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
          {showGenres && book.genres?.length ? (
            <div className="flex flex-wrap gap-1 mt-auto">
              {book.genres.slice(0,3).map(g => (
                <Badge key={g} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{g}</Badge>
              ))}
              {book.genres.length > 3 && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">+{book.genres.length - 3}</Badge>}
            </div>
          ) : <div className="mt-auto" />}
        </div>
      </Link>
    </Card>
  );
};

export default BookCardShadcn;
