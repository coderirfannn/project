import { NextResponse } from 'next/server';
import { withRouteHandler } from '@/lib/route';
import { releaseExpiredReservations } from '@/services/expiry.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function handleCleanup() {
  const result = await releaseExpiredReservations();

  return NextResponse.json(
    {
      data: result,
      ok: true,
      source: 'vercel-cron',
    },
    { status: 200 },
  );
}

export const GET = withRouteHandler(handleCleanup);
export const POST = withRouteHandler(handleCleanup);
