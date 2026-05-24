import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  default: 'bg-slate-950 text-white shadow-[0_16px_36px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:bg-slate-800',
  secondary: 'bg-slate-100 text-slate-900 hover:-translate-y-0.5 hover:bg-slate-200',
  outline: 'border border-slate-200 bg-white/90 text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white',
  destructive: 'bg-red-600 text-white shadow-[0_16px_36px_rgba(239,68,68,0.18)] hover:-translate-y-0.5 hover:bg-red-700',
  ghost: 'bg-transparent text-slate-900 hover:bg-slate-100/80',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0',
          buttonVariants[variant],
          size === 'sm' && 'h-9 px-3 text-sm',
          size === 'md' && 'h-10 px-4 text-sm',
          size === 'lg' && 'h-11 px-5 text-base',
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
