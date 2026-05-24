import * as React from 'react';
import { cn } from '@/lib/utils';

const alertVariants = {
  default: 'border-white/10 bg-white/[0.04] text-slate-200',
  destructive: 'border-red-500/20 bg-red-500/10 text-red-200',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
};

export function Alert({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof alertVariants }) {
  return <div className={cn('rounded-[0.9rem] border px-3.5 py-3 text-sm shadow-sm backdrop-blur-sm', alertVariants[variant], className)} {...props} />;
}
