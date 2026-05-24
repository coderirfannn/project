"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-2xl border-slate-200/80 bg-white/95">
      <CardHeader>
        <CardTitle>Checkout unavailable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">{error.message}</Alert>
        <div className="flex gap-3">
          <Button onClick={reset}>Retry</Button>
          <Button variant="outline" onClick={() => router.push('/products')}>Back to products</Button>
        </div>
      </CardContent>
    </Card>
  );
}
