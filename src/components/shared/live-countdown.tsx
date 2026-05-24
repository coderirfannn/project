"use client";

import { useEffect, useState } from 'react';
import { formatDuration } from '@/lib/utils';

export function LiveCountdown({ expiresAt, className, expiredLabel = 'Expired' }: { expiresAt: string; className?: string; expiredLabel?: string }) {
  const [secondsRemaining, setSecondsRemaining] = useState(() => Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining(Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (secondsRemaining <= 0) {
    return <span className={className}>{expiredLabel}</span>;
  }

  return <span className={className}>{formatDuration(secondsRemaining)}</span>;
}
