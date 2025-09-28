import React from 'react';
import { cn } from '@/lib/utils';

interface RatingDistributionProps {
  ratings: number[]; // array of numeric ratings (1-5)
  className?: string;
}

const buckets = [5,4,3,2,1];

export const RatingDistribution: React.FC<RatingDistributionProps> = ({ ratings, className }) => {
  if (!ratings.length) return null;
  const counts = buckets.map(b => ratings.filter(r => r === b).length);
  const max = Math.max(...counts, 1);
  const total = ratings.length;
  return (
    <div className={cn('space-y-2', className)}>
      {buckets.map((b, i) => {
        const count = counts[i];
        const pct = (count / total) * 100;
        return (
          <div key={b} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-right font-medium">{b}★</span>
            <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
              <div className="h-full bg-yellow-500/80" style={{ width: `${(count/max)*100}%` }} />
            </div>
            <span className="w-10 tabular-nums text-muted-foreground">{pct.toFixed(0)}%</span>
          </div>
        );
      })}
    </div>
  );
};

export default RatingDistribution;