import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-slate-200 dark:bg-slate-600',
        shimmer && 'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]',
        className
      )}
      {...rest}
    />
  );
}

// Tailwind animation util (add via global layer if needed)
// @keyframes shimmer { 100% { transform: translateX(100%); } }
