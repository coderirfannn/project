import { NextResponse } from 'next/server';
import { withRouteHandler } from '@/lib/route';
import { getProductsOverview } from '@/services/catalog.service';

export const GET = withRouteHandler(async () => {
  const products = await getProductsOverview();
  return NextResponse.json({ data: products }, { status: 200 });
});
