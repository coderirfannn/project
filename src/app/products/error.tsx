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
    <Card className="surface-panel-dark mx-auto max-w-2xl text-white">
      <CardHeader>
        <p className="section-eyebrow text-slate-400">Catalog error</p>
        <CardTitle className="font-display text-[1.15rem] tracking-[-0.02em] text-white">Product catalog failed to load</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">{error.message}</Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset}>Retry</Button>
          <Button variant="outline" onClick={() => router.push('/')}>Go home</Button>
        </div>
      </CardContent>
    </Card>
  );
}
