import { withRouteHandler, jsonDataResponse } from '@/lib/route';
import { getDashboardData } from '@/services/dashboard.service';

export const GET = withRouteHandler(async () => {
  const dashboard = await getDashboardData();
  return jsonDataResponse(dashboard);
});
