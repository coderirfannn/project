import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-11 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
