import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive, ...rest }: CardProps) {
  return <div className={cn('rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm', interactive && 'transition-shadow hover:shadow-md focus-within:shadow-md', className)} {...rest} />;
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4 pb-2 flex flex-col gap-1', className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold leading-tight tracking-tight', className)} {...rest} />;
}

export function CardDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-slate-600 dark:text-slate-300', className)} {...rest} />;
}

export function CardContent({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pb-4 pt-0', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pb-4 pt-0 flex items-center gap-3', className)} {...rest} />;
}
