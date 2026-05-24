import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[1.2rem] bg-gradient-to-r from-slate-200/70 via-slate-100 to-slate-200/70', className)} />;
}
