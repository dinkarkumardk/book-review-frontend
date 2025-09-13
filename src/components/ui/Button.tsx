import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-sky-600 text-white hover:bg-sky-500',
        ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
        outline: 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800',
        destructive: 'bg-rose-600 text-white hover:bg-rose-500',
        secondary: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100'
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), loading && 'relative text-transparent', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
          </span>
        )}
        <span className={loading ? 'opacity-0' : 'inline-flex items-center gap-2'}>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
