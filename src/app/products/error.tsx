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
    <Card className="mx-auto max-w-2xl overflow-hidden border-slate-200/80 bg-white/92 backdrop-blur-xl">
      <CardHeader>
        <p className="section-eyebrow text-emerald-600">Catalog error</p>
        <CardTitle className="text-2xl">Product catalog failed to load</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="shadow-none">{error.message}</Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset}>Retry</Button>
          <Button variant="outline" onClick={() => router.push('/')}>Go home</Button>
        </div>
      </CardContent>
    </Card>
  );
}
