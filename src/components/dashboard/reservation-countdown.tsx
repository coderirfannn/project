"use client";

import { useEffect, useState } from 'react';
import { formatDuration } from '@/lib/utils';

export function ReservationCountdown({ expiresAt, status }: { expiresAt: string; status: string }) {
  const [remaining, setRemaining] = useState(() => Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (status !== 'PENDING') {
    return <span className="font-mono text-slate-500">--:--</span>;
  }

  return (
    <span className={remaining <= 120 ? 'font-mono text-amber-700' : 'font-mono text-slate-700'}>
      {formatDuration(remaining)}
    </span>
  );
}
