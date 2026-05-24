import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-9 w-full rounded-[0.8rem] border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-100 shadow-sm transition-all duration-200 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
