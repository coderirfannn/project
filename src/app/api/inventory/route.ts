import { NextResponse } from 'next/server';
import { withRouteHandler } from '@/lib/route';
import { getInventoryOverview } from '@/services/reservation.service';

export const GET = withRouteHandler(async () => {
  const inventory = await getInventoryOverview();
  return NextResponse.json({ data: inventory }, { status: 200 });
});
