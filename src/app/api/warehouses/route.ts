import { NextResponse } from 'next/server';
import { withRouteHandler } from '@/lib/route';
import { getWarehousesOverview } from '@/services/catalog.service';

export const GET = withRouteHandler(async () => {
  const warehouses = await getWarehousesOverview();
  return NextResponse.json({ data: warehouses }, { status: 200 });
});
