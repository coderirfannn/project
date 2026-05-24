import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'border border-white/10 bg-white/[0.04] text-slate-300',
  success: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border border-amber-500/20 bg-amber-500/10 text-amber-300',
  destructive: 'border border-red-500/20 bg-red-500/10 text-red-300',
  outline: 'border border-white/10 bg-transparent text-slate-300',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <span className={cn('inline-flex items-center rounded-[0.7rem] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]', badgeVariants[variant], className)} {...props} />;
}
