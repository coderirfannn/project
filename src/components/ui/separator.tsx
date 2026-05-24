import { cn } from '@/lib/utils';

export function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent', className)} />;
}
