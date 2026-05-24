import { NextResponse } from 'next/server';
import { withRouteHandler } from '@/lib/route';

export const GET = withRouteHandler(async () => {
  return NextResponse.json(
    {
      ok: true,
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
});
