import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'border border-slate-200 bg-slate-100/80 text-slate-700',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border border-amber-200 bg-amber-50 text-amber-800',
  destructive: 'border border-red-200 bg-red-50 text-red-800',
  outline: 'border border-slate-200 bg-white/90 text-slate-700',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em]', badgeVariants[variant], className)} {...props} />;
}
