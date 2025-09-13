import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500',
  {
    variants: {
      variant: {
        default: 'bg-sky-600 text-white border-transparent hover:bg-sky-500',
        secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-transparent',
        outline: 'text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
      }
    },
    defaultVariants: { variant: 'default' }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
