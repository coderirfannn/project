import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  default: 'bg-white text-slate-950 shadow-[0_10px_24px_rgba(2,6,23,0.24)] hover:bg-slate-100',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
  outline: 'border border-white/10 bg-transparent text-slate-200 hover:border-white/20 hover:bg-white/[0.04]',
  destructive: 'bg-red-500 text-white shadow-[0_10px_24px_rgba(239,68,68,0.18)] hover:bg-red-400',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/[0.04] hover:text-white',
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
          'inline-flex items-center justify-center rounded-[0.8rem] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0',
          buttonVariants[variant],
          size === 'sm' && 'h-8 px-3 text-sm',
          size === 'md' && 'h-9 px-3.5 text-sm',
          size === 'lg' && 'h-10 px-4 text-sm',
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
