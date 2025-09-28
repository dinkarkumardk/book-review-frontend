import React from 'react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value?: number | null; // average rating
  outOf?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  ratingCount?: number;
  className?: string;
}

const Star: React.FC<{ filled: boolean; half?: boolean; sizeClass: string }>=({ filled, half, sizeClass }) => {
  if (half) {
    return (
      <span className={cn('relative inline-block text-yellow-500', sizeClass)} aria-hidden>
        <span className={cn('text-muted-foreground absolute inset-0')}>&#9734;</span>
        <span className="overflow-hidden inline-block w-1/2">&#9733;</span>
      </span>
    );
  }
  return <span className={cn(sizeClass, filled ? 'text-yellow-500' : 'text-muted-foreground')} aria-hidden>{filled ? '\u2605' : '\u2606'}</span>;
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  value = 0,
  outOf = 5,
  size = 'sm',
  showValue = true,
  ratingCount,
  className,
}) => {
  const safe = Math.max(0, Math.min(outOf, value || 0));
  const full = Math.floor(safe);
  const hasHalf = safe - full >= 0.5 && full < outOf;
  const sizeClass = size === 'sm' ? 'text-[12px]' : 'text-base';

  return (
    <div className={cn('flex items-center gap-1', className)} aria-label={showValue ? `Rated ${safe.toFixed(1)} out of ${outOf}` : undefined}>
      <div className="flex items-center">
        {Array.from({ length: outOf }).map((_, i) => {
          if (i < full) return <Star key={i} filled sizeClass={sizeClass} />;
          if (i === full && hasHalf) return <Star key={i} filled half sizeClass={sizeClass} />;
          return <Star key={i} filled={false} sizeClass={sizeClass} />;
        })}
      </div>
      {showValue && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {safe.toFixed(1)}{typeof ratingCount === 'number' && <span className="ml-1 text-[10px]">({ratingCount})</span>}
        </span>
      )}
    </div>
  );
};
