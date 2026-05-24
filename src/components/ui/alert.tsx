import * as React from 'react';
import { cn } from '@/lib/utils';

const alertVariants = {
  default: 'border-slate-200 bg-white text-slate-900',
  destructive: 'border-red-200 bg-red-50 text-red-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
};

export function Alert({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof alertVariants }) {
  return <div className={cn('rounded-2xl border p-4 text-sm shadow-sm', alertVariants[variant], className)} {...props} />;
}
