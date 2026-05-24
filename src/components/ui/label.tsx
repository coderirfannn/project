import * as React from 'react';
import { cn } from '@/lib/utils';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return <label ref={ref} className={cn('text-[0.72rem] font-semibold uppercase tracking-[0.16em] leading-none text-slate-400', className)} {...props} />;
  },
);

Label.displayName = 'Label';
