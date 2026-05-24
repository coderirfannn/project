import { NextResponse } from 'next/server';
import { withRouteHandler } from '@/lib/route';
import { getDashboardData } from '@/services/dashboard.service';

export const GET = withRouteHandler(async () => {
  const dashboard = await getDashboardData();
  return NextResponse.json({ data: dashboard }, { status: 200 });
});
