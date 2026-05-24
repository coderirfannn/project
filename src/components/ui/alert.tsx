import * as React from 'react';
import { cn } from '@/lib/utils';

const alertVariants = {
  default: 'border-slate-200/80 bg-white/85 text-slate-900',
  destructive: 'border-red-200 bg-red-50/95 text-red-900',
  success: 'border-emerald-200 bg-emerald-50/95 text-emerald-900',
};

export function Alert({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof alertVariants }) {
  return <div className={cn('rounded-[1.4rem] border px-4 py-4 text-sm shadow-sm backdrop-blur-sm', alertVariants[variant], className)} {...props} />;
}
