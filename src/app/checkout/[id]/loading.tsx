import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
      <Card className="surface-panel-dark overflow-hidden text-white">
        <CardHeader>
          <Skeleton className="h-4 w-40 bg-white/[0.08]" />
          <Skeleton className="h-11 w-3/4 bg-white/[0.08]" />
          <Skeleton className="h-4 w-2/3 bg-white/[0.08]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-28 w-full bg-white/[0.08]" />
          <Skeleton className="h-24 w-full bg-white/[0.08]" />
        </CardContent>
      </Card>
      <Card className="surface-panel-dark overflow-hidden text-white">
        <CardHeader>
          <Skeleton className="h-4 w-32 bg-white/[0.08]" />
          <Skeleton className="h-4 w-44 bg-white/[0.08]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full bg-white/[0.08]" />
          <Skeleton className="h-10 w-full bg-white/[0.08]" />
          <Skeleton className="h-10 w-full bg-white/[0.08]" />
        </CardContent>
      </Card>
    </div>
  );
}
