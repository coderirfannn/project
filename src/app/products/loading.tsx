import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200/80 bg-slate-950 text-white">
        <CardHeader>
          <Skeleton className="h-5 w-48 bg-white/10" />
          <Skeleton className="h-10 w-3/4 bg-white/10" />
          <Skeleton className="h-4 w-2/3 bg-white/10" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-44 w-full bg-white/10" />
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
